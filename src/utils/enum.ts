/**
 * Type of Segments Values
 * @description Used during the class creation to give each type its own index value.
 * @since 1.0.0
 */
export enum Delimiters {
  Segment,
  Field,
  Component,
  Repetition,
  Escape,
  SubComponent
}

/**
 * State of the Connected to the Server
 * @since 1.0.0
 */
export enum ReadyState {
  CONNECTING,
  CONNECTED,
  OPEN,
  CLOSING,
  CLOSED
}
