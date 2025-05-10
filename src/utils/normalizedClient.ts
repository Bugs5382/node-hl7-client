import { TcpSocketConnectOpts } from "node:net";
import type { ConnectionOptions as TLSOptions } from "node:tls";
import { Batch, FileBatch, Message } from "../builder/index.js";
import { InboundResponse } from "../client/module/inboundResponse.js";
import { HL7FatalError } from "./exception.js";
import { assertNumber, validIPv4, validIPv6 } from "./utils.js";

/**
 * Outbound Handler
 * @remarks Used to receive a response from the server
 * @since 1.0.0
 * @param res
 */
export type OutboundHandler = (res: InboundResponse) => Promise<void> | void;

const DEFAULT_CLIENT_OPTS = {
  encoding: "utf-8",
  connectionTimeout: 0,
  maxAttempts: 10,
  maxConnectionAttempts: 10,
  maxTimeout: 10,
  retryHigh: 30000,
  retryLow: 1000,
};

const DEFAULT_LISTEN_CLIENT_OPTS = {
  autoConnect: true,
  maxAttempts: 10,
  maxConnectionAttempts: 10,
  waitAck: true,
};

export interface ClientOptions {
  /**
   * How long a connection attempt checked before ending the socket and attempting again.
   * If this is set to zero, the client will stay connected.
   * Min. is 0 (Stay Connected), and Max. is 60000 (60 seconds.)
   * Use with caution.
   * @default 0
   */
  connectionTimeout?: number;
  /** Host - You can do a FQDN or the IPv(4|6) address. */
  host?: string;
  /** IPv4 - If this is set to true, only IPv4 address will be used and also validated upon installation from the hostname property.
   * @default false */
  ipv4?: boolean;
  /** IPv6 - If this is set to true, only IPv6 address will be used and also validated upon installation from the hostname property.
   * @default false */
  ipv6?: boolean;
  /** Max attempts
   * to send the message before an error is thrown if we are in the process of re-attempting to connect to the server.
   * Has to be greater than 1. You cannot exceed 50.
   * @default 10 */
  maxAttempts?: number;
  /** If we are trying to establish an initial connection to the server, let's end it after this many attempts.
   * The time between re-connecting is determined by {@link connectionTimeout}.
   * You cannot exceed 50.
   * @since 1.1.0
   * @default 30
   */
  maxConnectionAttempts?: number;
  /** The number of times a connection timeout occurs until it stops attempting and just stops.
   * @since 2.1.0
   * @default 10
   */
  maxTimeout?: number;
  /** Max delay, in milliseconds, for exponential-backoff when reconnecting
   * @default 30_000 */
  retryHigh?: number;
  /** Step size, in milliseconds, for exponential-backoff when reconnecting
   * @default 1000 */
  retryLow?: number;
  /** Additional options when creating the TCP socket with net.connect(). */
  socket?: TcpSocketConnectOpts;
  /** Enable TLS, or set TLS specific options like overriding the CA for
   * self-signed certificates. */
  tls?: boolean | TLSOptions;
}

export interface ClientListenerOptions extends ClientOptions {
  /** If set to false, you have to tell the system to start trying to connect
   * by sending 'start' method.
   * @default true
   */
  autoConnect?: boolean;
  /** Encoding of the messages we expect from the HL7 message.
   * @default "utf-8"
   */
  encoding?: BufferEncoding;
  /**
   * Your custom function to store messages if messages have to queue.
   * Note: You must set up flushQueue prop as well.
   * @param message
   * @since 3.1.0
   * @example
   * ```ts
   * const enqueueMessage = (message: Message): void => {
   *   messageQueue.push(message);
   * };
   * ```
   * @remarks
   * `enqueueMessage(message)` is called whenever a message should be stored.
   */
  enqueueMessage?: (message: Message | Batch | FileBatch) => void;
  /**
   * Your custom function to get messages from your custom enqueueMessage function.
   * Note: You must set up enqueueMessage prop as well.
   * @param message
   * @since 3.1.0
   * @example
   * ```ts
   * const flushQueue = (deliver: (msg: Message) => void): void => {
   *   while (messageQueue.length > 0) {
   *     const msg = messageQueue.shift();
   *     if (msg) deliver(msg);
   *   }
   * };
   * ```
   * @remarks
   * `flushQueue(deliverFn)` is called on reconnect to send stored messages back into the connection.
   */
  flushQueue?: (
    callback: (message: Message | Batch | FileBatch) => void,
  ) => void;
  /**
   * @since 3.1.0
   * @default 10,000
   */
  maxLimit?: number;
  /** Max Connections this connection makes.
   * Has to be greater than 1.
   * @default 10 */
  maxConnections?: number;
  /** The port we should connect to on the server. */
  port: number;
  /** Wait for ACK before sending a new message.
   * If this is set to false, you can send as many messages as you want but since you are not expecting any ACK from a
   * previous message sent before sending another one.
   * This does not stop the "total acknowledgement" counter on the
   * client object to stop increasing.
   * @default true **/
  waitAck?: boolean;
}

