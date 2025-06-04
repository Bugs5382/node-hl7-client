import { HL7_2_1_MSH } from "@/hl7/2.1/msh";
import { normalizedClientBuilderOptions } from "@/hl7/normalizedBuilder";
import { ClientBuilderOptions } from "@/modules/types";
import { Message } from "../builder/message";
import { HL7_2_2_MSH } from "./2.2";
import { HL7_2_3_MSH } from "./2.3";
import { HL7_2_3_1_MSH } from "./2.3.1";
import { HL7_2_4_MSH } from "./2.4";
import { HL7_2_5_MSH } from "./2.5";
import { HL7_2_5_1_MSH } from "./2.5.1";
import { HL7_2_6_MSH } from "./2.6";
import { HL7_2_7_MSH } from "./2.7";
import { HL7_2_7_1_MSH } from "./2.7.1";
import { HL7_2_8_MSH } from "./2.8";

/**
 * MSH Unions
 * @since 1.0.0
 */
export type MSH =
  | HL7_2_1_MSH
  | HL7_2_2_MSH
  | HL7_2_3_MSH
  | HL7_2_3_1_MSH
  | HL7_2_4_MSH
  | HL7_2_5_MSH
  | HL7_2_5_1_MSH
  | HL7_2_6_MSH
  | HL7_2_7_MSH
  | HL7_2_7_1_MSH
  | HL7_2_8_MSH;

/**
 * HL7 Base Interface
 * @since 1.0.0
 */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  version: string;
  /** Build MSH */
  buildMSH: (mshHeader: MSH) => void;
  /** Check the MSH Header for this Specification */
  checkMSH: (mshHeader: MSH) => boolean;
  /** */
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
