/**
 * Node Base
 * @since 1.0.0
 */
export interface HL7Node {
  name: string
  length: number

  get: (path: string | number) => HL7Node
  set: (path: string | number, value?: any) => HL7Node

  exists: (path: string | number) => boolean
  forEach: (callback: (value: HL7Node, index: number) => void) => void

  toString: () => string
  toRaw: () => string
  toArray: () => HL7Node[]
  isEmpty: () => boolean
  toDate: () => Date
  toInteger: () => number
  toFloat: () => number
  toBoolean: () => boolean
  toFile: (name: string, newLine?: boolean, location?: string) => void

  read: (path: string[]) => HL7Node
  write: (path: string[], value: string) => HL7Node
  path: string[]
}
