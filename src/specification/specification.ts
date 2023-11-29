import { HL7_2_7_MSH } from './2.7.js'

/** Unions **/
export type MSH = HL7_2_7_MSH

export interface HL7_SPEC {
  checkMSH: (options: MSH) => MSH
}

export class HL7_SPEC_BASE implements HL7_SPEC {
  checkMSH (_options: MSH): MSH {
    throw new Error('Not Implemented')
  }
}
