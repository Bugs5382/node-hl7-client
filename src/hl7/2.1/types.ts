import { ClientBuilderOptions } from "@/modules/types";

export type { HL7_2_1_ACC } from "@/hl7/2.1/acc";
export type { HL7_2_1_MSH } from "@/hl7/2.1/msh";

export interface ClientBuilderOptions_Hl7_2_1 extends ClientBuilderOptions {
  table_0100?: string[];
  table_0076?: string[];
}
