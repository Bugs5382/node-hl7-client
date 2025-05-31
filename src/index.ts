import { Batch } from "./builder/batch";
import { FileBatch } from "./builder/fileBatch";
import { HL7Node } from "./builder/interface/hL7Node";
import { Message } from "./builder/message";
import { EmptyNode } from "./builder/modules/emptyNode";
import { NodeBase } from "./builder/modules/nodeBase";
import { Segment } from "./builder/modules/segment";
import { SegmentList } from "./builder/modules/segmentList";
import { Client } from "./client/client";
import { Connection, IConnection } from "./client/connection";
import { InboundResponse } from "./client/module/inboundResponse";
import { Delimiters, ReadyState } from "./utils/enum";
import {
  FallBackHandler,
  NotifyPendingCount,
  OutboundHandler,
} from "./utils/types";

export type {
  ClientBuilderFileOptions,
  ClientBuilderMessageOptions,
  ClientBuilderOptions,
  ClientListenerOptions,
  ClientOptions,
  MessageItem,
} from "./utils/types";
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
} from "./utils/utils";

export { MLLPCodec } from "./utils/codec";
export { HL7Error, HL7FatalError, HL7ParserError } from "./utils/exception";
export {
  Batch,
  Client,
  Connection,
  Delimiters,
  EmptyNode,
  FileBatch,
  InboundResponse,
  Message,
  NodeBase,
  ReadyState,
  Segment,
  SegmentList,
};
export type {
  FallBackHandler,
  HL7Node,
  IConnection,
  NotifyPendingCount,
  OutboundHandler,
};

export default Client;
