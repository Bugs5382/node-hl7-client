import { TcpSocketConnectOpts } from 'node:net'
import type { ConnectionOptions as TLSOptions } from 'node:tls'
import { HL7_2_7 } from './specification/2.7.js'
import { assertNumber, validIPv4, validIPv6 } from './utils.js'

const DEFAULT_CLIENT_OPTS = {
  acquireTimeout: 20000,
  connectionTimeout: 10000
}

const DEFAULT_CLIENT_BUILDER_OPTS = {
  specification: new HL7_2_7(),
  newLine: '\r',
  separatorField: '|',
  separatorRepetition: '~',
  separatorComponent: '^',
  separatorSubComponent: '&',
  separatorEscape: '\\'
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
  /** Hostname - You can do a FQDN or the IPv(4|6) address. */
  hostname: string
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
  /** Keep the connection alive after sending data and getting a response.
   * @default true */
  keepAlive?: boolean
  /** Additional options when creating the TCP socket with net.connect(). */
  socket?: TcpSocketConnectOpts
  /** The port we should connect on the server. */
  port: number
}

export interface ClientBuilderOptions {
  /** The HL7 spec we are going to be creating. This will be formatted into the MSH header by default.
   * @default 2.7 */
  specification: any
  /** At the end of each line, add this as the new line character.
   * @default \r */
  newLine?: string
  /** */
  separatorField?: string
  /** */
  separatorRepetition?: string
  /** */
  separatorComponent?: string
  /** */
  separatorSubComponent?: string
  /** */
  separatorEscape?: string
}

export interface ClientBuilderBatchOptions extends ClientBuilderOptions {
  /** */
  comment?: string
  /** */
  footerComment?: string
  /** */
  headerComment?: string
}

type ValidatedClientKeys =
  | 'acquireTimeout'
  | 'connectionTimeout'
  | 'hostname'

type ValidatedClientListenerKeys =
  | 'port'

interface ValidatedClientOptions extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  hostname: string
  socket?: TcpSocketConnectOpts
  tls?: TLSOptions
}

interface ValidatedClientOptions extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  hostname: string
  socket?: TcpSocketConnectOpts
  tls?: TLSOptions
}

interface ValidatedClientListenerOptions extends Pick<Required<ClientListenerOptions>, ValidatedClientListenerKeys> {
  port: number
}

/** @internal */
export function normalizeClientOptions (raw?: ClientOptions): ValidatedClientOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw }

  if (typeof props.hostname === 'undefined' || props.hostname.length <= 0) {
    throw new Error('hostname is not defined or the length is less than 0.')
  }

  if (props.ipv4 === true && props.ipv6 === true) {
    throw new Error('ipv4 and ipv6 both can\'t be set to be both used exclusively.')
  }

  if (typeof props.hostname !== 'string' && props.ipv4 === false && props.ipv6 === false) {
    throw new Error('hostname is not valid string.')
  } else if (typeof props.hostname === 'string' && props.ipv4 === true && props.ipv6 === false) {
    if (!validIPv4(props.hostname)) {
      throw new Error('hostname is not a valid IPv4 address.')
    }
  } else if (typeof props.hostname === 'string' && props.ipv4 === false && props.ipv6 === true) {
    if (!validIPv6(props.hostname)) {
      throw new Error('hostname is not a valid IPv6 address.')
    }
  }

  assertNumber(props, 'acquireTimeout', 0)
  assertNumber(props, 'connectionTimeout', 0)

  if (props.tls === true) {
    props.tls = {}
  }

  return props
}

export function normalizedClientBuilderOptions (raw?: ClientBuilderOptions): ClientBuilderOptions {
  const props = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  return props
}

export function normalizedClientBatchBuilderOptions (raw?: ClientBuilderBatchOptions): ClientBuilderBatchOptions {
  const props = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  if ((typeof props.comment !== 'undefined') && (typeof props.headerComment !== 'undefined') && (typeof props.footerComment !== 'undefined')) {
    throw new Error('comment must be undefined if headerComment and footerComment are being set.')
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

  assertNumber(props, 'acquireTimeout', 0)
  assertNumber(props, 'connectionTimeout', 0)
  assertNumber(props, 'port', 0, 65353)

  return props
}
