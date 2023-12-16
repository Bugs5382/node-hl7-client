import fs from 'node:fs'
import path from 'node:path'
import { HL7FatalError, HL7ParserError } from '../utils/exception.js'
import { ClientBuilderFileOptions, normalizedClientFileBuilderOptions } from '../utils/normalizedBuilder.js'
import { createHL7Date, isHL7Number } from '../utils/utils.js'
import { Batch } from './batch.js'
import { Node } from './interface/node.js'
import { Message } from './message.js'
import { NodeBase } from './modules/nodeBase.js'
import { RootBase } from './modules/rootBase.js'
import { Segment } from './modules/segment.js'
import { SegmentList } from './modules/segmentList.js'

/**
 * File Class
 * @since 1.0.0
 * @extends RootBase
 */
export class FileBatch extends RootBase {
  /** @internal */
  protected _fileName: string
  /** @internal **/
  _opt: ReturnType<typeof normalizedClientFileBuilderOptions>
  /** @internal */
  protected _lines?: string[]
  /** @internal */
  protected _batchCount: number
  /** @internal */
  protected _messagesCount: number

  /**
   * @since 1.0.0
   * @param props
   */
  constructor (props?: ClientBuilderFileOptions) {
    const opt = normalizedClientFileBuilderOptions(props)
    super(opt)
    this._fileName = ''
    this._opt = opt
    this._batchCount = 0
    this._messagesCount = 0

    if (typeof opt.text !== 'undefined' && opt.parsing === true && opt.text !== '') {
      this._lines = this.split(opt.text).filter(line => line.startsWith('MSH'))
    }
  }

  /**
   * Add a Message or a Batch to the File
   * @since 1.0.0
   * @param item
   */
  add (item: Message | Batch): void {
    this.setDirty()
    // if we are adding a message to a file
    if (item instanceof Message) {
      // and we already added a batch segment, we need to add it to the batch segment since we cannot add a batch and then a MSH segment.
      // That would violate HL7 specification.
      if (this._batchCount >= 1) {
        // get the first batch segment we find
        const batch = this._getFirstBatch()
        // update the count of the BTS segment by 1
        const seg = batch.getFirstSegment('BTS')
        seg.set(1, batch._messagesCount + 1)
        // add the message to the batch
        batch.add(item, batch._messagesCount + 1)
      } else {
        this._messagesCount = this._messagesCount + 1
        this.children.push(item)
      }
    } else {
      // if there are already messages added before a batch
      if (this._messagesCount >= 1) {
        throw new HL7ParserError(500, 'Unable to add a batch segment, since there is already messages added individually.')
      }
      this._batchCount = this._batchCount + 1
      this.children.push(item)
    }
  }

  /**
   * Create a file to be stored.
   * @since 1.0.0
   */
  createFile (name: string): void {
    const getFSHDate = this.get('FHS.7').toString()

    if (typeof name === 'undefined') {
      throw new HL7FatalError(404, 'Missing file name.')
    }

    const nameFormat = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/ //eslint-disable-line

    if (nameFormat.test(name)) {
      throw new HL7FatalError(500, 'name must not contain certain characters: `!@#$%^&*()+\\-=\\[\\]{};\':"\\\\|,.<>\\/?~.')
    }

    if (typeof this._opt.location !== 'undefined') {
      if (!fs.existsSync(this._opt.location)) {
        fs.mkdir(this._opt.location, { recursive: true }, () => {})
      }

      this._fileName = `hl7.${name}.${getFSHDate}.${this._opt.extension}`

      fs.appendFile(path.join(this._opt.location, this._fileName), this.toString(), () => {})
    }
  }

  /**
   * End Batch
   * @since 1.0.0
   */
  end (): void {
    const segment = this._addSegment('FTS')
    segment.set('1', this._batchCount + this._messagesCount)
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
    throw new HL7ParserError(500, 'No messages inside file segment.')
  }

  /** @internal */
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

  /**
   * Start Batch
   * @since 1.0.0
   */
  start (): void {
    this.set('FHS.7', createHL7Date(new Date()))
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
  private _getFirstBatch (): Batch {
    const children = this.children
    for (let i = 0, l = children.length; i < l; i++) {
      if (children[i] instanceof Batch) {
        return children[i] as Batch
      }
    }
    throw new HL7FatalError(500, 'Unable to process _getFirstBatch.')
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
