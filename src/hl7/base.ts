import { ACC, MSH } from "@/hl7/headers";
import { normalizedClientBuilderOptions } from "@/hl7/normalizedBuilder";
import { ClientBuilderOptions } from "@/modules/types";
import { Message } from "../builder/message";

/**
 * HL7 Base Interface
 * @since 1.0.0
 */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  version: string;
  /** Build ACC (Accident) Segment */
  buildACC: (accHeader: ACC) => void;
  /** Build MSH (Message Header) Segment */
  buildMSH: (mshHeader: MSH) => void;
  /** Check the MSH Header for this Specification validation. */
  checkMSH: (mshHeader: MSH) => boolean;
  /** Export compiled H7 String */
  toString: () => string;
}

/**
 * Base Class of an HL7 Specification
 * @since 1.0.0
 */
export class HL7_BASE implements HL7_SPEC {
  /** Version
   * @since 1.0.0 */
  version = "";
  /** Name
   * @since 4.0.0 */
  protected _message: Message;
  /**
   * Options for the Hl7 Message.
   * @since 4.0.0 */
  readonly _opt: ClientBuilderOptions;

  /**
   * Create a new HL7 Message
   * @since 4.0.0
   */
  constructor(props?: ClientBuilderOptions) {
    const opt = normalizedClientBuilderOptions(props);

    this._opt = opt;
    this._message = new Message(opt);
  }

  /**
   * Build the ACC Segment
   * @remarks Add a ACC Segment to the HL7 Message
   * @since 4.0.0
   * @param _accHeader
   * @return void
   */
  buildACC(_accHeader: ACC): void {
    throw new Error("Not Implemented");
  }

  /**
   * Build MSH Header
   * @remarks Add the required fields based on the spec chosen.
   * @since 1.0.0
   * @param _mshHeader
   * @return void
   */
  buildMSH(_mshHeader: MSH): void {
    throw new Error("Not Implemented");
  }

  /**
   * Check MSH Header Properties
   * @since 1.0.0
   * @param _mshHeader
   * @return boolean
   */
  checkMSH(_mshHeader: MSH): boolean {
    throw new Error("Not Implemented");
  }

  /**
   * Return the string of the entire HL7 message.
   * @since 4.0.0
   */
  toString(): string {
    return this._message.toString();
  }
}
