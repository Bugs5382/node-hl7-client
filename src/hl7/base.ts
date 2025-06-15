import { Message } from "@/builder";
import { Segment } from "@/builder/modules/segment";
import { ValidationRule } from "@/declaration/validationRule";
import { HL7FatalError, HL7ValidationError } from "@/helpers";
import { ACC, ADD, BLG, DG1, DSP, ERR, EVN, MSH } from "@/hl7/headers";
import { normalizedClientBuilderOptions } from "@/hl7/normalizedBuilder";
import { HL7_SPEC } from "@/hl7/specs";
import { ClientBuilderOptions } from "@/modules/types";
import { createHL7Date } from "@/utils";
import EventEmitter from "events";

/**
 * Base Class of an HL7 Specification
 * @since 1.0.0
 */
export class HL7_BASE extends EventEmitter implements HL7_SPEC {
  /** Version
   * @since 1.0.0 */
  version = "";
  /**
   * Regardless if errors are soft, always throw and exception or deviation from the rule.
   * @since 4.0.0
   * @private
   */
  private readonly hardError: boolean;
  /**
   * Errors
   * @since 4.0.0
   * @private
   */
  private _validatorErrors: string[] = [];
  /**
   *
   * @private
   */
  private _validatorWarnings: string[] = [];
  /**
   * @since 4.0.0
   * @protected */
  protected _message: Message;
  /**
   * Options for the Hl7 Message.
   * @since 4.0.0
   * @readonly */
  readonly _opt: ClientBuilderOptions;
  /**
   * Max length of ADD Segment.
   * Changes based on extended class.
   * @since 4.0.0
   * @protected */
  protected _maxAddSegmentLength: number | undefined;
  /**
   * The Current Segment we are working on.
   * @since 4.0.0
   * @protected
   */
  protected _segment!: Segment;

