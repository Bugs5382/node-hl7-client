import {Delimiters} from "./delimiters";
import {Node} from "./node";
import {ClientBuilderOptions, normalizedClientBuilderOptions} from "./normalize";
import {Segment} from "./segment";
import {createDateTime} from "./utils";


export class Message extends Node {

  private _opt: ReturnType<typeof normalizedClientBuilderOptions>;

  /**
   * @param text If not provided, it will be MSH plus the default encoding characters.
   * @param props Override default encoding characters. (@default |^~\\&)
   * @since 1.0.0
   */
  constructor(text: string = "", props: ClientBuilderOptions = normalizedClientBuilderOptions()) {
    super( null,text, Delimiters.Segment)

    this._opt = normalizedClientBuilderOptions(props)

    if (!text) {
      this.initialBuild()
    }

  }

  addSegment(path: string): Segment {

    if (!path) {
      throw new Error("Missing segment path.");
    }

    let preparedPath = this.preparePath(path);
    if (preparedPath.length != 1) {
      throw new Error("Invalid segment path '" + path + "'.");
    }

    return <Segment>this.addChild(preparedPath[0]);
  }

  initialBuild() {

    let segment = this.addSegment("MSH");
    segment.set('MSH.1', this._opt.separatorField )
    segment.set('MSH.2', `${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}` )
    segment.set('MSH.7',  createDateTime())

  }

  protected pathCore(): string[] {
    // the message has an empty path
    return [];
  }


}