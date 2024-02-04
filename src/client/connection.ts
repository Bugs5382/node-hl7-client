import EventEmitter from 'node:events'
import net, { Socket } from 'node:net'
import { clearTimeout } from 'node:timers'
import tls from 'node:tls'
import Batch from '../builder/batch.js'
import FileBatch from '../builder/fileBatch.js'
import Message from '../builder/message.js'
import { PROTOCOL_MLLP_FOOTER, PROTOCOL_MLLP_HEADER } from '../utils/constants.js'
import { ReadyState } from '../utils/enum.js'
import { HL7FatalError } from '../utils/exception.js'
import { ClientListenerOptions, normalizeClientListenerOptions, OutboundHandler } from '../utils/normalizedClient.js'
import { createDeferred, Deferred, expBackoff } from '../utils/utils.js'
import { Client } from './client.js'
import { InboundResponse } from './module/inboundResponse.js'

/* eslint-disable */
export interface Connection extends EventEmitter {
  /** The connection has been closed manually. You have to start the connection again. */
  on(name: 'close', cb: () => void): this;
  /** The connection is made. */
  on(name: 'connect', cb: () => void): this;
  /** The connection is being (re)established or attempting to re-connect. */
  on(name: 'connection', cb: () => void): this;
  /** The handle is open to do a manual start to connect. */
  on(name: 'open', cb: () => void): this;
  /** The total acknowledged for this connection. */
  on(name: 'client.acknowledged', cb: (number: number) => void): this;
  /** The connection has an error. */
  on(name: 'client.error', cb: (err: any) => void): this;
  /** The total sent for this connection. */
  on(name: 'client.sent', cb: (number: number) => void): this;
}
/* eslint-enable */

/** Connection Class
 * @description Create a connection customer that will listen to result send to the particular port.
 * @since 1.0.0 */
export class Connection extends EventEmitter implements Connection {
  /** @internal */
  _handler: OutboundHandler
  /** @internal */
  private readonly _main: Client
  /** @internal */
  private readonly _opt: ReturnType<typeof normalizeClientListenerOptions>
  /** @internal */
  private _retryCount: number
  /** @internal */
  _retryTimer: NodeJS.Timeout | undefined
  /** @internal */
  private _socket: Socket | undefined
  /** @internal */
  protected _readyState: ReadyState
  /** @internal */
  _pendingSetup: Promise<boolean> | boolean
  /** @internal */
  _onConnect: Deferred<void>
  /** @internal */
  private _awaitingResponse: boolean
  /** @internal */
  readonly stats = {
    /** Total acknowledged messages back from server.
     * @since 1.1.0 */
    acknowledged: 0,
    /** Total message sent to server.
     * @since 1.1.0 */
    sent: 0
  }

  /**
   * @since 1.0.0
   * @param client The client parent that we are connecting too.
   * @param props The individual port connection options.
   * Some values will be defaulted by the parent server connection.
   * @param handler The function that will send the returned information back to the client after we got a response from the server.
   * @example
   * ```ts
   * const OB = client.createConnection({ port: 3000 }, async (res) => {})
   * ```
   */
  constructor (client: Client, props: ClientListenerOptions, handler: OutboundHandler) {
    super()

    this._handler = handler
    this._main = client
    this._awaitingResponse = false

    this._opt = normalizeClientListenerOptions(client._opt, props)

    this._connect = this._connect.bind(this)

    this._pendingSetup = true
    this._retryCount = 0
    this._retryTimer = undefined
    this._onConnect = createDeferred(true)

    if (this._opt.autoConnect) {
      this._readyState = ReadyState.CONNECTING
      this.emit('connecting')
      this._socket = this._connect()
    } else {
      this._readyState = ReadyState.OPEN
      this.emit('open')
      this._socket = undefined
    }
  }

  /** Close Client Listener Instance.
   * @description Force close a connection.
   * It Will stop any re-connection timers.
   * If you want to restart, your app has to restart the connection.
   * @since 1.0.0
   * @example
   * ```ts
   * OB.close()
   * ```
   */
  async close (): Promise<void> {
    if (this._readyState === ReadyState.CLOSED) {
      return // We are already closed. Nothing to do.
    }

    if (this._readyState === ReadyState.CLOSING) {
      return await new Promise(resolve => this._socket?.once('close', resolve))
    }

    if (this._readyState === ReadyState.CONNECTING) {
      // clear retry timer
      if (typeof this._retryTimer !== 'undefined') {
        clearTimeout(this._retryTimer)
      }
      // let's clear out the try timer forcefully
      this._retryTimer = undefined
    }

    // normal closing
    this._readyState = ReadyState.CLOSING

    // remove socket
    this._socket?.destroy()
    this._socket?.end()

    this.emit('close')

    this._readyState = ReadyState.CLOSED
  }

  /**
   * Get Port
   * @description Get the port that this connection will connect to.
   * @since 2.0.0
   */
  getPort (): number {
    return this._opt.port
  }

  /**
   * Start the connection if not auto started.
   * @since 2.0.0
   */
  async start (): Promise<void> {
    if (this._readyState === ReadyState.CONNECTING) {
      return
    }

    if (this._readyState === ReadyState.CONNECTED) {
      return
    }

    if (this._readyState === ReadyState.OPEN) {
      return
    }

    if (this._readyState === ReadyState.CLOSING) {
      return await new Promise(resolve => this._socket?.once('close', resolve))
    }

    this.emit('connecting')

    this._socket = this._connect()
  }

