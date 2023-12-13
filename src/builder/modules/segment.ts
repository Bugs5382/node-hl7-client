import { Delimiters } from '../../utils/enum'
import { HL7FatalError } from '../../utils/exception.js'
import { isString } from '../../utils/utils'
import { Field } from './field.js'
import { NodeBase } from './nodeBase.js'
import { Node } from '../interface/node.js'
import { SubComponent } from './subComponent.js'

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
    if (!isString(text) || text.length === 0) {
      throw new HL7FatalError(500, 'Segment must have a name.')
    }
    this._segmentName = text.slice(0, 3)
    this._name = this._segmentName
  }

  /**
     * Read Segment
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    let index = parseInt(path.shift() as string)
    if (index < 1) {
      throw new HL7FatalError(500, 'index must be 1 or greater.')
    }
    if ((this._name === 'MSH') || (this._name === 'BHS')) {
      if (typeof this.message !== 'undefined' && index === 1) {
        return new SubComponent(this, '1', this.message.delimiters[Delimiters.Field])
      } else {
        index = index - 1
      }
    }

    const field = this.children[index]
    return path.length > 0 ? field.read(path) : field
  }

  /**
     * Write Segment Core
     * @since 1.0.0
     * @param path
     * @param value
     * @protected
     */
  protected writeCore (path: string[], value: string): Node {
    let index = parseInt(path.shift() as string)
    if (index < 1 || isNaN(index)) {
      throw new HL7FatalError(500, "Can't have an index < 1 or not be a valid number.")
    }
    if ((this._name === 'MSH') || (this._name === 'BHS')) {
      if (index === 1 || index === 2) {
        throw new HL7FatalError(500, 'You cannot assign the field separator or encoding characters')
      } else {
        index = index - 1
      }
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
