import { HL7FatalError } from "@/utils/exception";
import { isHL7String } from "@/utils/utils";
import { ValueNode } from "./valueNode";

/** @internal */
export class SubComponent extends ValueNode {
  /** @internal */
  toString(): string {
    if (typeof this.message !== "undefined") {
      return this.message.unescape(this.toRaw());
    }
    throw new HL7FatalError("this.message is undefined. Unable to continue.");
  }

  /** @internal */
  isEmpty(): boolean {
    return !isHL7String(this.toString());
  }
}
