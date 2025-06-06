import { HL7FatalError, HL7ValidationError } from "@/helpers/exception";
import { HL7_2_1_BLG } from "@/hl7/2.1/blg";
import { ADD } from "@/hl7/headers";
import { TABLE_0076 } from "@/hl7/tables/0076";
import { TABLE_0100 } from "@/hl7/tables/0100";
import * as symbols from "@/hl7/types/symbols";
import { Validator } from "@/modules/validator";
import { createHL7Date } from "@/utils/createHL7Date";
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
   *
   * @param props
   */
  buildADD(props: ADD): void {
    super.buildADD(props);
  }

  /**
   *
   * @param props
   */
  buildACC(props: Partial<HL7_2_1_ACC>) {
    const acc = { ...props };

    const validator = new Validator({
      segment: this._message.addSegment("ACC"),
    });

    validator.validateAndSet(
      "1",
      props.acc_1 || acc[symbols.accidentDateTime],
      {
        required: false,
        type: "date",
        length: { min: 8, max: 19 },
      },
    );

    validator.validateAndSet("2", props.acc_2 || acc[symbols.accidentCode], {
      required: false,
      type: "string",
      length: 2,
    });

    validator.validateAndSet(
      "3",
      props.acc_3 || acc[symbols.accidentLocation],
      {
        required: false,
        type: "string",
        length: 25,
      },
    );
  }

  buildBLG(props: Partial<HL7_2_1_BLG>) {
    const blg = { ...props };
    const validator = new Validator({
      segment: this._message.addSegment("BLG"),
    });

    // see https://hl7-definition.caristix.com/v2/HL7v2.1/Tables/0100
    validator.validateAndSet(
      "1",
      props.blg_1 || blg[symbols.billingWhenToCharge],
      {
        required: false,
        type: "string",
        length: { min: 1, max: 15 },
        allowedValues: this._table_0100,
      },
    );

    validator.validateAndSet(
      "2",
      props.blg_2 || blg[symbols.billingChargeType],
      {
        required: false,
        type: "string",
        length: 2,
      },
    );

    validator.validateAndSet(
      "3",
      props.blg_3 || blg[symbols.billingAccountId],
      {
        required: false,
        type: "string",
        length: 25,
      },
    );
  }

  buildDG1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildDSC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildDSP(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildERR(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildEVN(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildFT1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildGT1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildIN1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param props
   */
  buildMSH(props: Partial<HL7_2_1_MSH>): void {
    const msh = { ...props };

    // make sure there is only one MSH header per message.
    if (this._message.totalSegment("MSH") > 0) {
      throw new HL7FatalError(
        `You can only have one MSH Header per HL7 Message.`,
      );
    }

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

    validator.validateAndSet(
      "3",
      props.msh_3 || msh[symbols.sendingApplication],
      {
        required: false,
        type: "string",
        length: { min: 1, max: 15 },
      },
    );

    validator.validateAndSet("4", props.msh_4 || msh[symbols.sendingFacility], {
      required: false,
      type: "string",
      length: { min: 1, max: 20 },
    });

    validator.validateAndSet(
      "5",
      props.msh_5 || msh[symbols.receivingApplication],
      {
        required: false,
        type: "string",
        length: { min: 1, max: 15 },
      },
    );

    validator.validateAndSet(
      "4",
      props.msh_6 || msh[symbols.receivingFacility],
      {
        required: false,
        type: "string",
        length: { min: 1, max: 30 },
      },
    );

    validator.validateAndSet("7", createHL7Date(new Date(), this._opt.date), {
      required: true,
      type: "date",
      length: { min: 8, max: 19 },
    });

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

  buildMRG(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildMSA(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNCK(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNK1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNPU(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNSC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNST(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildNTE(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildOBR(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildOBX(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildORC(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildPD1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildPID(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildPR1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildPV1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildQRD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildQRF(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildRX1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildUB1(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildURD(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }

  buildURS(_props: any): void {
    throw new HL7FatalError("Not Implemented");
  }
}
