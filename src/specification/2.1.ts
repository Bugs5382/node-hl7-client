import { Message } from "../builder/message";
import { createHL7Date, randomString } from "../utils/utils";
import { HL7_SPEC_BASE } from "./specification";

/**
 * HL7 2.1 MSH Specification
 * @remarks Only the required ones are listed below for typescript validation to pass.
 * @since 1.0.0
 * @example
 * To make it easier on having to fill this out each time, you may do this in your code:
 * ```
 * // Make this a constant in your application.
 * const MSH_HEADER: HL7_2_1_MSH = {
 *   msh_9: "ADT",
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
export interface HL7_2_1_MSH {
  /** Message Code
   * @since 1.0.0 */
  msh_9: string;
  /** Message Control ID
   * @remarks This ID is unique to the message being sent
   * so the client can track
   * to see if they get a response back from the server that this particular message was successful.
   * Max 20 characters.
   * @since 1.0.0
   * @default Random 20 Character String {@link randomString} if this is set to nothing or not included. */
  msh_10?: string;
  /** Processing ID
   * @since 1.0.0 */
  msh_11: "D" | "P" | "T";
}

/**
 * Hl7 Specification Version 2.1
 * @remarks Used to indicate that the message should follow 2.7 specification for retrieval or building a message.
 * @since 1.0.0
 */
export class HL7_2_1 extends HL7_SPEC_BASE {
  constructor() {
    super();
    this.name = "2.1";
  }

  /**
   * Check MSH Header Properties for HL7 2.1
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH(msh: HL7_2_1_MSH): boolean {
    if (typeof msh.msh_9 === "undefined") {
      throw new Error("MSH.9 must be defined.");
    }

    if (
      typeof msh.msh_10 !== "undefined" &&
      (msh.msh_10.length < 0 || msh.msh_10.length > 20)
    ) {
      throw new Error(
        "MSH.10 must be greater than 0 and less than 20 characters.",
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
  buildMSH(mshHeader: HL7_2_1_MSH, message: Message): void {
    if (typeof mshHeader !== "undefined") {
      message.set("MSH.7", createHL7Date(new Date(), message._opt.date));
      message.set("MSH.9", mshHeader.msh_9.toString());
      // if control ID is blank, then randomize it.
      if (typeof mshHeader.msh_10 === "undefined") {
        message.set("MSH.10", randomString());
      } else {
        message.set("MSH.10", mshHeader.msh_10.toString());
      }
      message.set("MSH.11", mshHeader.msh_11);
      message.set("MSH.12", this.name);
    }
  }
}
