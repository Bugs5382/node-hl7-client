export interface HL7_NST {
  /** Statistics Available: "Y" or "N" */
  nst_1?: "Y" | "N";
  /** Source Identifier */
  nst_2?: string;
  /** Source Type */
  nst_3?: string;
  /** Statistics Start (date/time) */
  nst_4?: Date | string;
  /** Statistics End (date/time) */
  nst_5?: Date | string;
  /** Receive Character Count */
  nst_6?: number | string;
  /** Send Character Count */
  nst_7?: number | string;
  /** Messages Received */
  nst_8?: number | string;
  /** Messages Sent */
  nst_9?: number | string;
  /** Checksum Errors Received */
  nst_10?: number | string;
  /** Length Errors Received */
  nst_11?: number | string;
  /** Other Errors Received */
  nst_12?: number | string;
  /** Connect Timeouts */
  nst_13?: number | string;
  /** Receive Timeouts */
  nst_14?: number | string;
  /** Application Control Level Errors */
  nst_15?: number | string;
}
