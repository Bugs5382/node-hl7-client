import { InboundResponse } from "@/client/module/inboundResponse";
import { MSH } from "@/hl7/base";
import { TcpSocketConnectOpts } from "node:net";
import type { ConnectionOptions as TLSOptions } from "tls";
import { Batch, FileBatch, Message } from "../builder";

export type MessageItem = Message | Batch | FileBatch;
/**
 * Outbound Handler
 * @remarks Used to receive a response from the server
 * @since 1.0.0
 * @param res
 */
export type OutboundHandler = (res: InboundResponse) => Promise<void> | void;
export type NotifyPendingCount = (count: number) => Promise<void>;
export type FallBackHandler = (message: MessageItem) => void;

/**
 * Client Builder Options
 * @remarks Used to specific default parameters around building an HL7 message if that is
 * so desired.
 * @since 1.0.0
 */
export interface ClientBuilderOptions {
  /** The date type for the date field. Usually generated at the time of the class being initialized.
   * @since 1.0.0
   * @default 14
   */
  date?: "8" | "12" | "14";
  /** At the end of each line, add this as the new line character.
   * @since 1.0.0
   * @default \r */
  newLine?: string;
  /** The character used to separate different components.
   * @since 1.0.0
   * @default ^ */
  separatorComponent?: string;
  /** The character used to escape characters that need it in order for the computer to interpret the string correctly.
   * @since 1.0.0
   * @default \\ */
  separatorEscape?: string;
  /** The character used for separating fields.
   * @since 1.0.0
   * @default | */
  separatorField?: string;
  /** The character used for repetition field/values pairs.
   * @since 1.0.0
   * @default ~ */
  separatorRepetition?: string;
  /** The character used to have subcomponents seperated.
   * @since 1.0.0
   * @default & */
  separatorSubComponent?: string;
}

export interface ClientBuilderMessageOptions extends ClientBuilderOptions {
  /**
   * MSH Header Options
   * @since 1.0.0
   */
  messageHeader?: MSH;
  /** The HL7 string that we are going to parse.
   * @default "" */
  text?: string;
}

export interface ClientBuilderFileOptions extends ClientBuilderOptions {
  /**
   * Extension of the file when it gets created.
   * @since 1.0.0
   * @default hl7
   */
  extension?: string;
  /** The file as a buffer passed onto the constructor
   * @since 1.0.0  */
  fileBuffer?: Buffer;
  /** If you are providing the full file path, please set it here.
   * @since 1.0.0 */
  fullFilePath?: string;
  /** Location where the file will be saved.
   * If this is not set,
   * the files will get save it in the same directory of the executing file that is calling the function.
   * If running this package inside a DOCKER/KUBERNETES node,
   * if the container is destroyed and the files are not saved on a folder mounted outside the node,
   * the files will be lost on restart.
   * @since 1.0.0
   * @default ""
   */
  location?: string;
  /** The HL7 string that we are going to parse.
   * @default "" */
  text?: string;
}

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
  enqueueMessage?: (
    message: MessageItem,
    notifyPendingCount: NotifyPendingCount,
  ) => void | Promise<void>;
  /**
   * Your custom function to get messages from your custom enqueueMessage function.
   * Note: You must set up enqueueMessage prop as well.
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
   * `flushQueue(deliverFn)` is called on reconnecting and established to send stored messages back into the connection.
   */
  flushQueue?: (
    callback: FallBackHandler,
    notifyPendingCount: NotifyPendingCount,
  ) => void | Promise<void>;
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
