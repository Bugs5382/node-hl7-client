/** Parent Cass of HL7 Error
 * @since 1.0.0 */
export class HL7Error extends Error {
  code: number;
  /** @internal */
  constructor(code: number, message: string) {
    super(message);
    this.name = "HL7ClientError";
    this.code = code;
  }
}

/** Used to indicate a fatal failure of a connection.
 * @since 1.0.0 */
export class HL7FatalError extends HL7Error {
  /** @internal */
  name = "HL7FatalError";
  constructor(message: string) {
    super(500, message);
  }
}

/** Used to indicate a fatal failure of a connection.
 * @since 1.0.0 */
export class HL7ParserError extends HL7Error {
  /** @internal */
  name = "HL7ParserError";
  constructor(message: string) {
    super(404, message);
  }
}
