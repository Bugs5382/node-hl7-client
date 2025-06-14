/**
 *
 */
export type ValidationRule = {
  required?: boolean;
  type?: "string" | "number" | "date";
  length?: number | { min?: number; max?: number };
  allowedValues?: string[];
  pattern?: RegExp;
  dependsOn?: {
    path: string;
    mustBeSet?: boolean;
    mustEqual?: any;
  };
};
