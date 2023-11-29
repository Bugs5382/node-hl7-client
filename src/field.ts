import { Delimiters } from './delimiters'
import { Node } from './node'
import { ValueNode } from './valueNode'

export class Field extends ValueNode {
  constructor (parent: Node, key: string, text: string) {
    super(parent, key, text, Delimiters.Field)

    console.log(parent, key, text)
  }
}
