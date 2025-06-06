import { beforeEach, describe, expect, test } from "vitest";
import { Client, HL7FatalError } from "../src";
import { expectHL7FatalError } from "./__utils__/expectHL7FatalError";

describe("node hl7 client", () => {
  describe("sanity tests - client class", () => {
    describe("valid", () => {
      test("valid - properties exist", async () => {
        const client = new Client({ host: "hl7.server.local" });
        expect(client).toHaveProperty("createConnection");
      });

      test("valid - ensure getHost() is what we set in the host", async () => {
        const client = new Client({ host: "hl7.server.local" });
        expect(client.getHost()).toEqual("hl7.server.local");
      });

      test("valid - port is being set correctly", async () => {
        const client = new Client({ host: "hl7.server.local" });
        const outbound = client.createConnection(
          // @ts-ignore message is not doing anything
          { port: 12345, autoConnect: false },
          async () => {},
        );

        expect(outbound.getPort()).toEqual(12345);
      });
    });

    describe("errors", () => {
      test("error - hostname has to be string", async () => {
        try {
          // @ts-expect-error this is not a string
          new Client({ host: 351123 });
        } catch (err: any) {
          expect(err.message).toBe("hostname is not valid string.");
        }
      });

      test("error - ipv4 and ipv6 both can not be true exist", async () => {
        try {
          new Client({ host: "5.8.6.1", ipv6: true, ipv4: true });
        } catch (err: any) {
          expect(err.message).toBe(
            "ipv4 and ipv6 both can't be set to be both used exclusively.",
          );
        }
      });

      test("error - ipv4 not valid address", async () => {
        try {
          new Client({ host: "123.34.52.455", ipv4: true });
        } catch (err: any) {
          expect(err.message).toBe("hostname is not a valid IPv4 address.");
        }
      });

      test("error - ipv4 valid address", async () => {
        try {
          new Client({ host: "123.34.52.45", ipv4: true });
        } catch (err: any) {
          expect(err.message).toBeUndefined();
        }
      });

      test("error - ipv6 not valid address", async () => {
        try {
          new Client({
            host: "2001:0db8:85a3:0000:zz00:8a2e:0370:7334",
            ipv6: true,
          });
        } catch (err: any) {
          expect(err.message).toBe("hostname is not a valid IPv6 address.");
        }
      });

      test("error - ipv6 valid address", async () => {
        try {
          new Client({
            host: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            ipv6: true,
          });
        } catch (err: any) {
          expect(err.message).toBeUndefined();
        }
      });
    });
  });

  describe("sanity tests - listener class", () => {
    let client: Client;

    beforeEach(() => {
      client = new Client({ host: "localhost" });
    });

    test("error - no port specified", async () => {
      try {
        // @ts-expect-error port is not specified
        client.createConnection();
      } catch (err: any) {
        expect(err.message).toBe("port is not defined.");
      }
    });

    test("error - port not a number", async () => {
      try {
        // @ts-expect-error port is not specified as a number
        client.createConnection({ port: "12345" }, async () => {});
      } catch (err: any) {
        expect(err.message).toBe("port is not valid number.");
      }
    });

    test("error - port less than 0", async () => {
      try {
        client.createConnection({ port: -1 }, async () => {});
      } catch (err: any) {
        expect(err.message).toBe("port must be a number (1, 65353).");
      }
    });

    test("error - port greater than 65353", async () => {
      try {
        client.createConnection({ port: 65354 }, async () => {});
      } catch (err: any) {
        expect(err.message).toBe("port must be a number (1, 65353).");
      }
    });

    test("error - flushQueue needs to be set", async () => {
      try {
        client.createConnection(
          // @ts-ignore message is not doing anything
          { port: 12345, enqueueMessage: (message) => {} },
          async () => {},
        );
      } catch (err) {
        expect(err).toEqual(new HL7FatalError("flushQueue is not set."));
      }
    });

    test("error - enqueueMessage needs to be set", async () => {
      try {
        client.createConnection(
          // @ts-ignore message is not doing anything
          { port: 12345, flushQueue: (message) => {} },
          async () => {},
        );
      } catch (err) {
        expectHL7FatalError(err, "enqueueMessage is not set.");
      }
    });
  });
});
