import EventEmitter from 'events'
import * as net from 'net'
import * as tls from 'tls'
import { Batch } from '../builder/batch.js'
import { Message } from '../builder/message.js'
import { randomString } from '../utils'
import { HL7FatalError } from '../utils/exception'
import { ClientListenerOptions, normalizeClientListenerOptions } from '../utils/normalizedClient.js'
import { Client } from './client.js'

export type OutboundHandler = (res: Buffer) => Promise<void>

/** HL7 Outbound Class
 * @since 1.0.0 */
export class HL7Outbound extends EventEmitter {
  /** @internal */
  private _awaitingResponse: boolean
  /** @internal */
  private readonly _handler: (res: Buffer) => void
  /** @internal */
  private readonly _main: Client
  /** @internal */
  private readonly _nodeId: string
  /** @internal */
  private readonly _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  private readonly _server: net.Socket | tls.TLSSocket
  /** @internal */
  private readonly _sockets: Map<any, any>

  constructor (client: Client, props: ClientListenerOptions, handler: OutboundHandler) {
    super()
    this._awaitingResponse = false
    this._handler = handler
    this._main = client
    this._nodeId = randomString(5)
    this._opt = normalizeClientListenerOptions(props)
    this._sockets = new Map()

    this._connect = this._connect.bind(this)
    this._server = this._connect()
  }

  getHost (): string {
    return this._main._opt.host
  }

  getPort (): string {
    return this._opt.port.toString()
  }

  /** Send a HL7 Message to the Listener
   * @since 1.0.0
   */
  async sendMessage (message: Message | Batch): Promise<boolean> {
    // if we are waiting for an ack before we can send something else, and we are in that process.
    if (this._opt.waitAck && this._awaitingResponse) {
      throw new HL7FatalError(500, 'Can\'t send message while we are waiting for a response.')
    }

    // ok, if our options are to wait for an acknowledgement, set the var to "true"
    if (this._opt.waitAck) {
      this._awaitingResponse = true
    }

    const messageToSend = Buffer.from(message.toString())

    const header = Buffer.alloc(6)
    header.writeInt32BE(messageToSend.length + 6, 1)
    header.writeInt8(2, 5)
    header[0] = header[1] ^ header[2] ^ header[3] ^ header[4] ^ header[5]

    const payload = Buffer.concat([header, messageToSend])

    return this._server.write(payload, this._opt.encoding, () => {
      // FOR DEBUGGING ONLY: console.log(toSendData)
    })
  }

  /** @internal */
  private _connect (): net.Socket | tls.TLSSocket {
    let server: net.Socket | tls.TLSSocket
    const host = this._main._opt.host
    const port = this._opt.port
    const _optTls = this._main._opt.tls

    if (typeof _optTls !== 'undefined') {
      // @TODO this needs to be expanded on for TLS options
      server = tls.connect({ host, port })
    } else {
      server = net.createConnection({ host, port }, () => {
        // set no delay
        server.setNoDelay(true)

        // add socket
        this._addSocket(this._nodeId, server, true)

        // check to make sure we do not max out on connections, we shouldn't...
        if (this._sockets.size > this._opt.maxConnections) {
          this._manageConnections()
        }
      })
    }

    server.on('connect', () => {
      this.emit('connect')
    })

    server.on('data', (buffer: Buffer) => {
      this._handler(buffer)
    })

    server.on('error', err => {
      this._removeSocket(this._nodeId)
      this.emit('client.error', err, this._nodeId)
    })

    server.on('end', () => {
      this._removeSocket(this._nodeId)
      this.emit('client.end')
    })

    server.unref()

    return server
  }

  /** Close Client Listener Instance.
   * @since 1.0.0 */
  async close (): Promise<boolean> {
    this._sockets.forEach((socket) => {
      if (typeof socket.destroyed !== 'undefined') {
        socket.end()
        socket.destroy()
      }
    })
    this._sockets.clear()

    this.emit('client.close')

    return true
  }

  /** @internal */
  private _addSocket (nodeId: string, socket: any, b: boolean): void {
    const s = this._sockets.get(nodeId)
    if (!b && typeof s !== 'undefined' && typeof s.destroyed !== 'undefined') {
      return
    }
    this._sockets.set(nodeId, socket)
  }

  /** @internal */
  private _removeSocket (nodeId: string): void {
    const socket = this._sockets.get(nodeId)
    if (typeof socket !== 'undefined' && typeof socket.destroyed !== 'undefined') {
      socket.destroy()
    }
    this._sockets.delete(nodeId)
  }

  /** @internal */
  private _manageConnections (): void {
    let count = this._sockets.size - this._opt.maxConnections
    if (count <= 0) {
      return
    }

    const list: Array<{ nodeID: any, lastUsed: any }> = []
    this._sockets.forEach((socket, nodeID) => list.push({ nodeID, lastUsed: socket.lastUsed }))
    list.sort((a, b) => a.lastUsed - b.lastUsed)

    count = Math.min(count, list.length - 1)
    const removable = list.slice(0, count)

    removable.forEach(({ nodeID }) => this._removeSocket(nodeID))
  }
}
