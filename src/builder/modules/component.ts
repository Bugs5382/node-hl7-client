import { Delimiters } from "../../utils/enum.js";
import { HL7Node } from "../interface/hL7Node.js";
import { NodeBase } from "./nodeBase.js";
import { SubComponent } from "./subComponent.js";
import { ValueNode } from "./valueNode.js";

/** @internal */
export class Component extends ValueNode {
  /** @internal */
  constructor(parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.SubComponent);
  }

  /** @internal */
  read(path: string[]): HL7Node {
    return this.children[parseInt(path.shift() as string) - 1];
  }

  /** @internal */
  protected writeCore(path: string[], value: string): HL7Node {
    return this.writeAtIndex(path, value, parseInt(path.shift() as string) - 1);
  }

  /** @internal */
  protected createChild(text: string, index: number): HL7Node {
    return new SubComponent(this, (index + 1).toString(), text);
  }
}
