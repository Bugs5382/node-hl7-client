import { Message } from '../builder/message.js'
import { HL7_2_1_MSH } from './2.1.js'
import { HL7_2_2_MSH } from './2.2.js'
import { HL7_2_3_MSH } from './2.3.js'
import { HL7_2_3_1_MSH } from './2.3.1.js'
import { HL7_2_4_MSH } from './2.4.js'
import { HL7_2_5_MSH } from './2.5.js'
import { HL7_2_5_1_MSH } from './2.5.1.js'
import { HL7_2_6_MSH } from './2.6.js'
import { HL7_2_7_1_MSH } from './2.7.1.js'
import { HL7_2_7_MSH } from './2.7.js'
import { HL7_2_8_MSH } from './2.8.js'

/**
 * MSH Unions
 * @since 1.0.0
 */
export type MSH = HL7_2_1_MSH | HL7_2_2_MSH | HL7_2_3_MSH | HL7_2_3_1_MSH | HL7_2_4_MSH | HL7_2_5_MSH | HL7_2_5_1_MSH | HL7_2_6_MSH | HL7_2_7_MSH | HL7_2_7_1_MSH | HL7_2_8_MSH

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
   * @remarks Add the required fields based on the spec chosen.
   * @since 1.0.0
   * @param _mshHeader
   * @param _massage
   * @return void
   */
  buildMSH (_mshHeader: MSH, _massage: Message): void {
    throw new Error('Not Implemented')
  }
}
