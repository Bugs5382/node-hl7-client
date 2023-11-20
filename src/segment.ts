import {Parser} from "./parser.js";

export default class Segment {
  _name: string = ""
  _data: any = {}
  _index?: number
  _subComponents: string
  _repeatingFields: string
  _dataSep = "."
  _subComponentSplit = "^"

  constructor(parser: Parser, name: string, index: number) {
    this._name = name
    this._index = index
    this._subComponents = parser._subComponents
    this._repeatingFields = parser._repeatingFields
  }

  set () {
    console.log('set')
  }

  get () {
    console.log('get')
  }

  processContent(content: string[]) {
    const name: string = this._name
    for (let idx = 1; idx < content.length; idx++) {
      let pos = this._name == "MSH" ? idx + 1 : idx;
      if (content[idx].indexOf(this._subComponents) > -1) {

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/


        let subcomponent = content[idx].split(this._subComponents);
        for (let j = 0; j < subcomponent.length; j++) {
          let component = {};
          let subs = subcomponent[j].split(this._subComponentSplit);
          for (let k = 0; k < subs.length; k++) {
            let pos_k = (k + 1)
            if (subs[k].indexOf(this._repeatingFields) > -1) {
              let repeating = subs[k].split(this._repeatingFields);
              let tmpRepeating: string[] = []
              for (let l = 0; l < repeating.length; l++) {
                tmpRepeating.push(repeating[l])
              }
              component = {
                ...component,
                [`${name}${this._dataSep}${pos}${this._dataSep}${pos_k}`]: tmpRepeating
              }
            } else {
              component = { [`${name}${this._dataSep}${pos}${this._dataSep}${pos_k}`]: subs[k] }
            }
          }
          this._data = {
            ...this._data,
            [`${name}${this._dataSep}${pos}`]: component
          }
        }

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

      } else if (content[idx].indexOf(this._subComponentSplit) > -1) {

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

        let subs = content[idx].split(this._subComponentSplit);
        for (let j = 0; j < subs.length; j++) {
          let component = {};
          let pos_j = (j + 1)
          if (subs[j].indexOf(this._repeatingFields) > -1) {
            let repeating = subs[j].split(this._repeatingFields);
            let tmpRepeating: string[] = []
            for (let l = 0; l < repeating.length; l++) {
              tmpRepeating.push(repeating[l])
            }
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}`]: {
                // ...[`${name}${this._dataSep}${pos}`],
                [`${name}${this._dataSep}${pos}${this._dataSep}${pos_j}`]: tmpRepeating
              }
            }
          } else {
            component = {
              ...component,
              [`${name}${this._dataSep}${pos}`]: {
                // ...[`${name}${this._dataSep}${pos}`],
                [`${name}${this._dataSep}${pos}${this._dataSep}${pos_j}`]: subs[j]
              }
            }
          }
          this._data = {
            ...this._data,
            [`${name}.${pos}`] : component
          }
        }

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

      } else if (content[idx].indexOf(this._repeatingFields) > -1) {

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

        let repeating = content[idx].split(this._repeatingFields);
        let tmpRepeating: string[] = []
        for (let l = 0; l < repeating.length; l++) {
          tmpRepeating.push(repeating[l]);
        }
        this._data = {
          ...this._data,
          [`${name}.${pos}`] : tmpRepeating
        }

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

      } else {

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

        this._data = {
          ...this._data,
          [`${name}${this._dataSep}${pos}`]: content[idx]
        }

        /************ ***/
        /*** BIG BLOCK **/
        /************ ***/

      }
    }
  }

  getData() {
    return this._data
  }

}