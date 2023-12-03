import {HL7FatalError} from "./exception.js";
import {NodeBase} from "./nodeBase.js";
import {Segment} from "./segment.js";
import {SegmentList} from "./segmentList.js";
import * as Util from "./utils.js";
import { Delimiters } from './decorators/enum/delimiters.js'
import { ClientBuilderOptions, normalizedClientBuilderOptions } from './normalize.js'
import { Node } from "./decorators/interfaces/node.js";

/**
 * Message Class
 * @since 1.0.0
 * @extends NodeBase
 */
export class Message extends NodeBase {

  /** @internal */
  private readonly _delimiters: string
  /** @internal */
  private readonly _opt: ReturnType<typeof normalizedClientBuilderOptions>
  /** @internal */
  private readonly _matchEscape: RegExp;
  /** @internal */
  private readonly _matchUnescape: RegExp;

  /** @internal */
  private static _defaultDelimiters = "\r|^~\\&";
  /** @internal */
  private static _defaultMatchUnescape = Message._makeMatchUnescape(Message._defaultDelimiters);
  /** @internal */
  private static _defaultMatchEscape = Message._makeMatchEscape(Message._defaultDelimiters);

  /**
   * Build the Message or Parse It
   * @since 1.0.0
   * @param props {@link ClientBuilderOptions}
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
   */
  constructor (props?: ClientBuilderOptions) {
    let opt = normalizedClientBuilderOptions(props)
    
    super(null, opt.text, Delimiters.Segment)

    this._opt = opt
    this._delimiters = `${this._opt.newLine}${this._opt.separatorField}${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`

    if (this._delimiters === Message._defaultDelimiters) {
      this._matchUnescape = Message._defaultMatchUnescape;
      this._matchEscape = Message._defaultMatchEscape;
    } else {
      this._matchUnescape = Message._makeMatchUnescape(this._delimiters);
      this._matchEscape = Message._makeMatchEscape(this._delimiters);
    }

    if (opt.text == "" && this._opt.specification.checkMSH(this._opt.mshHeader)) {

      this.set('MSH.1', `${this._opt.separatorField}`)
      this.set('MSH.2', `${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`)
      this.set('MSH.7', Util.createDate(new Date()))
      this.set('MSH.9.1', this._opt.mshHeader?.msh_9.msh_9_1)
      this.set('MSH.9.2', this._opt.mshHeader?.msh_9.msh_9_2)
      this.set('MSH.9.3', `${this._opt.mshHeader?.msh_9.msh_9_1}_${this._opt.mshHeader?.msh_9.msh_9_2}`)
      this.set('MSH.10', this._opt.mshHeader?.msh_10)
      this.set('MSH.12', this._opt.specification.name)

    } else {
      throw new HL7FatalError(500, 'Unable to fully build a new HL7 message.')
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

  /**
   * Get Delimiters
   * @since 1.0.0
   */
  get delimiters(): string {
    return this._delimiters;
  }

  /**
   * Unescape Text
   * @since 1.0.0
   * @param text
   */
  unescape(text: string): string {
    if (text == null) {
      throw new HL7FatalError(500, "text must be passed in unescape function.")
    }

    // Slightly faster for a normal case of no escape sequences in text
    if(text.indexOf(this._delimiters[Delimiters.Escape]) == -1) {
      return text;
    }

    return text.replace(this._matchUnescape, (match: string) => {

      switch (match.slice(1, 2)) {
        case "E":
          return this._delimiters[Delimiters.Escape];
        case "F":
          return this._delimiters[Delimiters.Field];
        case "R":
          return this._delimiters[Delimiters.Repetition];
        case "S":
          return this._delimiters[Delimiters.Component];
        case "T":
          return this._delimiters[Delimiters.SubComponent];
        case "X":
          return Util.decodeHexString(match.slice(2, match.length - 1));
        case "C":
        case "H":
        case "M":
        case "N":
        case "Z":
          break;
        default:
          return match;
      }

      return "";
    });
  }

  /**
   * Escape String
   * @since 1.0.0
   * @param text
   */
  escape(text: string): string {
    if (text == null) {
      throw new HL7FatalError(500, "text must be passed in escape function.")
    }

    return text.replace(this._matchEscape, (match: string) => {

      let ch: string = "";

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

      if (ch) {
        let escape = this._delimiters[Delimiters.Escape]
        return escape + ch + escape;
      }

      throw new Error("Escape sequence for '" + match + "' is not known.");
    });
  }

  /**
   * Add a new segment to a message.
   * @since 1.0.0
   * @description Creating a new segment adds an empty segment to the message.
   * It could be blank, or it could have values added into it.
   * @param path
   * @example
   *
   * const message = new Message({. the correct options here .})
   *
   * const segment = message.addSegment('PV1')
   * segment.set('PV1.1', 'Value Here');
   *
   * // When doing this, it overall adds it to the 'message' object
   * // when your output is the final result.
   *
   * const finalMessage = message.toString();
   *
   */
  addSegment(path: string): Segment {
    if (!path) {
      throw new Error("Missing segment path.");
    }

    let preparedPath = this.preparePath(path);
    if(preparedPath.length != 1) {
      throw new Error("Invalid segment path '" + path + "'.");
    }

    return this.addChild(preparedPath[0]);
  }

  /**
   * Read a path of a message.
   * @description Could return {@link SegmentList}
   * @since 1.0.0
   * @param path
   */
  read(path: string[]): Node {
    let segmentName = path.shift();
    if (path.length == 0) {
      // only the segment name was in the path so return a SegmentList
      let segments = <Segment[]>this.children.filter(x => (<Segment>x).name == segmentName);
      if(segments.length > 0) {
        return new SegmentList(this, segments) as Node;
      }
    } else {
      if (typeof segmentName === 'undefined') {
        throw new Error("We have an error Huston.")
      }
      let segment = this._getFirstSegment(segmentName);
      if (segment) {
        return segment.read(path) as Node;
      }
    }
    throw new Error("Failure is not an option.")
  }

  /**
   * Write Core of the Message
   * @since 1.0.0
   * @param path
   * @param value
   * @protected
   */
  protected writeCore(path: string[], value: string): Node {
    let segmentName = path.shift();
    if (typeof segmentName == 'undefined') {
      throw new Error("Danger, Will Robinson")
    }
    let index = this._getFirstSegmentIndex(segmentName);
    if(index === undefined) {
      index = this.children.length;
    }
    return this.writeAtIndex(path, value, index, segmentName);
  }

  /**
   * Create a new child of a message which is a segment.
   * @since
   * @see {@link Segment}
   * @param text Segment string. Must be 3 characters long.
   * @param _index Not used to create a segment.
   * @protected
   */
  protected createChild(text: string, _index: number): Node {
    return new Segment(this, text.trim());
  }

  /**
   * Path Core
   * @since 1.0.0
   * @protected
   */
  protected pathCore(): string[] {
    return [];
  }

  /** @internal */
  private _getFirstSegment(name: string): Segment {
    let children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      let segment = <Segment>children[i];
      if (segment.name == name) {
        return segment;
      }
    }
    throw new Error("We have a problem.")
  }

  /** @internal */
  private _getFirstSegmentIndex(name: string): number {
    let children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      let segment = <Segment>children[i];
      if (segment.name == name) {
        return i;
      }
    }
    return 0
  }

}