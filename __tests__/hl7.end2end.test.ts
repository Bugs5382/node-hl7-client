import fs from "fs";
import { Server } from "node-hl7-server";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";
import tcpPortUsed from "tcp-port-used";
import Client, { Batch, Message, ReadyState } from "../src";
import { createDeferred } from "../src/utils/utils";
import { expectEvent } from "./__utils__";

const port = Number(process.env.TEST_PORT) || 3000;

describe("node hl7 end to end - client", () => {
  describe("server/client sanity checks", () => {
    test("...simple connect", async () => {
      await tcpPortUsed.check(3000, "0.0.0.0");

      const dfd = createDeferred<void>();
      const dfdConnectionChecks = createDeferred<void>();

      const server = new Server({ bindAddress: "0.0.0.0" });
      const listener = server.createInbound({ port }, async (req, res) => {
        const messageReq = req.getMessage();
        expect(messageReq.get("MSH.12").toString()).toBe("2.7");
        await res.sendResponse("AA");
      });

      await expectEvent(listener, "listen");

      const client = new Client({ host: "0.0.0.0" });

      const outbound = client.createConnection({ port }, async (res) => {
        const messageRes = res.getMessage();
        expect(messageRes.get("MSA.1").toString()).toBe("AA");
        dfd.resolve();
      });

      // Ensure no errors on the connection
      outbound.on("client.error", (err) => {
        if (err.message === "Socket closed unexpectedly by server.")
          dfdConnectionChecks.reject("Connection terminated incorrectly");
      });

      // Ensure connection closes successfully
      outbound.on("close", () => {
        outbound.on("connection", () => {
          dfdConnectionChecks.reject(
            "Unexpected follow on connection attempted.",
          );
        });

        // Give the connection time to report any errors.
        setTimeout(dfdConnectionChecks.resolve, 500);
      });

      await expectEvent(outbound, "connect");

      const message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "CONTROL_ID",
          msh_11_1: "D",
        },
      });

      await outbound.sendMessage(message);

      await dfd.promise;

      expect(client.totalSent()).toEqual(1);
      expect(client.totalAck()).toEqual(1);

      await outbound.close();
      await listener.close();

      client.closeAll();

      await dfdConnectionChecks.promise;
      expect(outbound._connectionTimer).toBeUndefined();
      expect((outbound as any)._readyState).toEqual(ReadyState.CLOSED);
      expect(client._connections.length).toEqual(0);
    });

    test("... queues messages (autoConnect: false)", async () => {
      const client = new Client({ host: "0.0.0.0" });

      // Create connection without auto-connecting
      const outbound = client.createConnection(
        { port, autoConnect: false },
        async () => {},
      );

      vi.spyOn(outbound as any, "_connect").mockResolvedValue(undefined);

      const message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "CONTROL_ID",
          msh_11_1: "D",
        },
      });

      await outbound.sendMessage(message);

      expect(client.totalPending()).toEqual(1);
    });

    test.skip("...send simple message twice, no ACK needed", async () => {
      await tcpPortUsed.check(3000, "0.0.0.0");

      const dfd = createDeferred<void>();
      let totalSent = 0;

      const server = new Server({ bindAddress: "0.0.0.0" });
      const listener = server.createInbound({ port }, async (req, res) => {
        const messageReq = req.getMessage();
        expect(messageReq.get("MSH.12").toString()).toBe("2.7");
        totalSent++;
        await res.sendResponse("AA");
      });

      await expectEvent(listener, "listen");

      const client = new Client({ host: "0.0.0.0" });
      const outbound = client.createConnection(
        { port, waitAck: false },
        async () => {
          if (totalSent === 2) {
            dfd.resolve();
          }
        },
      );

      await expectEvent(outbound, "connect");

      const message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "CONTROL_ID",
          msh_11_1: "D",
        },
      });

      await outbound.sendMessage(message);

      const message2 = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "CONTROL_ID",
          msh_11_1: "D",
        },
      });

      await outbound.sendMessage(message2);

      await dfd.promise;

      expect(client.totalSent()).toEqual(2);
      expect(client.totalAck()).toEqual(2);

      await outbound.close();
      await listener.close();

      client.closeAll();
    });
  });

  describe("server/client failure checks", () => {
    test("...host does not exist, error out", async () => {
      const client = new Client({ host: "0.0.0.0", connectionTimeout: 1000 });
      const outbound = client.createConnection({ port }, async () => {});

      await expectEvent(outbound, "client.timeout");

      const error = await expectEvent(outbound, "client.error");
      expect(error.code).toBe("ECONNREFUSED");
    });

    test("...tls host does not exist, error out", async () => {
      const client = new Client({
        host: "0.0.0.0",
        connectionTimeout: 1000,
        tls: { rejectUnauthorized: false },
      });
      const outbound = client.createConnection({ port }, async () => {});

      await expectEvent(outbound, "client.timeout");

      const error = await expectEvent(outbound, "client.error");
      expect(error.code).toBe("ECONNREFUSED");
    });
  });

  describe("...no tls", () => {
    describe("...no file", () => {
      test.skip("...send batch with two message, get proper ACK", async () => {
        const dfd = createDeferred<void>();

        const server = new Server({ bindAddress: "0.0.0.0" });
        const inbound = server.createInbound({ port }, async (req, res) => {
          const messageReq = req.getMessage();
          expect(messageReq.get("MSH.12").toString()).toBe("2.7");
          await res.sendResponse("AA");
        });

        await expectEvent(inbound, "listen");

        const client = new Client({ host: "0.0.0.0" });
        const outbound = client.createConnection({ port }, async (res) => {
          const messageRes = res.getMessage();
          expect(messageRes.get("MSA.1").toString()).toBe("AA");
          dfd.resolve();
        });

        const batch = new Batch();
        batch.start();

        const message = new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: "CONTROL_ID",
            msh_11_1: "D",
          },
        });

        batch.add(message);
        batch.add(message);

        batch.end();

        await outbound.sendMessage(batch);

        await dfd.promise;

        expect(client.totalSent()).toEqual(1);
        expect(client.totalAck()).toEqual(1);

        await outbound.close();
        await inbound.close();

        client.closeAll();
      });
    });
  });

  describe("...tls", () => {
    describe("...no file", () => {
      test("...simple", async () => {
        const dfd = createDeferred<void>();

        const server = new Server({
          bindAddress: "0.0.0.0",
          tls: {
            key: fs.readFileSync(path.join("certs/", "server-key.pem")),
            cert: fs.readFileSync(path.join("certs/", "server-crt.pem")),
            rejectUnauthorized: false,
          },
        });
        const inbound = server.createInbound({ port }, async (req, res) => {
          const messageReq = req.getMessage();
          expect(messageReq.get("MSH.12").toString()).toBe("2.7");
          await res.sendResponse("AA");
        });

        await expectEvent(inbound, "listen");

        const client = new Client({
          host: "0.0.0.0",
          tls: { rejectUnauthorized: false },
        });
        const outbound = client.createConnection({ port }, async (res) => {
          const messageRes = res.getMessage();
          expect(messageRes.get("MSA.1").toString()).toBe("AA");
          dfd.resolve();
        });

        await expectEvent(outbound, "connect");

        const message = new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: "CONTROL_ID",
            msh_11_1: "D",
          },
        });

        await outbound.sendMessage(message);

        dfd.promise;

        await outbound.close();
        await inbound.close();

        client.closeAll();
      }, 70000);
    });
  });
});
