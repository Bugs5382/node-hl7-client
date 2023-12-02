import * as Util from "./utils.js";
import { Delimiters } from './decorators/enum/delimiters'
import { ClientBuilderOptions, normalizedClientBuilderOptions } from './normalize.js'

/**
 * Message Class
 * @since 1.0.0
 */
export class Message {

  private readonly _opt: ReturnType<typeof normalizedClientBuilderOptions>
  private _delimiters: string


  // @ts-ignore
  private _matchUnescape: RegExp;
  // @ts-ignore
  private _matchEscape: RegExp;

  private static _defaultDelimiters = "\r|^~\\&";
  private static _defaultMatchUnescape = Message._makeMatchUnescape(Message._defaultDelimiters);
  private static _defaultMatchEscape = Message._makeMatchEscape(Message._defaultDelimiters);

  /**
   * @param props Override default encoding characters. (@default |^~\\&)
   * @example
   * If you are processing a full message, do this:
   *
   * const message = new Message({text: "The HL7 Message Here"})
   * ... output cut ...
   *
   * If you are building out a message, do this:
   *
   * const message = new Message({header: { ... MSH Header Required Values ... }});
   *
   * which then you add segments with fields and values for your Hl7 message.
   *
   * @since 1.0.0
   */
  constructor (props?: ClientBuilderOptions) {

    // const opt = normalizedClientBuilderOptions(props)
    // super(null, opt.text, Delimiters.Segment)

    this._opt = normalizedClientBuilderOptions(props)
    this._delimiters = `${this._opt.newLine}${this._opt.separatorField}${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`

    if (this._delimiters === Message._defaultDelimiters) {
      this._matchUnescape = Message._defaultMatchUnescape;
      this._matchEscape = Message._defaultMatchEscape;
    } else {
      this._matchUnescape = Message._makeMatchUnescape(this._delimiters);
      this._matchEscape = Message._makeMatchEscape(this._delimiters);
    }

  }

  /**
   * @internal
   * @since 1.0.0
   * @param delimiters
   * @private
   */
  private static _makeMatchEscape(delimiters: string): RegExp {

    let sequences = [
      Util.escapeForRegExp(delimiters[Delimiters.Escape]),
      Util.escapeForRegExp(delimiters[Delimiters.Field]),
      Util.escapeForRegExp(delimiters[Delimiters.Repetition]),
      Util.escapeForRegExp(delimiters[Delimiters.Component]),
      Util.escapeForRegExp(delimiters[Delimiters.SubComponent]),
    ];

    return new RegExp(sequences.join("|"), "g");
  }

  /**
   * @internal
   * @since 1.0.0
   * @param delimiters
   * @private
   */
  private static _makeMatchUnescape(delimiters: string): RegExp {
    // setup regular expression for matching escape sequences, see http://www.hl7standards.com/blog/2006/11/02/hl7-escape-sequences/
    let matchEscape = Util.escapeForRegExp(delimiters[Delimiters.Escape]);
    return new RegExp([matchEscape,"[^", matchEscape, "]*", matchEscape].join(""), "g");
  }


}
