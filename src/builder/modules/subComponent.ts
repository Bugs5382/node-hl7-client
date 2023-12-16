import { HL7FatalError } from '../../utils/exception.js'
import { isHL7String } from '../../utils/utils.js'
import { ValueNode } from './valueNode.js'

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
    return !isHL7String(this.toString())
  }
}
