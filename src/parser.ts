import EventEmitter from 'events'
import Segment from "./segment.js";

export interface ParserOptions {
  /** Force processing items as a batch even if it's a single item. */
  forceBatch?: boolean;
  /** Separator for Repeating Fields
   * @default & */
  repeatingFields?: string;
  /** Specification Version HL7
   * @default none */
  specification?: any;
  /** Separator for Sub Components Fields
   * @default ~ */
  subComponents?: string;
}

export  interface  ParserProcessRawData {
  /** Data that needs to be processed. */
  data: string;
}

export class Parser extends EventEmitter {
  /** @internal */
  _forceBatch: boolean = false
  /** @internal */
  _repeatingFields: string = "&"
  /** @internal */
  _subComponents: string = "~"
  /** @internal */
  _lineSplitter: string = "|"
  /** @internal */
  _isBatchProcessing: boolean;
  /** @internal */
  _results: any[] = []

  constructor(props?: ParserOptions) {
    super();

    // @todo Normalize Parser Options?
    if (typeof props?.repeatingFields !== 'undefined') { this._repeatingFields = props.repeatingFields }
    if (typeof props?.subComponents !== 'undefined') { this._subComponents = props.subComponents }

    this._isBatchProcessing = false

    this.emit('initialized', { subComponents: this._subComponents, repeatingFields: this._repeatingFields})
  }

  // @ts-ignore
  async processRawData(props: ParserProcessRawData) {
    if (typeof props.data !== 'undefined') {

      const data = props.data

      // ok, lets emit the data back so listener can listen in if needed
      this.emit('data.raw', { data })

      if (!data.startsWith('MSH')
        && !data.startsWith('FHS')
        && !data.startsWith('BHS')
        && !data.startsWith('BTS')
        && !data.startsWith('FTS')) {

        this._throwError('error.data', "Expected RAW data to be an HL7 Message.")
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
        let lines = data.split(`\n`).filter(line => line.indexOf('|') > -1)

        for (let i = 0; i < lines.length; i++) {
          const result = await this._processLine(lines[i], i)
          this._results.push(result)
        }

      }

    } else {
      this._throwError('error.data', 'data did not pass any data.')
    }

  }

  /** Tell the user we did a batch process this time around.
   * This will be trying if we are processing a batch
   * and will remain true until it's finished processing the entire batch.
   * @since 1.0.0 */
  async getBatchProcess(): Promise<boolean> {
    return this._isBatchProcessing
  }

  /** @internal */
  private async _isBatch(data: string): Promise<boolean> {
    return (data.startsWith('FHS') || data.startsWith('BHS'));
  }

  /** @internal */
  private _throwError(emitKey: string, message: string): Error {
    this.emit(emitKey, { error: message })
    throw new Error(message)
  }

  /** @internal */
  private async _splitBatch(data: string, batch: string[] = []): Promise<string[]> {
    let getSegIndex = await this._getSegIndexes(['FHS', 'BHS', 'MSH', 'BTS', 'FTS'], data)
    getSegIndex.sort((a, b) => parseInt(a) - parseInt(b));
    for (let i = 0; i < getSegIndex.length; i++) {
      let start =  parseInt(getSegIndex[i])
      let end = parseInt(getSegIndex[i + 1])
      if (i + 1 === getSegIndex.length) {
        end = data.length
      }
      batch.push(data.slice(start, end));
    }
    return batch;
  }

  /** @internal */
  private async _getSegIndexes(names: string[], data: string, list: string[] = []): Promise<string[]> {
    for (let i = 0; i < names.length; i++) {
      let regexp = new RegExp(`(\n|\r\n|^|\r)${names[i]}\\|`, 'g'), m;
      while (m = regexp.exec(data)) {
        const s = m[0];
        if (s.indexOf('\r\n') !== -1) {
          m.index = m.index + 2;
        } else if (s.indexOf('\n') !== -1) {
          m.index++;
        } else if (s.indexOf('\r') !== -1) {
          m.index++;
        }
        if (m.index !== null) {
          list.push(m.index.toString())
        }
      }
    }
    return list
  }

  private async _processLine(data: string, index: number) {
    let name = data.substring(0, 3);
    let content = data.split(this._lineSplitter)
    if (Object.keys(this._results).indexOf(name) > -1) {

    } else {
      const segment = new Segment(this, name, index)
      segment.processContent(content)
      return segment.getData()
    }

  }

}
