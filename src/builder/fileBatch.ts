import fs from 'node:fs'
import path from 'node:path'
import { NAME_FORMAT } from '../utils/constants.js'
import { HL7FatalError, HL7ParserError } from '../utils/exception.js'
import { ClientBuilderFileOptions, normalizedClientFileBuilderOptions } from '../utils/normalizedBuilder.js'
import { createHL7Date, split } from '../utils/utils.js'
import { Batch } from './batch.js'
import { HL7Node } from './interface/hL7Node.js'
import { Message } from './message.js'
import { RootBase } from './modules/rootBase.js'
import { Segment } from './modules/segment.js'
import { SegmentList } from './modules/segmentList.js'

/**
 * File Batch Class
 * @description Create a File Batch (FHS) which will could include many BHS/BTS segments,
 * which could include many Message (MSH) segments to output the contents into a file on the OS.
 * These files could then be used to send manually or read by another system to interpret the contents.
 * This class helps
 * in generating the particulars for that file generation to make sure that it follows the correct format.
 * @since 1.0.0
 * @extends RootBase
 */
export class FileBatch extends RootBase {
  /** @internal */
  protected _fileName: string
  /** @internal **/
  _opt: ReturnType<typeof normalizedClientFileBuilderOptions>
  /** @internal */
  protected _lines: string[]
  /** @internal */
  protected _batchCount: number
  /** @internal */
  protected _messagesCount: number

  /**
   * @since 1.0.0
   * @param props Passing the options to build the file batch.
   */
  constructor (props?: ClientBuilderFileOptions) {
    const opt = normalizedClientFileBuilderOptions(props)
    super(opt)
    this._fileName = ''
    this._lines = []
    this._opt = opt
    this._batchCount = 0
    this._messagesCount = 0
    this._fileName = ''

    if (typeof opt.text !== 'undefined' && opt.parsing === true && opt.text !== '') {
      this._lines = split(opt.text).filter(line => line.startsWith('MSH'))
    } else {
      this.set('FHS.7', createHL7Date(new Date(), this._opt.date))
    }
  }

  /**
   * AAdd a Message or a Batch to the File
   * @description This adds a Message (MSH) output into the file batch.
   * If there is a Batch ("BHS") already part of this file, any new Message type will be added to the first found BHS regardless if the second Batch is added last.
   * @since 1.0.0
   * @param message The {@link Message} or {@link Batch} to add into the batch.
   */
  add (message: Message | Batch): void {
    this.setDirty()
    // if we are adding a message to a file
    if (message instanceof Message) {
      // and we already added a batch segment, we need to add it to the batch segment since we cannot add a batch and then a MSH segment.
      // That would violate HL7 specification.
      if (this._batchCount >= 1) {
        // get the first batch segment we find
        const batch = this._getFirstBatch()
        // update the count of the BTS segment by 1
        const seg = batch.getFirstSegment('BTS')
        seg.set(1, batch._messagesCount + 1)
        // add the message to the batch
        batch.add(message, batch._messagesCount + 1)
      } else {
        this._messagesCount = this._messagesCount + 1
        this.children.push(message)
      }
    } else {
      // if there are already messages added before a batch
      if (this._messagesCount >= 1) {
        throw new HL7ParserError('Unable to add a batch segment, since there is already messages added individually.')
      }
      this._batchCount = this._batchCount + 1
      this.children.push(message)
    }
  }

  /**
   * Create a file to be stored.
   * @since 1.0.0
   * @param name Name of the file.
   */
  createFile (name: string): void {
    const getFSHDate = this.get('FHS.7').toString()

    if (typeof name === 'undefined') {
      throw new HL7FatalError('Missing file name.')
    }

    if (NAME_FORMAT.test(name)) {
      throw new HL7FatalError('name must not contain certain characters: `!@#$%^&*()+\\-=\\[\\]{};\':"\\\\|,.<>\\/?~.')
    }

    if (typeof this._opt.location !== 'undefined') {
      if (!fs.existsSync(this._opt.location)) {
        fs.mkdir(this._opt.location, { recursive: true }, () => {})
      }

      this._fileName = `hl7.${name}.${getFSHDate}.${this._opt.extension as string}`

      fs.appendFile(path.join(this._opt.location, this._fileName), this.toString(), () => {})
    }
  }

