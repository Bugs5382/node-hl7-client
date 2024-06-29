import { Delimiters } from '../../utils/enum.js'
import { HL7FatalError } from '../../utils/exception.js'
import { isHL7Number, isHL7String } from '../../utils/utils.js'
import { Field } from './field.js'
import { NodeBase } from './nodeBase.js'
import { HL7Node } from '../interface/hL7Node.js'
import { SubComponent } from './subComponent.js'

/**
 * Segment
 * @since 1.0.0
 */
export class Segment extends NodeBase {
  /** @internal */
  private readonly _segmentName: string

  /** @internal */
  constructor (parent: NodeBase, text: string) {
    super(parent, text, Delimiters.Field)
    if (!isHL7String(text) || text.length === 0) {
      throw new HL7FatalError('Segment must have a name.')
    }
    this._segmentName = text.slice(0, 3)
    this._name = this._segmentName
  }

  /** @internal */
  read (path: string[]): HL7Node {
    let index = parseInt(path.shift() as string)
    if (index < 1) {
      throw new HL7FatalError('Index must be 1 or greater.')
    }
    if ((this._name === 'MSH') || (this._name === 'BHS') || (this._name === 'FHS')) {
      if (typeof this.message !== 'undefined' && index === 1) {
        return new SubComponent(this, '1', this.message.delimiters[Delimiters.Field])
      } else {
        index = index - 1
      }
    }

    const field = this.children[index]
    return typeof field !== 'undefined' && path.length > 0 ? field.read(path) : field
  }

  /** @internal */
  set (path: string | number, value?: any): HL7Node {
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
    } else if (isHL7Number(path)) {
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

    throw new HL7FatalError('Path must be a string or number.')
  }

  /** @internal */
  protected writeCore (path: string[], value: string): HL7Node {
    let index = parseInt(path.shift() as string)
    if (index < 1 || isNaN(index)) {
      throw new HL7FatalError("Can't have an index < 1 or not be a valid number.")
    }
    if ((this._name === 'MSH') || (this._name === 'BHS') || (this._name === 'FHS')) {
      if (index === 1 || index === 2) {
        throw new HL7FatalError('You cannot assign the field separator or encoding characters')
      } else {
        index = index - 1
      }
    }

    return this.writeAtIndex(path, value, index)
  }

  /** @internal */
  protected pathCore (): string[] {
    return [this._segmentName]
  }

  /** @internal */
  protected createChild (text: string, index: number): HL7Node {
    return new Field(this, index.toString(), text)
  }
}
