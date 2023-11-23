import EventEmitter from "events";
import {Field} from "./field.js";
import { Parser } from './parser.js'

/**
 * Segment Class
 * @since 1.0.0 */
export class Segment extends EventEmitter{
  /** @internal */
  _name: string = ''
  /** @internal */
  _data: any = {}
  /** @internal */
  _index?: number
  /** @internal */
  _subComponents: string
  /** @internal */
  _repeatingFields: string
  /** @internal */
  _dataSep = '_'
  /** @internal */
  _subComponentSplit = '^'
  /** @internal */
  _content: string[];

  constructor (parser: Parser, name: string, content: string[], index: number) {
    super()

    this._name = name
    this._index = index
    this._content = content;

    // @todo get this from the MSH field prior to being sent down tot his function
    this._subComponents = parser._subComponents
    this._repeatingFields = parser._repeatingFields
    this._dataSep = parser._dataSep
    this._subComponentSplit = parser._subComponentSplit

    this.processContent()

  }

  /** Get the data from this segment at this current index in the HL7 string.
   * @since 1.0.0 */
  async getField (field: string): Promise<Field | Field[]> {
    this.emit('segment.get.field', field)
    return this._data[field]
  }

  /** Process the line and create this segment to be built into the results.
   * This will be executed on each line of an HL7 message and break it up so that
   * individual fields within a segment can be retrieved.
   * @since 1.0.0
   * */
  processContent (): void {
    this.emit('segment.processContent')
    const content = this._content
    const name: string = this._name
    for (let idx = 1; idx < content.length; idx++) {
      const pos = this._name === 'MSH' ? idx + 1 : idx
      if (content[idx].includes(this._subComponents)) { // ~ check
        const subcomponent = content[idx].split(this._subComponents)
        for (let j = 0; j < subcomponent.length; j++) {
          let component = {}
          const subs = subcomponent[j].split(this._subComponentSplit)
          for (let k = 0; k < subs.length; k++) {
            const posK = (k + 1)
            if (subs[k].includes(this._repeatingFields)) {
              const repeating = subs[k].split(this._repeatingFields)
              const tmpRepeating: Field[] = []
              for (let l = 0; l < repeating.length; l++) {
                tmpRepeating.push(new Field(repeating[l], `${name}${this._dataSep}${pos}${this._dataSep}${posK}`))
              }
              component = {
                ...component,
                [`${name}${this._dataSep}${pos}${this._dataSep}${posK}`]: tmpRepeating
              }
            } else {
              component = { [`${name}${this._dataSep}${pos}${this._dataSep}${posK}`]: new Field(subs[k], `${name}${this._dataSep}${pos}${this._dataSep}${posK}`)  }
            }
          }
          this._data = {
            ...this._data,
            [`${name}${this._dataSep}${pos}`]: component
          }
        }
      } else if (content[idx].includes(this._subComponentSplit)) {
        const subs = content[idx].split(this._subComponentSplit) // ^ split here
        let component = {}
        for (let j = 0; j < subs.length; j++) {
          const posJ = (j + 1)
          if (subs[j].includes(this._repeatingFields)) {
            const repeating = subs[j].split(this._repeatingFields) // & split here
            const tmpRepeating: Field[] = []
            for (let l = 0; l < repeating.length; l++) {
              tmpRepeating.push(new Field(repeating[l], `${name}${this._dataSep}${pos}${this._dataSep}${posJ}`) )
            }
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}${this._dataSep}${posJ}`]: tmpRepeating
            }
          } else {
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}${this._dataSep}${posJ}`]: new Field(subs[j], `${name}${this._dataSep}${pos}${this._dataSep}${posJ}`)
            }
          }
          this._data = {
            ...this._data,
            [`${name}${this._dataSep}${pos}`]: component
          }
        }

      } else if (content[idx].includes(this._repeatingFields)) {
        const repeating = content[idx].split(this._repeatingFields)
        const tmpRepeating: Field[] = []
        for (let l = 0; l < repeating.length; l++) {
          tmpRepeating.push(new Field(repeating[l], `${name}${this._dataSep}${pos}`))
        }
        this._data = {
          ...this._data,
          [`${name}${this._dataSep}${pos}`]: tmpRepeating
        }
      } else {
        this._data = {
          ...this._data,
          [`${name}${this._dataSep}${pos}`]: new Field(content[idx], `${name}${this._dataSep}${pos}`)
        }
      }
    }

    // override MSH 2.1, always since it needs to include the encoding characters that we used
    if (this._name === "MSH") {
      this._data = {
        ['MSH_1']: '|',
        ...this._data,
        ['MSH_2']: '^~\\&'  // if this is HL7 Spec 2,7 or higher # at the end
      }
    }

  }

}
