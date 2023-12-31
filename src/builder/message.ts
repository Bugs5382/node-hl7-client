import { HL7FatalError } from '../utils/exception.js'
import { ClientBuilderMessageOptions, normalizedClientMessageBuilderOptions } from '../utils/normalizedBuilder.js'
import { isHL7Number } from '../utils/utils.js'
import { FileBatch } from './fileBatch.js'
import { NodeBase } from './modules/nodeBase.js'
import { RootBase } from './modules/rootBase.js'
import { Segment } from './modules/segment.js'
import { SegmentList } from './modules/segmentList.js'
import { HL7Node } from './interface/hL7Node.js'

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
        this._opt.specification.buildMSH(this._opt.messageHeader, this)
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
   * Get HL7 Segment at Path
   * @since 1.0.0
   * @param path
   */
  get (path: string | number): HL7Node {
    let ret: any

    if (typeof path === 'number') {
      if (path >= 0 && path < this.children.length) {
        ret = this.children[path]
      }
    } else if (path !== '') {
      const _path = this.preparePath(path)
      ret = this.read(_path)
    }

    return typeof ret !== 'undefined' ? ret as HL7Node : NodeBase.empty as HL7Node
  }

  /**
   * Read a path of a message.
   * @description Could return {@link SegmentList}
   * @since 1.0.0
   * @param path
   */
  read (path: string[]): HL7Node {
    const segmentName = path.shift() as string
    if (path.length === 0) {
      const segments = this.children.filter(x => (x as Segment).name === segmentName) as Segment[]
      if (segments.length > 0) {
        return new SegmentList(this, segments) as HL7Node
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
   * Set HL7 Segment at Path with a Value
   * @since 1.0.0
   * @param path
   * @param value
   */
  set (path: string | number, value?: any): HL7Node {
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
    } else if (isHL7Number(path)) {
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

  toFile (name: string, newLine?: boolean, location?: string): void {
    const fileBatch = new FileBatch({ location, newLine: newLine === true ? '\n' : '' })
    fileBatch.start()

    fileBatch.set('FHS.3', this.get('MSH.3').toString())
    fileBatch.set('FHS.4', this.get('MSH.4').toString())
    fileBatch.set('FHS.5', this.get('MSH.5').toString())
    fileBatch.set('FHS.6', this.get('MSH.6').toString())
    fileBatch.set('FHS.7', this.get('MSH.7').toString())
    fileBatch.set('FHS.9', `hl7.${name}.${this.get('MSH.7').toString()}.${fileBatch._opt.extension as string}`)
    fileBatch.set('FHS.11', this.get('MSH.10').toString())

    fileBatch.add(this)

    fileBatch.end()

    fileBatch.createFile(name)
  }

  /**
   * Write Core of the Message
   * @since 1.0.0
   * @param path
   * @param value
   * @protected
   */
  protected writeCore (path: string[], value: string): HL7Node {
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
  protected createChild (text: string, _index: number): HL7Node {
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

export default Message
