import { Component } from './component'
import { Delimiters } from './decorators/delimiters'
import { Node } from './interface/node'
import { HL7FatalError } from '../utils/exception'
import { NodeBase } from './nodeBase'
import { ValueNode } from './valueNode'

/**
 * Create a Field Repetition in an HL7 message segment
 * @since 1.0.0
 * @extends ValueNode
 */
export class FieldRepetition extends ValueNode {
  /**
     * @since 1.0.0
     * @param parent
     * @param key
     * @param text
     */
  constructor (parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.Component)
  }

  /**
     * Read Path
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    const component = this.children[parseInt(path.shift() as string) - 1]
    return path.length > 0 ? component.read(path) : component
  }

  /**
     * Write Core
     * @since 1.0.0
     * @param path
     * @param value
     * @protected
     */
  protected writeCore (path: string[], value: string): Node {
    return this.writeAtIndex(path, value, parseInt(path.shift() as string) - 1)
  }

  /**
     * Get Path Core
     * @since 1.0.0
     * @protected
     */
  protected pathCore (): string[] {
    if (this.parent == null) {
      throw new HL7FatalError(500, 'this.parent must not be null.')
    }
    return this.parent.path
  }

  /**
     * Create child of a field repetition
     * @since 1.0.0
     * @param text
     * @param index
     * @see {@link Component}
     * @protected
     */
  protected createChild (text: string, index: number): Node {
    return new Component(this, (index + 1).toString(), text)
  }
}
