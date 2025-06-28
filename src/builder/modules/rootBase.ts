import { Delimiters } from "@/declaration/enum";
import { HL7FatalError } from "@/helpers/exception";
import { ClientBuilderMessageOptions } from "@/modules/types";
import { decodeHexString } from "@/utils/decodeHexString";
import { escapeForRegExp } from "@/utils/escapeForRegExp";
import { NodeBase } from "./nodeBase";

/**
 * Root Base
 * @since 1.0.0
 * @extends NodeBase
 */
export class RootBase extends NodeBase {
  /** @internal */
  _opt: any;

  /** @internal */
  private readonly _delimiters: string;
  /** @internal */
  private readonly _matchEscape: RegExp;
  /** @internal */
  private readonly _matchUnescape: RegExp;

  /** @internal */
  private static readonly _defaultDelimiters = "\r|^~\\&";
  /** @internal */
  private static readonly _defaultMatchUnescape = RootBase._makeMatchUnescape(
    RootBase._defaultDelimiters,
  );
  /** @internal */
  private static readonly _defaultMatchEscape = RootBase._makeMatchEscape(
    RootBase._defaultDelimiters,
  );

  constructor(opt: ClientBuilderMessageOptions) {
    super(null, opt.text, Delimiters.Segment);

    this._delimiters = `${opt.newLine as string}${opt.separatorField as string}${opt.separatorComponent as string}${opt.separatorRepetition as string}${opt.separatorEscape as string}${opt.separatorSubComponent as string}`;

    if (this._delimiters === RootBase._defaultDelimiters) {
      this._matchUnescape = RootBase._defaultMatchUnescape;
      this._matchEscape = RootBase._defaultMatchEscape;
    } else {
      this._matchUnescape = RootBase._makeMatchUnescape(this._delimiters);
      this._matchEscape = RootBase._makeMatchEscape(this._delimiters);
    }
  }

  /** @internal */
  get delimiters(): string {
    return this._delimiters;
  }
  /** @internal */
  escape(text: string): string {
    if (text === null) {
      throw new HL7FatalError("Text must be passed in escape function.");
    }

    return text;

    // return text.replace(this._matchEscape, (match: string) => {
    //   let ch: string = "";
    //
    //   switch (match) {
    //     case this._delimiters[Delimiters.Escape]:
    //       ch = "E";
    //       break;
    //     case this._delimiters[Delimiters.Field]:
    //       ch = "F";
    //       break;
    //     case this._delimiters[Delimiters.Repetition]:
    //       ch = "R";
    //       break;
    //     case this._delimiters[Delimiters.Component]:
    //       ch = "S";
    //       break;
    //     case this._delimiters[Delimiters.SubComponent]:
    //       ch = "T";
    //       break;
    //   }
    //
    //   if (typeof ch !== "undefined") {
    //     const escape = this._delimiters[Delimiters.Escape];
    //     return `${escape}${ch}${escape}`;
    //   }
    //
    //   throw new HL7FatalError(`Escape sequence for ${match} is not known.`);
    // });
  }
  /** @internal */
  unescape(text: string): string {
    if (text === null) {
      throw new HL7FatalError("Text must be passed in unescape function.");
    }

    // Slightly faster for a normal case of no escape sequences in text
    if (!text.includes(this._delimiters[Delimiters.Escape])) {
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
          return decodeHexString(match.slice(2, match.length - 1));
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
  /** @internal */
  protected static _makeMatchEscape(delimiters: string): RegExp {
    const sequences = [
      escapeForRegExp(delimiters[Delimiters.Escape]),
      escapeForRegExp(delimiters[Delimiters.Field]),
      escapeForRegExp(delimiters[Delimiters.Repetition]),
      escapeForRegExp(delimiters[Delimiters.Component]),
      escapeForRegExp(delimiters[Delimiters.SubComponent]),
    ];
    return new RegExp(sequences.join("|"), "g");
  }

  /** @internal */
  protected static _makeMatchUnescape(delimiters: string): RegExp {
    // setup regular expression for matching escape sequences, see http://www.hl7standards.com/blog/2006/11/02/hl7-escape-sequences/
    const matchEscape = escapeForRegExp(delimiters[Delimiters.Escape]);
    return new RegExp(
      [matchEscape, "[^", matchEscape, "]*", matchEscape].join(""),
      "g",
    );
  }
}
