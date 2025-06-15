import { ACC, ADD, BLG, DG1, DSC, DSP, ERR, EVN, MSH } from "@/hl7/headers";

/**
 * HL7 Base Interface
 * @since 1.0.0
 */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  version: string;
  /** Build ACC (Accident) Segment */
  buildACC: (props: ACC) => void;
  /** Build ADD (Addendum) Segment */
  buildADD: (props: ADD) => void;
  /** Build BLG (Billing) Segment */
  buildBLG: (props: BLG) => void;
  /** */
  buildDG1: (props: DG1) => void;
  /** */
  buildDSC: (props: DSC) => void;
  /** */
  buildDSP: (props: DSP) => void;
  /** */
  buildERR: (props: ERR) => void;
  /** */
  buildEVN: (props: EVN) => void;
  /** */
  buildFT1: (props: any) => void;
  /** */
  buildGT1: (props: any) => void;
  /** */
  buildIN1: (props: any) => void;
  /** */
  buildMRG: (props: any) => void;
  /** */
  buildMSA: (props: any) => void;
  /** Build MSH (Message Header) Segment */
  buildMSH: (props: MSH) => void;
  /** */
  buildNCK: (props: any) => void;
  /** */
  buildNK1: (props: any) => void;
  /** */
  buildNPU: (props: any) => void;
  /** */
  buildNSC: (props: any) => void;
  /** */
  buildNST: (props: any) => void;
  /** */
  buildNTE: (props: any) => void;
  /** */
  buildOBR: (props: any) => void;
  /** */
  buildOBX: (props: any) => void;
  /** */
  buildORC: (props: any) => void;
  /** */
  buildPD1: (props: any) => void;
  /** */
  buildPID: (props: any) => void;
  /** */
  buildPR1: (props: any) => void;
  /** */
  buildPV1: (props: any) => void;
  /** */
  buildQRD: (props: any) => void;
  /** */
  buildQRF: (props: any) => void;
  /** */
  buildRX1: (props: any) => void;
  /** */
  buildUB1: (props: any) => void;
  /** */
  buildURD: (props: any) => void;
  /** */
  buildURS: (props: any) => void;
  /** Check the MSH Header for this Specification validation. */
  checkMSH: (props: MSH) => boolean;
  /** Export compiled H7 String */
  toString: () => string;
}
