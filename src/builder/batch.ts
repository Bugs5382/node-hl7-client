import { HL7FatalError, HL7ParserError } from '../utils/exception.js'
import { ClientBuilderBatchOptions, normalizedClientBatchBuilderOptions } from '../utils/normalizedBuilder.js'
import { isNumber, createHL7Date } from '../utils/utils.js'
import { FileBatch } from './fileBatch.js'
import { Node } from './interface/node.js'
import { Message } from './message.js'
import { NodeBase } from './modules/nodeBase.js'
import { RootBase } from './modules/rootBase.js'
import { Segment } from './modules/segment.js'
import { SegmentList } from './modules/segmentList.js'

/**
 * Batch Class
 * @since 1.0.0
 * @extends RootBase
 */
export class Batch extends RootBase {
  /** @internal **/
  _opt: ReturnType<typeof normalizedClientBatchBuilderOptions>
  /** @internal */
  _lines?: string[]
  /** @internal */
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

    if (typeof opt.text !== 'undefined' && opt.parsing === true && opt.text !== '') {
      this._lines = this.split(opt.text).filter(line => line.startsWith('MSH'))
    }
  }

  /**
   * Add a Message to the Batch
   * @since 1.0.0
   * @param message
   * @param index
   */
  add (message: Message, index: number | undefined = undefined): void {
    this.setDirty()
    this._messagesCount = this._messagesCount + 1
    if (typeof index !== 'undefined') {
      this.children.splice(index, 0, message)
    } else {
      this.children.push(message)
    }
  }

  /**
   * Get HL7 Segment at Path
   * @since 1.0.0
   * @param path
   */
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

  /**
   * End Batch
   * @since 1.0.0
   */
  end (): void {
    const segment = this._addSegment('BTS')
    segment.set('1', this._messagesCount)
  }

  /**
   * Get First Segment
   * @since 1.0.0
   * @param name
   */
  getFirstSegment (name: string): Segment {
    return this._getFirstSegment(name)
  }

  /**
   * Get Messages
   * @since 1.0.0
   */
  messages (): Message[] {
    if (typeof this._lines !== 'undefined' && typeof this._opt.newLine !== 'undefined') {
      const message: Message[] = []
      const re = new RegExp(`${this._opt.newLine}$`, 'g')
      for (let i = 0; i < this._lines.length; i++) {
        message.push(new Message({ text: this._lines[i].replace(re, '') }))
      }
      return message
    }
    throw new HL7ParserError(500, 'No messages inside batch.')
  }

  /**
   * Read Path
   * @since 1.0.0
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
   * Set HL7 Segment at Path with a Value
   * @since 1.0.0
   * @param path
   * @param value
   */
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

  /**
   * Start Batch
   * @since 1.0.0
   */
  start (): void {
    this.set('BHS.7', createHL7Date(new Date()))
  }

  /**
   * Create File
   * @param name
   * @param newLine
   * @param location
   */
  toFile (name: string, newLine?: boolean, location?: string): void {
    const fileBatch = new FileBatch({ location, newLine: newLine === true ? '\n' : '' })
    fileBatch.start()

    fileBatch.set('FHS.3', this.get('BHS.3').toString())
    fileBatch.set('FHS.4', this.get('BHS.4').toString())
    fileBatch.set('FHS.5', this.get('BHS.5').toString())
    fileBatch.set('FHS.6', this.get('BHS.6').toString())
    fileBatch.set('FHS.7', this.get('BHS.7').toString())
    fileBatch.set('FHS.9', `hl7.${name}.${this.get('BHS.7').toString()}.${fileBatch._opt.extension}`)

    fileBatch.add(this)

    fileBatch.end()

    fileBatch.createFile(name)
  }

  /** @internal */
  protected writeCore (path: string[], value: string): Node {
    const segmentName = path.shift() as string
    if (typeof segmentName === 'undefined') {
      throw new HL7FatalError(500, 'segment name is not defined.')
    }
    return this.writeAtIndex(path, value, 0, segmentName)
  }

  /** @internal */
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
