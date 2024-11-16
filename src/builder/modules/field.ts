import { Delimiters } from "../../utils/enum.js";
import { HL7Node } from "../interface/hL7Node.js";
import { FieldRepetition } from "./fieldRepetition.js";
import { NodeBase } from "./nodeBase.js";
import { ValueNode } from "./valueNode.js";

/** @internal */
export class Field extends ValueNode {
  /** @internal */
  constructor(parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.Repetition);
  }

  /** @internal */
  read(path: string[]): HL7Node {
    if (this.children.length > 0) {
      return this.children[0].read(path);
    }
    return this;
  }

  /** @internal */
  protected writeCore(path: string[], value: string): HL7Node {
    return this._ensureChild().write(path, value);
  }

  /**
   * Create a field repetition field of FieldRepetition
   * @since 1.0.0
   * @see {@link FieldRepetition}
   * @param text
   * @param _index
   * @protected
   */
  protected createChild(text: string, _index: number): HL7Node {
    return new FieldRepetition(this, this.key, text);
  }

  /** @internal */
  private _ensureChild(): HL7Node {
    let child: HL7Node;
    if (this.children.length === 0) {
      child = this.createChild("", 0);
      this.setChild(child, 0);
    } else {
      child = this.children[0];
    }
    return child;
  }
}
