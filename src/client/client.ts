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
  private _totalConnections: number

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
    this._totalConnections = 0
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
  createOutbound (props: ClientListenerOptions, cb: OutboundHandler): HL7Outbound {
    const outbound = new HL7Outbound(this, props, cb)
    outbound.on('client.connect', () => {
      this._totalConnections++
    })
    outbound.on('client.close', () => {
      this._totalConnections--
    })
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
   * Total connections ready to accept messages.
   * @since 1.1.0
   */
  totalConnections (): number {
    return this._totalConnections
  }
}
