import { HL7ValidationError } from "@/helpers/exception";
import { HL7_2_1_GT1 } from "@/hl7/2.1/gt1";
import { TABLE_0001 } from "@/hl7/tables/0001";
import { TABLE_0003 } from "@/hl7/tables/0003";
import { TABLE_0062 } from "@/hl7/tables/0062";
import { TABLE_0076 } from "@/hl7/tables/0076";
import { TABLE_0100 } from "@/hl7/tables/0100";
import { randomString } from "@/utils/randomString";
import { HL7_BASE } from "../base";
import {
  ClientBuilderOptions_Hl7_2_1,
  HL7_2_1_ACC,
  HL7_2_1_BLG,
  HL7_2_1_DG1,
  HL7_2_1_DSC,
  HL7_2_1_ERR,
  HL7_2_1_EVN,
  HL7_2_1_FT1,
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
  private _table_0003: string[];
  private _table_0062: string[];
  private _table_0001: string[];
  /**
   *
   * @param props
   */
  constructor(props?: ClientBuilderOptions_Hl7_2_1) {
    super(props);
    this.version = "2.1";
    this._maxAddSegmentLength = 60;

    this._table_0001 = props?.table_0001 || TABLE_0001;
    this._table_0003 = props?.table_0003 || TABLE_0003;
    this._table_0062 = props?.table_0062 || TABLE_0062;
    this._table_0100 = props?.table_0100 || TABLE_0100;
    this._table_0076 = props?.table_0076 || TABLE_0076;
  }

  /**
   * Build ACC Segment
   * @param props
   */
  protected _buildACC(props: Partial<HL7_2_1_ACC>) {
    this._segment = this._message.addSegment("ACC");

    this._validatorSetValue(
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

    this._validatorSetValue("2", props.acc_2 || props.accidentCode, {
      required: false,

      length: 2,
    });

    this._validatorSetValue("3", props.acc_3 || props.accidentLocation, {
      required: false,

      length: 25,
    });
  }

  /**
   *
   * @param props
   * @protected
   */
  protected _buildBLG(props: Partial<HL7_2_1_BLG>) {
    this._segment = this._message.addSegment("BLG");

    // see https://hl7-definition.caristix.com/v2/HL7v2.1/Tables/0100
    this._validatorSetValue("1", props.blg_1 || props.billingWhenToCharge, {
      required: false,

      length: { min: 1, max: 15 },
      allowedValues: this._table_0100,
    });

    this._validatorSetValue("2", props.blg_2 || props.billingChargeType, {
      required: false,

      length: 2,
    });

    this._validatorSetValue("3", props.blg_3 || props.billingAccountId, {
      required: false,

      length: 25,
    });
  }

  /**
   *
   * @param props
   * @protected
   */
  protected _buildDG1(props: Partial<HL7_2_1_DG1>): void {
    this._segment = this._message.addSegment("DG1");

    this._validatorSetValue("1", props.dg1_1 || props.diagnosisId, {
      required: true,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("2", props.dg1_2 || props.diagnosisCodingMethod, {
      required: true,
      length: { min: 1, max: 2 },
    });
    this._validatorSetValue("3", props.dg1_3 || props.diagnosisCode, {
      required: false,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("4", props.dg1_4 || props.diagnosisDescription, {
      required: false,
      length: { min: 1, max: 40 },
    });
    this._validatorSetValue(
      "5",
      (props.dg1_5 instanceof Date && !isNaN(props.dg1_5.getTime())) ||
        (props.timeStamp instanceof Date && !isNaN(props.timeStamp.getTime()))
        ? this.setDate(props.dg1_5 || props.timeStamp, this._opt.date)
        : "",
      { required: false, length: { min: 1, max: 19 } },
    );
    this._validatorSetValue("6", props.dg1_6 || props.diagnosisType, {
      required: true,
      length: { min: 1, max: 2 },
    });
    this._validatorSetValue("7", props.dg1_7 || props.diagnosisMajorCategory, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("8", props.dg1_8 || props.diagnosisRelatedGroup, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue(
      "9",
      props.dg1_9 || props.diagnosisApprovalIndicator,
      {
        required: false,
        length: { min: 1, max: 2 },
      },
    );
    this._validatorSetValue(
      "10",
      props.dg1_10 || props.diagnosisGrouperReviewCode,
      {
        required: false,
        length: { min: 1, max: 2 },
      },
    );
    this._validatorSetValue("11", props.dg1_11 || props.diagnosisOutlierType, {
      required: false,
      length: { min: 1, max: 2 },
    });
    this._validatorSetValue("12", props.dg1_12 || props.diagnosisOutlierDays, {
      required: false,
      length: { min: 1, max: 3 },
    });
    this._validatorSetValue("13", props.dg1_13 || props.diagnosisOutlierCost, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue(
      "14",
      props.dg1_14 || props.diagnosisGrouperVersionAndType,
      {
        required: false,
        length: { min: 1, max: 4 },
      },
    );
  }

  protected _buildDSC(props: Partial<HL7_2_1_DSC>): void {
    this._segment = this._message.addSegment("DSC");

    this._validatorSetValue("1", props.dsc_1 || props.continuationPointer, {
      required: false,
      length: { min: 1, max: 60 },
    });
  }

  protected _buildERR(props: Partial<HL7_2_1_ERR>) {
    this._segment = this._message.addSegment("ERR");

    this._validatorSetValue("1", props.err_1 || props.errorIdAndLocation, {
      required: true,
      length: { min: 1, max: 80 },
    });
  }

  protected _buildEVN(props: Partial<HL7_2_1_EVN>) {
    this._segment = this._message.addSegment("EVN");

    this._validatorSetValue("1", props.evn_1, {
      allowedValues: this._table_0003,
      required: true,
    });

    this._validatorSetValue(
      "2",
      props.evn_2 instanceof Date && !isNaN(props.evn_2.getTime())
        ? this.setDate(props.evn_2, this._opt.date)
        : this.setDate(new Date(), this._opt.date),
      {
        required: true,
        type: "date",
      },
    );

    this._validatorSetValue(
      "3",
      props.evn_3 instanceof Date && !isNaN(props.evn_3.getTime())
        ? this.setDate(props.evn_3, this._opt.date)
        : "",
      {
        required: false,
        type: "date",
      },
    );

    this._validatorSetValue("4", props.evn_4, {
      allowedValues: this._table_0062,
      required: false,
    });
  }

  protected _buildFT1(props: Partial<HL7_2_1_FT1>) {
    this._segment = this._message.addSegment("FT1");

    this._validatorSetValue("1", props.ft1_1, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("2", props.ft1_2, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("3", props.ft1_3, {
      required: false,
      length: { min: 1, max: 5 },
    });
    this._validatorSetValue(
      "4",
      props.ft1_4 instanceof Date && !isNaN(props.ft1_4.getTime())
        ? this.setDate(props.ft1_4, "8")
        : this.setDate(new Date(), "8"),
      { required: true, type: "date" },
    );
    this._validatorSetValue(
      "5",
      props.ft1_5 instanceof Date && !isNaN(props.ft1_5.getTime())
        ? this.setDate(props.ft1_5, "8")
        : "",
      { required: false, type: "date" },
    );
    this._validatorSetValue("6", props.ft1_6, {
      required: true,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("7", props.ft1_7, {
      required: true,
      length: { min: 1, max: 20 },
    });
    this._validatorSetValue("8", props.ft1_8, {
      required: false,
      length: { min: 1, max: 40 },
    });
    this._validatorSetValue("9", props.ft1_9, {
      required: false,
      length: { min: 1, max: 40 },
    });
    this._validatorSetValue("10", props.ft1_10, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("11", props.ft1_11, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("12", props.ft1_12, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("13", props.ft1_13, {
      required: false,
      length: { min: 1, max: 16 },
    });
    this._validatorSetValue("14", props.ft1_14, {
      required: false,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("15", props.ft1_15, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("16", props.ft1_16, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("17", props.ft1_17, { required: false, length: 1 });
    this._validatorSetValue("18", props.ft1_18, {
      required: false,
      length: { min: 1, max: 2 },
    });
    this._validatorSetValue("19", props.ft1_19, {
      required: false,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("20", props.ft1_20, {
      required: false,
      length: { min: 1, max: 60 },
    });
    this._validatorSetValue("21", props.ft1_21, {
      required: false,
      length: { min: 1, max: 60 },
    });
    this._validatorSetValue("21", props.ft1_22, {
      required: false,
      length: { min: 1, max: 12 },
    });
  }

  protected _buildGT1(props: Partial<HL7_2_1_GT1>) {
    this._segment = this._message.addSegment("GT1");

    this._validatorSetValue("1", props.gt1_1, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("2", props.gt1_2, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("3", props.gt1_3, {
      required: true,
      length: { min: 1, max: 5 },
    });
    this._validatorSetValue("4", props.gt1_4, { required: true });
    this._validatorSetValue("5", props.gt1_5, { required: false });
    this._validatorSetValue("6", props.gt1_6, {
      required: true,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("7", props.gt1_7, {
      required: true,
      length: { min: 1, max: 20 },
    });
    this._validatorSetValue("8", props.gt1_8, {
      required: false,
      length: { min: 1, max: 40 },
    });
    this._validatorSetValue("9", props.gt1_9, {
      required: false,
      length: { min: 1, max: 40 },
    });
    this._validatorSetValue("10", props.gt1_10, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("11", props.gt1_11, {
      required: false,
      length: { min: 1, max: 4 },
    });
    this._validatorSetValue("12", props.gt1_12, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("13", props.gt1_13, {
      required: false,
      length: { min: 1, max: 16 },
    });
    this._validatorSetValue("14", props.gt1_14, {
      required: false,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("15", props.gt1_15, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("16", props.gt1_16, {
      required: false,
      length: { min: 1, max: 12 },
    });
    this._validatorSetValue("17", props.gt1_17, { required: false, length: 1 });
    this._validatorSetValue("18", props.gt1_18, {
      required: false,
      length: { min: 1, max: 2 },
    });
    this._validatorSetValue("19", props.gt1_19, {
      required: false,
      length: { min: 1, max: 8 },
    });
    this._validatorSetValue("20", props.gt1_20, {
      required: false,
      length: { min: 1, max: 60 },
    });
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param props
   */
  protected _buildMSH(props: Partial<HL7_2_1_MSH>): void {
    this._segment = this._message.addSegment("MSH");

    if (this._opt.separatorComponent?.length !== 1) {
      throw new HL7ValidationError(
        `Separator Component has to be a single character.`,
      );
    }

    this._validatorSetValue(
      "1",
      `${this._opt.separatorComponent as string}${this._opt.separatorRepetition as string}${this._opt.separatorEscape as string}${this._opt.separatorSubComponent as string}`,
      {
        required: true,

        length: 4,
      },
    );

    this._validatorSetValue("3", props.msh_3 || props.sendingApplication, {
      required: false,

      length: { min: 1, max: 15 },
    });

    this._validatorSetValue("4", props.msh_4 || props.sendingFacility, {
      required: false,

      length: { min: 1, max: 20 },
    });

    this._validatorSetValue("5", props.msh_5 || props.receivingApplication, {
      required: false,

      length: { min: 1, max: 15 },
    });

    this._validatorSetValue("4", props.msh_6 || props.receivingFacility, {
      required: false,

      length: { min: 1, max: 30 },
    });

    this._validatorSetValue(
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

    this._validatorSetValue("8", props.msh_8, {
      required: false,

      length: { min: 1, max: 40 },
    });

    // review https://hl7-definition.caristix.com/v2/HL7v2.1/Tables/0076 for valid values
    this._validatorSetValue("9", props.msh_9, {
      required: true,

      allowedValues: this._table_0076,
    });

    this._validatorSetValue("10", props.msh_10 || randomString(), {
      required: false,

      length: { min: 1, max: 20 },
    });

    this._validatorSetValue("11", props.msh_11, {
      required: true,

      length: 1,
      allowedValues: ["P", "T"],
    });

    this._validatorSetValue("12", this.version, {
      required: true,
    });
  }
}
