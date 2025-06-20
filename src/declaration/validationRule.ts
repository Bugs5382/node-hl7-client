/**
 *
 */
export type ValidationRule = {
  /** If this is set to trye, this specification is required.
   * @default false */
  required?: boolean;
  /** Type of Input
   * @default string */
  type?: "string" | "number" | "date";
  length?: number | { min?: number; max?: number };
  deprecated?: boolean;
  useField?: string;
  allowedValues?: string[];
  pattern?: RegExp;
  dependsOn?: {
    path: string;
    mustBeSet?: boolean;
    mustEqual?: any;
  };
  hl7Support?: string | string[];
};
