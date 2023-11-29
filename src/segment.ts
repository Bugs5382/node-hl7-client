import { Delimiters } from './delimiters'
import { Field } from './field'
import { Node } from './node'

export class Segment extends Node {
  constructor (parent: Node, text: string) {
    super(parent, text, Delimiters.Field)
  }

  protected createChild (text: string, index: number): Field {
    return new Field(this, index.toString(), text)
  }
}
