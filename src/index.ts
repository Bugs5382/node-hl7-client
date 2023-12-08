import { Client } from './client/client'
import { Component } from './builder/modules/component'
import { Delimiters } from './builder/decorators/delimiters'
import { Field } from './builder/modules/field'
import { FieldRepetition } from './builder/modules/fieldRepetition'
import { Listener } from './client/listener'
import { Message } from './builder/message'
import { Parser, ParserPlan } from './client/parser'
import { Segment } from './builder/modules/segment'
import { SegmentList } from './builder/modules/segmentList'
import { HL7_2_7 } from './specification/2.7.js'
import { HL7_SPEC, HL7_SPEC_BASE } from './specification/specification.js'
import { SubComponent } from './builder/modules/subComponent'

export default Client
export { Client, Listener, Parser, ParserPlan, Message, Delimiters, Segment, SegmentList, Component, SubComponent, Field, FieldRepetition }
export * from './utils/index'

/** HL7 Specs **/
export type { MSH } from './specification/specification.js'
export type { HL7_MSH_MESSAGE_TYPE } from './specification/generic.js'
export type { HL7_2_7_MSH } from './specification/2.7.js'
/** HL7 Class **/
export { HL7_SPEC, HL7_SPEC_BASE, HL7_2_7 }

export type { ClientOptions, ClientListenerOptions, ClientBuilderOptions, ClientBuilderBatchOptions, ClientBuilderFileOptions, ParserProcessRawData } from './utils/normalize'
export type { HL7Error, HL7FatalError, HL7ParserError } from './utils/exception'
