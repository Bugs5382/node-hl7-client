import { HL7_MSH } from "@/hl7/types/msh";

/**
 * HL7 2.1 MSH Specification
 * @remarks
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
 * const message = new Hl7_2_1({ ...MSH_HEADER, msh_10: 'unique id' })
 * ```
 * so this way your code is much neater.
 *
 */
export interface HL7_2_1_MSH extends HL7_MSH {
  /** Message Code
   * @example ADT
   * @since 1.0.0 */
  msh_9: string;
  /** Message Code
   * @example ADT
   * @since 1.0.0 */
  messageCode: string;
  /** Message Control ID
   * @remarks This ID is unique to the message being sent
   * so the client can track
   * to see if they get a response back from the server that this particular message was successful.
   * Max 20 characters.
   * @since 1.0.0
   * @default Random 20 Character String {@link randomString} if this is set to nothing or not included. */
  msh_10?: string;
  /** Message Control ID
   * @remarks This ID is unique to the message being sent
   * so the client can track
   * to see if they get a response back from the server that this particular message was successful.
   * Max 20 characters.
   * @since 1.0.0
   * @default Random 20 Character String {@link randomString} if this is set to nothing or not included. */
  messageControlId?: string;
}
