import { HL7_MSH_MESSAGE_TYPE, HL7_MSH_PROCESSING_TYPE } from './generic.js'
import { HL7_SPEC_BASE } from './specification.js'

export const HL7_2_7_MSH_DEFAULT = {
  msh: {}
}

export interface HL7_2_7_MSH {
  /** Field Delimiter
   * @description The fields will be seperated by this 1-length character. This will override Message() class specs for all other segments generated.
   * @default |
   * @since 1.0.0 */
  msh_1?: string
  /** Encoding Delimiters
   * @description The encoding characters used to separate values fields.  This being set  will override Message() class specs for all other segments generated.
   * @default ^~\\& from the Message() Class
   * @since 1.0.0 */
  msh_2?: string
  /** Time Stamp of Message
   * @description This field contains the date/time that the sending system created the message. If the time zone is specified, it will be used throughout the message as the default time zone.
   * @example Format: YYYY[MM[DD[HH[MM[SS[.S[S[S[S]]]]]]]]][+/-ZZZZ].
   * @default (@see createDateTime() creates the example above.)
   * @since 1.0.0 */
  msh_7?: string
  /** Message Type
   * @description The message type of the Hl7 message we are sending.
   * @since 1.0.0 */
  msh_9: HL7_MSH_MESSAGE_TYPE
  /** Message Control ID
   * @description The message control ID that should ID this actual message.
   * @since 1.0.0 */
  msh_10: string
  /** Processing ID
   * @since 1.0.0 */
  msh_11?: HL7_MSH_PROCESSING_TYPE | undefined
  /** */
  msh_12?: string
}

export class HL7_2_7 extends HL7_SPEC_BASE {
  checkMSH (msh: HL7_2_7_MSH): HL7_2_7_MSH {
    if (typeof msh.msh_7 !== 'undefined' && msh.msh_7.length > 24) {
      throw new Error('MSH.7 must less than 24 characters.')
    }

    if (typeof msh.msh_9.msh_9_1 === 'undefined' ||
      typeof msh.msh_9.msh_9_2 === 'undefined' ||
      typeof msh.msh_9.msh_9_3 === 'undefined') {
      throw new Error('MSH.1 must be one character in length.')
    }

    if (msh.msh_9.msh_9_1.length !== 3) {
      throw new Error('MSH.9.1 must be 3 characters in length.')
    }

    if (msh.msh_9.msh_9_2.length !== 3) {
      throw new Error('MSH.9.2 must be 3 characters in length.')
    }

    if (msh.msh_9.msh_9_3.length !== 7) {
      throw new Error('MSH.9.3 must be 7 characters in length.')
    }

    if (typeof msh.msh_10 === 'undefined') {
      throw new Error('MSH.9.10 must be defined.')
    }

    if (msh.msh_10.length > 199) {
      throw new Error('MSH.9.10 must less than 199 characters.')
    }

    return msh
  }
}
