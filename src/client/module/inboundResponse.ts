import { Message } from "../../builder/message.js";

/**
 * Inbound Request
 * @since 1.0.0
 */
export class InboundResponse {
  /** @internal */
  private readonly _message: Message;

  /**
   * Process the Inbound Response from the Server
   * @remarks This takes the string of the response from the server and makes it a message.
   * A response from a broker SHOULD always be a properly formated Hl7 message, we hope.
   * @since 1.0.0
   * @param data
   */
  constructor(data: string) {
    this._message = new Message({ text: data.toString().trimEnd() });
  }

  /** '
   * Get Message
   * @since 1.0.0
   * @return Message
   */
  getMessage(): Message {
    return this._message;
  }
}
