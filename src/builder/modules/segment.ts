import { Delimiters } from '../../utils/enum.js'
import { HL7FatalError } from '../../utils/exception.js'
import { isNumber, isString } from '../../utils/utils.js'
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
    if ((this._name === 'MSH') || (this._name === 'BHS') || (this._name === 'FHS')) {
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
   * Set HL7 Segment at Path with a Value
   * @since 1.0.0
   * @param path
   * @param value
   */
  set (path: string | number, value?: any): Node {
    if (arguments.length === 1) {
      return this.ensure(path)
    }

    if (typeof path === 'string') {
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          this.set(`${path}.${i + 1}`, value[i])
        }
      } else {
        const _path = this.preparePath(path)
        this.write(_path, this.prepareValue(value))
      }

      return this
    } else if (isNumber(path)) {
      if (Array.isArray(value)) {
        const child = this.ensure(path)
        for (let i = 0, l = value.length; i < l; i++) {
          child.set(i, value[i])
        }
        return this
      } else {
        this.setChild(this.createChild(this.prepareValue(value), path), path)
      }

      return this
    }

    throw new HL7FatalError(500, 'Path must be a string or number.')
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
    if ((this._name === 'MSH') || (this._name === 'BHS') || (this._name === 'FHS')) {
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