  /**
   * End Batch
   * @description At the conclusion of building the file batch,
   * (Usually {@link add} method will be before this) will add the File Batch Trailing Segment (FTS) to the end.
   * If a message (MSH) is added after this,
   * that message (MSH) will get added to the first BHS found if there is one, otherwise it will just be added.
   * This might be typical inside a file output process.
   * @since 1.0.0
   */
  end (): void {
    const segment = this._addSegment('FTS')
    segment.set('1', this._batchCount + this._messagesCount)
  }

  /**
   * Get File name
   * @description Get File name going to be created.
   * @since 1.2.0
   */
  fileName (): string {
    return this._fileName
  }

  /**
   * Get FHS Segment at Path
   * @since 1.0.0
   * @param path Could be 'FHS.7' or 7, and it shall get the same result.
   * @example
   * ```ts
   * const fileBatch = file.get('FHS.7')
   * ```
   * or
   * ```ts
   * const fileBatch = file.get(7)
   * ```
   */
  get (path: string | number): HL7Node {
    return super.get(path)
  }

  /**
   * Get Messages within a submitted File Batch
   * @description This will parse the passed on "text"
   * in the contractor options and get all the messages (MSH) segments within it and return an array of them.
   * This will happen regardless of the depth of the segments.
   * @since 1.0.0
   * @example
   * ```ts
   * try {
   *  // parser the batch
   *  const parser = new FileBatch({ text: loadedMessage })
   *  // load the messages
   *  const allMessage = parser.messages()
   *  // loop messages
   *  allMessage.forEach((message: Message) => {
   *    const messageParsed = new Message({ text: message.toString() })
   *  })
   * } catch (e) {
   *   // error here
   * }
   * ```
   * @returns Returns an array of messages or a HL7ParserError will throw.
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
    throw new HL7FatalError('No messages inside file segment.')
  }

  /**
   * Set Batch Segment at Path with a Value
   * @since 1.0.0
   * @example
   * ```ts
   * const batch = new Batch()
   * batch.set('BHS.7', '20231231')
   * ```
   * @param path Where you want to set in the segment
   * @param value The value.
   * It Can be an Array, String, or Boolean.
   * If the value is not set, you can chain this to expand the paths
   * @example
   * If the value is not used this can be employed:
   * ```ts
   * batch.set('BHS.3').set(0).set('BHS.3.1', 'abc');
   * ```
   */
  set (path: string | number, value?: any): HL7Node {
    return super.set(path, value)
  }

  /**
   * Start Batch
   * @since 1.0.0
   */
  start (): void {
    this.set('FHS.7', createHL7Date(new Date()))
  }

  /** @internal */
  protected createChild (text: string, _index: number): HL7Node {
    return new Segment(this, text.trim())
  }

  /** @internal */
  read (path: string[]): HL7Node {
    const segmentName = path.shift() as string
    if (path.length === 0) {
      const segments = this.children.filter(x => (x as Segment).name === segmentName) as Segment[]
      if (segments.length > 0) {
        return new SegmentList(this, segments) as HL7Node
      }
    } else {
      if (typeof segmentName === 'undefined') {
        throw new HL7ParserError('Segment name is not defined.')
      }
      const segment = this._getFirstSegment(segmentName)
      if (typeof segment !== 'undefined') {
        return segment.read(path)
      }
    }
    throw new HL7FatalError('Unable to process the read function correctly.')
  }

  /** @internal */
  protected writeCore (path: string[], value: string): HL7Node {
    const segmentName = path.shift() as string
    if (typeof segmentName === 'undefined') {
      throw new HL7ParserError('Segment name is not defined.')
    }
    return this.writeAtIndex(path, value, 0, segmentName)
  }

  /** @internal **/
  private _addSegment (path: string): Segment {
    if (typeof path === 'undefined') {
      throw new HL7ParserError('Missing segment path.')
    }

    const preparedPath = this.preparePath(path)
    if (preparedPath.length !== 1) {
      throw new HL7ParserError(`"Invalid segment ${path}."`)
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
    throw new HL7FatalError('Unable to process _getFirstBatch.')
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
    throw new HL7ParserError('Unable to process _getFirstSegment.')
  }
}

export default FileBatch
