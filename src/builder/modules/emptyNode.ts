import { Node } from '../interface/node.js'

/**
 * Empty Node
 * @description Used for anything not value in a segment index, this will be the defaults of the methods.
 * Some have to be implemented on those segments to work.
 * @since 1.0.0
 */
export class EmptyNode implements Node {
  get name (): string {
    throw new Error('Method not implemented')
  }

  get length (): number {
    return 0
  }

  get (_path: string | number): Node {
    return this
  }

  set (_path: string | number, _value?: any): Node {
    return this
  }

  exists (_path: string | number): boolean {
    return false
  }

  forEach (_callback: (value: Node, index: number) => void): void {
    throw new Error('Method not implemented')
  }

  toString (): string {
    return ''
  }

  toFile (_name: string, _newLine?: boolean, _location?: string): void {
    throw new Error('Method not implemented.')
  }

  toRaw (): string {
    throw new Error('Method not implemented')
  }

  toArray (): Node[] {
    return []
  }

  isEmpty (): boolean {
    return true
  }

  toDate (): Date {
    throw new Error('Method not implemented')
  }

  toInteger (): number {
    throw new Error('Method not implemented')
  }

  toFloat (): number {
    throw new Error('Method not implemented')
  }

  toBoolean (): boolean {
    throw new Error('Method not implemented')
  }

  read (_path: string[]): Node {
    throw new Error('Method not implemented')
  }

  write (_path: string[], _value: string): Node {
    return this
  }

  get path (): string[] {
    throw new Error('Method not implemented')
  }
}
