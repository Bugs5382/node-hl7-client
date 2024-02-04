import { Client } from './client/client.js'
import { Message } from './builder/message.js'
import { Batch } from './builder/batch.js'
import { FileBatch } from './builder/fileBatch.js'
import { Connection } from './client/connection.js'
import { Delimiters, ReadyState } from './utils/enum.js'
import { OutboundHandler } from './utils/normalizedClient.js'
import { InboundResponse } from './client/module/inboundResponse.js'
import { NodeBase } from './builder/modules/nodeBase.js'
import { HL7Node } from './builder/interface/hL7Node.js'
import { EmptyNode } from './builder/modules/emptyNode.js'
import { Segment } from './builder/modules/segment.js'
export { MSH } from './specification/specification.js'

export { expBackoff, assertNumber, isHL7Number, isHL7String, validIPv4, validIPv6, createHL7Date, isBatch, isFile, padHL7Date, escapeForRegExp, decodeHexString, randomString } from './utils/utils.js'

export type { ClientOptions, ClientListenerOptions } from './utils/normalizedClient.js'
export type { ClientBuilderFileOptions, ClientBuilderMessageOptions, ClientBuilderOptions } from './utils/normalizedBuilder.js'
export type { HL7Error, HL7FatalError, HL7ParserError } from './utils/exception.js'

export default Client
export { Client, Connection, OutboundHandler, InboundResponse, FileBatch, Batch, Message, ReadyState, NodeBase, EmptyNode, Segment, Delimiters, HL7Node }
