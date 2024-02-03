/** Parent Cass of HL7 Error
 * @since 1.0.0 */
class HL7Error extends Error {
  code: number
  /** @internal */
  constructor (code: number, message: string) {
    super(message)
    this.name = 'HL7ClientError'
    this.code = code
  }
}

/** Used to indicate a fatal failure of a connection.
 * @since 1.0.0 */
class HL7FatalError extends HL7Error {
  /** @internal */
  name = 'HL7FatalError'
  constructor (message: string) {
    super(500, message)
  }
}

/** Used to indicate a fatal failure of a connection.
 * @since 1.0.0 */
class HL7ParserError extends Error {
  /** @internal */
  name = 'HL7ParserError'
}

export { HL7Error, HL7FatalError, HL7ParserError }
