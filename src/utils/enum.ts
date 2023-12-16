/** @internal */
export enum Delimiters {
  Segment,
  Field,
  Component,
  Repetition,
  Escape,
  SubComponent
}

/** @internal */
export enum ReadyState {
  CONNECTING,
  CONNECTED,
  OPEN,
  CLOSING,
  CLOSED
}
