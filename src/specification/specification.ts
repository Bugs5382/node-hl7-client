import { HL7_2_7_MSH } from './2.7.js'

/** @internal Unions **/
export type MSH = HL7_2_7_MSH

/** @internal */
export interface HL7_SPEC {
  name: string;
  checkMSH: (options: MSH) => boolean
}

/** @internal */
export class HL7_SPEC_BASE implements HL7_SPEC {
  name = ""
  checkMSH (_options: MSH): boolean {
    throw new Error('Not Implemented')
  }
}
