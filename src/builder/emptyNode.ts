import { Node } from './interface/node'

/** @internal */
export class EmptyNode implements Node {
  get name (): string {
    throw new Error('Not implemented')
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
    throw new Error('Not implemented')
  }

  toString (): string {
    throw new Error('Not implemented')
  }

  toRaw (): string {
    throw new Error('Not implemented')
  }

  toArray (): Node[] {
    return []
  }

  isEmpty (): boolean {
    return  true
  }

  toDate (): Date {
    throw new Error('Not implemented')
  }

  toInteger (): number {
    throw new Error('Not implemented')
  }

  toFloat (): number {
    throw new Error('Not implemented')
  }

  toBoolean (): boolean {
    throw new Error('Not implemented')
  }

  read (_path: string[]): Node {
    throw new Error('Not implemented')
  }

  write (_path: string[], _value: string): Node {
    return this
  }

  get path (): string[] {
    throw new Error('Not implemented')
  }
}
