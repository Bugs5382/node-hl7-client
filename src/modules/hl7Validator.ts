import { Segment } from "@/builder/modules/segment";
import { ValidationRule } from "@/declaration/validationRule";

/**
 *
 */
export class HL7Validator {
  private errors: string[] = [];

  constructor(private segment: Segment) {}

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
      this.errors.push(`Field ${fieldPath} requires ${dep.path} to be set`);
    }

    if (dep.mustEqual !== undefined && depVal !== dep.mustEqual) {
      this.errors.push(
        `Field ${fieldPath} requires ${dep.path} to equal "${dep.mustEqual}", but got "${depVal}"`,
      );
    }
  }

  private validateValue(fieldPath: string, value: any, rules: ValidationRule) {
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      this.errors.push(`Field ${fieldPath} is required`);
      return;
    }

    if (value !== undefined && value !== null) {
      if (rules.type === "number" && isNaN(Number(value))) {
        this.errors.push(`Field ${fieldPath} must be a number`);
      }

      if (rules.type === "string" && typeof value !== "string") {
        this.errors.push(`Field ${fieldPath} must be a string`);
      }

      if (rules.type === "date" && !/^\d{8}$/.test(String(value))) {
        this.errors.push(
          `Field ${fieldPath} must be a valid date in YYYYMMDD format`,
        );
      }

      const valStr = String(value);
      const len = valStr.length;

      if (typeof rules.length === "number" && len !== rules.length) {
        this.errors.push(
          `Field ${fieldPath} must be exactly ${rules.length} characters`,
        );
      }

      if (typeof rules.length === "object") {
        if (rules.length.min && len < rules.length.min) {
          this.errors.push(
            `Field ${fieldPath} must be at least ${rules.length.min} characters`,
          );
        }
        if (rules.length.max && len > rules.length.max) {
          this.errors.push(
            `Field ${fieldPath} must be at most ${rules.length.max} characters`,
          );
        }
      }

      if (rules.pattern && !rules.pattern.test(valStr)) {
        this.errors.push(`Field ${fieldPath} does not match expected format`);
      }

      if (rules.allowedValues && !rules.allowedValues.includes(valStr)) {
        this.errors.push(
          `Field ${fieldPath} must be one of: ${rules.allowedValues.join(", ")}`,
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
    const normalized = this.normalize(value, rules);
    this.checkDependency(rules.dependsOn, fieldPath);
    this.validateValue(fieldPath, normalized, rules);

    if (this.errors.length === 0) {
      this.segment.set(fieldPath, normalized);
    }

    return this.errors;
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