type ValidatedClientKeys = "host" | "connectionTimeout";

type ValidatedClientListenerKeys =
  | "autoConnect"
  | "port"
  | "maxAttempts"
  | "maxConnectionAttempts";

interface ValidatedClientOptions
  extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  connectionTimeout: number;
  host: string;
  maxTimeout: number;
  retryHigh: number;
  retryLow: number;
  socket?: TcpSocketConnectOpts;
  tls?: TLSOptions;
}

interface ValidatedClientListenerOptions
  extends Pick<Required<ClientListenerOptions>, ValidatedClientListenerKeys> {
  autoConnect: boolean;
  encoding: BufferEncoding;
  extendMaxLimit: boolean;
  port: number;
  maxAttempts: number;
  maxConnectionAttempts: number;
  maxLimit: number;
  notifyOnLimitExceeded: boolean;
  retryHigh: number;
  retryLow: number;
  waitAck: boolean;
}

/** @internal */
export function normalizeClientOptions(
  raw?: ClientOptions,
): ValidatedClientOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw };

  if (typeof props.host === "undefined" || props.host.length <= 0) {
    throw new HL7FatalError(
      "host is not defined or the length is less than 0.",
    );
  }

  if (props.ipv4 === true && props.ipv6 === true) {
    throw new HL7FatalError(
      "ipv4 and ipv6 both can't be set to be both used exclusively.",
    );
  }

  if (
    typeof props.host !== "string" &&
    props.ipv4 === false &&
    props.ipv6 === false
  ) {
    throw new HL7FatalError("host is not valid string.");
  } else if (
    typeof props.host === "string" &&
    props.ipv4 === true &&
    props.ipv6 === false
  ) {
    if (!validIPv4(props.host)) {
      throw new HL7FatalError("host is not a valid IPv4 address.");
    }
  } else if (
    typeof props.host === "string" &&
    props.ipv4 === false &&
    props.ipv6 === true
  ) {
    if (!validIPv6(props.host)) {
      throw new HL7FatalError("host is not a valid IPv6 address.");
    }
  }

  if (props.tls === true) {
    props.tls = {};
  }

  assertNumber(props, "connectionTimeout", 0, 60000);
  assertNumber(props, "maxTimeout", 1, 50);

  return props;
}

/** @internal */
export function normalizeClientListenerOptions(
  client: ClientOptions,
  raw?: ClientListenerOptions,
): ValidatedClientListenerOptions {
  const props: any = { ...DEFAULT_LISTEN_CLIENT_OPTS, ...raw };

  if (typeof props.port === "undefined") {
    throw new HL7FatalError("port is not defined.");
  }

  if (typeof props.port !== "number") {
    throw new HL7FatalError("port is not valid number.");
  }

  if (typeof props.retryHigh === "undefined") {
    props.retryHigh = client.retryHigh;
  }

  if (typeof props.retryLow === "undefined") {
    props.retryLow = client.retryLow;
  }

  if (
    typeof props.enqueueMessage !== "undefined" &&
    typeof props.flushQueue === "undefined"
  ) {
    throw new HL7FatalError("flushQueue is not set.");
  }

  if (
    typeof props.enqueueMessage == "undefined" &&
    typeof props.flushQueue !== "undefined"
  ) {
    throw new HL7FatalError("enqueueMessage is not set.");
  }

  assertNumber(props, "maxLimit", 1);
  assertNumber(props, "maxAttempts", 1, 50);
  assertNumber(props, "maxConnectionAttempts", 1, 50);
  assertNumber(props, "port", 1, 65353);

  return props;
}
