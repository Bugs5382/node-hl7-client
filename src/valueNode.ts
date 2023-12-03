import { Delimiters } from './decorators/enum/delimiters'
import { NodeBase } from './nodeBase'

/** @internal */
export class ValueNode extends NodeBase {
  protected key: string

  constructor (parent: NodeBase, key: string, text: string, delimiter: Delimiters | undefined = undefined) {
    super(parent, text, delimiter)
    this.key = key
  }

  toString (): string {
    const children = this.children
    return children.length > 1 ? this.toRaw() : children[0].toString()
  }

  toDate (): Date {
    const text = this.toString()
    if (text.length === 8) {
      /** YYYYMMDD */
      return new Date(parseInt(text.slice(0, 4)), parseInt(text.slice(4, 6)) - 1, parseInt(text.slice(6, 8)), 0, 0, 0)
    } else if (text.length === 12) {
      /** YYYYMMDDHHMM */
      return new Date(parseInt(text.slice(0, 4)), parseInt(text.slice(4, 6)) - 1, parseInt(text.slice(6, 8)), parseInt(text.slice(8, 10)), parseInt(text.slice(10, 12)), 0)
    } else if (text.length >= 14) {
      /** YYYYMMDDHHMMSS **/
      return new Date(parseInt(text.slice(0, 4)), parseInt(text.slice(4, 6)) - 1, parseInt(text.slice(6, 8)), parseInt(text.slice(8, 10)), parseInt(text.slice(10, 12)), parseInt(text.slice(12, 14)))
    }
    throw new Error('Invalid Date Format')
  }

  toInteger (): number {
    return parseInt(this.toString())
  }

  toFloat (): number {
    return parseFloat(this.toString())
  }

  toBoolean (): boolean {
    switch (this.toString()) {
      case 'Y':
        return true
      case 'N':
        return false
    }
    throw new Error('Not a valid value for boolean value.')
  }

  protected pathCore (): string[] {
    if (this.parent === null) {
      throw new Error('Somehow, this.parent is null.')
    }
    return this.parent.path.concat([this.key])
  }
}
