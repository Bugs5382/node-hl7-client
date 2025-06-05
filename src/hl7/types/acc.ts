import {
  accidentCode,
  accidentDateTime,
  accidentLocation,
} from "@/hl7/types/symbols";

export interface HL7_ACC {
  /**
   * Accident Date/Time
   * @since 4.0.0
   */
  acc_1?: string;
  /**
   * Accident Date/Time
   * @since 4.0.0
   */
  [accidentDateTime]?: string;
  /**
   * Accident Code
   * @since 4.0.0
   */
  acc_2?: string;
  /**
   * Accident Code
   * @since 4.0.0
   */
  [accidentCode]?: string;
  /**
   * Accident Location
   * @since 4.0.0
   */
  acc_3?: string;
  /**
   * Accident Location
   * @since 4.0.0
   */
  [accidentLocation]?: string;
}
