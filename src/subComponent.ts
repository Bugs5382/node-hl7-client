import { HL7FatalError } from './exception.js'
import {NodeBase} from "./nodeBase.js";
import { ValueNode } from './valueNode.js'

/**
 * Sub Components
 * @since 1.0.0
 * @extends ValueNode
 */
export class SubComponent extends ValueNode {

    /**
     * @since 1.0.0
     * @param parent
     * @param key
     * @param text
     */
    constructor(parent: NodeBase, key: string, text: string) {
        super(parent, key, text);
    }

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
    return !this.toString()
  }
}
