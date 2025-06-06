import { HL7ValidationError } from "@/helpers";
import { ACC, ADD, BLG, MSH } from "@/hl7/headers";
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
  buildACC: (props: ACC) => void;
  /** Build ADD (Addendum) Segment */
  buildADD: (props: ADD) => void;
  /** Build BLG (Billing) Segment */
  buildBLG: (props: BLG) => void;
  /** */
  buildDG1: (props: any) => void;
  /** */
  buildDSC: (props: any) => void;
  /** */
  buildDSP: (props: any) => void;
  /** */
  buildERR: (props: any) => void;
  /** */
  buildEVN: (props: any) => void;
  /** */
  buildFT1: (props: any) => void;
  /** */
  buildGT1: (props: any) => void;
  /** */
  buildIN1: (props: any) => void;
  /** */
  buildMRG: (props: any) => void;
  /** */
  buildMSA: (props: any) => void;
  /** Build MSH (Message Header) Segment */
  buildMSH: (props: MSH) => void;
  /** */
  buildNCK: (props: any) => void;
  /** */
  buildNK1: (props: any) => void;
  /** */
  buildNPU: (props: any) => void;
  /** */
  buildNSC: (props: any) => void;
  /** */
  buildNST: (props: any) => void;
  /** */
  buildNTE: (props: any) => void;
  /** */
  buildOBR: (props: any) => void;
  /** */
  buildOBX: (props: any) => void;
  /** */
  buildORC: (props: any) => void;
  /** */
  buildPD1: (props: any) => void;
  /** */
  buildPID: (props: any) => void;
  /** */
  buildPR1: (props: any) => void;
  /** */
  buildPV1: (props: any) => void;
  /** */
  buildQRD: (props: any) => void;
  /** */
  buildQRF: (props: any) => void;
  /** */
  buildRX1: (props: any) => void;
  /** */
  buildUB1: (props: any) => void;
  /** */
  buildURD: (props: any) => void;
  /** */
  buildURS: (props: any) => void;
  /** Check the MSH Header for this Specification validation. */
  checkMSH: (props: MSH) => boolean;
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
   *
   * @since 4.0.0
   * @param _props
   */
  buildBLG(_props: BLG) {
    throw new Error("Not Implemented");
  }

  buildDG1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildDSC(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildDSP(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildERR(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildEVN(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildFT1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildGT1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildIN1(_props: any): void {
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

  buildMRG(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildMSA(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNCK(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNK1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNPU(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNSC(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNST(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildNTE(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildOBR(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildOBX(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildORC(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildPD1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildPID(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildPR1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildPV1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildQRD(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildQRF(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildRX1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildUB1(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildURD(_props: any): void {
    throw new Error("Not Implemented");
  }

  buildURS(_props: any): void {
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
