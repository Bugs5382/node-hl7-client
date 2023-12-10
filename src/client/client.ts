import EventEmitter from 'events'
import { normalizeClientOptions, ClientListenerOptions, ClientOptions } from '../utils/normalizeClient.js'
import {HL7Outbound} from "./hl7Outbound";

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
  createOutbound (props: ClientListenerOptions, handler?: any): HL7Outbound {
    return new HL7Outbound(this, props, handler)
  }

  getHost(): string {
    return this._opt.host
  }

}
