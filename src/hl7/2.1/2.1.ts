import { HL7_2_1_MSH } from "@/hl7/2.1/msh";
import {
  processingId,
  receivingApplication,
  receivingFacility,
  sendingApplication,
  sendingFacility
} from "@/hl7/types/msh";
import { HL7FatalError } from "@/utils/exception";
import { ClientBuilderOptions } from "@/utils/types";
import { createHL7Date, randomString } from "@/utils/utils";
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
 *  msh_9: "ADT",
 *  msh_10: "12345",
 *  msh_11: "D",
 * });
 *
 * Will generate: MSH|^~\&||||||20081231||ADT|12345|D|2.1
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
    this.name = "2.1";
  }

  /**
   * Build HL7 MSH Segment
   * @since 1.0.0
   * @param props
   */
  MSH(props: Partial<HL7_2_1_MSH>): void {
    const msh = { ...props };

    if (props.msh_3) {
      msh[sendingApplication] = props.msh_3;
    } else if (msh[sendingApplication]) {
      props.msh_3 = msh[sendingApplication];
    }

    // make sure there is only one MSH header per message.
    if (this._message.totalSegment("MSH") > 0) {
      throw new HL7FatalError(
        `You can only have one MSH Header per HL7 Message.`,
      );
    }

    const mshHeader = this._message.addSegment("MSH");

    mshHeader.set(
      "1",
      `${this._opt.separatorComponent as string}${this._opt.separatorRepetition as string}${this._opt.separatorEscape as string}${this._opt.separatorSubComponent as string}`,
    );

    if (
      typeof msh[sendingApplication] !== "undefined" ||
      typeof props.msh_3 !== "undefined"
    ) {
      mshHeader.set("3", msh[sendingApplication]);
    }

    if (
      typeof msh[sendingFacility] !== "undefined" ||
      typeof props.msh_4 !== "undefined"
    ) {
      mshHeader.set("4", msh[sendingFacility]);
    }

    if (
      typeof msh[receivingApplication] !== "undefined" ||
      typeof props.msh_5 !== "undefined"
    ) {
      mshHeader.set("5", msh[receivingApplication]);
    }

    if (
      typeof msh[receivingFacility] !== "undefined" ||
      typeof props.msh_6 !== "undefined"
    ) {
      mshHeader.set("6", msh[receivingFacility]);
    }

    mshHeader.set("7", createHL7Date(new Date(), this._opt.date));

    if (
      typeof msh[processingId] !== "undefined" ||
      typeof props.msh_9 !== "undefined"
    ) {
      mshHeader.set("9", msh[processingId] || props.msh_9);
    }

    // if control ID is blank, then randomize it.
    if (typeof props.msh_10 === "undefined") {
      mshHeader.set("10", randomString());
    } else {
      mshHeader.set("10", props.msh_10.toString());
    }

    mshHeader.set("11", props.msh_11);
    mshHeader.set("12", this.name);
  }

  /**
   * Check MSH Header Properties for HL7 2.1
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH(msh: HL7_2_1_MSH): boolean {
    if (typeof msh.msh_9 === "undefined") {
      throw new Error("MSH.9 must be defined.");
    }

    if (
      typeof msh.msh_10 !== "undefined" &&
      (msh.msh_10.length < 0 || msh.msh_10.length > 20)
    ) {
      throw new Error(
        "MSH.10 must be greater than 0 and less than 20 characters.",
      );
    }

    return true;
  }
}
