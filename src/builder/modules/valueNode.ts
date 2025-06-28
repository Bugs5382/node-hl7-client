import { Delimiters } from "@/declaration/enum";
import { HL7FatalError } from "@/helpers/exception";
import { NodeBase } from "./nodeBase";

/** @internal */
export class ValueNode extends NodeBase {
  /** @internal */
  protected key: string;

  /** @internal */
  constructor(
    parent: NodeBase,
    key: string,
    text: string,
    delimiter: Delimiters | undefined = undefined,
  ) {
    super(parent, text, delimiter);
    this.key = key;
  }

  /** @internal */
  toString(): string {
    const children = this.children;
    return children.length === 0 ? this.toRaw() : children[0].toString();
  }

  /** @internal */
  toDate(): Date {
    const text = this.toString();

    const year = parseInt(text.slice(0, 4));
    const month = parseInt(text.slice(4, 6)) - 1;
    const day = parseInt(text.slice(6, 8));
    const hour = parseInt(text.slice(8, 10) || "0");
    const minute = parseInt(text.slice(10, 12) || "0");
    const second = parseInt(text.slice(12, 14) || "0");

    const baseDate = new Date(Date.UTC(year, month, day, hour, minute, second));

    const tzOffsetMatch = text.match(/([+-])(\d{2})(\d{2})$/);

    if (tzOffsetMatch) {
      const sign = tzOffsetMatch[1] === '+' ? -1 : 1; // inverse because offset is from UTC
      const tzHour = parseInt(tzOffsetMatch[2]);
      const tzMin = parseInt(tzOffsetMatch[3]);
      const offsetMillis = sign * ((tzHour * 60 + tzMin) * 60 * 1000);
      return new Date(baseDate.getTime() + offsetMillis);
    }

    return new Date(
      year,
      month,
      day,
      hour,
      minute,
      second,
    );
  }

  /** @internal */
  toInteger(): number {
    return parseInt(this.toString());
  }

  /** @internal */
  toFloat(): number {
    return parseFloat(this.toString());
  }

  /** @internal */
  toBoolean(): boolean {
    switch (this.toString()) {
      case "Y":
        return true;
      case "N":
        return false;
    }
    throw new HL7FatalError("Not a valid value for boolean value.");
  }

  /** @internal */
  protected pathCore(): string[] {
    if (this.parent === null) {
      throw new HL7FatalError("Somehow, this.parent is null.");
    }
    return this.parent.path.concat([this.key]);
  }
}
