import EventEmitter from 'events'
import net, { Socket } from 'node:net'
import tls from 'node:tls'
import { Batch } from '../builder/batch.js'
import { Message } from '../builder/message.js'
import { READY_STATE } from '../utils/enum'
import { HL7FatalError } from '../utils/exception'
import { ClientListenerOptions, normalizeClientListenerOptions } from '../utils/normalizedClient.js'
import { expBackoff, randomString } from '../utils/utils'
import { Client } from './client.js'

export type OutboundHandler = (res: Buffer) => Promise<void>

/** HL7 Outbound Class
 * @since 1.0.0 */
export class HL7Outbound extends EventEmitter {
  /** @internal */
  private _awaitingResponse: boolean
  /** @internal */
  _connectionTimer: NodeJS.Timeout | undefined
  /** @internal */
  private readonly _handler: (res: Buffer) => void
  /** @internal */
  private readonly _main: Client
  /** @internal */
  private readonly _nodeId: string
  /** @internal */
  private readonly _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  private _retryCount: number
  /** @internal */
  _retryTimer: NodeJS.Timeout | undefined
  /** @internal */
  private readonly _socket: Socket
  /** @internal */
  private readonly _sockets: Map<any, any>
  /** @internal */
  protected _readyState: READY_STATE
  /** @internal */
  _pendingSetup: Promise<boolean> | boolean

  constructor (client: Client, props: ClientListenerOptions, handler: OutboundHandler) {
    super()
    this._awaitingResponse = false
    this._connectionTimer = undefined
    this._handler = handler
    this._main = client
    this._nodeId = randomString(5)
    this._opt = normalizeClientListenerOptions(props)
    this._pendingSetup = true
    this._sockets = new Map()
    this._retryCount = 1
    this._retryTimer = undefined
    this._readyState = READY_STATE.CONNECTING

    this._connect = this._connect.bind(this)
    this._socket = this._connect()
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
    let attempts = 0
    const maxAttempts = typeof this._opt.maxAttempts === 'undefined' ? this._main._opt.maxAttempts : this._opt.maxAttempts

    const checkConnection = async (): Promise<boolean> => {
      return this._readyState === READY_STATE.CONNECTED
    }

    const checkAck = async (): Promise<boolean> => {
      return this._awaitingResponse
    }

    const checkSend = async (_message: string): Promise<boolean> => {
      // noinspection InfiniteLoopJS
      while (true) {
        try {
        // first, if we are closed, sorry, no more sending messages
          if ((this._readyState === READY_STATE.CLOSED) || (this._readyState === READY_STATE.CLOSING)) {
            // noinspection ExceptionCaughtLocallyJS
            throw new HL7FatalError(500, 'In an invalid state to be able to send message.')
          }
          if (this._readyState !== READY_STATE.CONNECTED) {
          // if we are not connected,
          // check to see if we are now connected.
            if (this._pendingSetup === false) {
              // @todo in the future, add here to store the messages in a file or a
              this._pendingSetup = checkConnection().finally(() => { this._pendingSetup = false })
            }
          } else if (this._readyState === READY_STATE.CONNECTED && this._opt.waitAck && this._awaitingResponse) {
          // Ok, we ar now conformed connected.
          // However, since we are checking
          // to make sure we wait for an ACKNOWLEDGEMENT from the server,
          // that the message was gotten correctly from the last one we sent.
          // We are still waiting, we need to recheck again
          // if we are not connected,
          // check to see if we are now connected.
            if (this._pendingSetup === false) {
              this._pendingSetup = checkAck().finally(() => { this._pendingSetup = false })
            }
          }
          return await this._pendingSetup
        } catch (err: any) {
          Error.captureStackTrace(err)
          if (++attempts >= maxAttempts) {
            throw err
          } else {
            emitter.emit('retry', err)
          }
        }
      }
    }

    const emitter = new EventEmitter()

    const theMessage = message.toString()

    // check to see if we should be sending
    await checkSend(theMessage)

    // ok, if our options are to wait for an acknowledgement, set the var to "true"
    if (this._opt.waitAck) {
      this._awaitingResponse = true
    }

    const messageToSend = Buffer.from(theMessage)

    const header = Buffer.alloc(6)
    header.writeInt32BE(messageToSend.length + 6, 1)
    header.writeInt8(2, 5)
    header[0] = header[1] ^ header[2] ^ header[3] ^ header[4] ^ header[5]

    const payload = Buffer.concat([header, messageToSend])

    return this._socket.write(payload, this._opt.encoding, () => {
      // FOR DEBUGGING ONLY: console.log(toSendData)
    })
  }

  private _listener (socket: Socket): void {
    // set no delay
    socket.setNoDelay(true)

    // add socket
    this._addSocket(this._nodeId, socket, true)

    // check to make sure we do not max out on connections, we shouldn't...
    if (this._sockets.size > this._opt.maxConnections) {
      this._manageConnections()
    }

    this._readyState = READY_STATE.CONNECTED
  }

  /** @internal */
  private _connect (): Socket {
    let socket: Socket
    const host = this._main._opt.host
    const port = this._opt.port
    const _optTls = this._main._opt.tls

    if (typeof _optTls !== 'undefined') {
      // @TODO this needs to be expanded on for TLS options
      socket = tls.connect({ host, port }, () => this._listener(socket))
    } else {
      socket = net.createConnection({ host, port }, () => this._listener(socket))
    }

    socket.on('error', err => {
      this._removeSocket(this._nodeId)
      this.emit('client.error', err, this._nodeId)
    })

    socket.on('close', () => {
      if (this._readyState === READY_STATE.CLOSING) {
        this._readyState = READY_STATE.CLOSED
      } else {
        const retryHigh = typeof this._opt.retryHigh === 'undefined' ? this._main._opt.retryHigh : this._opt.retryLow
        const retryLow = typeof this._opt.retryLow === 'undefined' ? this._main._opt.retryLow : this._opt.retryLow
        const retryCount = this._retryCount++
        const delay = expBackoff(retryLow, retryHigh, retryCount)
        this._readyState = READY_STATE.OPEN
        this._retryTimer = setTimeout(this._connect, delay)
        if (retryCount <= 1) {
          this.emit('error')
        }
      }
    })

    socket.on('connect', () => {
      this._readyState = READY_STATE.CONNECTED
      this.emit('connect')
    })

    socket.on('data', (buffer: Buffer) => {
      this._handler(buffer)
    })

    socket.on('end', () => {
      this._removeSocket(this._nodeId)
      this.emit('client.end')
    })

    socket.unref()

    return socket
  }

  /** Close Client Listener Instance.
   * @since 1.0.0 */
  async close (): Promise<boolean> {
    // mark that we set our internal that we are closing, so we do not try to re-connect
    this._readyState = READY_STATE.CLOSING
    // @todo Remove all pending messages that might be pending sending.
    // @todo Do we dare save them as a file so if the kube process fails and restarts up, it can send them again??
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
