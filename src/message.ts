import { Delimiters } from './delimiters'
import { Node } from './node'
import { ClientBuilderOptions, normalizedClientBuilderOptions } from './normalize'
import { Segment } from './segment'
import { createDateTime } from './utils'

export class Message extends Node {
  private readonly _opt: ReturnType<typeof normalizedClientBuilderOptions>
  private _delimiters: string

  /**
   * @param text If not provided you have to build a MSH header using (@see createHeader)
   * @param props Override default encoding characters. (@default |^~\\&)
   * @example
   * If you are processing a full message, do this:
   *
   * const message = new Message("The HL7 Message Here")
   * ... output cut ...
   *
   * If you are building out a message, do this:
   *
   * const message = new Message();
   * await message.createHeader<HL7_2_7_MSH>() ({ ... required parameters ... })
   * ... add additional segments, etc. Check out Unit Tests for complete examples ...
   *
   * which will generate the properly formatted MSH header for your HL7 Method.
   *
   * @since 1.0.0
   */
  constructor (text: string = '', props: ClientBuilderOptions = normalizedClientBuilderOptions()) {
    super(null, text, Delimiters.Segment)

    this._opt = normalizedClientBuilderOptions(props)
    this._delimiters = `${this._opt.newLine}${this._opt.separatorField}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`
  }

  addSegment (path: string): Segment {
    if (typeof path === 'undefined') {
      throw new Error('Missing segment path.')
    }
    const preparedPath = this.preparePath(path)
    if (preparedPath.length !== 1) {
      throw new Error("Invalid segment path '" + path + "'.")
    }
    return this.addChild(preparedPath[0]) as Segment
  }

  async createHeader<T>(specification: T): Promise<void> {
    try {
      const specs = await this._opt.specification.checkMSH(specification)

      if (typeof specs.msh_1 !== 'undefined') {
        this._opt.separatorField = specs.msh_1
      }

      if (typeof specs.msh_2 !== 'undefined') {
        this._delimiters = `${this._opt.newLine}${specs.msh_2}`
      }

      const segment = this.addSegment('MSH')
      segment.set('MSH.1', typeof specs.msh_1 !== 'undefined' ? specs.msh_1 : this._opt.separatorField)
      segment.set('MSH.2', typeof specs.msh_2 !== 'undefined' ? specs.msh_2 : `${typeof specs.msh_1 !== 'undefined' ? specs.msh_1 : this._opt.separatorField}${this._opt.separatorRepetition}${this._opt.separatorEscape}${this._opt.separatorSubComponent}`)
      segment.set('MSH.7', typeof specs.msh_7 !== 'undefined' ? specs.msh_7 : createDateTime())
      segment.set('MSH.9').set('1', specs.msh_9_1).set('2', specs.msh_9_2).set('3', specs.msh_9_3)
    } catch (e: any) {
      throw new Error(e.message)
    }
  }

  protected pathCore (): string[] {
    // the message has an empty path
    return []
  }

  protected createChild (text: string, _index: number): Node {
    // make sure to remove any \n that might follow the \r
    return new Segment(this, text.trim())
  }

  get delimiters (): string {
    return this._delimiters
  }
}
