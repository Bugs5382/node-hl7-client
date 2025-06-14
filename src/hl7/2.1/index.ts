import { HL7ValidationError } from "@/helpers/exception";
import { HL7_2_1_BLG } from "@/hl7/2.1/blg";
import { HL7_2_1_DG1 } from "@/hl7/2.1/dg1";
import { TABLE_0076 } from "@/hl7/tables/0076";
import { TABLE_0100 } from "@/hl7/tables/0100";
import { Validator } from "@/modules/validator";
import { randomString } from "@/utils/randomString";
import { HL7_BASE } from "../base";
import {
  ClientBuilderOptions_Hl7_2_1,
  HL7_2_1_ACC,
  HL7_2_1_MSH,
} from "./types";

/**
 * Hl7 Version 2.1
 * @remarks Used to build an HL7 based off the HL7 2.1 Specification.
 * @since 1.0.0
 * @extends HL7_BASE
 * @example
 * ```ts
 * const message = new HL7_2_1();
 *
 * message.buildMSH({
 *  msh_9: "ACK",
 *  msh_10: "12345",
 *  msh_11: "T",
 * });
 *
 * Will generate: MSH|^~\&||||||20081231||ACK|12345|T|2.1
 *
 * ```
 */
export class HL7_2_1 extends HL7_BASE {
  private _table_0100: string[];
  private _table_0076: string[];
  /**
   *
   * @param props
   */
  constructor(props?: ClientBuilderOptions_Hl7_2_1) {
    super(props);
    this.version = "2.1";
    this._maxAddSegmentLength = 60;

    this._table_0100 = props?.table_0100 || TABLE_0100;
    this._table_0076 = props?.table_0076 || TABLE_0076;
  }

  /**
   * Build ACC Segment
   * @param props
   */
  protected _buildACC(props: Partial<HL7_2_1_ACC>) {
    const validator = new Validator({
      segment: this._message.addSegment("ACC"),
    });

    validator.validateAndSet(
      "1",
      (props.acc_1 instanceof Date && !isNaN(props.acc_1.getTime())) ||
        (props.timeStamp instanceof Date && !isNaN(props.timeStamp.getTime()))
        ? this.setDate(props.acc_1 || props.timeStamp, this._opt.date)
        : "",
      {
        required: false,
        type: "date",
        length: { min: 8, max: 19 },
      },
    );

    validator.validateAndSet("2", props.acc_2 || props.accidentCode, {
      required: false,
      type: "string",
      length: 2,
    });

    validator.validateAndSet("3", props.acc_3 || props.accidentLocation, {
      required: false,
      type: "string",
      length: 25,
    });
  }

  /**
   *
   * @param props
   * @protected
   */
  protected _buildBLG(props: Partial<HL7_2_1_BLG>) {
    const validator = new Validator({
      segment: this._message.addSegment("BLG"),
    });

    // see https://hl7-definition.caristix.com/v2/HL7v2.1/Tables/0100
    validator.validateAndSet("1", props.blg_1 || props.billingWhenToCharge, {
      required: false,
      type: "string",
      length: { min: 1, max: 15 },
      allowedValues: this._table_0100,
    });

    validator.validateAndSet("2", props.blg_2 || props.billingChargeType, {
      required: false,
      type: "string",
      length: 2,
    });

    validator.validateAndSet("3", props.blg_3 || props.billingAccountId, {
      required: false,
      type: "string",
      length: 25,
    });
  }

