import { HL7FatalError } from "@/helpers/exception";
import { ClientBuilderOptions } from "@/modules/types";

const DEFAULT_CLIENT_BUILDER_OPTS = {
  newLine: "\r",
  separatorComponent: "^",
  separatorEscape: "\\",
  separatorField: "|",
  separatorRepetition: "~",
  separatorSubComponent: "&",
};

export function normalizedClientBuilderOptions(
  raw?: ClientBuilderOptions,
): ClientBuilderOptions {
  const props: ClientBuilderOptions = {
    ...DEFAULT_CLIENT_BUILDER_OPTS,
    ...raw,
  };

  if (
    (typeof props.newLine !== "undefined" && props.newLine === "\\r") ||
    props.newLine === "\\n"
  ) {
    throw new HL7FatalError("newLine must be \r or \n");
  }

  if (props.date !== "8" && props.date !== "12" && props.date !== "14") {
    props.date = "14";
  }

  return props;
}
