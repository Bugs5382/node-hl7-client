import { Message } from "../builder/message";
import { HL7_2_3_1, HL7_2_3_1_MSH } from "./2.3.1";

/**
 * HL7 2.4 MSH Specification
 * @remarks Only the required ones are listed below for typescript validation to pass.
 * @since 1.0.0
 * @example
 * To make it easier on having to fill this out each time, you may do this in your code:
 * ```
 * // Make this a constant in your application.
 * const MSH_HEADER: HL7_2_4_MSH = {
 *   msh_9_1: "ADT",
 *   msh_9_2: "A01",
 *   msh_11_1: "D",
 *   msh_11_2: "A",
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
export type HL7_2_4_MSH = HL7_2_3_1_MSH & {
  /** Message Structure
   * @since 2.2.0
   * @default If not specified, it will be the combo of 9.1 and 9.2 with an underscore. */
  msh_9_3?: string;
  /** Processing Mode
   * @since 1.0.0 */
  msh_11_2?: "A" | "I" | "R" | "T" | "";
};

/**
 * Hl7 Specification Version 2.4
 * @remarks Used to indicate that the message should follow 2.7 hl7 for retrieval or building a message.
 * @since 1.0.0
 */
export class HL7_2_4 extends HL7_2_3_1 {
  constructor() {
    super();
    this.name = "2.4";
  }

  /**
   * Check MSH Header Properties for HL7 2.4
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH(msh: HL7_2_4_MSH): boolean {
    super.checkMSH(msh);
    if (
      typeof msh.msh_9_3 !== "undefined" &&
      (msh.msh_9_3.length < 3 || msh.msh_9_3.length > 10)
    ) {
      throw new Error(
        "MSH.9.3 must be 3 to 10 characters in length if specified.",
      );
    }
    return true;
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param mshHeader
   * @param message
   */
  buildMSH(mshHeader: HL7_2_4_MSH, message: Message): void {
    super.buildMSH(mshHeader, message);
    message.set(
      "MSH.9.3",
      typeof mshHeader.msh_9_3 !== "undefined"
        ? mshHeader.msh_9_3.toString()
        : `${mshHeader.msh_9_1.toString()}_${mshHeader.msh_9_2.toString()}`,
    );
  }
}
