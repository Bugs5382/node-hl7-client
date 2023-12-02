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

  get delimiters(): string {

    return this._delimiters;
  }

  unescape(text: string): string {
    if(text == null) return null;

    // Slightly faster for normal case of no escape sequences in text
    if(text.indexOf(this._delimiters[Delimiters.Escape]) == -1) return text;

    return text.replace(this._matchUnescape, (match: string) => {

      switch(match.slice(1, 2)) {
        case "C":
          // ignore single-byte escape sequence
          break;
        case "E":
          return this._delimiters[Delimiters.Escape];
        case "F":
          return this._delimiters[Delimiters.Field];
        case "H":
          // ignore start highlight
          break;
        case "M":
          // ignore multi-byte escape sequence
          break;
        case "N":
          // ignore stop highlight
          break;
        case "R":
          return this._delimiters[Delimiters.Repetition];
        case "S":
          return this._delimiters[Delimiters.Component];
        case "T":
          return this._delimiters[Delimiters.SubComponent];
        case "X":
          return Util.decodeHexString(match.slice(2, match.length - 1));
        case "Z":
          // ignore locally defined escape sequence
          break;
        default:
          // pass through unknown escape sequences
          return match;
      }

      return "";
    });
  }

  escape(text: string): string {
    if(text == null) return null;

    return text.replace(this._matchEscape, (match: string) => {

      var ch: string;

      switch(match) {
        case this._delimiters[Delimiters.Escape]:
          ch = "E";
          break;
        case this._delimiters[Delimiters.Field]:
          ch = "F";
          break;
        case this._delimiters[Delimiters.Repetition]:
          ch = "R";
          break;
        case this._delimiters[Delimiters.Component]:
          ch = "S";
          break;
        case this._delimiters[Delimiters.SubComponent]:
          ch = "T";
          break;
      }

      if(ch) {
        var escape = this._delimiters[Delimiters.Escape]
        return escape + ch + escape;
      }

      throw new Error("Escape sequence for '" + match + "' is not known.");
    });
  }

  addSegment(path: string): Segment {

    if(!path) {
      throw new Error("Missing segment path.");
    }

    var preparedPath = this.preparePath(path);
    if(preparedPath.length != 1) {
      throw new Error("Invalid segment path '" + path + "'.");
    }

    return <Segment>this.addChild(preparedPath[0]);
  }

  read(path: string[]): Node {

    var segmentName = path.shift();

    if(path.length == 0) {
      // only the segment name was in the path so return a SegmentList
      var segments = <Segment[]>this.children.filter(x => (<Segment>x).name == segmentName);
      if(segments.length > 0) {
        return new SegmentList(this, segments);
      }
    }
    else {
      var segment = this._getFirstSegment(segmentName);
      if(segment) {
        return segment.read(path);
      }
    }

    return null;
  }

  protected writeCore(path: string[], value: string): Node {

    var segmentName = path.shift();
    var index = this._getFirstSegmentIndex(segmentName);
    if(index === undefined) {
      index = this.children.length;
    }
    return this.writeAtIndex(path, value, index, segmentName);
  }

  protected createChild(text: string, index: number): Node {

    // make sure to remove any \n that might follow the \r
    return new Segment(this, text.trim());
  }

  protected pathCore(): string[] {

    // the message has an empty path
    return [];
  }

  private _getFirstSegment(name: string): Segment {

    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
      var segment = <Segment>children[i];
      if (segment.name == name) {
        return segment;
      }
    }
  }
  private _getFirstSegmentIndex(name: string): number {

    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
      var segment = <Segment>children[i];
      if (segment.name == name) {
        return i;
      }
    }
  }

}
