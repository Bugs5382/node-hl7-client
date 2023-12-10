import portfinder from 'portfinder'
import {Server, Listener as ServerListener} from "../../node-hl7-server/src";
import {Client, Listener, Message} from '../src'
import {expectEvent} from "./__utils__/utils";

describe('node hl7 client', () => {

  describe('sanity tests - client class', () => {

    test(`error - hostname has to be string`, async  () => {
      try {
        // @ts-expect-error this is not a string
        new Client({hostname: 351123})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not valid string.')
      }
    })

    test(`error - ipv4 and ipv6 both can not be true exist`, async  () => {
      try {
        new Client({hostname: '5.8.6.1', ipv6: true, ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('ipv4 and ipv6 both can\'t be set to be both used exclusively.')
      }
    })

    test(`error - ipv4 not valid address`, async  () => {
      try {
        new Client({hostname: "123.34.52.455", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv4 address.')
      }
    })

    test(`error - ipv4 valid address`, async  () => {
      try {
        new Client({hostname: "123.34.52.45", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`error - ipv6 not valid address`, async  () => {
      try {
        new Client({hostname: "2001:0db8:85a3:0000:zz00:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv6 address.')
      }
    })

    test(`error - ipv6 valid address`, async  () => {
      try {
        new Client({hostname: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`properties exist`, async  () => {
      const client = new Client({ hostname: 'hl7.server.com'})
      expect(client).toHaveProperty("connectToListener")
    })

  })

  describe('sanity tests - listener class', () => {

    let client: Client

    beforeEach(() => {
      client = new Client({hostname: 'localhost'})
    })

    test('error - no port specified', async () => {

      try {
        // @ts-expect-error port is not specified
        client.connectToListener()
      } catch (err: any) {
        expect(err.message).toBe('port is not defined.')
      }

    })

    test('error - port not a number', async  () => {
      try {
        // @ts-expect-error port is not specified as a number
        client.connectToListener({ port: "12345"}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port is not valid number.')
      }
    })

    test('error - port less than 0', async () => {
      try {
        client.connectToListener({ port: -1}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

    test('error - port greater than 65353', async () => {
      try {
        client.connectToListener({ port: 65354}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

  })

  describe('basic listener tests', () => {

    test('...simple connect', async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: 'localhost'})
      const listener = server.createListener({port: LISTEN_PORT}, async () => {})

      const client = new Client({ hostname: 'localhost'})
      const outGoing = client.connectToListener({ port: LISTEN_PORT }, () => {})

      await expectEvent(listener, 'client.connect')
      await expectEvent(outGoing, 'connect')

      await outGoing.close()
      await listener.close()

    })

    test('...should be able to connect to the same port from different clients', async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: 'localhost'})
      const listener = server.createListener({port: LISTEN_PORT}, async () => {})

      const client = new Client({ hostname: 'localhost'})
      const outGoing = client.connectToListener({ port: LISTEN_PORT }, () => {})

      const client_2 = new Client({ hostname: 'localhost'})
      const outGoing_2 = client_2.connectToListener({ port: LISTEN_PORT }, () => {})

      await expectEvent(outGoing, 'connect')
      await expectEvent(outGoing_2, 'connect')

      await outGoing.close()
      await outGoing_2.close()
      await listener.close()

    })

    test('...two different ports', async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const LISTEN_PORT_2 = await portfinder.getPortPromise({
        port: 3001,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: 'localhost'})
      const listener = server.createListener({port: LISTEN_PORT}, async () => {})

      const server_2 = new Server({ bindAddress: 'localhost'})
      const listener_2 = server_2.createListener({port: LISTEN_PORT_2}, async () => {})


      const client = new Client({ hostname: 'localhost'})
      const outGoing = client.connectToListener({ port: LISTEN_PORT }, () => {})

      const client_2 = new Client({ hostname: 'localhost'})
      const outGoing_2 = client_2.connectToListener({ port: LISTEN_PORT_2 }, () => {})

      await expectEvent(outGoing, 'connect')
      await expectEvent(outGoing_2, 'connect')

      await outGoing.close()
      await outGoing_2.close()
      await listener.close()
      await listener_2.close()

    })

  })

  describe('end to end testing', () => {

    let waitAck: number = 0

    let server: Server
    let listener: ServerListener

    let client: Client
    let outGoing: Listener

    beforeEach(async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      server = new Server({bindAddress: 'localhost'})
      listener = server.createListener({port: LISTEN_PORT}, async () => {})

      client = new Client({hostname: 'localhost'})
      outGoing = client.connectToListener({port: LISTEN_PORT, waitAck: waitAck !== 2}, async () => {})

    })

    afterEach(async () => {
      await outGoing.close()
      await listener.close()

      waitAck = waitAck + 1;
    })

    test('...send simple message, just to make sure it sends, no data checks', async () => {

      let message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: 'CONTROL_ID'
        }
      })

      await outGoing.sendMessage(message)

    })

    test('...send simple message twice, fails because no ACK of the first', async () => {

      try {
        let message = new Message({
          messageHeader: {
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: 'CONTROL_ID'
          }
        })

        await outGoing.sendMessage(message)
        await outGoing.sendMessage(message)

      } catch (err: any) {
        expect(err.message).toBe(`Can't send message while we are waiting for a response.`)
      }

    })

    // Note: For this test to pass, you must run it from the describe block!
    test('...send simple message twice, no ACK needed', async () => {

        let message = new Message({
          messageHeader: {
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: 'CONTROL_ID'
          }
        })

        await outGoing.sendMessage(message)

        message = new Message({
          messageHeader: {
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: 'CONTROL_ID'
          }
        })

        await outGoing.sendMessage(message)

    })

  })

})