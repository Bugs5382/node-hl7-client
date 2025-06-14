import { normalizeClientOptions } from "@/client/normalizedClient";
import {
  ClientListenerOptions,
  ClientOptions,
  OutboundHandler,
} from "@/modules/types";
import EventEmitter from "events";
import { Connection } from "./connection";

/**
 * Client Class
 * @remarks The main class that starts a client connection to a valid HL7 TCP/MLLP specified server.
 * @since 1.0.0 */
export class Client extends EventEmitter {
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
    _totalAck: 0,
    /** Overall Pending
     * @since 3.1.0 */
    _totalPending: 0,
  };
  /** @internal */
  _opt: ReturnType<typeof normalizeClientOptions>;
  /** @internal */
  _connections: Connection[];

  /**
   * This creates a new client to a new server connection.
   * This is the remote side in which we will connect.
   * Then using the {@link createConnection} method, you establish a connection to the port.
   * @since 1.0.0
   * @param props
   * @example
   * ```ts
   * const client = new Client({host: '0.0.0.0'})
   * ```
   */
  constructor(props?: ClientOptions) {
    super();
    this._opt = normalizeClientOptions(props);
    this._connections = [];
  }

  /**
   * Close all connections
   * @since 2.0.0
   */
  closeAll(): void {
    // loop through!
    this._connections.map(async (connection) => {
      void connection.close();
    });
    // reset!
    this._connections = [];
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
  createConnection(
    props: ClientListenerOptions,
    cb: OutboundHandler,
  ): Connection {
    const outbound = new Connection(this, props, cb);

    outbound.on("client.acknowledged", (total: number) => {
      this.stats._totalAck = total;
    });

    outbound.on("client.sent", (total: number) => {
      this.stats._totalSent = total;
    });

    outbound.on("client.pending", (total: number) => {
      this.stats._totalPending = total;
    });

    outbound.on("client.limitExceeded", (port: number) => {
      this.emit("limitExceeded", port);
    });

    // add this connection
    this._connections.push(outbound);

    // send back current outbound
    return outbound;
  }

  /**
   * Get the host that we will connect to.
   * The port might be different from each different "connection"
   * @since 1.1.0
   */
  getHost(): string {
    return this._opt.host;
  }

  /**
   * Total ack in this object lifetime.
   * @since 2.0.0
   */
  totalAck(): number {
    return this.stats._totalAck;
  }

  /**
   * Total pending messages that need to be sent out
   * on reconnection to the server.
   * @since 3.1.0
   */
  totalPending(): number {
    return this.stats._totalPending;
  }

  /**
   * Total sent messages in this object lifetime.
   * @since 2.0.0
   */
  totalSent(): number {
    return this.stats._totalSent;
  }
}
