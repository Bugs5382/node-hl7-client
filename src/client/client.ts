import EventEmitter from 'events'
import { normalizeClientOptions, ClientListenerOptions, ClientOptions } from '../utils/normalizedClient.js'
import {HL7Outbound, OutboundHandler} from "./hl7Outbound";

/**
 * Client Class
 * @since 1.0.0 */
export class Client extends EventEmitter {
  /** @internal */
  _opt: ReturnType<typeof normalizeClientOptions>

  constructor (props?: ClientOptions) {
    super()
    this._opt = normalizeClientOptions(props)
  }

  /** Connect to a listener to a specified port.
   *  @since 1.0.0 */
  createOutbound (props: ClientListenerOptions, cb: OutboundHandler): HL7Outbound {
    return new HL7Outbound(this, props, cb)
  }

  getHost(): string {
    return this._opt.host
  }

}
