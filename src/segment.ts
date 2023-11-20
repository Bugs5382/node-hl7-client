import { Parser } from './parser.js'

export class Segment {
  _name: string = ''
  _data: any = {}
  _index?: number
  _subComponents: string
  _repeatingFields: string
  _dataSep = '.'
  _subComponentSplit = '^'

  constructor (parser: Parser, name: string, index: number) {
    this._name = name
    this._index = index
    this._subComponents = parser._subComponents
    this._repeatingFields = parser._repeatingFields
  }

  set (): void {
    console.log('set')
  }

  get (): void {
    console.log('get')
  }

  processContent (content: string[]): void {
    const name: string = this._name
    for (let idx = 0; idx < content.length; idx++) {
      const pos = this._name === 'MSH' ? idx + 1 : idx
      if (content[idx].includes(this._subComponents)) { // ~ check
        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/

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

        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/
      } else if (content[idx].includes(this._subComponentSplit)) {
        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/

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
            [`${name}.${pos}`]: component
          }
        }
        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/
      } else if (content[idx].includes(this._repeatingFields)) {
        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/

        const repeating = content[idx].split(this._repeatingFields)
        const tmpRepeating: string[] = []
        for (let l = 0; l < repeating.length; l++) {
          tmpRepeating.push(repeating[l])
        }
        this._data = {
          ...this._data,
          [`${name}.${pos}`]: tmpRepeating
        }

        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/
      } else {
        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/

        this._data = {
          ...this._data,
          [`${name}${this._dataSep}${pos}`]: content[idx]
        }

        /** ********** ***/
        /** * BIG BLOCK **/
        /** ********** ***/
      }
    }
  }

  getData (): any {
    return this._data
  }
}
