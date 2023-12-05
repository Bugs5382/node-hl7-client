import EventEmitter from 'events'
import { Socket } from 'net'
import * as net from 'net'
import * as tls from 'tls'
import { Client } from './client'
import { ClientListenerOptions, normalizeClientListenerOptions } from '../utils/normalize'

/** Listener Class
 * @since 1.0.0 */
export class Listener extends EventEmitter {
  /** @internal */
  _main: Client
  /** @internal */
  _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  _server: net.Socket | tls.TLSSocket | undefined
  /** @internal */
  _socket: Socket | undefined
  /** @internal */
  _handler?: any | undefined

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

  /** @internal */
  private _connect (): Socket | tls.TLSSocket {
    let server

    if (this._main._opt.tls != null) {
      server = tls.connect({ port: this._opt.port })
    } else {
      server = net.createConnection({ port: this._opt.port })
    }

    return server
  }
}
