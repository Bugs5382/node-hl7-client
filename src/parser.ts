import { HL7ParserError } from './exception.js'
import { ParserProcessRawData } from './normalize.js'

/** Parser Class
 * @since 1.0.0 */
export class Parser {
  /** @internal */
  _isBatchProcessing: boolean
  /** @internal */
  _parsePlan?: ParserPlan
  /** @internal */
  _regex = /MSH/gm

  constructor () {
    this._isBatchProcessing = false
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
    // make the data all one line
    const data = props.data.trim()

    if (!data.startsWith('MSH') &&
        !data.startsWith('FHS') &&
        !data.startsWith('BHS')) {
      this._throwError('message does not start as a proper hl7 message')
    }

    // generate parse plan
    this._parsePlan = new ParserPlan(data)

    // check to see if we need to do batch processing
    this._isBatchProcessing = await this._isBatch(data)

    let lines: string[] | string = ''
    if (this._isBatchProcessing) {
      lines = await this._splitBatch(data)
    } else {
      /** noop **/
    }
    console.log(lines)

    /*
      } else {
        // regular processing
        this.emit('data.processing', data)

        // split up the lines. this is hardcoded to \n
        const lines = data.split('\n').filter(line => line.includes('|'))

        for (let i = 0; i < lines.length; i++) {
          const name = lines[i].substring(0, 3)
          const content = lines[i].split(this._lineSplitter)
          // @todo if MSH, get parser options for this HL7 message. use those when parsing data
          this._results?.push({name: `${name}${this._dataSep}${i+1}`, data: new Segment(this, name, content,i), content: lines[i]})
        }
      } */
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
  private async _isBatch (data: string): Promise<boolean> {
    return (data.startsWith('FHS') || data.startsWith('BHS'))
  }

  /** @internal */
  private _throwError (message: string): Error {
    throw new HL7ParserError(500, message)
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
}

/**
 * Used to figure out the current HL7 message(s) stings used to encode this particular HL7 message.
 * @since 1.0.0
 * @example
 *
 * let parsePlan = new ParserPlan(<HL7 Message>)
 *
 *
 */
export class ParserPlan {
  _escape?: string
  _separators?: string

  /**
   * Gets passed an HL7 message. Batched or Non-Batched.
   * @since
   * @param data
   */
  constructor (data: string) {
    if (!data.startsWith('MSH') &&
        !data.startsWith('FHS') &&
        !data.startsWith('BHS') &&
        !data.startsWith('BTS') &&
        !data.startsWith('FTS')) {
      this._throwError('message does not start as a proper hl7 message')
    }

    let esc: string = ''
    let separators = '\r\n'

    const sep0 = data.substring(3, 4)
    const seps = data.substring(data.indexOf(sep0), 8).split('')

    separators += seps[0]
    if (seps.length > 2) {
      separators += seps[2]
    } else {
      separators += '~'
    }
    if (seps.length > 1) {
      separators += seps[1]
    } else {
      separators += '^'
    }
    if (seps.length > 4) {
      separators += seps[4]
    } else {
      separators += '&'
    }
    if (seps.length > 3) {
      esc = seps[3]
    } else {
      esc = '\\'
    }

    this._escape = esc
    this._separators = separators
  }

  /** @internal */
  private _throwError (message: string): Error {
    throw new HL7ParserError(500, message)
  }
}