  /**
   *
   * @param props
   * @protected
   */
  protected _buildDG1(props: Partial<HL7_2_1_DG1>): void {
    const validator = new Validator({
      segment: this._message.addSegment("DG1"),
    });

    validator.validateAndSet("1", props.dg1_1 || props.diagnosisId, {
      required: true,
      length: { min: 1, max: 4 },
    });
    validator.validateAndSet("2", props.dg1_2 || props.diagnosisCodingMethod, {
      required: true,
      length: { min: 1, max: 2 },
    });
    validator.validateAndSet("3", props.dg1_3 || props.diagnosisCode, {
      required: false,
      length: { min: 1, max: 8 },
    });
    validator.validateAndSet("4", props.dg1_4 || props.diagnosisDescription, {
      required: false,
      length: { min: 1, max: 40 },
    });
    validator.validateAndSet(
      "5",
      (props.dg1_5 instanceof Date && !isNaN(props.dg1_5.getTime())) ||
        (props.timeStamp instanceof Date && !isNaN(props.timeStamp.getTime()))
        ? this.setDate(props.dg1_5 || props.timeStamp, this._opt.date)
        : "",
      { required: false, length: { min: 1, max: 19 } },
    );
    validator.validateAndSet("6", props.dg1_6 || props.diagnosisType, {
      required: true,
      length: { min: 1, max: 2 },
    });
    validator.validateAndSet("7", props.dg1_7 || props.diagnosisMajorCategory, {
      required: false,
      length: { min: 1, max: 4 },
    });
    validator.validateAndSet("8", props.dg1_8 || props.diagnosisRelatedGroup, {
      required: false,
      length: { min: 1, max: 4 },
    });
    validator.validateAndSet(
      "9",
      props.dg1_9 || props.diagnosisApprovalIndicator,
      {
        required: false,
        length: { min: 1, max: 2 },
      },
    );
    validator.validateAndSet(
      "10",
      props.dg1_10 || props.diagnosisGrouperReviewCode,
      {
        required: false,
        length: { min: 1, max: 2 },
      },
    );
    validator.validateAndSet("11", props.dg1_11 || props.diagnosisOutlierType, {
      required: false,
      length: { min: 1, max: 2 },
    });
    validator.validateAndSet("12", props.dg1_12 || props.diagnosisOutlierDays, {
      required: false,
      length: { min: 1, max: 3 },
    });
    validator.validateAndSet(
      "13",
      props.dg1_13 || props.diagnosisOutlierDCost,
      {
        required: false,
        length: { min: 1, max: 12 },
      },
    );
    validator.validateAndSet(
      "14",
      props.dg1_14 || props.diagnosisGrouperVersionAndType,
      {
        required: false,
        length: { min: 1, max: 4 },
      },
    );
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param props
   */
  protected _buildMSH(props: Partial<HL7_2_1_MSH>): void {
    const validator = new Validator({
      segment: this._message.addSegment("MSH"),
    });

    if (this._opt.separatorComponent?.length !== 1) {
      throw new HL7ValidationError(
        `Separator Component has to be a single character.`,
      );
    }

    validator.validateAndSet(
      "1",
      `${this._opt.separatorComponent as string}${this._opt.separatorRepetition as string}${this._opt.separatorEscape as string}${this._opt.separatorSubComponent as string}`,
      {
        required: true,
        type: "string",
        length: 4,
      },
    );

    validator.validateAndSet("3", props.msh_3 || props.sendingApplication, {
      required: false,
      type: "string",
      length: { min: 1, max: 15 },
    });

    validator.validateAndSet("4", props.msh_4 || props.sendingFacility, {
      required: false,
      type: "string",
      length: { min: 1, max: 20 },
    });

    validator.validateAndSet("5", props.msh_5 || props.receivingApplication, {
      required: false,
      type: "string",
      length: { min: 1, max: 15 },
    });

    validator.validateAndSet("4", props.msh_6 || props.receivingFacility, {
      required: false,
      type: "string",
      length: { min: 1, max: 30 },
    });

    validator.validateAndSet(
      "7",
      props.msh_7 instanceof Date && !isNaN(props.msh_7.getTime())
        ? this.setDate(props.msh_7, this._opt.date)
        : this.setDate(new Date(), this._opt.date),
      {
        required: true,
        type: "date",
        length: { min: 8, max: 19 },
      },
    );

    validator.validateAndSet("8", props.msh_8, {
      required: false,
      type: "string",
      length: { min: 1, max: 40 },
    });

    // review https://hl7-definition.caristix.com/v2/HL7v2.1/Tables/0076 for valid values
    validator.validateAndSet("9", props.msh_9, {
      required: true,
      type: "string",
      allowedValues: this._table_0076,
    });

    validator.validateAndSet("10", props.msh_10 || randomString(), {
      required: false,
      type: "string",
      length: { min: 1, max: 20 },
    });

    validator.validateAndSet("11", props.msh_11, {
      required: true,
      type: "string",
      length: 1,
      allowedValues: ["P", "T"],
    });

    validator.validateAndSet("12", this.version, {
      required: true,
      type: "string",
    });
  }
}
