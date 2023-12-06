import { Delimiters } from './decorators/delimiters'
import { Node } from './interface/node'
import { NodeBase } from './nodeBase'
import { SubComponent } from './subComponent'
import { ValueNode } from './valueNode'

/**
 * Component Field of an HL7 Segment
 * @since 1.0.0
 * @extends ValueNode
 */
export class Component extends ValueNode {
  /**
     * @since 1.0.0
     * @param parent
     * @param key
     * @param text
     */
  constructor (parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.SubComponent)
  }

  /**
     * Read Path
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    return this.children[parseInt(path.shift() as string) - 1]
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
     * Create a Child Node with Sub Component
     * @since 1.0.0
     * @param text
     * @param index
     * @see {@link SubComponent}
     * @protected
     */
  protected createChild (text: string, index: number): Node {
    return new SubComponent(this, (index + 1).toString(), text)
  }
}
