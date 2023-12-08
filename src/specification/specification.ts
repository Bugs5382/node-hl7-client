import { HL7_2_7_BSH, HL7_2_7_MSH } from './2.7.js'

/** @internal Unions **/
export type MSH = HL7_2_7_MSH
/** @internal Unions **/
export type BSH = HL7_2_7_BSH

/** @internal */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  name: string
  /** Check the BSH Header for this Specification */
  checkBSH: (options: BSH) => boolean
  /** Check the MSH Header for this Specification */
  checkMSH: (options: MSH) => boolean

}

/** @internal */
export class HL7_SPEC_BASE implements HL7_SPEC {
  /** @internal */
  name = ''

  /**
   * Check BSH Header Properties
   * @since 1.0.0
   * @param _options
   * @return boolean
   */
  checkBSH (_options: BSH): boolean {
    throw new Error('Not Implemented')
  }

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
