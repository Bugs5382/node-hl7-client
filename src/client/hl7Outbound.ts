import EventEmitter from 'events'
import * as net from 'net'
import * as tls from 'tls'
import {Batch} from '../builder/batch.js'
import {Message} from '../builder/message.js'
import {randomString} from "../utils";
//import { CR, FS, VT } from '../utils/constants.js'
import {HL7FatalError} from '../utils/exception'
import {ClientListenerOptions, normalizeClientListenerOptions} from '../utils/normalizeClient.js'
import {Client} from './client.js'

/** HL7 Outbound Class
 * @since 1.0.0 */
export class HL7Outbound extends EventEmitter {
  /** @internal */
  private _awaitingResponse: boolean
  /** @internal */
  _handler?: any | undefined // @todo is this needed?
  /** @internal */
  private _main: Client
  /** @internal */
  private _nodeId: string
  /** @internal */
  private _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  private _server: net.Socket | tls.TLSSocket
  /** @internal */
  private _sockets: Map<any, any>

  constructor (client: Client, props: ClientListenerOptions, handler?: any) {
    super()
    this._main = client
    this._nodeId = randomString(5)

    this._awaitingResponse = false

    // process listener options
    this._opt = normalizeClientListenerOptions(props)

    this._sockets = new Map()
    this._handler = handler

    this._connect = this._connect.bind(this)
    this._server = this._connect()
  }

  getPort(): string {
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

    const toSendData =  Buffer.from(message.toString())

    return this._server?.write(toSendData, 'utf8', () => {
      // console.log(toSendData)
    })

  }

  /** @internal */
  private _connect (): net.Socket | tls.TLSSocket {
    let server: net.Socket | tls.TLSSocket
    let host = this._main._opt.host
    let port = this._opt.port
    let _opt_tls = this._main._opt.tls

      if (typeof _opt_tls !== 'undefined') {
        // @todo this needs to be expanded on for TLS options
        server = tls.connect({host, port})
      } else {

        server = net.createConnection({host, port}, () => {

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

      server.on('data', buffer => {
        this.emit('data', buffer.toString())
      })

      server.on('error', err => {
        this._removeSocket(this._nodeId)
        this.emit('client.error', err, this._nodeId)
        throw new HL7FatalError(500, 'Unable to connect to remote host.')
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

  /**@internal */
  private _manageConnections() {
    let count = this._sockets.size - this._opt.maxConnections;
    if (count <= 0) {
      return
    }

    const list: { nodeID: any; lastUsed: any }[] = [];
    this._sockets.forEach((socket, nodeID) => list.push({ nodeID, lastUsed: socket.lastUsed }));
    list.sort((a, b) => a.lastUsed - b.lastUsed);

    count = Math.min(count, list.length - 1);
    const removable = list.slice(0, count);

    removable.forEach(({ nodeID }) => this._removeSocket(nodeID));

  }
}
