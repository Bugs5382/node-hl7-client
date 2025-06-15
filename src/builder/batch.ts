import { normalizedClientBatchParserOptions } from "@/builder/normalizedParser";
import { HL7FatalError, HL7ParserError } from "@/helpers/exception";
import { ClientBuilderMessageOptions } from "@/modules/types";
import { createHL7Date } from "@/utils/createHL7Date";
import { split } from "@/utils/spilt";
import { FileBatch } from "./fileBatch";
import { HL7Node } from "./interface/hL7Node";
import { Message } from "./message";
import { RootBase } from "./modules/rootBase";
import { Segment } from "./modules/segment";
import { SegmentList } from "./modules/segmentList";

/**
 * Batch Class
 * @remarks Creating a Batch (BHS) which could include hundreds of MSH segments for processing.
 * Normally used in large data processing.
 * However, the server usually breaks down a batch MSH into single "elements" to process them and returns that the batch.
 * @since 1.0.0
 */
export class Batch extends RootBase {
  /** @internal **/
  _opt: ReturnType<typeof normalizedClientBatchParserOptions>;
  /** @internal */
  protected _lines: string[];
  /** @internal */
  _messagesCount: number;

  /**
   * @since 1.0.0
   * @param props Passing the options to build the batch.
   */
  constructor(props?: ClientBuilderMessageOptions) {
    const opt = normalizedClientBatchParserOptions(props);
    super(opt);
    this._lines = [];
    this._opt = opt;
    this._messagesCount = 0;

    if (typeof opt.text !== "undefined" && opt.text !== "") {
      this._lines = split(opt.text).filter((line) => line.startsWith("MSH"));
    } else {
      this.set("BHS.7", createHL7Date(new Date(), this._opt.date));
    }
  }

  /**
   * Add a Message to the Batch
   * @remarks This adds a Message (MSH) output into the batch.
   * It also increases the count of the BTS segment as the batch final result
   * when in end tells the receiving end how many message (MSH) segments are included.
   * @since 1.0.0
   * @param message The {@link Message} to add into the batch.
   * @param index Used Internally mostly to add an MSH segment within a BHS segment at a certain index.
   */
  add(message: Message, index?: number | undefined): void {
    this.setDirty();
    this._messagesCount = this._messagesCount + 1;
    if (typeof index !== "undefined") {
      this.children.splice(index, 0, message);
    } else {
      this.children.push(message);
    }
  }

  /**
   * End Batch
   * @remarks At the conclusion of building the batch,
   * (Usually {@link add} method will be before this) will add the Batch Trailing Segment (BTS) to the end.
   * If a message (MSH) is added after this,
   * that message (MSH) will get added to the first BHS found if there is more than one.
   * This might be typical inside a file output process.
   * {@link FileBatch} for more information.
   * @since 1.0.0
   */
  end(): void {
    const segment = this._addSegment("BTS");
    segment.set("1", this._messagesCount);
  }

  /**
   * Get BHS Segment at Path
   * @since 1.0.0
   * @param path Could be 'BHS.7' or 7, and it shall get the same result.
   * @example
   * ```ts
   * const date = batch.get('BHS.7')
   * ```
   * or
   * ```ts
   * const date = batch.get(7)
   * ```
   */
  get(path: string | number): HL7Node {
    return super.get(path);
  }

  /**
   * Get the First Segment
   * @remarks Returns the first segment found in the Batch (BHS).
   * This is only used during the {@link add} method
   * in determining
   * if there is more than one Batch of MSH in a File Batch {@link FileBatch}
   * which can hold more than one Batch groups.
   * @since 1.0.0
   * @param name The name of the segment.
   * At max usually three characters long.
   */
  getFirstSegment(name: string): Segment {
    return this._getFirstSegment(name);
  }

  /**
   * Get Messages within a submitted Batch
   * @remarks This will parse the passed on "text"
   * in the contractor options and get all the messages (MSH) segments within it and return an array of them.
   * @since 1.0.0
   * @example
   * ```ts
   * try {
   *  // parser the batch
   *  const parser = new Batch({ text: loadedMessage })
   *  // load the messages
   *  const allMessage = parser.messages()
   *  // loop messages
   *  allMessage.forEach((message: Message) => {
   *    const messageParsed = new Message({ text: message.toString() })
   *  })
   * } catch (e) {
   *   // error here
   * }
   * ```
   * @returns Returns an array of messages or a HL7ParserError will throw.
   */
  messages(): Message[] {
    if (
      typeof this._lines !== "undefined" &&
      typeof this._opt.newLine !== "undefined"
    ) {
      const message: Message[] = [];
      const re = new RegExp(`${this._opt.newLine}$`, "g");
      for (let i = 0; i < this._lines.length; i++) {
        message.push(new Message({ text: this._lines[i].replace(re, "") }));
      }
      return message;
    }
    throw new HL7FatalError("No messages inside batch.");
  }

