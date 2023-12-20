import { Component } from './component.js'
import { Delimiters } from '../../utils/enum.js'
import { Node } from '../interface/node.js'
import { HL7FatalError } from '../../utils/exception.js'
import { NodeBase } from './nodeBase.js'
import { ValueNode } from './valueNode.js'

/** @internal */
export class FieldRepetition extends ValueNode {
  /** @internal */
  constructor (parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.Component)
  }

  /** @internal */
  read (path: string[]): Node {
    const component = this.children[parseInt(path.shift() as string) - 1]
    return path.length > 0 ? component.read(path) : component
  }

  /** @internal */
  protected writeCore (path: string[], value: string): Node {
    return this.writeAtIndex(path, value, parseInt(path.shift() as string) - 1)
  }

  /** @internal */
  protected pathCore (): string[] {
    if (this.parent == null) {
      throw new HL7FatalError(500, 'this.parent must not be null.')
    }
    return this.parent.path
  }

  /** @internal */
  protected createChild (text: string, index: number): Node {
    return new Component(this, (index + 1).toString(), text)
  }
}
