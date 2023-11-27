/*
import {Node} from "./node";
import {ClientBuilderOptions, normalizedClientBatchBuilderOptions} from "./normalize";
*/

export class Batch {

/*  private _count: number = 0;
  private _opt: ReturnType<typeof normalizedClientBatchBuilderOptions>;
  private _header: string;
  private _tail: string;

  /!**
   * @param batch {boolean} Creating a batch or a file batch. BHS/BTS or FHS/FTS with the encoding characters. (@default true)
   * @param props Override default encoding characters. (@default |^~\\&)
   * @since 1.0.0
   *!/
  constructor(batch: boolean = true, props?: ClientBuilderOptions) {
    super()

    this._opt = normalizedClientBatchBuilderOptions(props)

    if (batch) {
      this._header = `BHS${this._opt.separatorField}${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`
      this._tail= `BTS${this._opt.separatorField}`
    } else {
      this._header = `FHS${this._opt.separatorField}${this._opt.separatorComponent}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`
      this._tail = `FTS${this._opt.separatorField}`
    }

  }*/

  buildHeader() {

  }

  /**
   * Adds a new message segment to the batch.
   * @since 1.0.0
   */
  addMessage() {

  }


}