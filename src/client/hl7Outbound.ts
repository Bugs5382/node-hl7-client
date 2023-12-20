import EventEmitter from 'node:events'
import fs from 'node:fs'
import net, { Socket } from 'node:net'
import tls from 'node:tls'
import { Batch } from '../builder/batch.js'
import { FileBatch } from '../builder/fileBatch.js'
import { Message } from '../builder/message.js'
import { CR, FS, VT } from '../utils/constants.js'
import { ReadyState } from '../utils/enum.js'
import { HL7FatalError } from '../utils/exception.js'
import { ClientListenerOptions, normalizeClientListenerOptions, OutboundHandler } from '../utils/normalizedClient.js'
import { expBackoff, randomString } from '../utils/utils.js'
import { Client } from './client.js'
import { InboundResponse } from './module/inboundResponse.js'

/** HL7 Outbound Class
 * @description Create a connection to a server on a particular port.
 * @since 1.0.0 */
export class HL7Outbound extends EventEmitter {
  /** @internal */
  private _awaitingResponse: boolean
  /** @internal */
  _connectionTimer: NodeJS.Timeout | undefined
  /** @internal */
  private readonly _handler: (res: InboundResponse) => void
  /** @internal */
  private readonly _main: Client
  /** @internal */
  private readonly _nodeId: string
  /** @internal */
  private readonly _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  private _retryCount: number
  /** @internal */
  _retryTimer: NodeJS.Timeout | undefined
  /** @internal */
  private readonly _socket: Socket
  /** @internal */
  private readonly _sockets: Map<any, any>
  /** @internal */
  protected _readyState: ReadyState
  /** @internal */
  _pendingSetup: Promise<boolean> | boolean

  /**
   * @since 1.0.0
   * @param client The client parent that we are connecting too.
   * @param props The individual port connection options.
   * Some values will be defaulted by the parent server connection.
   * @param handler The function that will send the returned information back to the client after we got a response from the server.
   * @example
   * ```ts
   * const OB = client.createOutbound({ port: 3000 }, async (res) => {})
   * ```
   */
  constructor (client: Client, props: ClientListenerOptions, handler: OutboundHandler) {
    super()
    this._awaitingResponse = false
    this._connectionTimer = undefined
    this._handler = handler
    this._main = client
    this._nodeId = randomString(5)
    this._opt = normalizeClientListenerOptions(props)
    this._pendingSetup = true
    this._sockets = new Map()
    this._retryCount = 1
    this._retryTimer = undefined
    this._readyState = ReadyState.CONNECTING

    this._connect = this._connect.bind(this)
    this._socket = this._connect()
  }

  /** Close Client Listener Instance.
   * @description Force close a connection.
   * It Will stop any re-connection timers.
   * If you want to restart, your app has to restart the connection.
   * @since 1.0.0
   * @example
   * ```ts
   *  OB.close()
   * ```
   */
  async close (): Promise<boolean> {
    // mark that we set our internal that we are closing, so we do not try to re-connect
    this._readyState = ReadyState.CLOSING
    this._sockets.forEach((socket) => {
      if (typeof socket.destroyed !== 'undefined') {
        socket.end()
        socket.destroy()
      }
    })
    this._sockets.clear()

    this.emit('client.close')

    return true
  }

  /**
   * Read a file.
   * @description We need to read a file.
   * We are not doing anything else other than getting the {@link Buffer} of the file,
   * so we can pass it onto the File Batch class to send it to the {@link sendMessage} method as a separate step
   * @since 1.0.0
   * @param fullFilePath The full file path of the file we need to read.
   */
  async readFile (fullFilePath: string): Promise<FileBatch> {
    try {
      const regex = /\n/mg
      const subst = '\\r'
      const fileBuffer = fs.readFileSync(fullFilePath)
      const text = fileBuffer.toString().replace(regex, subst)
      return new FileBatch({ text })
    } catch (e: any) {
      throw new HL7FatalError(500, `Unable to read file: ${fullFilePath}`)
    }
  }

