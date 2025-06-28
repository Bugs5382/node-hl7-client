import { TABLE_0003 } from "@/hl7/tables/0003";
import { TABLE_0062 } from "@/hl7/tables/0062";

export type Table0003Value = (typeof TABLE_0003)[number];
export type Table0062Value = (typeof TABLE_0062)[number];

export interface HL7_EVN {
  evn_1?: Table0003Value;
  evn_2?: Date;
  evn_3?: Date;
  evn_4?: Table0062Value;
}
