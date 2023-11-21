/** Parent Cass of HL7 Error
 * @since 1.0.0*/
class HL7ClientError extends Error {
  code: string
  /** @internal */
  constructor (code: string, message: string) {
    super(message)
    this.name = 'HL7ClientError'
    this.code = code
  }
}

/** Used to indicate a fatal failure of a connection.
 * @since 1.0.0*/
class HL7ClientFatalError extends HL7ClientError {
  /** @internal */
  name = 'HL7ClientFatalError'
}

export { HL7ClientError, HL7ClientFatalError }
