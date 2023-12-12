import portfinder from 'portfinder'
import {Hl7Inbound, Server} from "../../node-hl7-server/src";
import {Client, HL7Outbound, Message} from '../src'
import {expectEvent} from "./__utils__/utils";

describe('node hl7 client', () => {

  describe('sanity tests - client class', () => {

    test(`error - hostname has to be string`, async  () => {
      try {
        // @ts-expect-error this is not a string
        new Client({host: 351123})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not valid string.')
      }
    })

    test(`error - ipv4 and ipv6 both can not be true exist`, async  () => {
      try {
        new Client({host: '5.8.6.1', ipv6: true, ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('ipv4 and ipv6 both can\'t be set to be both used exclusively.')
      }
    })

    test(`error - ipv4 not valid address`, async  () => {
      try {
        new Client({host: "123.34.52.455", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv4 address.')
      }
    })

    test(`error - ipv4 valid address`, async  () => {
      try {
        new Client({host: "123.34.52.45", ipv4: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`error - ipv6 not valid address`, async  () => {
      try {
        new Client({host: "2001:0db8:85a3:0000:zz00:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBe('hostname is not a valid IPv6 address.')
      }
    })

    test(`error - ipv6 valid address`, async  () => {
      try {
        new Client({host: "2001:0db8:85a3:0000:0000:8a2e:0370:7334", ipv6: true})
      } catch (err: any) {
        expect(err.message).toBeUndefined()
      }
    })

    test(`properties exist`, async  () => {
      const client = new Client({ host: 'hl7.server.com'})
      expect(client).toHaveProperty("createOutbound")
    })

  })

  describe('sanity tests - listener class', () => {

    let client: Client

    beforeEach(() => {
      client = new Client({host: 'localhost'})
    })

    test('error - no port specified', async () => {

      try {
        // @ts-expect-error port is not specified
        client.createOutbound()
      } catch (err: any) {
        expect(err.message).toBe('port is not defined.')
      }

    })

    test('error - port not a number', async  () => {
      try {
        // @ts-expect-error port is not specified as a number
        client.createOutbound({ port: "12345"}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port is not valid number.')
      }
    })

    test('error - port less than 0', async () => {
      try {
        client.createOutbound({ port: -1}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

    test('error - port greater than 65353', async () => {
      try {
        client.createOutbound({ port: 65354}, async () => {})
      } catch (err: any) {
        expect(err.message).toBe('port must be a number (0, 65353).')
      }
    })

  })

  describe('basic listener tests', () => {

    test.skip('...simple connect', async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: 'localhost'})
      const listener = server.createInbound({port: LISTEN_PORT}, async () => {})

      const client = new Client({ host: 'localhost'})
      const outGoing = client.createOutbound({ port: LISTEN_PORT }, async () => {})

      await expectEvent(listener, 'client.connect')
      await expectEvent(outGoing, 'connect')

      await outGoing.close()
      await listener.close()

    })

  })

  describe('server/client sanity checks', () => {

    let waitAck: number = 0

    let server: Server
    let listener: Hl7Inbound

    let client: Client
    let outGoing: HL7Outbound

    beforeEach(async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      server = new Server({bindAddress: 'localhost'})
      listener = server.createInbound({port: LISTEN_PORT}, async () => {})

      client = new Client({host: 'localhost'})
      outGoing = client.createOutbound({port: LISTEN_PORT, waitAck: waitAck !== 2}, async () => {})

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

  describe('end to end tests', () => {

    test.skip('...send message, get proper ACK', async () => {

    })

  })

})