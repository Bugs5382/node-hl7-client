import EventEmitter from 'events'
import { Listener } from './listener.js'
import { normalizeClientOptions, ClientListenerOptions, ClientOptions } from '../utils/normalizeClient.js'

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
  connectToListener (props: ClientListenerOptions, handler: any): Listener {
    return new Listener(this, props, handler)
  }
}
