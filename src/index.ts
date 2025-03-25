import { Client } from "./client/client.js";

export { Client } from "./client/client.js";
export { Message } from "./builder/message.js";
export { Batch } from "./builder/batch.js";
export { FileBatch } from "./builder/fileBatch.js";
export { Connection, IConnection } from "./client/connection.js";
export { Delimiters, ReadyState } from "./utils/enum.js";
export { OutboundHandler } from "./utils/normalizedClient.js";
export { InboundResponse } from "./client/module/inboundResponse.js";
export { NodeBase } from "./builder/modules/nodeBase.js";
export { HL7Node } from "./builder/interface/hL7Node.js";
export { EmptyNode } from "./builder/modules/emptyNode.js";
export { Segment } from "./builder/modules/segment.js";

export {
  expBackoff,
  assertNumber,
  isHL7Number,
  isHL7String,
  validIPv4,
  validIPv6,
  createHL7Date,
  isBatch,
  isFile,
  padHL7Date,
  escapeForRegExp,
  decodeHexString,
  randomString,
} from "./utils/utils.js";

export type {
  ClientOptions,
  ClientListenerOptions,
} from "./utils/normalizedClient.js";
export type {
  ClientBuilderFileOptions,
  ClientBuilderMessageOptions,
  ClientBuilderOptions,
} from "./utils/normalizedBuilder.js";
export { HL7Error, HL7FatalError, HL7ParserError } from "./utils/exception.js";
export { MLLPCodec } from "./utils/codec.js";

export default Client;
