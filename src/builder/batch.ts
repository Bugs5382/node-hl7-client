import { HL7FatalError, HL7ParserError } from '../utils/exception.js'
import { ClientBuilderBatchOptions, normalizedClientBatchBuilderOptions } from '../utils/normalizedBuilder.js'
import { createHL7Date } from '../utils/utils'
import { FileBatch } from './fileBatch'
import { Node } from './interface/node.js'
import { Message } from './message.js'
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
      this._lines = this._splitBatch(opt.text).filter(line => line.includes('MSH'))
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
    throw new HL7ParserError(500, 'No messages inside batch')
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

  /** @internal */
  private _getSegIndexes (names: string[], data: string, list: string[] = []): string[] {
    for (let i = 0; i < names.length; i++) {
      const regexp = new RegExp(`(\n|\r\n|^|\r)${names[i]}\\|`, 'g'); let m
      while ((m = regexp.exec(data)) != null) {
        const s = m[0]
        if (s.includes('\r\n')) {
          m.index = m.index + 2
        } else if (s.includes('\n')) {
          m.index++
        } else if (s.includes('\r')) {
          m.index++
        }
        if (m.index !== null) {
          list.push(m.index.toString())
        }
      }
    }
    return list
  }

  /** @internal */
  private _splitBatch (data: string, batch: string[] = []): string[] {
    const getSegIndex = this._getSegIndexes(['FHS', 'BHS', 'MSH', 'BTS', 'FTS'], data)
    getSegIndex.sort((a, b) => parseInt(a) - parseInt(b))
    for (let i = 0; i < getSegIndex.length; i++) {
      const start = parseInt(getSegIndex[i])
      let end = parseInt(getSegIndex[i + 1])
      if (i + 1 === getSegIndex.length) {
        end = data.length
      }
      batch.push(data.slice(start, end))
    }
    return batch
  }
}
