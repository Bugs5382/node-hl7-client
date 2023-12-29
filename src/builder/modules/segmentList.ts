import { HL7Node } from '../interface/hL7Node.js'
import { NodeBase } from './nodeBase.js'
import { Segment } from './segment.js'

/** @internal */
export class SegmentList extends NodeBase {
  /** @internal */
  private readonly _segments: Segment[]

  /** @internal */
  constructor (parent: NodeBase, segments: Segment[]) {
    super(parent)
    this._segments = segments
  }

  /** @internal */
  toString (): string {
    return this._segments[0].toString()
  }

  /** @internal */
  get name (): string {
    return this._segments[0].name
  }

  /** @internal */
  read (path: string[]): HL7Node {
    return this._segments[0].read(path)
  }

  /** @internal */
  protected writeCore (path: string[], value: string): HL7Node {
    return this._segments[0].write(path, value)
  }

  /** @internal */
  protected pathCore (): string[] {
    return this._segments[0].path
  }

  /** @internal */
  protected get children (): HL7Node[] {
    return this._segments
  }
}
