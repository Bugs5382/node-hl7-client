import { HL7FatalError } from '../../utils/exception.js'
import { isHL7String } from '../../utils/utils.js'
import { ValueNode } from './valueNode.js'

/** @internal */
export class SubComponent extends ValueNode {
  /** @internal */
  toString (): string {
    if (typeof this.message !== 'undefined') {
      return this.message.unescape(this.toRaw())
    }
    throw new HL7FatalError(500, 'this.message is undefined. Unable to continue.')
  }

  /** @internal */
  isEmpty (): boolean {
    return !isHL7String(this.toString())
  }
}