  /** Send a HL7 Message to the Listener
   * @description This function sends a message/batch/file batch to the remote side.
   * It has the ability, if set to auto-retry (defaulted to 1 re-connect before connection closes)
   * @since 1.0.0
   * @param message The message we need to send to the port.
   * @example
   * ```ts
   *
   * // the OB was set from the orginial 'createConnection' method.
   *
   * let message = new Message({
   *  messageHeader: {
   *    msh_9_1: "ADT",
   *    msh_9_2: "A01",
   *    msh_11_1: "P" // marked for production here in the example
   *  }async sendMessage (message: Message | Batch | FileBatch): void {
   * })
   *
   * await OB.sendMessage(message)
   *
   * ```
   */
  async sendMessage (message: Message | Batch | FileBatch): Promise<void> {
    let attempts = 0
    const maxAttempts = this._opt.maxAttempts
    const emitter = new EventEmitter()

    const checkConnection = async (): Promise<boolean> => {
      return this._readyState === ReadyState.CONNECTED
    }

    const checkAcknowledgement = async (): Promise<boolean> => {
      return this._awaitingResponse
    }

    const checkSend = async (_message: string): Promise<boolean> => {
      while (true) { // noinspection InfiniteLoopJS
        try {
          if ((this._readyState === ReadyState.CLOSED) || (this._readyState === ReadyState.CLOSING)) {
            // noinspection ExceptionCaughtLocallyJS
            throw new HL7FatalError('In an invalid state to be able to send message.')
          }
          if (this._readyState !== ReadyState.CONNECTED) {
            // if we are not connected,
            // check to see if we are now connected.
            if (this._pendingSetup === false) {
              this._pendingSetup = checkConnection().finally(() => {
                this._pendingSetup = false
              })
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
              if (this._opt.waitAck) {
                this._pendingSetup = checkAcknowledgement().finally(() => {
                  this._pendingSetup = false
                })
              }
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

    // get the message
    const theMessage = message.toString()

    // check to see if we should be sending
    await checkSend(theMessage)

    // ok, if our options are to wait for an acknowledgement, set the var to "true"
    if (this._opt.waitAck) {
      this._awaitingResponse = true
    }

    // add MLLP settings to the message
    const messageToSend = Buffer.from(`${PROTOCOL_MLLP_HEADER}${theMessage}${PROTOCOL_MLLP_FOOTER}`)

    // send the message
    this._socket?.write(messageToSend, this._opt.encoding, () => {
      // we sent a message
      ++this.stats.sent
      // emit
      this.emit('client.sent', this.stats.sent)
    })
  }

  /** @internal */
  private _connect (): Socket {
    let socket: Socket
    const host = this._main._opt.host
    const port = this._opt.port

    this._retryTimer = undefined

    if (typeof this._main._opt.tls !== 'undefined') {
      socket = tls.connect({
        host,
        port,
        ...this._main._opt.socket,
        ...this._main._opt.tls
      })
    } else {
      socket = net.connect({
        host,
        port
      })
    }

    this._socket = socket

    // set no delay
    socket.setNoDelay(true)

    let connectionError: Error | boolean | undefined

    socket.on('error', err => {
      connectionError = (connectionError != null) ? connectionError : err
    })

    socket.on('close', () => {
      if (this._readyState === ReadyState.CLOSING) {
        this._readyState = ReadyState.CLOSED
      } else {
        connectionError = (connectionError != null) ? connectionError : new HL7FatalError('Socket closed unexpectedly by server.')
        if (this._readyState === ReadyState.OPEN) {
          this._onConnect = createDeferred(true)
        }
        this._readyState = ReadyState.CONNECTING
        const retryCount = this._retryCount++
        const delay = expBackoff(this._opt.retryLow, this._opt.retryHigh, retryCount)
        if (retryCount <= this._opt.maxConnectionAttempts) {
          this._retryTimer = setTimeout(this._connect, delay)
          this.emit('client.error', connectionError)
        } else if (retryCount > this._opt.maxConnectionAttempts) {
          // stop this from going again
          void this.close()
        }
      }
    })

    socket.on('connect', () => {
      // accepting connections
      this._readyState = ReadyState.CONNECTED
      // reset retryCount count
      this._retryCount = 1
      // emit
      this.emit('connect')
    })

    socket.on('data', (buffer) => {
      // we got some sort of response, bad, good, or error,
      // so lets tell the system we got "something"
      this._awaitingResponse = false

      socket.cork()

      const indexOfVT = buffer.indexOf(PROTOCOL_MLLP_HEADER)
      const indexOfFSCR = buffer.indexOf(PROTOCOL_MLLP_FOOTER)

      let loadedMessage = buffer.toString().substring(indexOfVT, indexOfFSCR + 2)
      loadedMessage = loadedMessage.replace(PROTOCOL_MLLP_HEADER, '')

      if (loadedMessage.includes(PROTOCOL_MLLP_FOOTER)) {
        // strip them out
        loadedMessage = loadedMessage.replace(PROTOCOL_MLLP_FOOTER, '')
        if (typeof this._handler !== 'undefined') {
          // response
          const response = new InboundResponse(loadedMessage)
          // got an ACK, failure or not
          ++this.stats.acknowledged
          // update ack total
          this.emit('client.acknowledged', this.stats.acknowledged)
          // send it back
          void this._handler(response)
        }
      }

      socket.uncork()
    })

    const readerLoop = async (): Promise<void> => {
      try {
        await this._negotiate()
      } catch (err: any) {
        if (err.code !== 'READ_END') {
          socket.destroy(err)
        }
      }
    }

    void readerLoop().then(_r => { /* noop */ })

    return socket
  }

  /** @internal */
  private async _negotiate (): Promise<void> {
    if (this._socket?.writable === true) {
      // we are open, not yet ready, but we can
      this._readyState = ReadyState.OPEN
      // on connect resolve
      this._onConnect.resolve()
      // emit
      this.emit('connection')
    }
  }
}

export default Connection
