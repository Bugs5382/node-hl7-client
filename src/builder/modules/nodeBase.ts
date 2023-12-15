import { isNumber, isString, pad } from '../../utils/utils.js'
import { Batch } from '../batch.js'
import { EmptyNode } from './emptyNode.js'
import { HL7FatalError } from '../../utils/exception.js'
import { Delimiters } from '../../utils/enum.js'
import { Node } from '../interface/node.js'
import { Message } from '../message.js'

/** @internal */
export class NodeBase implements Node {
  protected parent: NodeBase | null

  _name: string
  private _text: string
  private readonly _delimiter: Delimiters | undefined
  private _delimiterText: string
  private _children: Node[]
  private _message: Message | Batch | undefined
  private _path: string[]
  private _dirty: boolean

  constructor (parent: NodeBase | null, text: string = '', delimiter: Delimiters | undefined = undefined) {
    this.parent = parent

    this._children = []
    this._delimiter = delimiter
    this._delimiterText = ''
    this._dirty = false
    this._name = ''
    this._path = []
    this._text = text
  }

  static empty = new EmptyNode()

  get (path: string | number): Node {
    let ret: any

    if (typeof path === 'number') {
      if (path >= 0 && path < this.children.length) {
        ret = this.children[path]
      }
    } else if (path !== '') {
      const _path = this.preparePath(path)
      ret = this.read(_path)
    }

    return typeof ret !== 'undefined' ? ret as Node : NodeBase.empty as Node
  }

  set (path: string | number, value?: any): Node {
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
    } else if (isNumber(path)) {
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

    throw new HL7FatalError(500, 'Path must be a string or number.')
  }

  get name (): string {
    if (this._name !== undefined) {
      return this._name
    }
    this._name = this.path.join('.')
    return this._name
  }

  get length (): number {
    return this.children.length
  }

  toDate (): Date {
    throw new Error('Method not implemented.')
  }

  toFile (_name: string, _newLine?: boolean, _location?: string): void {
    throw new Error('Method not implemented.')
  }

  toInteger (): number {
    throw new Error('Method not implemented.')
  }

  toFloat (): number {
    throw new Error('Method not implemented.')
  }

  toBoolean (): boolean {
    throw new Error('Method not implemented.')
  }

  toString (): string {
    return this.toRaw()
  }

  toRaw (): string {
    if (!this._dirty) {
      return typeof this._text !== 'undefined' ? this._text : ''
    }
    this._dirty = false
    this._text = this.children.map(x => x.toRaw()).join(this.delimiter)
    return this._text
  }

  toArray (): Node[] {
    return this.children
  }

  forEach (callback: (value: Node, index: number) => void): void {
    const children = this.children
    for (let i = 0, l = children.length; i < l; i++) {
      callback(children[i], i)
    }
  }

  exists (path: string | number): boolean {
    const value = this.get(path)
    if (value == null) {
      return false
    }
    return !value.isEmpty()
  }

  isEmpty (): boolean {
    return this.children.length === 0
  }

  protected ensure (path: string | number): Node {
    const ret = this.get(path)
    if (ret !== NodeBase.empty) {
      return ret
    }
    if (typeof path === 'number') {
      return this.setChild(this.createChild('', path), path)
    } else if (isString(path)) {
      return this.write(this.preparePath(path), '')
    }
    throw new HL7FatalError(500, 'There seems to be a problem.')
  }

  protected preparePath (path: string): string[] {
    let parts = path.split('.')
    if (parts[0] === '') {
      parts.shift()
      parts = this.path.concat(parts)
    }

    if (!this._isSubPath(parts)) {
      throw new HL7FatalError(500, "'" + parts.toString() + "' is not a sub-path of '" + this.path.toString() + "'")
    }

    return this._remainderOf(parts)
  }

