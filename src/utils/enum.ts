/**
 * Type of Segments Values
 * @description Used during the class creation to give each type its own index value.
 * This is done during the constructor phase of the classes.
 * @since 1.0.0
 */
export enum Delimiters {
  /** Usually each line of the overall HL7 Message. */
  Segment,
  /** The field of each segment. Usually separated with a | */
  Field,
  /** Usually within each Field, seperated by ^ */
  Component,
  /** Usually within each Component, seperated by & */
  Repetition,
  /** The escape string used within the code. */
  Escape,
  /** Usually within each Field, seperated by ~ */
  SubComponent
}

/**
 * State of the Connected to the Server
 * @description These are the states that are used to track the connecting to the server side and also during the auto-reconnect phase.
 * @since 1.0.0
 */
export enum ReadyState {
  /** The client is trying to connect to the server. */
  CONNECTING,
  /** The client is connected to the server.  */
  CONNECTED,
  /** The client is open, but not yet trying to connect to the server.  */
  OPEN,
  /** The client is closing the connection by force or by timeout */
  CLOSING,
  /** The client connection is closed.  */
  CLOSED
}
