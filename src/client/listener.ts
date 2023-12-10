import EventEmitter from 'events'
import { Socket } from 'net'
import * as net from 'net'
import * as tls from 'tls'
import {Batch} from "../builder/batch.js";
import {Message} from "../builder/message.js";
import {CR, FS, VT} from "../utils/constants.js";
import {HL7FatalError} from "../utils/exception";
import { Client } from './client.js'
import { ClientListenerOptions, normalizeClientListenerOptions } from '../utils/normalize.js'

/** Listener Class
 * @since 1.0.0 */
export class Listener extends EventEmitter {
  /** @internal */
  _handler?: any | undefined
  /** @internal */
  _lastUsed?: Date
  /** @internal */
  _main: Client
  /** @internal */
  _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  _server: net.Socket | tls.TLSSocket | undefined
  /** @internal */
  _socket?: Socket | undefined

  constructor (client: Client, props: ClientListenerOptions, handler?: any) {
    super()
    this._main = client

    // process listener options
    this._opt = normalizeClientListenerOptions(props)

    this._socket = undefined
    this._handler = handler

    this._connect = this._connect.bind(this)
    this._server = this._connect()
  }

  /** Send a HL7 Message to the Listener
   * @since 1.0.0
   */
  async sendMessage (message: Message | Batch): Promise<void> {
    this._server?.write(`${VT}${message.toString()}${FS}${CR}`)
  }


  /** @internal */
  private _connect (): Socket | tls.TLSSocket {
    let server: Socket | tls.TLSSocket

    if (this._main._opt.tls != null) {
      server = tls.connect({port: this._opt.port})
    } else {
      server = net.createConnection({host: this._main._opt.hostname, port: this._opt.port}, () => {
        this._lastUsed = new Date();
        server.setNoDelay(true);
        this._socket = server
        this.emit('connect', server);
      })
    }

    server.on('close', () => {
      this.emit('close');
    });

    server.on('data', data => {
      this.emit('data', data)
    });

    server.on('error', err => {
      this.emit('error', err);
      throw new HL7FatalError(500, 'Unable to connect to remote host.')
    });

    server.on('end', () => {
      this.emit('end');
    });

    server.unref()

    return server
  }

  /** Close Client Listener Instance.
   * @since 1.0.0 */
  async close (): Promise<boolean> {
    if (typeof this._socket !== 'undefined') {
      this._socket.end()
      this._socket.destroy()
      this.emit('client.close');
    }
    return true
  }

}
