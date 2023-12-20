import { Message } from '../../builder/message.js'

/**
 * Inbound Request
 * @since 1.0.0
 */
export class InboundResponse {
  /** @internal */
  private readonly _message: Message

  /**
   * Process the Inbound Response from the Server
   * @description This takes the string of the response from the server and makes it a message. A response from a broker SHOULD always be a
   * @since 1.0.0
   * @param data
   */
  constructor (data: string) {
    this._message = new Message({ text: data.toString() })
  }

  /** '
   * Get Message
   * @since 1.0.0
   * @return Message
   */
  getMessage (): Message {
    return this._message
  }
}
