import fs from "fs";
import {Server} from "node-hl7-server";
import path from "node:path";
import portfinder from "portfinder";
import {Batch, Client, Message} from "../src";
import {sleep} from "./__utils__";

describe('node hl7 end to end', () => {

  describe('end to end tests', () => {

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
          expect(res.toString()).not.toContain('ADT^A01^ADT_A01')
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

        message = new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: 'CONTROL_ID2',
            msh_11_1: "D"
          }
        })

        message.set('MSH.7', '20081231')

        batch.add(message)

        batch.end()

        console.log(batch.toRaw().replace("\n", "\r"))

        expect(batch.toString()).toBe([`BHS|^~\\&|||||20081231`, `MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID1|D|2.7`, `MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID2|D|2.7`, "BTS|2"].join("\r"))

        await OB_ADT.sendMessage(batch)

        await sleep(10)

        await OB_ADT.close()
        await IB_ADT.close()

      })

      test.skip('...tls', async () => {

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

  })

})