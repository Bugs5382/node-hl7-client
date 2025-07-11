import { Message } from "../builder/message";
import { HL7_2_7, HL7_2_7_MSH } from "./2.7";

/**
 * HL7 2.7.1 MSH Specification
 * @remarks Only the required ones are listed below for typescript validation to pass.
 * @since 1.0.0
 * @example
 * To make it easier on having to fill this out each time, you may do this in your code:
 * ```
 * // Make this a constant in your application.
 * const MSH_HEADER: HL7_2_7_MSH = {
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
export type HL7_2_7_1_MSH = HL7_2_7_MSH;

/**
 * Hl7 Specification Version 2.7.1
 * @remarks Used to indicate that the message should follow 2.7 specification for retrieval or building a message.
 * @since 1.0.0
 */
export class HL7_2_7_1 extends HL7_2_7 {
  constructor() {
    super();
    this.name = "2.7.1";
  }

  /**
   * Check MSH Header Properties for HL7 2.7
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH(msh: HL7_2_7_1_MSH): boolean {
    return super.checkMSH(msh);
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param mshHeader
   * @param message
   */
  buildMSH(mshHeader: HL7_2_7_1_MSH, message: Message): void {
    super.buildMSH(mshHeader, message);
  }
}
