import {Server} from 'node-hl7-server'
import { describe, expect, test } from 'vitest';
import tcpPortUsed from 'tcp-port-used'
import Client, {Message} from '../src'
import {createDeferred} from "../src/utils/utils";
import {expectEvent} from './__utils__'

describe('node hl7 end to end - client', () => {

/*  let readFileTestMSH: string
  let readFileTestTwoMSH: string*/

  /*beforeAll(async () => {

    const hl7String: string = 'MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231'
    const hl7StringDouble: string[] = [
      "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231",
      "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231"
    ]

    // single MSH
    const message = new Message({ text: hl7String })
    readFileTestMSH = message.toFile('readFileTestMSH', true, 'temp/')

    fs.access(`temp/${readFileTestMSH as string}`, fs.constants.F_OK, (err) => {
      if (err == null) {
        // Do something
      }
    })

    // double MSH file
    const batch = new Batch()

    batch.start()

    for (let i = 0; i < hl7StringDouble.length; i++) {
      const message = new Message({text: hl7StringDouble[i] })
      batch.add(message)
    }

    batch.end()
    readFileTestTwoMSH = batch.toFile('readFileTestTwoMSH', true, 'temp/')

    fs.access(`temp/${readFileTestTwoMSH as string}`, fs.constants.F_OK, (err) => {
      if (err == null) {
        // Do something
      }
    })

    await (async () => {
      try {
        await fs.promises.access(`temp/${readFileTestMSH as string}`, fs.constants.F_OK)
        await fs.promises.access(`temp/${readFileTestTwoMSH as string}`, fs.constants.F_OK)
        // Do something
      } catch (err) {
        // Handle error
      }
    })()

  })

  afterAll(async () => {
    fs.readdir('temp/', (err, files) => {
      if (err != null) return
      for (const file of files) {
        fs.unlink(path.join('temp/', file), (err) => {
          if (err != null) throw err
        })
      }
    })
  })*/

  describe('server/client sanity checks', () => {

    test('...simple connect', async () => {

      let dfd = createDeferred<void>()

      const server = new Server({bindAddress: '0.0.0.0'})
      const listener = server.createInbound({port: 3000}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      await expectEvent(listener, 'listen')

      // expect(await tcpPortUsed.check(3000, '0.0.0.0')).toBe(true)

      const client = new Client({ host: '0.0.0.0' })

      const outbound = client.createConnection({ port: 3000 }, async (res) => {
        const messageRes = res.getMessage()
        expect(messageRes.get('MSA.1').toString()).toBe('AA')
        dfd.resolve()
      })

      await expectEvent(outbound, 'connect')

      let message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await outbound.sendMessage(message)

      await dfd.promise

      expect(client.totalSent()).toEqual(1)
      expect(client.totalAck()).toEqual(1)

      await outbound.close()
      await listener.close()

      client.closeAll()

    })

    test('...send simple message twice, no ACK needed', async () => {

      await tcpPortUsed.check(3000, '0.0.0.0')

      let dfd = createDeferred<void>()

      const server = new Server({bindAddress: '0.0.0.0'})
      const listener = server.createInbound({port: 3000}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      await expectEvent(listener, 'listen')

      const client = new Client({ host: '0.0.0.0' })
      const outbound = client.createConnection({ port: 3000, waitAck: false }, async () => {
        dfd.resolve()
      })

      //await outbound.start()

      await expectEvent(outbound, 'connect')

      let message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await outbound.sendMessage(message)

      await dfd.promise

      expect(client.totalSent()).toEqual(1)
      expect(client.totalAck()).toEqual(1)

      await outbound.close()
      await listener.close()

      client.closeAll()

    })
  })

  /*describe('server/client failure checks', () => {
    test.skip('...host does not exist, error out', async () => {

      const client = new Client({ host: '192.0.2.1' })
      const ob = client.createOutbound({ port: 1234,connectionTimeout: 1, maxAttempts: 1 })

      let message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await ob.sendMessage(message)

      await expectEvent(ob, 'error')

    })

    test.skip('...host exist, but not listening on the port, error', async () => {
      const server = new Server({bindAddress: '0.0.0.0'})
      const listener = server.createInbound({port: LISTEN_PORT}, async (req, res) => {
        const messageReq = req.getMessage()
        expect(messageReq.get('MSH.12').toString()).toBe('2.7')
        await res.sendResponse('AA')
      })

      const client = new Client({ host: '0.0.0.0' })

      // forced to lower connection timeout so unit testing is not slow
      const ob = client.createOutbound({ port: 1234, connectionTimeout: 1, maxAttempts: 1 })

      let message = new Message({
        messageHeader: {
          msh_9_1: 'ADT',
          msh_9_2: 'A01',
          msh_10: 'CONTROL_ID',
          msh_11_1: 'D'
        }
      })

      await ob.sendMessage(message)

      // we couldn't connect
      await expectEvent(ob, 'error')

      await listener.close()

    })
  })

  describe('...no tls', () => {

    describe('...no file', () => {

      test.skip('...send batch with two message, get proper ACK', async () => {

        let dfd = createDeferred<void>()

        const server = new Server({ bindAddress: '0.0.0.0' })
        const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
          const messageReq = req.getMessage()
          expect(messageReq.get('MSH.12').toString()).toBe('2.7')
          await res.sendResponse('AA')
        })

        await expectEvent(IB_ADT, 'listen')

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

        await sleep(30)

        await dfd.promise

        expect(client.totalSent()).toEqual(1)
        expect(client.totalAck()).toEqual(2)

        await IB_ADT.close()
      })

    })

    describe('...file', () => {

      test.skip('...send file with one message, get proper ACK', async () => {

        let dfd = createDeferred<void>()

        const server = new Server({ bindAddress: '0.0.0.0' })
        const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
          const messageReq = req.getMessage()
          expect(messageReq.get('MSH.12').toString()).toBe('2.7')
          await res.sendResponse('AA')
        })

        await expectEvent(IB_ADT, 'listen')

        const client = new Client({ host: '0.0.0.0' })
        const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
          const messageRes = res.getMessage()
          expect(messageRes.get('MSA.1').toString()).toBe('AA')
          dfd.resolve()
        })

        const fileBatch = await OB_ADT.readFile(`temp/${readFileTestMSH as string}`)

        await OB_ADT.sendMessage(fileBatch)

        await sleep(30)

        await dfd.promise

        expect(client.totalSent()).toEqual(1)
        expect(client.totalAck()).toEqual(1)

        await IB_ADT.close()
      })

      test.skip('...send file with two message, get proper ACK', async () => {

        let dfd = createDeferred<void>()

        const server = new Server({ bindAddress: '0.0.0.0' })
        const IB_ADT = server.createInbound({ port: LISTEN_PORT }, async (req, res) => {
          const messageReq = req.getMessage()
          expect(messageReq.get('MSH.12').toString()).toBe('2.7')
          await res.sendResponse('AA')
        })

        await expectEvent(IB_ADT, 'listen')

        const client = new Client({ host: '0.0.0.0' })
        let count: number = 0
        const OB_ADT = client.createOutbound({ port: LISTEN_PORT }, async (res) => {
          const messageRes = res.getMessage()
          expect(messageRes.get('MSA.1').toString()).toBe('AA')
          count += 1
          if (count > 1) {
            dfd.resolve()
          }
        })

        const fileBatch = await OB_ADT.readFile(`temp/${readFileTestTwoMSH as string}`)

        await OB_ADT.sendMessage(fileBatch)

        await dfd.promise

        expect(client.totalSent()).toEqual(1)
        expect(client.totalAck()).toEqual(2)

        await IB_ADT.close()
      })

    })

  })*/

})
