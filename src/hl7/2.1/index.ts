import { HL7FatalError, HL7ValidationError } from "@/helpers/exception";
import { HL7_2_1_MSH } from "@/hl7/2.1/msh";
import {
  receivingApplication,
  receivingFacility,
  sendingApplication,
  sendingFacility,
} from "@/hl7/types/symbols";
import { ClientBuilderOptions } from "@/modules/types";
import { Validator } from "@/modules/validator";
import { createHL7Date } from "@/utils/createHL7Date";
import { randomString } from "@/utils/randomString";
import { HL7_BASE } from "../base";

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
  /**
   *
   * @param props
   */
  constructor(props?: ClientBuilderOptions) {
    super(props);
    this.version = "2.1";
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

    const mshHeader = this._message.addSegment("MSH");
    const validator = new Validator({ segment: mshHeader });

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

    validator.validateAndSet("3", props.msh_3 || msh[sendingApplication], {
      required: false,
      type: "string",
      length: { min: 1, max: 15 },
    });

    validator.validateAndSet("4", props.msh_4 || msh[sendingFacility], {
      required: false,
      type: "string",
      length: { min: 1, max: 20 },
    });

    validator.validateAndSet("5", props.msh_5 || msh[receivingApplication], {
      required: false,
      type: "string",
      length: { min: 1, max: 15 },
    });

    validator.validateAndSet("4", props.msh_6 || msh[receivingFacility], {
      required: false,
      type: "string",
      length: { min: 1, max: 30 },
    });

    validator.validateAndSet("7", createHL7Date(new Date(), this._opt.date), {
      required: true,
      type: "string",
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
      allowedValues: [
        "ACK",
        "ARD",
        "BAR",
        "DSR",
        "MCF",
        "ORF",
        "ORM",
        "ORR",
        "ORU",
        "OSQ",
        "UDM",
      ],
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

    mshHeader.set("12", this.version);
  }
}
