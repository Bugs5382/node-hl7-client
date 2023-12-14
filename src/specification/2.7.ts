import { HL7_SPEC_BASE } from './specification.js'

/**
 * HL7 2.7 MSH Specification
 * @since 1.0.0
 */
export interface HL7_2_7_MSH {
  /** Message Code
   * @since 1.0.0 */
  msh_9_1: string
  /** Trigger Event
   * @since 1.0.0 */
  msh_9_2: string
  /** Processing ID
   * @since 1.0.0 */
  msh_11_1?: 'D' | 'P' | 'T'
  /** Processing Mode
   * @since 1.0.0 */
  msh_11_2?: 'A' | 'I' | 'R' | 'T' | ''
  /** Message Control ID
   * @description The message control ID that should ID this actual message.
   * @since 1.0.0 */
  msh_10: string
}

/**
 * HL7 2.7 BSH Specification
 * @since 1.0.0
 */
export interface HL7_2_7_BHS {}

/**
 * HL7 2.7 FSH Specification
 * @since 1.0.0
 */
export interface HL7_2_7_FHS {}

/**
 * Hl7 Specification Version 2.7
 * @description Used to indicate that the message should follow 2.7 specification for retrieval or building a message.
 * @since 1.0.0
 */
export class HL7_2_7 extends HL7_SPEC_BASE {
  constructor () {
    super()
    this.name = '2.7'
  }

  /**
   * Check BHS Header Properties for HL7 2.7
   * @since 1.0.0
   * @param _bhs
   * @return boolean
   */
  checkBHS (_bhs: HL7_2_7_FHS): boolean {
    return true
  }

  /**
   * Check FHS Header Properties for HL7 2.7
   * @since 1.0.0
   * @param _fhs
   * @return boolean
   */
  checkFHS (_fhs: HL7_2_7_FHS): boolean {
    return true
  }

  /**
   * Check MSH Header Properties for HL7 2.7
   * @since 1.0.0
   * @param msh
   * @return boolean
   */
  checkMSH (msh: HL7_2_7_MSH): boolean {
    if (typeof msh.msh_9_1 === 'undefined' ||
      typeof msh.msh_9_2 === 'undefined') {
      throw new Error('MSH.9.1 & MSH 9.2 must be defined.')
    }

    if (msh.msh_9_1.length !== 3) {
      throw new Error('MSH.9.1 must be 3 characters in length.')
    }

    if (msh.msh_9_2.length !== 3) {
      throw new Error('MSH.9.2 must be 3 characters in length.')
    }

    if (typeof msh.msh_10 === 'undefined') {
      throw new Error('MSH.10 must be defined.')
    }

    if (msh.msh_10.length === 0 || msh.msh_10.length > 199) {
      throw new Error('MSH.10 must be greater than 0 and less than 199 characters.')
    }

    return true
  }
}
