import { Parser } from './parser.js'

export class Segment {
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
  _dataSep = '.'
  /** @internal */
  _subComponentSplit = '^'

  constructor (parser: Parser, name: string, index: number) {
    this._name = name
    this._index = index
    this._subComponents = parser._subComponents
    this._repeatingFields = parser._repeatingFields
    this._dataSep = parser._dataSep
    this._subComponentSplit = parser._subComponentSplit
  }

  /** Process the line and create this segment.
   * @since 1.0.0
   * @param content */
  async processContent (content: string[]): Promise<void> {
    const name: string = this._name
    for (let idx = 0; idx < content.length; idx++) {
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
              const tmpRepeating: string[] = []
              for (let l = 0; l < repeating.length; l++) {
                tmpRepeating.push(repeating[l])
              }
              component = {
                ...component,
                [`${name}${this._dataSep}${pos}${this._dataSep}${posK}`]: tmpRepeating
              }
            } else {
              component = { [`${name}${this._dataSep}${pos}${this._dataSep}${posK}`]: subs[k] }
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
            const tmpRepeating: string[] = []
            for (let l = 0; l < repeating.length; l++) {
              tmpRepeating.push(repeating[l])
            }
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}${this._dataSep}${posJ}`]: tmpRepeating
            }
          } else {
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}${this._dataSep}${posJ}`]: subs[j]
            }
          }
          this._data = {
            ...this._data,
            [`${name}${this._dataSep}${pos}`]: component
          }
        }

      } else if (content[idx].includes(this._repeatingFields)) {
        const repeating = content[idx].split(this._repeatingFields)
        const tmpRepeating: string[] = []
        for (let l = 0; l < repeating.length; l++) {
          tmpRepeating.push(repeating[l])
        }
        this._data = {
          ...this._data,
          [`${name}.${pos}`]: tmpRepeating
        }
      } else {
        this._data = {
          ...this._data,
          [`${name}${this._dataSep}${pos}`]: content[idx]
        }
      }
    }
  }

  /** Get the data that we have parsed as a segment.
   * @since 1.0.0 */
  async getData (): Promise<any> {
    return this._data
  }
}
