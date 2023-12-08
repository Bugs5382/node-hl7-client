import * as Util from "../utils";
import {HL7FatalError} from "../utils/exception";
import {
  ClientBuilderBatchOptions,
  normalizedClientBatchBuilderOptions,
} from "../utils/normalize";
import {RootNode} from "./modules/rootNode";

/**
 * Batch Class
 * @since 1.0.0
 * @extends RootNode
 */
export class Batch extends RootNode {

  _opt: ReturnType<typeof normalizedClientBatchBuilderOptions>

  constructor(props?: ClientBuilderBatchOptions) {
    const opt = normalizedClientBatchBuilderOptions(props)

    super(props);

    this._opt = opt

    if (typeof this._opt.batchHeader !== 'undefined') {
      if (this._opt.specification.checkBSH(this._opt.batchHeader) === true) {
        this.set('BSH.7', Util.createDate(new Date()))
      }
    } else {
      throw new HL7FatalError(500, 'Unable to fully build a new HL7 batch framework.')
    }

  }

}