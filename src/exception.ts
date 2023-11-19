/** Low severity */
class HL7ClientError extends Error {
  code: string
  /** @internal */
  constructor (code: string, message: string) {
    super(message)
    this.name = 'HL7ClientError'
    this.code = code
  }
}

/** High severity. All pending actions are rejected and all connections are closed. The connection is reset. */
class HL7ClientConnectionError extends HL7ClientError {
  /** @internal */
  name = 'HL7ClientConnectionError'
}

export { HL7ClientError, HL7ClientConnectionError }
