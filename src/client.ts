import EventEmitter from "events";
import * as net from "net";
import {Socket} from "net";
import * as tls from "tls";
import normalizeOptions, {ConnectionOptions} from "./normalize.js";

export declare interface Connection {
  /** The connection is successfully (re)established */
  on(name: 'connection', cb: () => void): this;
  on(name: 'error', cb: (err: any) => void): this;
}

/**
 * This
 * @since 1.0.0
 */
export class Client extends EventEmitter {
    /** @internal */
    _opt: ReturnType<typeof normalizeOptions>
    /** @internal */
    _socket: Socket

    constructor(props?: string | ConnectionOptions) {
      super();
      this._connect = this._connect.bind(this)
      this._opt = normalizeOptions(props)

      this._socket = this._connect()
    }

    /** @internal */
    private _connect(): Socket {

      const host = this._opt.host

      // assume any previously opened socket is already fully closed
      let socket: Socket
      if (this._opt.tls) {
        socket = tls.connect({
          port: host.port,
          host: host.hostname,
          ...this._opt.socket,
          ...this._opt.tls
        })
      } else {
        socket = net.connect({
          port: host.port,
          host: host.hostname,
          ...this._opt.socket
        })
      }
      this._socket = socket

      return socket
    }

  }