  /** Send a HL7 Message to the Listener
   * @description This function sends a message/batch/file batch to the remote side.
   * It has the ability, if set to auto-retry (defaulted to 1 re-connect before connection closes)
   * @since 1.0.0
   * @param message The message we need to send to the port.
   * @example
   * ```ts
   *
   * // OB was set from the orginial 'createOutbound' method.
   *
   * let message = new Message({
   *  messageHeader: {
   *    msh_9_1: "ADT",
   *    msh_9_2: "A01",
   *    msh_11_1: "P" // marked for production here in the example
   *  }
   * })
   *
   * await OB.sendMessage(message)
   *
   * ```
   */
  async sendMessage (message: Message | Batch | FileBatch): Promise<boolean> {
    let attempts = 0
    const maxAttempts = typeof this._opt.maxAttempts === 'undefined' ? this._main._opt.maxAttempts : this._opt.maxAttempts

    const checkConnection = async (): Promise<boolean> => {
      return this._readyState === ReadyState.CONNECTED
    }

    const checkAck = async (): Promise<boolean> => {
      return this._awaitingResponse
    }

    const checkSend = async (_message: string): Promise<boolean> => {
      // noinspection InfiniteLoopJS
      while (true) {
        try {
        // first, if we are closed, sorry, no more sending messages
          if ((this._readyState === ReadyState.CLOSED) || (this._readyState === ReadyState.CLOSING)) {
            // noinspection ExceptionCaughtLocallyJS
            throw new HL7FatalError(500, 'In an invalid state to be able to send message.')
          }
          if (this._readyState !== ReadyState.CONNECTED) {
          // if we are not connected,
          // check to see if we are now connected.
            if (this._pendingSetup === false) {
              this._pendingSetup = checkConnection().finally(() => { this._pendingSetup = false })
            }
          } else if (this._readyState === ReadyState.CONNECTED && this._opt.waitAck && this._awaitingResponse) {
          // Ok, we ar now confirmed connected.
          // However, since we are checking
          // to make sure we wait for an ACKNOWLEDGEMENT from the server,
          // that the message was gotten correctly from the last one we sent.
          // We are still waiting, we need to recheck again
          // if we are not connected,
          // check to see if we are now connected.
            if (this._pendingSetup === false) {
              this._pendingSetup = checkAck().finally(() => { this._pendingSetup = false })
            }
          }
          return await this._pendingSetup
        } catch (err: any) {
          Error.captureStackTrace(err)
          if (++attempts >= maxAttempts) {
            throw err
          } else {
            emitter.emit('retry', err)
          }
        }
      }
    }

    const emitter = new EventEmitter()

    // get the message
    const theMessage = message.toString()

    // check to see if we should be sending
    await checkSend(theMessage)

    // ok, if our options are to wait for an acknowledgement, set the var to "true"
    if (this._opt.waitAck) {
      this._awaitingResponse = true
    }

    // add MLLP settings to the message
    const messageToSend = Buffer.from(`${VT}${theMessage}${FS}${CR}`)

    return this._socket.write(messageToSend, this._opt.encoding, () => {
      // FOR DEBUGGING ONLY: console.log(toSendData)
    })
  }

  /** @internal */
  private _addSocket (nodeId: string, socket: any, b: boolean): void {
    const s = this._sockets.get(nodeId)
    if (!b && typeof s !== 'undefined' && typeof s.destroyed !== 'undefined') {
      return
    }
    this._sockets.set(nodeId, socket)
  }

  /** @internal */
  private _connect (): Socket {
    let socket: Socket
    const host = this._main._opt.host
    const port = this._opt.port

    if (typeof this._main._opt.tls !== 'undefined') {
      socket = tls.connect({ host, port, ...this._main._opt.socket, ...this._main._opt.tls }, () => this._listener(socket))
    } else {
      socket = net.createConnection({ host, port }, () => this._listener(socket))
    }

    socket.on('error', err => {
      this._removeSocket(this._nodeId)
      this.emit('client.error', err, this._nodeId)
    })

    socket.on('close', () => {
      if (this._readyState === ReadyState.CLOSING) {
        this._readyState = ReadyState.CLOSED
      } else {
        const retryHigh = typeof this._opt.retryHigh === 'undefined' ? this._main._opt.retryHigh : this._opt.retryLow
        const retryLow = typeof this._opt.retryLow === 'undefined' ? this._main._opt.retryLow : this._opt.retryLow
        const retryCount = this._retryCount++
        const delay = expBackoff(retryLow, retryHigh, retryCount)
        this._readyState = ReadyState.OPEN
        this._retryTimer = setTimeout(this._connect, delay)
        if (retryCount <= 1) {
          this.emit('error')
        }
      }
    })

    socket.on('connect', () => {
      this._readyState = ReadyState.CONNECTED
      this.emit('connect', true, this._socket)
    })

    socket.on('data', (buffer: Buffer) => {
      this._awaitingResponse = false
      let loadedMessage = buffer.toString().replace(VT, '')
      // is there is F5 and CR in this message?
      if (loadedMessage.includes(FS + CR)) {
        // strip them out
        loadedMessage = loadedMessage.replace(FS + CR, '')
        const response = new InboundResponse(loadedMessage)
        this._handler(response)
      }
    })

    socket.on('end', () => {
      this._removeSocket(this._nodeId)
      this.emit('client.end')
    })

    socket.unref()

    return socket
  }

  /** @internal */
  private _listener (socket: Socket): void {
    // set no delay
    socket.setNoDelay(true)

    // add socket
    this._addSocket(this._nodeId, socket, true)

    // check to make sure we do not max out on connections, we shouldn't...
    if (this._sockets.size > this._opt.maxConnections) {
      this._manageConnections()
    }

    this._readyState = ReadyState.CONNECTED
  }

  /** @internal */
  private _manageConnections (): void {
    let count = this._sockets.size - this._opt.maxConnections
    if (count <= 0) {
      return
    }

    const list: Array<{ nodeID: any, lastUsed: any }> = []
    this._sockets.forEach((socket, nodeID) => list.push({ nodeID, lastUsed: socket.lastUsed }))
    list.sort((a, b) => a.lastUsed - b.lastUsed)

    count = Math.min(count, list.length - 1)
    const removable = list.slice(0, count)

    removable.forEach(({ nodeID }) => this._removeSocket(nodeID))
  }

  /** @internal */
  private _removeSocket (nodeId: string): void {
    const socket = this._sockets.get(nodeId)
    if (typeof socket !== 'undefined' && typeof socket.destroyed !== 'undefined') {
      socket.destroy()
    }
    this._sockets.delete(nodeId)
  }
}
