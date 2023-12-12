import { TcpSocketConnectOpts } from 'node:net'
import type { ConnectionOptions as TLSOptions } from 'node:tls'
import * as Util from './index.js'

const DEFAULT_CLIENT_OPTS = {
  acquireTimeout: 20000,
  connectionTimeout: 10000,
  encoding: 'utf-8',
  maxConnections: 10,
  waitAck: true
}

export interface ParserProcessRawData {
  /** Data that needs to be processed. */
  data: string
}

export interface ClientOptions {
  /** Milliseconds to wait before aborting a connection attempt
   * @default 20_000 */
  acquireTimeout?: number
  /** Max wait time, in milliseconds, for a connection attempt
   * @default 10_000 */
  connectionTimeout?: number
  /** Host - You can do a FQDN or the IPv(4|6) address. */
  host: string
  /** IPv4 - If this is set to true, only IPv4 address will be used and also validated upon installation from the hostname property.
   * @default false */
  ipv4?: boolean
  /** IPv6 - If this is set to true, only IPv6 address will be used and also validated upon installation from the hostname property.
   * @default false */
  ipv6?: boolean
  /** Keep the connection alive after sending data and getting a response.
   * @default true */
  keepAlive?: boolean
  /** Additional options when creating the TCP socket with net.connect(). */
  socket?: TcpSocketConnectOpts
  /** Enable TLS, or set TLS specific options like overriding the CA for
   * self-signed certificates. */
  tls?: boolean | TLSOptions
}

export interface ClientListenerOptions {
  /** Milliseconds to wait before aborting a connection attempt.
   * This will override the overall client connection for this particular connection.
   * @default 20_000 */
  acquireTimeout?: number
  /** Max wait time, in milliseconds, for a connection attempt.
   * This will override the overall client connection for this particular connection.
   * @default 10_000 */
  connectionTimeout?: number
  /** Encoding of the messages we expect from the HL7 message.
   * @default "utf-8"
   */
  encoding?: BufferEncoding
  /** Keep the connection alive after sending data and getting a response.
   * @default true */
  keepAlive?: boolean
  /** Max Connections this connection makes.
   * Has to be greater than 1.
   * @default 10 */
  maxConnections?: number
  /** Additional options when creating the TCP socket with net.connect(). */
  socket?: TcpSocketConnectOpts
  /** The port we should connect on the server. */
  port: number
  /** Wait for ACK **/
  waitAck?: boolean
}

type ValidatedClientKeys =
  | 'acquireTimeout'
  | 'connectionTimeout'
  | 'host'

type ValidatedClientListenerKeys =
  | 'port'

interface ValidatedClientOptions extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  host: string
  socket?: TcpSocketConnectOpts
  tls?: TLSOptions
}

interface ValidatedClientListenerOptions extends Pick<Required<ClientListenerOptions>, ValidatedClientListenerKeys> {
  encoding: BufferEncoding
  port: number
  maxConnections: number
  waitAck: boolean
}

/** @internal */
export function normalizeClientOptions (raw?: ClientOptions): ValidatedClientOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw }

  if (typeof props.host === 'undefined' || props.host.length <= 0) {
    throw new Error('hostname is not defined or the length is less than 0.')
  }

  if (props.ipv4 === true && props.ipv6 === true) {
    throw new Error('ipv4 and ipv6 both can\'t be set to be both used exclusively.')
  }

  if (typeof props.host !== 'string' && props.ipv4 === false && props.ipv6 === false) {
    throw new Error('hostname is not valid string.')
  } else if (typeof props.host === 'string' && props.ipv4 === true && props.ipv6 === false) {
    if (!Util.validIPv4(props.host)) {
      throw new Error('hostname is not a valid IPv4 address.')
    }
  } else if (typeof props.host === 'string' && props.ipv4 === false && props.ipv6 === true) {
    if (!Util.validIPv6(props.host)) {
      throw new Error('hostname is not a valid IPv6 address.')
    }
  }

  Util.assertNumber(props, 'acquireTimeout', 0)
  Util.assertNumber(props, 'connectionTimeout', 0)
  Util.assertNumber(props, 'maxConnections', 1)

  if (props.tls === true) {
    props.tls = {}
  }

  return props
}

/** @internal */
export function normalizeClientListenerOptions (raw?: ClientListenerOptions): ValidatedClientListenerOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw }

  if (typeof props.port === 'undefined') {
    throw new Error('port is not defined.')
  }

  if (typeof props.port !== 'number') {
    throw new Error('port is not valid number.')
  }

  Util.assertNumber(props, 'acquireTimeout', 0)
  Util.assertNumber(props, 'connectionTimeout', 0)
  Util.assertNumber(props, 'port', 0, 65353)

  return props
}
