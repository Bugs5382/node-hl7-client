/**
 * Parse Plan
 * @remarks Used to figure out the current HL7
 * message(s)/batch delimited used to encode this particular HL7 message
 * @since 1.0.0
 */
export class ParserPlan {
  /** @internal */
  separatorField: string;
  /** @internal */
  separatorComponent: string;
  /** @internal */
  separatorRepetition: string;
  /** @internal */
  separatorEscape: string;
  /** @internal */
  separatorSubComponent: string;

  /**
   * @since 1.0.0
   * @param data
   */
  constructor(data: string) {
    const seps = data.split("");

    this.separatorField = seps[0];
    if (seps.length > 2) {
      this.separatorRepetition = seps[2];
    } else {
      this.separatorRepetition = "~";
    }
    if (seps.length > 1) {
      this.separatorComponent = seps[1];
    } else {
      this.separatorComponent = "^";
    }
    if (seps.length > 4) {
      this.separatorSubComponent = seps[4];
    } else {
      this.separatorSubComponent = "&";
    }
    if (seps.length > 3) {
      this.separatorEscape = seps[3];
    } else {
      this.separatorEscape = "\\";
    }
  }
}
