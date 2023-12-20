import { Message } from '../builder/message.js'
import { HL7_2_7_1 } from './2.7.1.js'

/**
 * HL7 2.8 MSH Specification
 * @description Only the required ones are listed below for typescript validation to pass.
 * @since 1.0.0
 * @example
 * To make it easier on having to fill this out each time, you may do this in your code:
 * ```
 * // Make this a constant in your application.
 * const MSH_HEADER: HL7_2_8_MSH = {
 *   msh_9_1: "ADT",
 *   msh_9_2: "A01",
 *   msh_11_1: "D",
 * }
 * ```
 * MSH.7 (Date Time) and MSH.12 (HL7 Spec) are filled in automatically at the time of creation.
 * and when you create your Message class:
 * ```
 * const message = new Message({ ...MSH_HEADER, msh_10: 'unique id' })
 * ```
 * so this way your code is much neater.
 *
 */
export interface HL7_2_8_MSH {
  /** Message Code
   * @since 1.0.0 */
  msh_9_1: string
  /** Trigger Event
   * @since 1.0.0 */
  msh_9_2: string
  /** Message Control ID
   * @description This ID is unique to the message being sent
   * so the client can track
   * to see if they get a response back from the server that this particular message was successful.
   * @since 1.0.0
   * @default Random 20 Character String @see {@link randomString} if this is set to nothing or not included. */
  msh_10?: string
  /** Processing ID
   * @since 1.0.0 */
  msh_11_1: 'D' | 'P' | 'T'
  /** Processing Mode
   * @since 1.0.0 */
  msh_11_2?: 'A' | 'I' | 'R' | 'T' | ''
}

/**
 * Hl7 Specification Version 2.8
 * @description Used to indicate that the message should follow 2.7 specification for retrieval or building a message.
 * @since 1.0.0
 */
export class HL7_2_8 extends HL7_2_7_1 {
  constructor () {
    super()
    this.name = '2.8'
  }

  /**
   * Check MSH Header Properties for HL7 2.7
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH (msh: HL7_2_8_MSH): boolean {
    return super.checkMSH(msh)
  }

  /**
   * Build HL7 MSH Segment
   * @param mshHeader
   * @param message
   */
  buildMSH (mshHeader: HL7_2_8_MSH, message: Message): void {
    super.buildMSH(mshHeader, message)
  }
}
