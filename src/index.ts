import { Client } from './client/client.js'
import { Component } from './builder/modules/component.js'
import { Field } from './builder/modules/field.js'
import { FieldRepetition } from './builder/modules/fieldRepetition.js'
import { Message } from './builder/message.js'
import { Segment } from './builder/modules/segment.js'
import { SegmentList } from './builder/modules/segmentList.js'
import { HL7_2_7 } from './specification/2.7.js'
import { HL7_SPEC, HL7_SPEC_BASE } from './specification/specification.js'
import { SubComponent } from './builder/modules/subComponent.js'
import { Batch } from './builder/batch.js'
import { FileBatch } from "./builder/fileBatch.js";
import { ParserPlan } from './utils/parserPlan.js'
import { HL7Outbound } from './client/hl7Outbound.js'

export default Client
export { Client, HL7Outbound, ParserPlan, FileBatch, Batch, Message, Segment, SegmentList, Component, SubComponent, Field, FieldRepetition }
export { Delimiters, READY_STATE } from './utils/enum.js'
export * from './utils/utils.js'

/** HL7 Specs **/
export type { MSH } from './specification/specification.js'
export type { HL7_2_7_MSH } from './specification/2.7.js'
/** HL7 Class **/
export { HL7_SPEC, HL7_SPEC_BASE, HL7_2_7 }

export type { ClientOptions, ClientListenerOptions, ParserProcessRawData } from './utils/normalizedClient.js'
export type { ClientBuilderFileOptions, ClientBuilderBatchOptions, ClientBuilderOptions } from './utils/normalizedBuilder.js'
export type { HL7Error, HL7FatalError, HL7ParserError } from './utils/exception.js'
