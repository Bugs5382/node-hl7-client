import * as Util from '../utils'
import { HL7FatalError } from '../utils/exception'
import {
  ClientBuilderBatchOptions,
  normalizedClientBatchBuilderOptions
} from '../utils/normalize'
import { Node } from './interface/node'
import { Message } from './message'
import { RootBase } from './modules/rootBase'
import { Segment } from './modules/segment'
import { SegmentList } from './modules/segmentList'

/**
 * Batch Class
 * @since 1.0.0
 * @extends RootBase
 */
export class Batch extends RootBase {
  /** @internal **/
  _opt: ReturnType<typeof normalizedClientBatchBuilderOptions>
  _messagesCount: number

  /**
   * @since 1.0.0
   * @param props
   */
  constructor (props?: ClientBuilderBatchOptions) {
    const opt = normalizedClientBatchBuilderOptions(props)
    super(opt)
    this._opt = opt
    this._messagesCount = 0
  }

  /**
   * Add a Message to the Batch
   * @since 1.0.0
   * @param message
   */
  add (message: Message): void {
    this.setDirty()
    this._messagesCount = this._messagesCount + 1
    this.children.push(message)
  }

  /**
   * End Batch
   * @since 1.0.0
   */
  end (): void {
    const segment = this._addSegment('BTS')
    segment.set('1', this._messagesCount)
  }

  /**
   * Read a path of a batch.
   * @description Could return {@link SegmentList}
   * @since 1.0.0
   * @param path
   */
  read (path: string[]): Node {
    const segmentName = path.shift() as string
    if (path.length === 0) {
      const segments = this.children.filter(x => (x as Segment).name === segmentName) as Segment[]
      if (segments.length > 0) {
        return new SegmentList(this, segments) as Node
      }
    } else {
      if (typeof segmentName === 'undefined') {
        throw new HL7FatalError(500, 'segment name is not defined.')
      }
      const segment = this._getFirstSegment(segmentName)
      if (typeof segment !== 'undefined') {
        return segment.read(path)
      }
    }
    throw new HL7FatalError(500, 'Unable to process the read function correctly.')
  }

  /**
   * Start Batch
   * @since 1.0.0
   */
  start (): void {
    this.set('BSH.7', Util.createHL7Date(new Date()))
  }

  /**
   * Write Core of the Batch
   * @since 1.0.0
   * @param path
   * @param value
   * @protected
   */
  protected writeCore (path: string[], value: string): Node {
    const segmentName = path.shift() as string
    if (typeof segmentName === 'undefined') {
      throw new HL7FatalError(500, 'segment name is not defined.')
    }
    return this.writeAtIndex(path, value, 0, segmentName)
  }

  /**
   * Create a new child of a batch which is a segment.
   * @since
   * @see {@link Segment}
   * @param text Segment string. Must be 3 characters long.
   * @param _index Not used to create a segment.
   * @protected
   */
  protected createChild (text: string, _index: number): Node {
    return new Segment(this, text.trim())
  }

  /** @internal **/
  private _addSegment (path: string): Segment {
    if (typeof path === 'undefined') {
      throw new HL7FatalError(404, 'Missing segment path.')
    }

    const preparedPath = this.preparePath(path)
    if (preparedPath.length !== 1) {
      throw new HL7FatalError(500, `"Invalid segment ${path}."`)
    }

    return this.addChild(preparedPath[0]) as Segment
  }

  /** @internal */
  private _getFirstSegment (name: string): Segment {
    const children = this.children
    for (let i = 0, l = children.length; i < l; i++) {
      const segment = children[i] as Segment
      if (segment.name === name) {
        return segment
      }
    }
    throw new HL7FatalError(500, 'Unable to process _getFirstSegment.')
  }
}
