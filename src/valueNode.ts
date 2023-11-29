import { Delimiters } from './delimiters'
import { Node } from './node'

export class ValueNode extends Node {
  key: string

  constructor (parent: Node, key: string, text: string, delimiter: Delimiters) {
    super(parent, text, delimiter)

    this.key = key
  }
}
