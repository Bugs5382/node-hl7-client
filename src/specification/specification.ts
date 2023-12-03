import { HL7_2_7_MSH } from './2.7.js'

/** @internal Unions **/
export type MSH = HL7_2_7_MSH

/** @internal */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  name: string
  /** Check the MSH Header for this Specification */
  checkMSH: (options: MSH) => boolean
}

/** @internal */
export class HL7_SPEC_BASE implements HL7_SPEC {
  /** @internal */
  name = ''

  /**
   * Check MSH Header Properties
   * @since 1.0.0
   * @param _options
   * @return boolean
   */
  checkMSH (_options: MSH): boolean {
    throw new Error('Not Implemented')
  }
}
