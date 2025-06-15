import { HL7_2_1_ACC } from "@/hl7/2.1/acc";
import { HL7_2_1_BLG } from "@/hl7/2.1/blg";
import { HL7_2_1_DG1 } from "@/hl7/2.1/dg1";
import { HL7_2_1_DSC } from "@/hl7/2.1/dsc";
import { HL7_2_1_ERR } from "@/hl7/2.1/err";
import { HL7_2_1_MSH } from "@/hl7/2.1/msh";
import { HL7_ADD } from "@/hl7/types/add";
import { HL7_DSP } from "@/hl7/types/dsp";
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

export type ACC = HL7_2_1_ACC;

export type ADD = HL7_ADD;

export type BLG = HL7_2_1_BLG;

export type DG1 = HL7_2_1_DG1;

export type DSC = HL7_2_1_DSC;

export type DSP = HL7_DSP;

export type ERR = HL7_2_1_ERR;

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
