import { Delimiters } from '../../utils/enum.js'
import { HL7FatalError } from '../../utils/exception.js'
import { isHL7String } from '../../utils/utils.js'
import { Field } from './field.js'
import { NodeBase } from './nodeBase.js'
import { HL7Node } from '../interface/hL7Node.js'
import { SubComponent } from './subComponent.js'

/**
 * Segment
 * @since 1.0.0
 * @extends NodeBase
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
