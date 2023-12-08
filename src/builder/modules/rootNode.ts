import {HL7FatalError} from "../../utils/exception";
import {Delimiters} from "../decorators/delimiters";
import {NodeBase} from "./nodeBase";
import * as Util from '../../utils/'

export class RootNode extends NodeBase {

  /** @internal */
  _opt: any

  /** @internal */
  private readonly _delimiters: string
  /** @internal */
  private readonly _matchEscape: RegExp
  /** @internal */
  private readonly _matchUnescape: RegExp

  /** @internal */
  private static readonly _defaultDelimiters = '\r|^~\\&'
  /** @internal */
  private static readonly _defaultMatchUnescape = RootNode._makeMatchUnescape(RootNode._defaultDelimiters)
  /** @internal */
  private static readonly _defaultMatchEscape = RootNode._makeMatchEscape(RootNode._defaultDelimiters)

  constructor(props: any) {
    super(null, props.opt.text, Delimiters.Segment)

    this._delimiters = `${this._opt.newLine}${this._opt.separatorField}${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`

    if (this._delimiters === RootNode._defaultDelimiters) {
      this._matchUnescape = RootNode._defaultMatchUnescape
      this._matchEscape = RootNode._defaultMatchEscape
    } else {
      this._matchUnescape = RootNode._makeMatchUnescape(this._delimiters)
      this._matchEscape = RootNode._makeMatchEscape(this._delimiters)
    }
  }


  /**
   * @internal
   * @since 1.0.0
   * @param delimiters
   * @private
   */
  protected static _makeMatchEscape (delimiters: string): RegExp {
    const sequences = [
      Util.escapeForRegExp(delimiters[Delimiters.Escape]),
      Util.escapeForRegExp(delimiters[Delimiters.Field]),
      Util.escapeForRegExp(delimiters[Delimiters.Repetition]),
      Util.escapeForRegExp(delimiters[Delimiters.Component]),
      Util.escapeForRegExp(delimiters[Delimiters.SubComponent])
    ]
    return new RegExp(sequences.join('|'), 'g')
  }

  /**
   * @internal
   * @since 1.0.0
   * @param delimiters
   * @private
   */
  protected static _makeMatchUnescape (delimiters: string): RegExp {
    // setup regular expression for matching escape sequences, see http://www.hl7standards.com/blog/2006/11/02/hl7-escape-sequences/
    const matchEscape = Util.escapeForRegExp(delimiters[Delimiters.Escape])
    return new RegExp([matchEscape, '[^', matchEscape, ']*', matchEscape].join(''), 'g')
  }

  /**
   * Get Delimiters
   * @since 1.0.0
   */
  get delimiters (): string {
    return this._delimiters
  }

  /**
   * Unescape Text
   * @since 1.0.0
   * @param text
   */
  protected unescape (text: string): string {
    if (text === null) {
      throw new HL7FatalError(500, 'text must be passed in unescape function.')
    }

    // Slightly faster for a normal case of no escape sequences in text
    if (!text.includes(this._delimiters[Delimiters.Escape])) {
      return text
    }

    return text.replace(this._matchUnescape, (match: string) => {
      switch (match.slice(1, 2)) {
        case 'E':
          return this._delimiters[Delimiters.Escape]
        case 'F':
          return this._delimiters[Delimiters.Field]
        case 'R':
          return this._delimiters[Delimiters.Repetition]
        case 'S':
          return this._delimiters[Delimiters.Component]
        case 'T':
          return this._delimiters[Delimiters.SubComponent]
        case 'X':
          return Util.decodeHexString(match.slice(2, match.length - 1))
        case 'C':
        case 'H':
        case 'M':
        case 'N':
        case 'Z':
          break
        default:
          return match
      }

      return ''
    })
  }

  /**
   * Escape String
   * @since 1.0.0
   * @param text
   */
  protected escape (text: string): string {
    if (text === null) {
      throw new HL7FatalError(500, 'text must be passed in escape function.')
    }

    return text.replace(this._matchEscape, (match: string) => {
      let ch: string = ''

      switch (match) {
        case this._delimiters[Delimiters.Escape]:
          ch = 'E'
          break
        case this._delimiters[Delimiters.Field]:
          ch = 'F'
          break
        case this._delimiters[Delimiters.Repetition]:
          ch = 'R'
          break
        case this._delimiters[Delimiters.Component]:
          ch = 'S'
          break
        case this._delimiters[Delimiters.SubComponent]:
          ch = 'T'
          break
      }

      if (typeof ch !== 'undefined') {
        const escape = this._delimiters[Delimiters.Escape]
        return `${escape}${ch}${escape}`
      }

      throw new HL7FatalError(500, `Escape sequence for ${match} is not known.`)
    })
  }

}