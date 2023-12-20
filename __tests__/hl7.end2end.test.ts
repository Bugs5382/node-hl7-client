import fs from "fs";
import path from "node:path";
import portfinder from "portfinder";
import {Hl7Inbound, Server} from "node-hl7-server";
import {Batch, Client, HL7Outbound, Message} from "../src";
import {HL7_2_7_MSH} from "../src/specification/2.7";
import {expectEvent, sleep} from "./__utils__";

const MSH_HEADER: HL7_2_7_MSH = {
  msh_9_1: "ADT",
  msh_9_2: "A01",
  msh_11_1: "D"
}

describe('node hl7 end to end', () => {

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

      server = new Server({bindAddress: '0.0.0.0'})
      listener = server.createInbound({port: LISTEN_PORT}, async () => {})

      client = new Client({host: '0.0.0.0'})
      outGoing = client.createOutbound({port: LISTEN_PORT, waitAck: waitAck !== 2}, async () => {})

    })

    afterEach(async () => {
      await outGoing.close()
      await listener.close()

      waitAck = waitAck + 1;
    })

    test('...simple connect', async () => {

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: '0.0.0.0'})
      const listener = server.createInbound({port: LISTEN_PORT}, async () => {})

      const client = new Client({ host: '0.0.0.0'})
      const outGoing = client.createOutbound({ port: LISTEN_PORT }, async () => {})

      await expectEvent(listener, 'client.connect')
      await expectEvent(outGoing, 'connect')

      await outGoing.close()
      await listener.close()

    })

    test('...send simple message, just to make sure it sends, no data checks', async () => {

      let message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: 'CONTROL_ID'
        }
      })

      await outGoing.sendMessage(message)

    })

    test('...send simple message twice, fails because no ACK of the first', async () => {

      try {
        let message = new Message({
          messageHeader: {
            ...MSH_HEADER,
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
          ...MSH_HEADER,
          msh_10: 'CONTROL_ID'
        }
      })

      await outGoing.sendMessage(message)

      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: 'CONTROL_ID'
        }
      })

      await outGoing.sendMessage(message)

    })

  })

  describe('...send message, get proper ACK', () => {

    let LISTEN_PORT: number
    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })
    })

    test('...no tls', async () => {

      const server = new Server({bindAddress: '0.0.0.0'})
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0'})

      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageResponse = res.getMessage()
        expect(messageResponse.get('MSA.1').toString()).toBe('AA')
      })

      await sleep(5)

      let message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID',
          msh_11_1: "D"
        }
      })

      await OB_ADT.sendMessage(message)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

    test('...tls', async () => {

      const server = new Server(
        {
          bindAddress: '0.0.0.0',
          tls:
            {
              key: fs.readFileSync(path.join('certs/', 'server-key.pem')),
              cert: fs.readFileSync(path.join('certs/', 'server-crt.pem')),
              rejectUnauthorized: false
            }
        })
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0', tls: { rejectUnauthorized: false }})
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        expect(res.toString()).not.toContain('ADT^A01^ADT_A01')
      })

      await sleep(5)

      let message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID',
          msh_11_1: "D"
        }
      })

      await OB_ADT.sendMessage(message)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

  })

  describe('...send batch with one message, get proper ACK', () => {

    let LISTEN_PORT: number
    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })
    })

    test('...no tls', async () => {

      const server = new Server({bindAddress: '0.0.0.0'})
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0'})
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
      })

      await sleep(5)

      let batch = new Batch()

      batch.start()

      batch.set('BHS.7', '20081231')

      let message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID1',
          msh_11_1: "D"
        }
      })

      message.set('MSH.7', '20081231')

      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

    test('...tls', async () => {

      const server = new Server(
        {
          bindAddress: '0.0.0.0',
          tls:
            {
              key: fs.readFileSync(path.join('certs/', 'server-key.pem')),
              cert: fs.readFileSync(path.join('certs/', 'server-crt.pem')),
              rejectUnauthorized: false
            }
        })
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0', tls: { rejectUnauthorized: false }})
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
      })

      await sleep(5)

      let batch = new Batch()
      batch.start()

      let message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID',
          msh_11_1: "D"
        }
      })

      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

  })

  describe('...send file with one message, get proper ACK', () => {

    let LISTEN_PORT: number

    const hl7_string: string = "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231"

    beforeAll(async () => {

      fs.readdir("temp/", (err, files) => {
        if (err) return;
        for (const file of files) {
          fs.unlink(path.join("temp/", file), (err) => {
            if (err) throw err;
          });
        }
      })

      await sleep(2)

      const message = new Message({text: hl7_string, date: "8"})
      message.toFile('readFileTestMSH', true, 'temp/')

      await sleep(2)

    })

    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })
    })

    test('...no tls', async () => {

      const server = new Server({bindAddress: '0.0.0.0'})
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0'})
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
      })

      await sleep(5)

      const fileBatch = await OB_ADT.readFile(`temp/hl7.readFileTestMSH.20081231.hl7`)

      await OB_ADT.sendMessage(fileBatch)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

    test('...tls', async () => {

      const server = new Server(
        {
          bindAddress: '0.0.0.0',
          tls:
            {
              key: fs.readFileSync(path.join('certs/', 'server-key.pem')),
              cert: fs.readFileSync(path.join('certs/', 'server-crt.pem')),
              rejectUnauthorized: false
            }
        })
      const IB_ADT = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse("AA")
      })

      await sleep(5)

      const client = new Client({host: '0.0.0.0', tls: { rejectUnauthorized: false }})
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
      })

      await sleep(5)

      const fileBatch = await OB_ADT.readFile(`temp/hl7.readFileTestMSH.20081231.hl7`)

      await OB_ADT.sendMessage(fileBatch)

      await sleep(10)

      await OB_ADT.close()
      await IB_ADT.close()

    })

  })

})
