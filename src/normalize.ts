import { TcpSocketConnectOpts } from 'node:net'
import type { ConnectionOptions as TLSOptions } from 'node:tls'

const DEFAULT_CLIENT_OPTS = {
  acquireTimeout: 20000,
  connectionTimeout: 10000
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
  /** IPv4 - If this is set to true, only IPv4 address will be used.
   * @default false */
  ipv4?: boolean
  /** IPv6 - If this is set to true, only IPv6 address will be used.
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

type ValidatedClientKeys =
  | 'acquireTimeout'
  | 'connectionTimeout'
  | 'hostname'

interface ValidatedClientOptions extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  hostname: string
  socket?: TcpSocketConnectOpts
  tls?: TLSOptions
}

type ValidatedClientListenerKeys =
  | 'port'

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

  if (typeof props.hostname == 'undefined' || props.hostname.length <= 0) {
    throw new Error('hostname is not defined or the length is less than 0.')
  }

  if (props.ipv4 && props.ipv6) {
    throw new Error('ipv4 and ipv6 both can\'t be set to be exclusive.')
  }

  assertNumber(props, 'acquireTimeout', 0)
  assertNumber(props, 'connectionTimeout', 0)

  if (props.tls === true) {
    props.tls = {}
  }

  return props
}

/** @internal */
export function normalizeClientListenerOptions (raw?: ClientListenerOptions): ValidatedClientListenerOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw }

  if (typeof props.port == 'undefined') {
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

function assertNumber (props: Record<string, number>, name: string, min: number, max?: number) {
  const val = props[name]
  if (isNaN(val) || !Number.isFinite(val) || val < min || (max != null && val > max)) {
    throw new TypeError(max != null
      ? `${name} must be a number (${min}, ${max}).`
      : `${name} must be a number >= ${min}.`)
  }
}

/** @internal */
// @ts-ignore
function validIPv4 (ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(part => parseInt(part) <= 255)
  }
  return false
}


/** @internal */
// @ts-ignore
function validIPv6 (ip: string): boolean {
  const ipv6Regex = /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i
  if (ipv6Regex.test(ip)) {
    return ip.split(':').every(part => part.length <= 4)
  }
  return false
}