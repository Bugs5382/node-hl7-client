import { Message } from "@/builder";
import { HL7FatalError, HL7ValidationError } from "@/helpers";
import { ACC, ADD, BLG, MSH } from "@/hl7/headers";
import { normalizedClientBuilderOptions } from "@/hl7/normalizedBuilder";
import { HL7_SPEC } from "@/hl7/specs";
import { addendumContinuationPointer } from "@/hl7/types/symbols";
import { ClientBuilderOptions } from "@/modules/types";
import { Validator } from "@/modules/validator";

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
   *
   * @param props
   */
  buildACC(props: ACC) {
    this.headerExists();
    this._buildACC(props);
  }
  /**
   * Build the ADD Segment
   * @remarks Add an ADD Segment to the HL7 Message
   * @param props
   */
  buildADD(props: ADD) {
    this.headerExists();

    const lastSegment = this._message.getLastSegment();

    // @todo This might not be need to check BHS/FHS cause we are building using Message
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
      props.add_1 || props[addendumContinuationPointer],
      {
        required: false,
        type: "string",
        length: { min: 0, max: this._maxAddSegmentLength },
      },
    );
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildBLG(props: BLG) {
    this.headerExists();
    this._buildBLG(props);
  }
  buildDG1(props: any): void {
    this.headerExists();
    this._buildDG1(props);
  }
  buildDSC(props: any): void {
    this.headerExists();
    this._buildDSC(props);
  }
  buildDSP(props: any): void {
    this.headerExists();
    this._buildDSP(props);
  }
  buildERR(props: any): void {
    this.headerExists();
    this._buildERR(props);
  }
  buildEVN(props: any): void {
    this.headerExists();
    this._buildEVN(props);
  }
  buildFT1(props: any): void {
    this.headerExists();
    this._buildFT1(props);
  }
  buildGT1(props: any): void {
    this.headerExists();
    this._buildGT1(props);
  }
  buildIN1(props: any): void {
    this.headerExists();
    this._buildIN1(props);
  }
  /**
   * Build MSH Header
   * @remarks Add the required fields based on the spec chosen.
   * @since 1.0.0
   * @return void
   * @param props
   */
  buildMSH(props: Partial<MSH>): void {
    // make sure there is only one MSH header per message.
    if (this._message.totalSegment("MSH") > 0) {
      throw new HL7FatalError(
        `You can only have one MSH Header per HL7 Message.`,
      );
    }
    this._buildMSH(props);
  }
  buildMRG(props: any): void {
    this.headerExists();
    this._buildMRG(props);
  }
  buildMSA(props: any): void {
    this.headerExists();
    this._buildMSA(props);
  }
  buildNCK(props: any): void {
    this.headerExists();
    this._buildNCK(props);
  }
  buildNK1(props: any): void {
    this.headerExists();
    this._buildNK1(props);
  }
  buildNPU(props: any): void {
    this.headerExists();
    this._buildNPU(props);
  }
  buildNSC(props: any): void {
    this.headerExists();
    this._buildNSC(props);
  }
  buildNST(props: any): void {
    this.headerExists();
    this._buildNST(props);
  }
  buildNTE(props: any): void {
    this.headerExists();
    this._buildNTE(props);
  }
  buildOBR(props: any): void {
    this.headerExists();
    this._buildOBR(props);
  }
  buildOBX(props: any): void {
    this.headerExists();
    this._buildOBX(props);
  }
  buildORC(props: any): void {
    this.headerExists();
    this._buildORC(props);
  }
  buildPD1(props: any): void {
    this.headerExists();
    this._buildPD1(props);
  }
  buildPID(props: any): void {
    this.headerExists();
    this._buildPID(props);
  }
  buildPR1(props: any): void {
    this.headerExists();
    this._buildPR1(props);
  }
  buildPV1(props: any): void {
    this.headerExists();
    this._buildPV1(props);
  }
  buildQRD(props: any): void {
    this.headerExists();
    this._buildQRD(props);
  }
  buildQRF(props: any): void {
    this.headerExists();
    this._buildQRF(props);
  }
  buildRX1(props: any): void {
    this.headerExists();
    this._buildRX1(props);
  }
  buildUB1(props: any): void {
    this.headerExists();
    this._buildUB1(props);
  }
  buildURD(props: any): void {
    this.headerExists();
    this._buildURD(props);
  }
  buildURS(props: any): void {
    this.headerExists();
    this._buildURS(props);
  }
  /**
   * Check MSH Header Properties
   * @since 1.0.0
   * @return boolean
   * @param _props
   */
  checkMSH(_props: MSH): boolean {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   *
   */
  headerExists(): void {
    const firstSegment = this._message.getFirstSegment();
    if (typeof firstSegment !== "undefined" && firstSegment._name !== "MSH") {
      throw new HL7FatalError("MSH Header must be built first.");
    }
  }
  /**
   * Return the string of the entire HL7 message.
   * @since 4.0.0
   */
  toString(): string {
    return this._message.toString();
  }
  /**
   * Build the ADD Segment
   * @remarks Add an ADD Segment to the HL7 Message
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildADD(_props: ADD): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * Build the ACC Segment
   * @remarks Add an ACC Segment to the HL7 Message
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildACC(_props: ACC): void {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildBLG(_props: BLG) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildDG1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildDSC(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildDSP(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildERR(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildEVN(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildFT1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildGT1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  protected _buildIN1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * Build the MSH Segment
   * @remarks Add an MSH Segment to the HL7 Message
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildMSH(_props: Partial<MSH>): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildMRG(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildMSA(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNCK(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNK1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNPU(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNSC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNST(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildNTE(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildOBR(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildOBX(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildORC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildPD1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildPID(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildPR1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildPV1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildQRD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildQRF(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildRX1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildUB1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildURD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  protected _buildURS(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
}
