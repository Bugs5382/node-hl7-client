import EventEmitter from 'events'
import {ParserOptions, ParserProcessRawData} from "./normalize.js";
import { Segment } from './segment.js'

/** Needed to help with some functionally.
 * @since 1.0.0 */
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function (search: string, rawPos: number) {
      let pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    }
  });
}

export class Parser extends EventEmitter {
  /** @internal */
  _forceBatch: boolean = false
  /** @internal */
  _repeatingFields: string = '&'
  /** @internal */
  _subComponents: string = '~'
  /** @internal */
  _dataSep: string = '.'
  /** @internal */
  _subComponentSplit: string = '^'
  /** @internal */
  _lineSplitter: string = '|'
  /** @internal */
  _isBatchProcessing: boolean
  /** @internal */
  _results: any[] = []

  constructor (props?: ParserOptions) {
    super()

    if (typeof props?.repeatingFields !== 'undefined') { this._repeatingFields = props.repeatingFields }
    if (typeof props?.subComponents !== 'undefined') { this._subComponents = props.subComponents }
    if (typeof props?.dataSep !== 'undefined') { this._dataSep = props.dataSep }
    if (typeof props?.subComponentSplit !== 'undefined') { this._subComponentSplit = props.subComponentSplit }

    this._isBatchProcessing = false

    this.emit('initialized', { subComponents: this._subComponents, repeatingFields: this._repeatingFields })
  }

  /** Will return true/false to indicate to the user if we did a batch processing method.
   * @since 1.0.0 */
  async getBatchProcess (): Promise<boolean> {
    return this._isBatchProcessing
  }

  /** Process a raw HL7 message.
   * Must be properly formatted, or we will return an error.
   * @see ParserProcessRawData for HL7 message sample.
   * @since 1.0.0
   * @param props
   * @example
   */
  async processRawData (props: ParserProcessRawData): Promise<void> {
    try {
      const data = props.data

      // ok, let's emit the data back so listener can listen in if needed
      this.emit('data.raw', { data })

      if (!data.startsWith('MSH') &&
        !data.startsWith('FHS') &&
        !data.startsWith('BHS') &&
        !data.startsWith('BTS') &&
        !data.startsWith('FTS')) {
        this._throwError('error.data', 'expected RAW data to be an HL7 message.')
      }

      // if the data is a batch
      if (await this._isBatch(data) || this._forceBatch) {
        // batch processing
        this.emit('data.processingBatch')
        this._isBatchProcessing = true

        // split up the batch
        const _b = await this._splitBatch(data)

        for (let i = 0; i < _b.length; i++) {
          const result = await this._processLine(_b[i], i)
          this._results.push(result)
        }
      } else {
        // regular processing
        this.emit('data.processing', data)

        // split up the lines. this is hardcoded to \n
        const lines = data.split('\n').filter(line => line.includes('|'))

        for (let i = 0; i < lines.length; i++) {
          const result = await this._processLine(lines[i], i)
          this._results.push(result)
        }
      }
    } catch (_e: any) {
      this._throwError('error.data', 'data object not passed or not defined.')
    }
  }

  /** @internal */
  private async _isBatch (data: string): Promise<boolean> {
    return (data.startsWith('FHS') || data.startsWith('BHS'))
  }

  /** @internal */
  private _throwError (emitKey: string, message: string): Error {
    this.emit(emitKey, { error: message })
    throw new Error(message)
  }

  /** @internal */
  private async _splitBatch (data: string, batch: string[] = []): Promise<string[]> {
    const getSegIndex = await this._getSegIndexes(['FHS', 'BHS', 'MSH', 'BTS', 'FTS'], data)
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

  /** @internal */
  private async _getSegIndexes (names: string[], data: string, list: string[] = []): Promise<string[]> {
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
  private async _processLine (data: string, index: number): Promise<any> {
    const name = data.substring(0, 3)
    const content = data.split(this._lineSplitter)
    if (Object.keys(this._results).includes(name)) {
      /* noop */
    } else {
      const segment = new Segment(this, name, index)
      await segment.processContent(content)
      return segment.getData()
    }
  }
}
