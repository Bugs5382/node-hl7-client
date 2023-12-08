import { Delimiters } from '../decorators/delimiters'
import { Node } from '../interface/node'
import { FieldRepetition } from './fieldRepetition'
import { NodeBase } from './nodeBase'
import { ValueNode } from './valueNode'

/**
 * Field Area of the HL7 Segment
 * @since 1.0.0
 * @extends ValueNode
 */
export class Field extends ValueNode {
  /**
     * @since 1.0.0
     * @param parent
     * @param key
     * @param text
     */
  constructor (parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.Repetition)
  }

  /**
     * Read a Field Path
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    if (this.children.length > 0) {
      return this.children[0].read(path)
    }
    throw new Error('We have a problem.')
  }

  /**
     * Write a Field
     * @since 1.0.0
     * @param path
     * @param value
     * @protected
     */
  protected writeCore (path: string[], value: string): Node {
    return this._ensureChild().write(path, value)
  }

  /**
     * Create a field repetition field of FieldRepetition
     * @since 1.0.0
     * @see {@link FieldRepetition}
     * @param text
     * @param _index
     * @protected
     */
  protected createChild (text: string, _index: number): Node {
    return new FieldRepetition(this, this.key, text)
  }

  /** @internal */
  private _ensureChild (): Node {
    let child: Node
    if (this.children.length === 0) {
      child = this.createChild('', 0)
      this.setChild(child, 0)
    } else {
      child = this.children[0]
    }
    return child
  }
}