  /**
   * Set Batch Segment at Path with a Value
   * @since 1.0.0
   * @example
   * ```ts
   * const batch = new Batch()
   * batch.set('BHS.7', '20231231')
   * ```
   * @param path Where you want to set in the segment
   * @param value The value.
   * It Can be an Array, String, or Boolean.
   * If the value is not set, you can chain this to expand the paths
   * @example
   * If the value is not used this can be employed:
   * ```ts
   * batch.set('BHS.3').set(0).set('BHS.3.1', 'abc');
   * ```
   */
  set(path: string | number, value?: any): HL7Node {
    return super.set(path, value);
  }

  /**
   * Start Batch
   * @remarks This allows you to override the orginial contractor BHS fields that are required.
   * In this case, 'BHS.7'
   * (Date Field) is filled out with a 14-character date field with YYYYMMDDHHMMSS entered in by default.
   * @since 1.0.0
   * @param style Your options produce: YYYYMMDDHHMMSS = 14 | YYYYMMDDHHMM = 12 | YYYYMMDD = 8
   * @defaultValue YYYYMMDDHHMMSS (14)
   */
  start(style?: "8" | "12" | "14"): void {
    this.set("BHS.7", createHL7Date(new Date(), style));
  }

  /**
   * Create File from a Batch
   * @remarks Will procure a file of the saved MSH in the proper format
   * that includes a FHS and FTS segments with the possibility of more than one BHS segments inside with one or more MSH inside each BHS groups.
   * @since 1.0.0
   * @param name File Name
   * @param newLine Provide a New Line
   * @param location Where to save the exported file
   * @param extension Custom extension of the file.
   * Default: hl7
   * @example
   * ```ts
   * const batch = new Batch({text: hl7_batch_string})
   * batch.toFile('readTestBHS', true, 'temp/')
   * ```
   * You can set an `extension` parameter on Batch to set a custom extension if you don't want to be HL7.
   */
  toFile(
    name: string,
    newLine?: boolean,
    location?: string,
    extension: string = "hl7",
  ): string {
    const fileBatch = new FileBatch({
      location,
      newLine: newLine === true ? "\n" : "",
      extension,
    });
    fileBatch.start();

    fileBatch.set("FHS.3", this.get("BHS.3").toString());
    fileBatch.set("FHS.4", this.get("BHS.4").toString());
    fileBatch.set("FHS.5", this.get("BHS.5").toString());
    fileBatch.set("FHS.6", this.get("BHS.6").toString());
    fileBatch.set("FHS.7", this.get("BHS.7").toString());
    fileBatch.set(
      "FHS.9",
      `hl7.${name}.${this.get("BHS.7").toString()}.${fileBatch._opt.extension as string}`,
    );

    fileBatch.add(this);

    fileBatch.end();

    fileBatch.createFile(name);

    return fileBatch.fileName();
  }

  /** @internal */
  protected createChild(text: string, _index: number): HL7Node {
    return new Segment(this, text.trim());
  }

  /** @internal */
  read(path: string[]): HL7Node {
    const segmentName = path.shift() as string;
    if (path.length === 0) {
      const segments = this.children.filter(
        (x) => (x as Segment).name === segmentName,
      ) as Segment[];
      if (segments.length > 0) {
        return new SegmentList(this, segments) as HL7Node;
      }
    } else {
      if (typeof segmentName === "undefined") {
        throw new HL7FatalError("Segment name is not defined.");
      }
      const segment = this._getFirstSegment(segmentName);
      if (typeof segment !== "undefined") {
        return segment.read(path);
      }
    }
    throw new HL7FatalError("Unable to process the read function correctly.");
  }

  /** @internal */
  protected writeCore(path: string[], value: string): HL7Node {
    const segmentName = path.shift() as string;
    if (typeof segmentName === "undefined") {
      throw new HL7ParserError("Segment name is not defined.");
    }
    return this.writeAtIndex(path, value, 0, segmentName);
  }

  /** @internal **/
  private _addSegment(path: string): Segment {
    if (typeof path === "undefined") {
      throw new HL7ParserError("Missing segment path.");
    }

    const preparedPath = this.preparePath(path);
    if (preparedPath.length !== 1) {
      throw new HL7ParserError(`Invalid segment ${path}.`);
    }

    return this.addChild(preparedPath[0]) as Segment;
  }

  /** @internal */
  private _getFirstSegment(name: string): Segment {
    const children = this.children;
    for (let i = 0, l = children.length; i < l; i++) {
      const segment = children[i] as Segment;
      if (segment.name === name) {
        return segment;
      }
    }
    throw new HL7FatalError("Unable to process _getFirstSegment.");
  }
}

export default Batch;
