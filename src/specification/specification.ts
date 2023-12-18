import { Message } from '../builder/message.js'
import { HL7_2_1_MSH } from './2.1'
import { HL7_2_7_MSH } from './2.7.js'

/**
 * MSH Unions
 * @since 1.0.0
 */
export type MSH = HL7_2_7_MSH | HL7_2_1_MSH

/**
 * HL7 Base Interface
 * @since 1.0.0
 */
export interface HL7_SPEC {
  /** Name of the HL7 Spec */
  name: string
  /** Check the MSH Header for this Specification */
  checkMSH: (options: MSH) => boolean
  /** Build MSH */
  buildMSH: (mshHeader: MSH, massage: Message) => void
}

/**
 * Base Class of an HL7 Specification
 * @since 1.0.0
 */
export class HL7_SPEC_BASE implements HL7_SPEC {
  /** Name
   * @since 1.0.0 */
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

  /**
   * Build MSH Header
   * @description Add the required fields based on the spec chosen.
   * @since 1.0.0
   * @param _mshHeader
   * @param _massage
   * @return void
   */
  buildMSH (_mshHeader: MSH, _massage: Message): void {
    throw new Error('Not Implemented')
  }
}