  protected prepareValue (value: any): string {
    if (value == null) return ''

    if (typeof value === 'string') {
      if (typeof this.message !== 'undefined') {
        return this.message.escape(value)
      }
    }

    if (typeof value === 'number') {
      return value.toString()
    }

    if (typeof value === 'boolean') {
      return value ? 'Y' : 'N'
    }

    if (value instanceof Date) {
      return this._formatDateTime(value)
    }

    return value.toString()
  }

  protected get message (): Message | Batch | undefined {
    if (typeof this._message !== 'undefined') {
      return this._message
    }
    this._message = (this.parent !== null) ? this.parent.message : this as any
    return this._message
  }

  read (_path: string[]): Node {
    throw new Error('Method not implemented.')
  }

  write (path: string[], value: string): Node {
    this.setDirty()
    return this.writeCore(path, value == null ? '' : value)
  }

  protected writeCore (_path: string[], _value: string): Node {
    throw new Error('Method not implemented.')
  }

  protected writeAtIndex (path: string[], value: string, index: number, emptyValue = ''): Node {
    let child: Node

    if (path.length === 0) {
      child = this.createChild(typeof value !== 'undefined' ? value : emptyValue, index)
    } else {
      if (index < this.children.length) {
        child = this.children[index]
      } else {
        child = this.createChild(emptyValue, index)
      }
    }

    this.setChild(child, index)

    if (path.length !== 0) {
      return child.write(path, value)
    }

    return child
  }

  get path (): string[] {
    if (typeof this._path !== 'undefined') {
      return this._path
    }
    this._path = this.pathCore()
    return this._path
  }

  protected pathCore (): string[] {
    throw new Error('Method not implemented.')
  }

  protected get delimiter (): string {
    if (typeof this.message === 'undefined') {
      throw new HL7FatalError(500, 'this.message is not defined.')
    }

    if (typeof this._delimiter === 'undefined') {
      throw new HL7FatalError(500, 'this.message is not defined.')
    }

    this._delimiterText = this.message.delimiters[this._delimiter]
    return this._delimiterText
  }

  protected get children (): Node[] {
    if (this._text !== '' && this._children.length === 0) {
      const parts = this._text.split(this.delimiter)
      const children = new Array(parts.length)
      for (let i = 0, l = parts.length; i < l; i++) {
        children[i] = this.createChild(parts[i], i)
      }
      this._children = children
    }
    return this._children
  }

  protected addChild (text: string): Node {
    this.setDirty()
    const child = this.createChild(text, this.children.length)
    this.children.push(child)
    return child
  }

  protected createChild (_text: string, _index: number): Node {
    throw new Error('Method not implemented.')
  }

  protected setChild (child: Node, index: number): Node {
    this.setDirty()
    const children = this.children
    if (index < children.length) {
      children[index] = child
      return child
    }
    for (let i = children.length; i < index; i++) {
      children.push(this.createChild('', i))
    }
    children.push(child)
    return child
  }

  protected setDirty (): void {
    if (!this._dirty) {
      this._dirty = true
      if (typeof this.parent !== 'undefined' && this.parent !== null) {
        this.parent.setDirty()
      }
    }
  }

  private _isSubPath (other: string[]): boolean {
    if (this.path.length >= other.length) {
      return false
    }
    const path = this.path
    for (let i = 0, l = path.length; i < l; i++) {
      if (path[i] !== other[i]) {
        return false
      }
    }
    return true
  }

  private _remainderOf (other: string[]): string[] {
    const path = this.path
    return other.slice(path.length)
  }

  private _formatDateTime (date: Date): string {
    // check if there is a time component
    if (date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0 || date.getMilliseconds() !== 0) {
      return this._formatDate(date) + pad(date.getHours(), 2) + pad(date.getMinutes(), 2) + pad(date.getSeconds(), 2)
    }
    return this._formatDate(date)
  }

  private _formatDate (date: Date): string {
    return date.getFullYear().toString() + pad(date.getMonth() + 1, 2) + pad(date.getDate(), 2)
  }
}