  /**
   * Create a new HL7 Message
   * @since 4.0.0
   */
  constructor(props?: ClientBuilderOptions) {
    super();
    const opt = normalizedClientBuilderOptions(props);

    this._opt = opt;
    this._message = new Message(opt);
    this.hardError = props?.hardError || false;
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

    this._segment = this._message.addSegment("ADD");

    this._validatorSetValue(
      "1",
      props.add_1 || props.addendumContinuationPointer,
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
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildDG1(props: DG1): void {
    this.headerExists();
    this._buildDG1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildDSC(props: any): void {
    this.headerExists();
    this._buildDSC(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildDSP(props: any): void {
    this.headerExists();
    this._buildDSP(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildERR(props: any): void {
    this.headerExists();
    this._buildERR(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildEVN(props: Partial<EVN>): void {
    this.headerExists();
    this._buildEVN(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildFT1(props: any): void {
    this.headerExists();
    this._buildFT1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildGT1(props: any): void {
    this.headerExists();
    this._buildGT1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
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
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildMRG(props: any): void {
    this.headerExists();
    this._buildMRG(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildMSA(props: any): void {
    this.headerExists();
    this._buildMSA(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNCK(props: any): void {
    this.headerExists();
    this._buildNCK(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNK1(props: any): void {
    this.headerExists();
    this._buildNK1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNPU(props: any): void {
    this.headerExists();
    this._buildNPU(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNSC(props: any): void {
    this.headerExists();
    this._buildNSC(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNST(props: any): void {
    this.headerExists();
    this._buildNST(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildNTE(props: any): void {
    this.headerExists();
    this._buildNTE(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildOBR(props: any): void {
    this.headerExists();
    this._buildOBR(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildOBX(props: any): void {
    this.headerExists();
    this._buildOBX(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildORC(props: any): void {
    this.headerExists();
    this._buildORC(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildPD1(props: any): void {
    this.headerExists();
    this._buildPD1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildPID(props: any): void {
    this.headerExists();
    this._buildPID(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildPR1(props: any): void {
    this.headerExists();
    this._buildPR1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildPV1(props: any): void {
    this.headerExists();
    this._buildPV1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildQRD(props: any): void {
    this.headerExists();
    this._buildQRD(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildQRF(props: any): void {
    this.headerExists();
    this._buildQRF(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildRX1(props: any): void {
    this.headerExists();
    this._buildRX1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildUB1(props: any): void {
    this.headerExists();
    this._buildUB1(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
  buildURD(props: any): void {
    this.headerExists();
    this._buildURD(props);
  }
  /**
   *
   * @since 4.0.0
   * @param props
   */
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
   * Set the date.
   * @param date
   * @param length
   */
  setDate(date?: Date, length?: "8" | "12" | "14" | "19") {
    return createHL7Date(
      typeof date === "undefined" ? new Date() : date,
      length,
    );
  }

  /**
   * Return the string of the entire HL7 message.
   * @since 4.0.0
   */
  toString(): string {
    const test = this._message.toString();
    return test;
  }

  /** Return Message Object
   * @since 4.0.0
   */
  toMessage(): Message {
    return this._message;
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
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildBLG(_props: BLG) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildDG1(_props: DG1) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildDSC(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param props
   */
  protected _buildDSP(props: Partial<DSP>): void {
    this._segment = this._message.addSegment("DSP");

    const rulesDSP_3: ValidationRule = {};
    const rulesDSP_4: ValidationRule = {};
    const rulesDSP_5: ValidationRule = {};

    if (!["2.7", "2.7.1", "2.8"].includes(this.version)) {
      rulesDSP_3.length = { min: 1, max: 300 };
    }

    if (!["2.7", "2.7.1", "2.8"].includes(this.version)) {
      rulesDSP_4.length = { min: 1, max: 2 };
    }

    if (!["2.7", "2.7.1", "2.8"].includes(this.version)) {
      rulesDSP_5.length = { min: 1, max: 20 };
    }

    this._validatorSetValue("1", props.dsp_1, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("2", props.dsp_2, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("3", props.dsp_3, {
      required: true,
      ...rulesDSP_3,
    });
    this._validatorSetValue("4", props.dsp_4, {
      required: false,
      ...rulesDSP_4,
    });
    this._validatorSetValue("5", props.dsp_5, {
      required: false,
      ...rulesDSP_5,
    });
  }

  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildERR(_props: ERR) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildEVN(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildFT1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildGT1(_props: any) {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
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
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildMRG(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildMSA(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNCK(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNK1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNPU(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNSC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNST(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildNTE(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildOBR(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildOBX(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildORC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildPD1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildPID(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildPR1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildPV1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildQRD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildQRF(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildRX1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildUB1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildURD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
  /**
   * @since 4.0.0
   * @return void
   * @param _props
   */
  protected _buildURS(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  /**
   *
   * @param value
   * @param rules
   * @private
   */
  private _validatorNormalize(value: any, rules: ValidationRule): any {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  }

  /**
   *
   * @param dep
   * @param fieldPath
   * @private
   */
  private _validatorCheckDependency(
    dep: ValidationRule["dependsOn"],
    fieldPath: string,
  ) {
    if (!dep) {
      return;
    }

    const depVal = this._validatorResolvePath(dep.path);
    const isSet = depVal !== undefined && depVal !== null && depVal !== "";

    if (dep.mustBeSet && !isSet) {
      this._validatorThrowError(
        `Field ${fieldPath} requires ${dep.path} to be set`,
      );
    }

    if (dep.mustEqual !== undefined && depVal !== dep.mustEqual) {
      this._validatorThrowError(
        `Field ${fieldPath} requires ${dep.path} to equal "${dep.mustEqual}", but got "${depVal}"`,
      );
    }
  }

  /**
   *
   * @param fieldPath
   * @param value
   * @param rules
   * @private
   */
  private _validatorCheckValue(
    fieldPath: string,
    value: any,
    rules: ValidationRule,
  ) {
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      this._validatorThrowError(`Field ${fieldPath} is required`, true);
    }

    if (value !== undefined && value !== null) {
      if (rules.type === "number" && isNaN(Number(value))) {
        this._validatorThrowError(`Field ${fieldPath} must be a number`);
      }

      if (rules.type === "string" && typeof value !== "string") {
        this._validatorThrowError(`Field ${fieldPath} must be a string`);
      }

      if (
        typeof value !== "undefined" &&
        rules.type === "date" &&
        !/^\d{8}(\d{4})?(\d{2})?(\.\d{4})?$/.test(String(value))
      ) {
        if (rules.required) {
          this._validatorThrowError(
            `Field ${fieldPath} must be a valid HL7 date in one of the following formats: YYYYMMDD, YYYYMMDDHHMM, YYYYMMDDHHMMSS, or YYYYMMDDHHMMSS.SSSS`,
          );
        }
      }

      const valStr = String(value);
      const len = valStr.length;

      if (typeof rules.length === "number" && len !== rules.length) {
        this._validatorThrowError(
          `Field ${fieldPath} must be exactly ${rules.length} characters`,
        );
      }

      if (typeof rules.length === "object") {
        if (rules.length.min && len < rules.length.min) {
          this._validatorThrowError(
            `Field ${fieldPath} must be at least ${rules.length.min} characters`,
          );
        }
        if (rules.length.max && len > rules.length.max) {
          this._validatorThrowError(
            `Field ${fieldPath} must be at most ${rules.length.max} characters`,
          );
        }
      }

      if (rules.pattern && !rules.pattern.test(valStr)) {
        this._validatorThrowError(
          `Field ${fieldPath} does not match expected format`,
        );
      }

      if (rules.allowedValues && !rules.allowedValues.includes(valStr)) {
        this._validatorThrowError(
          `Field ${fieldPath} must be one of: ${rules.allowedValues.join(", ")}`,
          true,
        );
      }
    }
  }

  /**
   *
   * @param fieldPath
   * @param value
   * @param rules
   * @protected
   */
  protected _validatorSetValue(
    fieldPath: string,
    value: any,
    rules: ValidationRule = {},
  ): string[] {
    this._validatorErrors = [];
    this._validatorWarnings = [];

    const normalized = this._validatorNormalize(value, rules);
    this._validatorCheckDependency(rules.dependsOn, fieldPath);
    this._validatorCheckValue(fieldPath, normalized, rules);

    if (
      rules.deprecated &&
      normalized !== undefined &&
      normalized !== null &&
      normalized !== ""
    ) {
      let msg = `Field ${fieldPath} is deprecated and should not be used.`;
      if (rules.useField) {
        msg += ` Use '${rules.useField}' instead.`;
      }
      this._validatorWarn(msg);
    }

    if (this._validatorErrors.length === 0) {
      this._segment.set(fieldPath, normalized);
    }

    return [...this._validatorErrors, ...this._validatorWarnings]; // Or return separately if needed
  }

  /**
   *
   * @param path
   * @private
   */
  private _validatorResolvePath(path: string): any {
    return this._segment.get(path);
  }

  /**
   *
   * @param message
   * @private
   */
  private _validatorWarn(message: string) {
    this.emit("warning", message);
    this._validatorWarnings.push(`${message}`);
  }

  /**
   *
   * @param message
   * @param forceThrow
   * @private
   */
  private _validatorThrowError(message: string, forceThrow: boolean = false) {
    this.emit("error", message);
    if (this.hardError || forceThrow) {
      throw new HL7ValidationError(message);
    }

    this._validatorErrors.push(message);
  }
}
