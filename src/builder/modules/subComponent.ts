import * as Util from '../../utils'
import { HL7FatalError } from '../../utils/exception'
import { ValueNode } from './valueNode'

/**
 * Sub Components
 * @since 1.0.0
 * @extends ValueNode
 */
export class SubComponent extends ValueNode {
  /**
     * Get Value as String
     * @since 1.0.0
     */
  toString (): string {
    if (typeof this.message !== 'undefined') {
      return this.message.unescape(this.toRaw())
    }
    throw new HL7FatalError(500, 'this.message is undefined. Unable to continue.')
  }

  /**
     * Check to see if the value is empty.
     * @since 1.0.0
     */
  isEmpty (): boolean {
    return !Util.isString(this.toString())
  }
}
