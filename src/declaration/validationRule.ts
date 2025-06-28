/**
 *
 */
export type ValidationRule = {
  /** An array of valid values.
   * @remarks 'type' has to be 'string', which is the default. */
  allowedValues?: string[];
  dependsOn?: {
    path: string;
    mustBeSet?: boolean;
    mustEqual?: any;
  };
  deprecated?: boolean;
  hl7Support?: string | string[];
  /** If type is 'string', you can set what the min and max number of string should be.
   * Setting the number of a single means it must be that length. */
  length?: number | { min?: number; max?: number };
  number?: { min?: number; max?: number };
  pattern?: RegExp;
  /** If this is set to 'trye', this specification is required.
   * @default false */
  required?: boolean;
  /** Type of Input
   * @default string */
  type?: "string" | "number" | "date";
  /** If type is 'number', you can set what the min and max number should be. */
  useField?: string;
};
