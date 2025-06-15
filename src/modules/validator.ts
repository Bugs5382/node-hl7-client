import { Segment } from "@/builder/modules/segment";
import { ValidationRule } from "@/declaration/validationRule";
import { HL7ValidationError } from "@/helpers";

interface HL7ValidationProps {
  /** */
  hardError?: boolean;
  /** */
  segment: Segment;
}

/**
 * @since 4.0.0
 */
export class Validator {
  /**
   * Errors
   * @since 4.0.0
   * @private
   */
  private errors: string[] = [];
  /**
   * Segment
   * @since 4.0.0
   * @private
   */
  private segment: Segment;
  /**
   * Regardless if errors are soft, always throw and exception or deviation from the rule.
   * @since 4.0.0
   * @private
   */
  private readonly hardError: boolean;
  /**
   *
   * @private
   */
  private warnings: string[] = [];

  constructor(props: HL7ValidationProps) {
    this.hardError = props.hardError || false;
    this.segment = props.segment;
  }

  private resolvePath(path: string): any {
    return this.segment.get(path);
  }

  private normalize(value: any, rules: ValidationRule): any {
    if (typeof value === "string") {
      return value.trim();
    }
    return value;
  }

  private checkDependency(dep: ValidationRule["dependsOn"], fieldPath: string) {
    if (!dep) return;

    const depVal = this.resolvePath(dep.path);
    const isSet = depVal !== undefined && depVal !== null && depVal !== "";

    if (dep.mustBeSet && !isSet) {
      this._throwError(`Field ${fieldPath} requires ${dep.path} to be set`);
    }

    if (dep.mustEqual !== undefined && depVal !== dep.mustEqual) {
      this._throwError(
        `Field ${fieldPath} requires ${dep.path} to equal "${dep.mustEqual}", but got "${depVal}"`,
      );
    }
  }

  private validateValue(fieldPath: string, value: any, rules: ValidationRule) {
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      this._throwError(`Field ${fieldPath} is required`, true);
    }

    if (value !== undefined && value !== null) {
      if (rules.type === "number" && isNaN(Number(value))) {
        this._throwError(`Field ${fieldPath} must be a number`);
      }

      if (rules.type === "string" && typeof value !== "string") {
        this._throwError(`Field ${fieldPath} must be a string`);
      }

      if (
        rules.type === "date" &&
        !/^\d{8}(\d{4})?(\d{2})?(\.\d{4})?$/.test(String(value))
      ) {
        this._throwError(
          `Field ${fieldPath} must be a valid HL7 date in one of the following formats: YYYYMMDD, YYYYMMDDHHMM, YYYYMMDDHHMMSS, or YYYYMMDDHHMMSS.SSSS`,
        );
      }

      const valStr = String(value);
      const len = valStr.length;

      if (typeof rules.length === "number" && len !== rules.length) {
        this._throwError(
          `Field ${fieldPath} must be exactly ${rules.length} characters`,
        );
      }

      if (typeof rules.length === "object") {
        if (rules.length.min && len < rules.length.min) {
          this._throwError(
            `Field ${fieldPath} must be at least ${rules.length.min} characters`,
          );
        }
        if (rules.length.max && len > rules.length.max) {
          this._throwError(
            `Field ${fieldPath} must be at most ${rules.length.max} characters`,
          );
        }
      }

      if (rules.pattern && !rules.pattern.test(valStr)) {
        this._throwError(`Field ${fieldPath} does not match expected format`);
      }

      if (rules.allowedValues && !rules.allowedValues.includes(valStr)) {
        this._throwError(
          `Field ${fieldPath} must be one of: ${rules.allowedValues.join(", ")}`,
          true,
        );
      }
    }
  }

  public validateAndSet(
    fieldPath: string,
    value: any,
    rules: ValidationRule = {},
  ): string[] {
    this.errors = [];
    this.warnings = [];
    const normalized = this.normalize(value, rules);
    this.checkDependency(rules.dependsOn, fieldPath);
    this.validateValue(fieldPath, normalized, rules);

    if (
      rules.deprecated &&
      normalized !== undefined &&
      normalized !== null &&
      normalized !== ""
    ) {
      let msg = `Field ${fieldPath} is deprecated and should not be used.`;
      if (rules.useField) {
        msg += ` Use '${rules.useField}' instead.`;
      }
      this._warn(msg);
    }

    if (this.errors.length === 0) {
      this.segment.set(fieldPath, normalized);
    }

    return this.errors;
  }

  private _warn(message: string) {
    this.warnings.push(`${message}`);
  }

  private _throwError(message: string, forceThrow: boolean = false) {
    if (this.hardError || forceThrow) {
      throw new HL7ValidationError(message);
    }

    this.errors.push(message);
  }

  // public delete(
  //   fieldPath: string,
  //   dependsOn?: ValidationRule["dependsOn"],
  // ): string[] {
  //   this.errors = [];
  //   this.checkDependency(dependsOn, fieldPath);
  //
  //   if (this.errors.length === 0) {
  //     this.segment.delete(fieldPath);
  //   }
  //
  //   return this.errors;
  // }
}
