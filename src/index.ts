import { Batch } from "./builder/batch.js";
import { FileBatch } from "./builder/fileBatch.js";
import { HL7Node } from "./builder/interface/hL7Node.js";
import { Message } from "./builder/message.js";
import { EmptyNode } from "./builder/modules/emptyNode.js";
import { NodeBase } from "./builder/modules/nodeBase.js";
import { Segment } from "./builder/modules/segment.js";
import { Client } from "./client/client.js";
import { Connection, IConnection } from "./client/connection.js";
import { InboundResponse } from "./client/module/inboundResponse.js";
import { Delimiters, ReadyState } from "./utils/enum.js";
import {
  FallBackHandler,
  NotifyPendingCount,
  OutboundHandler,
} from "./utils/types.js";

export type {
  ClientBuilderFileOptions,
  ClientBuilderMessageOptions,
  ClientBuilderOptions,
  ClientListenerOptions,
  ClientOptions,
  MessageItem,
} from "./utils/types.js";
export {
  assertNumber,
  createHL7Date,
  decodeHexString,
  escapeForRegExp,
  expBackoff,
  isBatch,
  isFile,
  isHL7Number,
  isHL7String,
  padHL7Date,
  randomString,
  validIPv4,
  validIPv6,
} from "./utils/utils.js";

export { MLLPCodec } from "./utils/codec.js";
export { HL7Error, HL7FatalError, HL7ParserError } from "./utils/exception.js";
export {
  Batch,
  Client,
  Connection,
  Delimiters,
  EmptyNode,
  FallBackHandler,
  FileBatch,
  HL7Node,
  IConnection,
  InboundResponse,
  Message,
  NodeBase,
  NotifyPendingCount,
  OutboundHandler,
  ReadyState,
  Segment,
};

export default Client;
