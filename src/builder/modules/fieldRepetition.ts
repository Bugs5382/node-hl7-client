import { Delimiters } from "@/utils/enum";
import { HL7FatalError } from "@/utils/exception";
import { HL7Node } from "../interface/hL7Node";
import { Component } from "./component";
import { NodeBase } from "./nodeBase";
import { ValueNode } from "./valueNode";

/** @internal */
export class FieldRepetition extends ValueNode {
  /** @internal */
  constructor(parent: NodeBase, key: string, text: string) {
    super(parent, key, text, Delimiters.Component);
  }

  /** @internal */
  read(path: string[]): HL7Node {
    const component = this.children[parseInt(path.shift() as string) - 1];
    return path.length > 0 ? component.read(path) : component;
  }

  /** @internal */
  protected writeCore(path: string[], value: string): HL7Node {
    return this.writeAtIndex(path, value, parseInt(path.shift() as string) - 1);
  }

  /** @internal */
  protected pathCore(): string[] {
    if (this.parent == null) {
      throw new HL7FatalError("this.parent must not be null.");
    }
    return this.parent.path;
  }

  /** @internal */
  protected createChild(text: string, index: number): HL7Node {
    return new Component(this, (index + 1).toString(), text);
  }
}
