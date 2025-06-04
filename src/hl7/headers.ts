import { HL7_2_1_ACC } from "@/hl7/2.1/acc";
import { HL7_2_1_MSH } from "@/hl7/2.1/msh";
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

export type ACC = HL7_2_1_ACC;
