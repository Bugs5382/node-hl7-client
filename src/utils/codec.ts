import { Socket } from 'node:net'
import { PROTOCOL_MLLP_END, PROTOCOL_MLLP_FOOTER, PROTOCOL_MLLP_HEADER } from './constants.js'

/** MLLPCodec Class
 * @since 3.1.0 */
export class MLLPCodec {
  private lastMessage: string | null = null
  private dataBuffer: Buffer = Buffer.alloc(0)

  /**
   * @since 3.1.0
   * @private
   */
  private processMessage (): void {
    const messages: string[] = []

    const dataString = this.dataBuffer.toString('utf-8') // @todo this is hard coded

    const messageParts = dataString.split('\u001c\r')

    for (const part of messageParts) {
      if (part.trim() !== '') {
        const trimmedPart = part.trim()
        messages.push(this.stripMLLPCharacters(trimmedPart))
      }
    }

    this.lastMessage = messages.join('\r') // @todo this is hard coded

    this.dataBuffer = Buffer.alloc(0)
  }

  /**
   * @since 3.1.0
   * @param message
   * @private
   */
  private stripMLLPCharacters (message: string): string {
    // eslint-disable-next-line no-control-regex
    return message.replace(/\u000b/g, '').replace(/\u001c/g, '')
  }

  /**
   * @since 3.1.0
   * @param data
   */
  public receiveData (data: Buffer): boolean {
    this.dataBuffer = Buffer.concat([this.dataBuffer, data])

    if (this.dataBuffer.includes(0x1C) && this.dataBuffer.includes(0x0D)) {
      void this.processMessage()
      return true
    }

    return false
  }

  /**
   * @since 3.1.0
   */
  public getLastMessage (): string | null {
    return this.lastMessage
  }

  /**
   * @since 3.1.0
   * @param socket
   * @param message
   * @param encoding
   */
  public sendMessage (socket: Socket | undefined, message: string, encoding: BufferEncoding): void {
    const messageBuffer = Buffer.concat([
      PROTOCOL_MLLP_HEADER,
      Buffer.from(message, encoding),
      PROTOCOL_MLLP_END,
      PROTOCOL_MLLP_FOOTER
    ])

    socket?.write(messageBuffer)
  }
}
