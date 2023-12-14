import { HL7_2_7_BHS, HL7_2_7_FHS, HL7_2_7_MSH } from './2.7.js'

/** @internal Unions **/
export type MSH = HL7_2_7_MSH
/** @internal Unions **/
export type BHS = HL7_2_7_BHS
/** @internal Unions **/
export type FHS = HL7_2_7_FHS

/** @internal */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  name: string
  /** Check the BSH Header for this Specification */
  checkBHS: (options: BHS) => boolean
  /** Check the BSH Header for this Specification */
  checkFHS: (options: FHS) => boolean
  /** Check the MSH Header for this Specification */
  checkMSH: (options: MSH) => boolean

}

/** @internal */
export class HL7_SPEC_BASE implements HL7_SPEC {
  /** @internal */
  name = ''

  /**
   * Check BHS Header Properties
   * @since 1.0.0
   * @param _options
   * @return boolean
   */
  checkBHS (_options: BHS): boolean {
    throw new Error('Not Implemented')
  }

  /**
   * Check FHS Header Properties
   * @since 1.0.0
   * @param _options
   * @return boolean
   */
  checkFHS (_options: FHS): boolean {
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
