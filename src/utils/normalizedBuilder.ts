import fs from 'fs'
import { HL7_2_7 } from '../specification/2.7.js'
import { FHS, BHS, MSH } from '../specification/specification.js'
import { ParserPlan } from './parserPlan.js'

const DEFAULT_CLIENT_BUILDER_OPTS = {
  newLine: '\r',
  parsing: false,
  separatorComponent: '^',
  separatorEscape: '\\',
  separatorField: '|',
  separatorRepetition: '~',
  separatorSubComponent: '&',
  specification: new HL7_2_7(),
  text: ''
}

const DEFAULT_CLIENT_FILE_OPTS = {
  extension: 'hl7',
  location: ''
}

/**
 * Client Builder Options
 * @description Used to specific default paramaters around building an HL7 message if that is
 * so desired.
 * It also sets up checking of input values to make sure they match up to the proper
 * HL7 specification.
 * @since 1.0.0
 */
export interface ClientBuilderOptions {
  /** At the end of each line, add this as the new line character.
   * @since 1.0.0
   * @default \r */
  newLine?: string
  /** Parsing a message?
   * @since 1.0.0
   * @default false
   */
  parsing?: boolean
  /** The character used to separate different components.
   * @since 1.0.0
   * @default ^ */
  separatorComponent?: string
  /** The character used to escape characters that need it in order for the computer to interpret the string correctly.
   * @since 1.0.0
   * @default \\ */
  separatorEscape?: string
  /** The character used for separating fields.
   * @since 1.0.0
   * @default | */
  separatorField?: string
  /** The character used for repetition field/values pairs.
   * @since 1.0.0
   * @default ~ */
  separatorRepetition?: string
  /** The character used to have subcomponents seperated.
   * @since 1.0.0
   * @default & */
  separatorSubComponent?: string
  /** The HL7 spec we are going to be creating.
   * This will be formatted into the MSH header by default.
   * @since 1.0.0
   * @default 2.7 via class new HL7_2_7() */
  specification?: any
  /** The HL7 string that we are going to parse.
   * @default "" */
  text?: string
}

export interface ClientBuilderMessageOptions extends ClientBuilderOptions {
  /**
   * MSH Header Options
   * @since 1.0.0
   */
  messageHeader?: MSH
}

export interface ClientBuilderBatchOptions extends ClientBuilderOptions {
  /**
   * BHS Header Options
   * @since 1.0.0
   */
  batchHeader?: BHS
}

export interface ClientBuilderFileOptions extends ClientBuilderOptions {
  /**
   * Extension of the file when it gets created.
   * @since 1.0.0
   * @default hl7
   */
  extension?: string
  /** The file as a buffer passed onto the constructor
   * @since 1.0.0  */
  fileBuffer?: Buffer
  /** If you are providing the full file path, please set it here.
   * @since 1.0.0 */
  fullFilePath?: string
  /** FHS Header Options
   * @since 1.0.0
   */
  fileHeader?: FHS
  /** Location where the file will be saved.
   * If this is not set,
   * the files will get save it in the same directory of the executing file that is calling the function.
   * If running this package inside a DOCKER/KUBERNETES node,
   * if the container is destroyed and the files are not saved on a folder mounted outside the node,
   * the files will be lost on restart.
   * @since 1.0.0
   * @default ""
   */
  location?: string
}

export function normalizedClientMessageBuilderOptions (raw?: ClientBuilderMessageOptions): ClientBuilderMessageOptions {
  const props: ClientBuilderMessageOptions = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.messageHeader === 'undefined' && props.text === '') {
    throw new Error('mshHeader must be set if no HL7 message is being passed.')
  } else if (typeof props.messageHeader === 'undefined' && typeof props.text !== 'undefined' && props.text.slice(0, 3) !== 'MSH') {
    throw new Error('text must begin with the MSH segment.')
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  if (props.text === '') {
    props.text = `MSH${props.separatorField}${props.separatorComponent}${props.separatorRepetition}${props.separatorEscape}${props.separatorSubComponent}`
  } else if (typeof props.text !== 'undefined') {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8))
    props.parsing = true
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes('\r') ? '\r' : '\n'
    props.separatorField = plan.separatorField
    props.separatorComponent = plan.separatorComponent
    props.separatorRepetition = plan.separatorRepetition
    props.separatorEscape = plan.separatorEscape
    props.separatorSubComponent = plan.separatorSubComponent
  }

  return props
}

export function normalizedClientBatchBuilderOptions (raw?: ClientBuilderBatchOptions): ClientBuilderBatchOptions {
  const props: ClientBuilderBatchOptions = { ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.batchHeader === 'undefined' && typeof props.text !== 'undefined' && props.text !== '' && props.text.slice(0, 3) !== 'BHS') {
    throw new Error('text must begin with the BHS segment.')
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  if (props.text === '') {
    props.text = `BHS${props.separatorField}${props.separatorComponent}${props.separatorRepetition}${props.separatorEscape}${props.separatorSubComponent}`
  } else if (typeof props.text !== 'undefined') {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8))
    props.parsing = true
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes('\r') ? '\r' : '\n'
    props.separatorField = plan.separatorField
    props.separatorComponent = plan.separatorComponent
    props.separatorRepetition = plan.separatorRepetition
    props.separatorEscape = plan.separatorEscape
    props.separatorSubComponent = plan.separatorSubComponent
  }

  return props
}

export function normalizedClientFileBuilderOptions (raw?: ClientBuilderFileOptions): ClientBuilderFileOptions {
  const props: ClientBuilderFileOptions = { ...DEFAULT_CLIENT_FILE_OPTS, ...DEFAULT_CLIENT_BUILDER_OPTS, ...raw }

  if (typeof props.fileHeader === 'undefined' && typeof props.text !== 'undefined' && props.text !== '' && props.text.slice(0, 3) !== 'FHS') {
    throw new Error('text must begin with the FHS segment.')
  }

  if ((typeof props.newLine !== 'undefined' && props.newLine === '\\r') || props.newLine === '\\n') {
    throw new Error('newLine must be \r or \n')
  }

  if (typeof props.extension !== 'undefined' && props.extension.length !== 3) {
    throw new Error('The extension for file save must be 3 characters long.')
  }

  if (typeof props.fullFilePath !== 'undefined' && typeof props.fileBuffer !== 'undefined') {
    throw new Error('You can not have specified a file path and a buffer. Please choose one or the other.')
  }

  const regex = /\n/mg
  const subst = '\\r'
  if (typeof props.fullFilePath !== 'undefined' && typeof props.fileBuffer === 'undefined') {

    const fileBuffer = fs.readFileSync(props.fullFilePath)
    props.text = fileBuffer.toString().replace(regex, subst)
  } else if (typeof props.fullFilePath === 'undefined' && typeof props.fileBuffer !== 'undefined') {
    props.text = props.fileBuffer.toString().replace(regex, subst)
  }

  if (props.text === '') {
    props.text = `FHS${props.separatorField}${props.separatorComponent}${props.separatorRepetition}${props.separatorEscape}${props.separatorSubComponent}`
  } else if (typeof props.text !== 'undefined') {
    const plan: ParserPlan = new ParserPlan(props.text.slice(3, 8))
    props.parsing = true
    // check to make sure that we set the correct properties
    props.newLine = props.text.includes('\r') ? '\r' : '\n'
    props.separatorField = plan.separatorField
    props.separatorComponent = plan.separatorComponent
    props.separatorRepetition = plan.separatorRepetition
    props.separatorEscape = plan.separatorEscape
    props.separatorSubComponent = plan.separatorSubComponent
  }

  return props
}
