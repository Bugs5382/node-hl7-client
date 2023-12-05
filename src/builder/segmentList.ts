import { Node } from './decorators/node'
import { NodeBase } from './nodeBase'
import { Segment } from './segment'

/**
 * Segment List
 * @since 1.0.0
 * @extends NodeBase
 */
export class SegmentList extends NodeBase {
  /** @internal */
  private readonly _segments: Segment[]

  /**
     * @since 1.0.0
     * @param parent
     * @param segments
     */
  constructor (parent: NodeBase, segments: Segment[]) {
    super(parent)
    this._segments = segments
  }

  /**
     * To String
     * @since 1.0.0
     */
  toString (): string {
    return this._segments[0].toString()
  }

  /**
     * Get Name
     * @since 1.0.0
     */
  get name (): string {
    return this._segments[0].name
  }

  /**
     * Read Path
     * @since 1.0.0
     * @param path
     */
  read (path: string[]): Node {
    return this._segments[0].read(path)
  }

  /**
     * Write Core Segment List
     * @param path
     * @param value
     * @protected
     */
  protected writeCore (path: string[], value: string): Node {
    return this._segments[0].write(path, value)
  }

  /**
     * Get Path Core
     * @since 1.0.0
     * @protected
     */
  protected pathCore (): string[] {
    return this._segments[0].path
  }

  /**
     * Get Children
     * @since 1.0.0
     * @protected
     */
  protected get children (): Node[] {
    return this._segments
  }
}
