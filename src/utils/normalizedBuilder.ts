import fs from "fs";
import { HL7_2_7 } from "../specification/2.7.js";
import { HL7FatalError } from "./exception.js";
import { ParserPlan } from "./parserPlan.js";
import {
  ClientBuilderFileOptions,
  ClientBuilderMessageOptions,
  ClientBuilderOptions,
} from "./types.js";
import { isBatch } from "./utils.js";

const DEFAULT_CLIENT_BUILDER_OPTS = {
  date: "14",
  newLine: "\r",
  parsing: false,
  separatorComponent: "^",
  separatorEscape: "\\",
  separatorField: "|",
  separatorRepetition: "~",
  separatorSubComponent: "&",
  specification: new HL7_2_7(),
  text: "",
};

const DEFAULT_CLIENT_FILE_OPTS = {
  extension: "hl7",
  location: "",
};

export function normalizedClientMessageBuilderOptions(
  raw?: ClientBuilderMessageOptions,
): ClientBuilderMessageOptions {
  const props: ClientBuilderMessageOptions = {
    ...DEFAULT_CLIENT_BUILDER_OPTS,
    ...raw,
  };

  if (typeof props.messageHeader === "undefined" && props.text === "") {
    throw new HL7FatalError(
      "mshHeader must be set if no HL7 message is being passed.",
    );
  } else if (
    typeof props.messageHeader === "undefined" &&
    typeof props.text !== "undefined" &&
    props.text.slice(0, 3) !== "MSH"
  ) {
    throw new Error("text must begin with the MSH segment.");
  }

  if (
    (typeof props.newLine !== "undefined" && props.newLine === "\\r") ||
    props.newLine === "\\n"
  ) {
    throw new HL7FatalError("newLine must be \r or \n");
  }

  if (props.date !== "8" && props.date !== "12" && props.date !== "14") {
    props.date = "14";
  }

  if (props.text === "") {
    props.text = `MSH${props.separatorField as string}${props.separatorComponent as string}${props.separatorRepetition as string}${props.separatorEscape as string}${props.separatorSubComponent as string}`;
  } else if (typeof props.text !== "undefined") {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8));
    props.parsing = true;
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes("\r") ? "\r" : "\n";
    props.separatorField = plan.separatorField;
    props.separatorComponent = plan.separatorComponent;
    props.separatorRepetition = plan.separatorRepetition;
    props.separatorEscape = plan.separatorEscape;
    props.separatorSubComponent = plan.separatorSubComponent;
    // remove default specs
    props.specification = undefined;
    // cleanup
    props.text = props.text.trim();
  }

  return props;
}

export function normalizedClientBatchBuilderOptions(
  raw?: ClientBuilderOptions,
): ClientBuilderOptions {
  const props: ClientBuilderOptions = {
    ...DEFAULT_CLIENT_BUILDER_OPTS,
    ...raw,
  };

  if (
    typeof props.text !== "undefined" &&
    props.text !== "" &&
    props.text.slice(0, 3) !== "BHS" &&
    props.text.slice(0, 3) !== "MSH"
  ) {
    throw new HL7FatalError("text must begin with the BHS or MSH segment.");
  }

  if (
    typeof props.text !== "undefined" &&
    props.text !== "" &&
    props.text.slice(0, 3) === "MSH" &&
    !isBatch(props.text)
  ) {
    throw new HL7FatalError(
      "Unable to process a single MSH as a batch. Use Message.",
    );
  }

  if (
    (typeof props.newLine !== "undefined" && props.newLine === "\\r") ||
    props.newLine === "\\n"
  ) {
    throw new HL7FatalError("newLine must be \r or \n");
  }

  if (props.date !== "8" && props.date !== "12" && props.date !== "14") {
    props.date = "14";
  }

  if (props.text === "") {
    props.text = `BHS${props.separatorField as string}${props.separatorComponent as string}${props.separatorRepetition as string}${props.separatorEscape as string}${props.separatorSubComponent as string}`;
  } else if (typeof props.text !== "undefined") {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8));
    props.parsing = true;
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes("\r") ? "\r" : "\n";
    props.separatorField = plan.separatorField;
    props.separatorComponent = plan.separatorComponent;
    props.separatorRepetition = plan.separatorRepetition;
    props.separatorEscape = plan.separatorEscape;
    props.separatorSubComponent = plan.separatorSubComponent;
  }

  return props;
}

export function normalizedClientFileBuilderOptions(
  raw?: ClientBuilderFileOptions,
): ClientBuilderFileOptions {
  const props: ClientBuilderFileOptions = {
    ...DEFAULT_CLIENT_FILE_OPTS,
    ...DEFAULT_CLIENT_BUILDER_OPTS,
    ...raw,
  };

  if (
    typeof props.text !== "undefined" &&
    props.text !== "" &&
    props.text.slice(0, 3) !== "FHS"
  ) {
    throw new HL7FatalError("text must begin with the FHS segment.");
  }

  if (
    (typeof props.newLine !== "undefined" && props.newLine === "\\r") ||
    props.newLine === "\\n"
  ) {
    throw new HL7FatalError("newLine must be \r or \n");
  }

  if (typeof props.extension !== "undefined" && props.extension.length !== 3) {
    throw new HL7FatalError(
      "The extension for file save must be 3 characters long.",
    );
  }

  if (
    typeof props.fullFilePath !== "undefined" &&
    typeof props.fileBuffer !== "undefined"
  ) {
    throw new HL7FatalError(
      "You can not have specified a file path and a buffer. Please choose one or the other.",
    );
  }

  if (props.date !== "8" && props.date !== "12" && props.date !== "14") {
    props.date = "14";
  }

  const regex = /\n/gm;
  const subst = "\\r";
  if (
    typeof props.fullFilePath !== "undefined" &&
    typeof props.fileBuffer === "undefined"
  ) {
    const fileBuffer = fs.readFileSync(props.fullFilePath);
    props.text = fileBuffer.toString().replace(regex, subst);
  } else if (
    typeof props.fullFilePath === "undefined" &&
    typeof props.fileBuffer !== "undefined"
  ) {
    props.text = props.fileBuffer.toString().replace(regex, subst);
  }

  if (props.text === "") {
    props.text = `FHS${props.separatorField as string}${props.separatorComponent as string}${props.separatorRepetition as string}${props.separatorEscape as string}${props.separatorSubComponent as string}`;
  } else if (typeof props.text !== "undefined") {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8));
    props.parsing = true;
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes("\r") ? "\r" : "\n";
    props.separatorField = plan.separatorField;
    props.separatorComponent = plan.separatorComponent;
    props.separatorRepetition = plan.separatorRepetition;
    props.separatorEscape = plan.separatorEscape;
    props.separatorSubComponent = plan.separatorSubComponent;
  }

  return props;
}
