import { addendumContinuationPointer } from "@/hl7/types/symbols";

export interface HL7_ADD {
  /**
   * Addendum Continuation Pointer
   * @since 4.0.0
   */
  add_1?: string;
  /**
   * Addendum Continuation Pointer
   * @since 4.0.0
   */
  [addendumContinuationPointer]?: string;
}
