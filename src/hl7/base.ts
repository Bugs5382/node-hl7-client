import { HL7ValidationError } from "@/helpers";
import { ACC, ADD, MSH } from "@/hl7/headers";
import { normalizedClientBuilderOptions } from "@/hl7/normalizedBuilder";
import { addendumContinuationPointer } from "@/hl7/types/symbols";
import { ClientBuilderOptions } from "@/modules/types";
import { Validator } from "@/modules/validator";
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
  /** Build ADD (Addendum) Segment */
  buildADD: (addHeader: ADD) => void;
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
   * Max length of ADD Segment. Changes based off extended class.
   * @since 4.0.0 */
  protected _maxAddSegmentLength: number | undefined;

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
   * Build the ADD Segment
   * @remarks Add an ADD Segment to the HL7 Message
   * @param addHeader
   */
  buildADD(addHeader: ADD) {
    const lastSegment = this._message.getLastSegment();
    if (["MSH", "BHS", "FHS"].includes(lastSegment._name)) {
      throw new HL7ValidationError(
        "This segment must not follow a MSH, BHS, or FHS",
      );
    }
    const validator = new Validator({
      segment: this._message.addSegment("ADD"),
    });

    validator.validateAndSet(
      "1",
      addHeader.add_1 || addHeader[addendumContinuationPointer],
      {
        required: false,
        type: "string",
        length: { min: 0, max: this._maxAddSegmentLength },
      },
    );
  }

  /**
   * Build the ACC Segment
   * @remarks Add an ACC Segment to the HL7 Message
   * @since 4.0.0
   * @param _props
   * @return void
   */
  buildACC(_props: ACC): void {
    throw new Error("Not Implemented");
  }

  /**
   * Build MSH Header
   * @remarks Add the required fields based on the spec chosen.
   * @since 1.0.0
   * @param _props
   * @return void
   */
  buildMSH(_props: MSH): void {
    throw new Error("Not Implemented");
  }

  /**
   * Check MSH Header Properties
   * @since 1.0.0
   * @param _props
   * @return boolean
   */
  checkMSH(_props: MSH): boolean {
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
