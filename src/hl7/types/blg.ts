import {
  billingAccountId,
  billingChargeType,
  billingWhenToCharge,
} from "@/hl7/types/symbols";

export interface HL7_BLG {
  /**
   * @since 4.0.0
   */
  blg_1?: string;
  /**
   * @since 4.0.0
   */
  [billingWhenToCharge]?: string;
  /**
   * @since 4.0.0
   */
  blg_2?: string;
  /**
   * @since 4.0.0
   */
  [billingChargeType]?: string;
  /**
   * @since 4.0.0
   */
  blg_3?: string;
  /**
   * @since 4.0.0
   */
  [billingAccountId]?: string;
}
