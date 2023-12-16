/**
 * Node
 * @since 1.0.0
 */
export interface Node {
  name: string
  length: number

  get: (path: string | number) => Node
  set: (path: string | number, value?: any) => Node

  exists: (path: string | number) => boolean
  forEach: (callback: (value: Node, index: number) => void) => void

  toString: () => string
  toRaw: () => string
  toArray: () => Node[]
  isEmpty: () => boolean
  toDate: () => Date
  toInteger: () => number
  toFloat: () => number
  toBoolean: () => boolean
  toFile: (name: string, newLine?: boolean, location?: string) => void

  read: (path: string[]) => Node
  write: (path: string[], value: string) => Node
  path: string[]
}
