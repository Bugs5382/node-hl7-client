import { HL7FatalError } from '../utils/exception'
import { RootBase } from './modules/rootBase'
import { Segment } from './modules/segment'
import { SegmentList } from './modules/segmentList'
import * as Util from '../utils/'
import { ClientBuilderMessageOptions, normalizedClientMessageBuilderOptions } from '../utils/normalize'
import { Node } from './interface/node'

/**
 * Message Class
 * @since 1.0.0
 * @extends RootBase
 */
export class Message extends RootBase {
  /** @internal */
  _opt: ReturnType<typeof normalizedClientMessageBuilderOptions>

  /**
   * Build the Message or Parse It
   * @since 1.0.0
   * @param props {@link ClientBuilderOptions}
   * @example
   * If you are processing a full message, do this:
   *
   * const message = new Message({text: "The HL7 Message Here"})
   * ... output cut ...
   *
   * If you are building out a message, do this:
   *
   * const message = new Message({messageHeader: { ... MSH Header Required Values Here ... }});
   *
   * which then you add segments with fields and values for your Hl7 message.
   *
   */
  constructor (props?: ClientBuilderMessageOptions) {
    const opt = normalizedClientMessageBuilderOptions(props)

    super(opt)

    this._opt = opt

    if (typeof this._opt.messageHeader !== 'undefined') {
      if (this._opt.specification.checkMSH(this._opt.messageHeader) === true) {
        this.set('MSH.7', Util.createHL7Date(new Date()))
        this.set('MSH.9.1', this._opt.messageHeader.msh_9.msh_9_1.toString())
        this.set('MSH.9.2', this._opt.messageHeader.msh_9.msh_9_2.toString())
        this.set('MSH.9.3', `${this._opt.messageHeader.msh_9.msh_9_1.toString()}_${this._opt.messageHeader.msh_9.msh_9_2.toString()}`)
        this.set('MSH.10', this._opt.messageHeader.msh_10.toString())
        this.set('MSH.12', this._opt.specification.name.toString())
      }
    }
  }

  /**
   * Add a new segment to a message.
   * @since 1.0.0
   * @description Creating a new segment adds an empty segment to the message.
   * It could be blank, or it could have values added into it.
   * @param path
   * @example
   *
   * const message = new Message({. the correct options here .})
   *
   * const segment = message.addSegment('PV1')
   * segment.set('PV1.1', 'Value Here');
   *
   * // When doing this, it overall adds it to the 'message' object
   * // when your output is the final result.
   *
   * const finalMessage = message.toString();
   *
   */
  addSegment (path: string): Segment {
    if (typeof path === 'undefined') {
      throw new HL7FatalError(404, 'Missing segment path.')
    }

    const preparedPath = this.preparePath(path)
    if (preparedPath.length !== 1) {
      throw new HL7FatalError(500, `"Invalid segment ${path}."`)
    }

    return this.addChild(preparedPath[0]) as Segment
  }

  /**
   * Read a path of a message.
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
    return Message.empty
  }

  /**
   * Write Core of the Message
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
    let index = this._getFirstSegmentIndex(segmentName)
    if (index === undefined) {
      index = this.children.length
    }
    return this.writeAtIndex(path, value, index, segmentName)
  }

  /**
   * Create a new child of a message which is a segment.
   * @since
   * @see {@link Segment}
   * @param text Segment string. Must be 3 characters long.
   * @param _index Not used to create a segment.
   * @protected
   */
  protected createChild (text: string, _index: number): Node {
    return new Segment(this, text.trim())
  }

  /**
   * Path Core
   * @since 1.0.0
   * @protected
   */
  protected pathCore (): string[] {
    return []
  }

  /** @internal */
  private _getFirstSegment (name: string): Segment | undefined {
    const children = this.children
    for (let i = 0, l = children.length; i < l; i++) {
      const segment = children[i] as Segment
      if (segment.name === name) {
        return segment
      }
    }
    return undefined
  }

  /** @internal */
  private _getFirstSegmentIndex (name: string): number | undefined {
    const children = this.children
    for (let i = 0, l = children.length; i < l; i++) {
      const segment = children[i] as Segment
      if (segment.name === name) {
        return i
      }
    }
    return undefined
  }
}
