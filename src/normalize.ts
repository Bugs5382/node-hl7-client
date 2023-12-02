import { TcpSocketConnectOpts } from 'node:net'
import type { ConnectionOptions as TLSOptions } from 'node:tls'
import { HL7_2_7 } from './specification/2.7.js'
import {MSH} from "./specification/specification";
import * as Util from './utils.js'

const DEFAULT_CLIENT_OPTS = {
  acquireTimeout: 20000,
  connectionTimeout: 10000
}

const DEFAULT_CLIENT_BUILDER_OPTS = {
  newLine: '\r',
  separatorComponent: '^',
  separatorEscape: `\\`,
  separatorField: '|',
  separatorRepetition: '~',
  separatorSubComponent: '&',
  specification: new HL7_2_7(),
  text: ""
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

/**
 * Client Builder Options
 * @description Used to specific default paramaters around building an HL7 message if that is
 * so desired.
 * It also sets up checking of input values to make sure they match up to the proper
 * HL7 specification.
 * @since 1.0.0
 */
export interface ClientBuilderOptions {
  /**
   * MSH Header Options
   * @since 1.0.0
   */
  mshHeader?: MSH
  /** At the end of each line, add this as the new line character.
   * @since 1.0.0
   * @default \r */
  newLine?: string
  /** The character used to separate different components.
   * @since 1.0.0
   * @default ^ */
  separatorComponent?: string
  /** The character used to escape characters that need it in order for the computer to interpret the string correctly.
   * @since 1.0.0
   * @default \\ */
  separatorEscape?: string
  /** The character used for separating fields.
   * @since 1.0.0
   * @default | */
  separatorField?: string
  /** The character used for repetition field/values pairs.
   * @since 1.0.0
   * @default ~ */
  separatorRepetition?: string
  /** The character used to have subcomponents seperated.
   * @since 1.0.0
   * @default & */
  separatorSubComponent?: string
  /** The HL7 spec we are going to be creating.
   * This will be formatted into the MSH header by default.
   * @since 1.0.0
   * @default 2.7 via class new HL7_2_7() */
  specification?: any
  /** The HL7 string that we are going to parse.
   * @default "" */
  text: string;
}

export interface ClientBuilderBatchOptions extends ClientBuilderOptions {
  /** */
  batchHeader?: any;
}

export interface ClientBuilderFileOptions extends ClientBuilderOptions {
  /** */
  fileHeader?: any;
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
    if (!Util.validIPv4(props.hostname)) {
      throw new Error('hostname is not a valid IPv4 address.')
    }
  } else if (typeof props.hostname === 'string' && props.ipv4 === false && props.ipv6 === true) {
    if (!Util.validIPv6(props.hostname)) {
      throw new Error('hostname is not a valid IPv6 address.')
    }
  }

  Util.assertNumber(props, 'acquireTimeout', 0)
  Util.assertNumber(props, 'connectionTimeout', 0)

  if (props.tls === true) {
    props.tls = {}
  }

  return props
}

export function normalizedClientBuilderOptions (raw?: ClientBuilderOptions): ClientBuilderOptions {
  const props = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.mshHeader == 'undefined' && props.text !== '') {
    throw new Error('mshHeader must be set if no HL7 message is being passed.')
  } else if (props.text.slice(0, 3) !== "MSH") {
    throw new Error("text must begin with the MSH segment.");
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  return props
}

export function normalizedClientBatchBuilderOptions (raw?: ClientBuilderBatchOptions): ClientBuilderBatchOptions {
  const props = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.batchHeader == 'undefined' && props.text !== '') {
    throw new Error('batchHeader must be set if no HL7 message is being passed.')
  } else if (typeof props.batchHeader != 'undefined' && typeof props.mshHeader == 'undefined' && props.text !== '' ) {
    throw new Error('batchHeader and mshHeader must be set if no HL7 message is being passed.')
  } else if (props.text.slice(0, 3) !== "BHS") {
    throw new Error("text must begin with the BHS segment.");
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  return props
}

export function normalizedClientFileBuilderOptions (raw?: ClientBuilderFileOptions): ClientBuilderFileOptions {
  const props = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.fileHeader == 'undefined' && props.text !== '') {
    throw new Error('fileHeader must be set if no HL7 message is being passed.')
  } else if (props.text.slice(0, 3) !== "FHS") {
    throw new Error("text must begin with the FHS segment.");
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
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
