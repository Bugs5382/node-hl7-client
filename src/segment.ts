import { Delimiters } from './decorators/enum/delimiters.js'
import { HL7FatalError } from './exception.js'
import { Field } from './field.js'
import { NodeBase } from './nodeBase.js'
import { Node } from './decorators/interfaces/node.js'
import * as Util from './utils.js'

/**
 * Segment Class
 * @since 1.0.0
 * @extends NodeBase
 */
export class Segment extends NodeBase {
  /** @internal */
  private readonly _segmentName: string

  /**
     * Create a Segment
     * @since 1.0.0
     * @param parent
     * @param text
     */
  constructor (parent: NodeBase, text: string) {
    super(parent, text, Delimiters.Field)
    if (!Util.isString(text) || text.length === 0) {
      throw new Error('Segment must have a name.')
    }
    this._segmentName = text.slice(0, 3)
  }

  /**
     * Read Segment
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    const index = parseInt(path.shift() as string)
    if (index < 1) {
      throw new HL7FatalError(500, 'index must be 1 or greater.')
    }

    const field = this.children[index]
    return field && path.length > 0 ? field.read(path) : field
  }

  /**
     * Write Segment Core
     * @since 1.0.0
     * @param path
     * @param value
     * @protected
     */
  protected writeCore (path: string[], value: string): Node {
    const index = parseInt(path.shift() as string)
    if (index < 1) {
      throw new Error("Can't have an index < 1")
    }
    return this.writeAtIndex(path, value, index)
  }

  /**
     * Path Core
     * @since 1.0.0
     * @protected
     */
  protected pathCore (): string[] {
    return [this._segmentName]
  }

  /**
     * Create a Field from a Segment
     * @since 1.0.0
     * @see {@link Field}
     * @param text
     * @param index
     * @protected
     */
  protected createChild (text: string, index: number): Node {
    return new Field(this, index.toString(), text)
  }
}
