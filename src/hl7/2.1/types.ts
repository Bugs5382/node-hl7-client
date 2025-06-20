import { ClientBuilderOptions } from "@/modules/types";

export type { HL7_2_1_ACC } from "@/hl7/2.1/acc";
export type { HL7_2_1_BLG } from "@/hl7/2.1/blg";
export type { HL7_2_1_DG1 } from "@/hl7/2.1/dg1";
export type { HL7_2_1_DSC } from "@/hl7/2.1/dsc";
export type { HL7_2_1_ERR } from "@/hl7/2.1/err";
export type { HL7_2_1_EVN } from "@/hl7/2.1/evn";
export type { HL7_2_1_FT1 } from "@/hl7/2.1/ft1";
export type { HL7_2_1_MSH } from "@/hl7/2.1/msh";

export interface ClientBuilderOptions_Hl7_2_1 extends ClientBuilderOptions {
  table_0001?: string[];
  table_0003?: string[];
  table_0062?: string[];
  table_0100?: string[];
  table_0076?: string[];
}
