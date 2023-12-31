import fs from 'fs'
import { Hl7Inbound, Server } from 'node-hl7-server'
import { Batch, Client, HL7Outbound, Message } from '../src'
import path from 'node:path'
import portfinder from 'portfinder'
import { createDeferred, Deferred, expectEvent, sleep } from './__utils__'

describe('node hl7 end to end - client', () => {
  let dfd: Deferred<void>

  describe('server/client sanity checks', () => {
    // please run these tests using the described block. otherwise tests will fail

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

      server = new Server({ bindAddress: '0.0.0.0' })
      listener = server.createInbound({ port: LISTEN_PORT }, async () => {})

      client = new Client({ host: '0.0.0.0' })
      outGoing = client.createOutbound({ port: LISTEN_PORT, waitAck: waitAck !== 2 }, async () => {})
    })

    afterEach(async () => {
      await outGoing.close()
      await listener.close()

      waitAck = waitAck + 1
    })

    test('...simple connect', async () => {
      // please run these tests using the described block. otherwise tests will fail

      const LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      const server = new Server({ bindAddress: '0.0.0.0' })
      const listener = server.createInbound({ port: LISTEN_PORT }, async () => {})

      const client = new Client({ host: '0.0.0.0' })
      const outGoing = client.createOutbound({ port: LISTEN_PORT }, async () => {})

      await expectEvent(listener, 'client.connect')
      await expectEvent(outGoing, 'connect')

      await outGoing.close()
      await listener.close()
    })

    test('...send simple message, just to make sure it sends, no data checks', async () => {
      // please run these tests using the described block. otherwise tests will fail

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await outGoing.sendMessage(message)
    })

    test('...send simple message twice, fails because no ACK of the first', async () => {
      // please run these tests using the described block. otherwise tests will fail

      try {
        const message = new Message({
          messageHeader: {
            msh_9_1: 'ADT',
            msh_9_2: 'A01',
            msh_10: 'CONTROL_ID',
            msh_11_1: 'D'
          }
        })

        await outGoing.sendMessage(message)
        await outGoing.sendMessage(message)
      } catch (err: any) {
        expect(err.message).toBe('Can\'t send message while we are waiting for a response.')
      }
    })

    // Note: For this test to pass, you must run it from the describe block!
    test('...send simple message twice, no ACK needed', async () => {
      // please run these tests using the described block. otherwise tests will fail

      let message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await outGoing.sendMessage(message)

      message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await outGoing.sendMessage(message)
    })
  })

  describe('server/client failure checks', () => {
    test('...host does not exist, timeout', async () => {
      const client = new Client({ host: '192.0.2.1' })

      // forced to lower connection timeout so unit testing is not slow
      const ob = client.createOutbound({ port: 1234, connectionTimeout: 100 }, async () => {})

      await expectEvent(ob, 'timeout')
    })

    test('...host exist, but not listening on the port, timeout', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const listener = server.createInbound({ port: 3000 }, async () => {})

      await expectEvent(listener, 'listen')

      const client = new Client({ host: '0.0.0.0' })

      // forced to lower connection timeout so unit testing is not slow
      const ob = client.createOutbound({ port: 1234, connectionTimeout: 10 }, async () => {})

      // we couldn't connect
      await expectEvent(ob, 'error')

      // we are attempting to reconnect
      await expectEvent(ob, 'connecting')

      // close ob now. were done
      await ob.close()

      // close the server connection
      await listener.close()
    })
  })

  describe('...send message, get proper ACK', () => {
    let LISTEN_PORT: number

    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      dfd = createDeferred<void>()
    })

    test('...no tls', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('message')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0' })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await OB_ADT.sendMessage(message)

      await sleep(10)

      dfd.promise

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
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('message')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0', tls: { rejectUnauthorized: false } })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await OB_ADT.sendMessage(message)

      await sleep(10)

      dfd.promise

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

      dfd = createDeferred<void>()
    })

    test('...no tls', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('batch')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0' })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toRaw()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const batch = new Batch()
      batch.start()

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID1',
          msh_11_1: 'D'
        }
      })

      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      dfd.promise

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
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('batch')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0', tls: { rejectUnauthorized: false } })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const batch = new Batch()
      batch.start()

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      dfd.promise

      await OB_ADT.close()
      await IB_ADT.close()
    })
  })

  describe('...send batch with two message, get proper ACK', () => {
    let LISTEN_PORT: number
    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      dfd = createDeferred<void>()
    })

    test('...no tls', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('batch')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      let count: number = 0
      const client = new Client({ host: '0.0.0.0' })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        count = count + 1
        if (count === 2) {
          dfd.resolve()
        }
      })

      await expectEvent(OB_ADT, 'connect')

      const batch = new Batch()
      batch.start()

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID1',
          msh_11_1: 'D'
        }
      })

      batch.add(message)
      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      dfd.promise

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
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        const messageType = req.getType()
        expect(messageType).toBe('batch')
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      let count: number = 0
      const client = new Client({ host: '0.0.0.0', tls: { rejectUnauthorized: false } })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        count = count + 1
        if (count === 2) {
          dfd.resolve()
        }
      })

      await expectEvent(OB_ADT, 'connect')

      const batch = new Batch()
      batch.start()

      const message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      batch.add(message)
      batch.add(message)

      batch.end()

      await OB_ADT.sendMessage(batch)

      await sleep(10)

      dfd.promise

      await OB_ADT.close()
      await IB_ADT.close()
    })
  })

  describe('...send file with one message, get proper ACK', () => {
    let LISTEN_PORT: number

    const hl7_string: string = 'MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231'

    beforeAll(async () => {
      fs.readdir('temp/', (err, files) => {
        if (err != null) return
        for (const file of files) {
          fs.unlink(path.join('temp/', file), (err) => {
            if (err != null) throw err
          })
        }
      })

      await sleep(2)

      const message = new Message({ text: hl7_string, date: '8' })
      message.toFile('readFileTestMSH', true, 'temp/')

      fs.access('temp/hl7.readFileTestMSH.20081231.hl7', fs.constants.F_OK, (err) => {
        if (err == null) {
          // Do something
        }
      })

      await (async () => {
        try {
          await fs.promises.access('temp/hl7.readFileTestMSH.20081231.hl7', fs.constants.F_OK)
          // Do something
        } catch (err) {
          // Handle error
        }
      })()
    })

    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      dfd = createDeferred<void>()
    })

    test('...no tls', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0' })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const fileBatch = await OB_ADT.readFile('temp/hl7.readFileTestMSH.20081231.hl7')

      await OB_ADT.sendMessage(fileBatch)

      await dfd.promise

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
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0', tls: { rejectUnauthorized: false } })
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(OB_ADT, 'connect')

      const fileBatch = await OB_ADT.readFile('temp/hl7.readFileTestMSH.20081231.hl7')

      await OB_ADT.sendMessage(fileBatch)

      await dfd.promise

      await OB_ADT.close()
      await IB_ADT.close()
    })
  })

  describe('...send file with two message, get proper ACK', () => {
    let LISTEN_PORT: number

    const hl7_string: string = 'MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231\rMSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231'

    beforeAll(async () => {
      fs.readdir('temp/', (err, files) => {
        if (err != null) return
        for (const file of files) {
          fs.unlink(path.join('temp/', file), (err) => {
            if (err != null) throw err
          })
        }
      })

      await sleep(2)

      const message = new Message({ text: hl7_string, date: '8' })
      message.toFile('readFileTestMSH', true, 'temp/')

      fs.access('temp/hl7.readFileTestMSH.20081231.hl7', fs.constants.F_OK, (err) => {
        if (err == null) {
          // Do something
        }
      })

      await (async () => {
        try {
          await fs.promises.access('temp/hl7.readFileTestMSH.20081231.hl7', fs.constants.F_OK)
          // Do something
        } catch (err) {
          // Handle error
        }
      })()
    })

    beforeEach(async () => {
      LISTEN_PORT = await portfinder.getPortPromise({
        port: 3000,
        stopPort: 65353
      })

      dfd = createDeferred<void>()
    })

    test('...no tls', async () => {
      const server = new Server({ bindAddress: '0.0.0.0' })
      const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      // await expectEvent(IB_ADT, 'listen')

      const client = new Client({ host: '0.0.0.0' })
      let count: number = 0
      const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        count += 1
        if (count === 2) {
          dfd.resolve()
        }
      })

      await expectEvent(OB_ADT, 'connect')

      const fileBatch = await OB_ADT.readFile('temp/hl7.readFileTestMSH.20081231.hl7')

      await OB_ADT.sendMessage(fileBatch)

      await dfd.promise

      await OB_ADT.close()
      await IB_ADT.close()
    })
  })
})
