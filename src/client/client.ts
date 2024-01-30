import EventEmitter from 'events'
import {
  normalizeClientOptions,
  ClientListenerOptions,
  ClientOptions,
  OutboundHandler
} from '../utils/normalizedClient.js'
import { HL7Outbound } from './hl7Outbound.js'

/**
 * Client Class
 * @description The main class that starts a client connection to a valid HL7 TCP/MLLP specified server.
 * @since 1.0.0 */
export class Client extends EventEmitter {
  /** @internal */
  _opt: ReturnType<typeof normalizeClientOptions>
  /** @internal */
  readonly stats = {
    /** Total outbound connections able to connect to at this moment.
     * @since 1.1.0 */
    _totalConnections: 0,
    /** Overall total sent messages
     * @since 2.0.0 */
    _totalSent: 0,
    /** Overall Ack *
     * @since 2.0.0 */
    _totalAck: 0
  }

  /**
   * @since 1.0.0
   * @param props
   * @example
   * ```ts
   * const client = new Client({host: '0.0.0.0'})
   * ```
   */
  constructor (props?: ClientOptions) {
    super()
    this._opt = normalizeClientOptions(props)
  }

  /** Connect to a listener to a specified port.
   * @since 1.0.0
   * @param props This individual port connections which can override the main server connection properties.
   * Some properties from the server build could be defaulted if not specified here.
   * @param cb The function that the client will process if and when they get a response from the server.
   * It follows an async/await function.
   * @example
   * ```ts
   * const outGoing = client.createOutbound({port: 3000}, async (res: InboundResponse) => {})
   * ```
   * Review the {@link InboundResponse} on the properties returned.
   */
  createOutbound (props: ClientListenerOptions, cb?: OutboundHandler): HL7Outbound {
    const outbound = new HL7Outbound(this, props, cb)

    outbound.on('client.acknowledged', (total) => {
      this.stats._totalAck = total
    })

    outbound.on('client.sent', (total) => {
      this.stats._totalSent = total
    })

    // send back current outbound
    return outbound
  }

  /**
   * Get the host that we are currently connecting to.
   * @since 1.1.0
   */
  getHost (): string {
    return this._opt.host
  }

  /**
   * Total ack in lifetime.
   * @since 2.0.0
   */
  totalAck (): number {
    return this.stats._totalAck
  }

  /**
   * Total sent messages in a lifetime.
   * @since 2.0.0
   */
  totalSent (): number {
    return this.stats._totalSent
  }
}
