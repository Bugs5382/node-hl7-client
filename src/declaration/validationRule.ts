/**
 *
 */
export type ValidationRule = {
  required?: boolean;
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
