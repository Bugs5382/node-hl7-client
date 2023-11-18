import {TcpSocketConnectOpts} from 'node:net'
import type {ConnectionOptions as TLSOptions} from 'node:tls'

const DEFAULT_OPTS = {
  acquireTimeout: 20000,
  connectionTimeout: 10000
}

export interface ConnectionOptions {
  /** Milliseconds to wait before aborting a connection attempt
   * @default 20_000*/
  acquireTimeout?: number,
  /** Max wait time, in milliseconds, for a connection attempt
   * @default 10_000*/
  connectionTimeout?: number,
  /** Keep the connection alive after sending data and getting a response.
   * @default true*/
  keepAlive?: boolean,

  /** Must include params: acquire_timeout, connection_timeout.
   * The port (i.e., 1234) represented the HL7 server connection port that you need to establish on.
   *
   * @example "localhost:1234?acquire_timeout=0&connection_timeout=0"
   */
  url: string,

  hostname?: string,
  port?: string|number,

  /** Enable TLS, or set TLS specific options like overriding the CA for
   * self-signed certificates. */
  tls?: boolean | TLSOptions,

  /** Additional options when creating the TCP socket with net.connect(). */
  socket?: TcpSocketConnectOpts,
}

type ValidatedKeys =
  | 'acquireTimeout'
  | 'connectionTimeout'

interface ValidatedOptions extends Pick<Required<ConnectionOptions>, ValidatedKeys> {
  socket?: TcpSocketConnectOpts,
  tls?: TLSOptions
  host: {hostname: string, port: number};
}

/** @internal */
export default function normalizeOptions(raw?: string|ConnectionOptions): ValidatedOptions {
  if (typeof raw === 'string') {
    raw = {url: raw}
  }
  const props: any = {...DEFAULT_OPTS, ...raw}
  let url
  if (typeof props.url == 'string') {
    url = new URL(props.url)
    props.hostname = url.hostname
    props.port = url.port
    props.tls = props.tls || true
  } else {
      throw new Error('url is not valid string.')
  }

  const acquireTimeout = parseInt(url.searchParams.get('acquire_timeout')!)
  if (!isNaN(acquireTimeout)) {
    props.acquireTimeout = Math.max(0, acquireTimeout)
  }

  const connectionTimeout = parseInt(url.searchParams.get('connection_timeout')!)
  if (!isNaN(connectionTimeout)) {
    props.connectionTimeout = Math.max(0, connectionTimeout)
  }

  if (props.tls === true) {
    props.tls = {}
  }

  assertNumber(props, 'acquireTimeout', 0)
  assertNumber(props, 'connectionTimeout', 0)

  return props
}

function assertNumber(props: Record<string, number>, name: string, min: number, max?: number) {
  const val = props[name]
  if (isNaN(val) || !Number.isFinite(val) || val < min || (max != null && val > max)) {
    throw new TypeError(max != null
      ? `${name} must be a number (${min}, ${max})`
      : `${name} must be a number >= ${min}`)
  }
}