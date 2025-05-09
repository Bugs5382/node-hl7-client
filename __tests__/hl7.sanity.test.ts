import { describe, expect, test } from "vitest";
import {
  Batch,
  FileBatch,
  HL7FatalError,
  isBatch,
  isFile,
  Message,
} from "../src";
import { HL7_2_4 } from "../src/specification/2.4";
import { MSH_HEADER } from "./__data__/constants";

describe("node hl7 client - sanity tests", () => {
  describe("...Message", () => {
    test("error - Message Object - nothing passed", async () => {
      try {
        // @ts-expect-error
        const message = new Message();
      } catch (err) {
        expect(err).toEqual(
          new HL7FatalError(
            "mshHeader must be set if no HL7 message is being passed.",
          ),
        );
      }
    });

    test("error - Message Object - text empty ", async () => {
      try {
        new Message({ text: "" });
      } catch (err) {
        expect(err).toEqual(
          new HL7FatalError(
            "mshHeader must be set if no HL7 message is being passed.",
          ),
        );
      }
    });

    test("error - Message Object - text must start with MSH ", async () => {
      try {
        new Message({ text: "PV1|||||||^Jones\r" });
      } catch (err) {
        expect(err).toEqual(new Error("text must begin with the MSH segment."));
      }
    });

    test("error - Message Object - msh 9.1 is empty ", async () => {
      try {
        new Message({
          // @ts-expect-error 9.1 should be not empty
          messageHeader: {
            msh_9_1: "",
          },
        });
      } catch (err) {
        expect(err).toEqual(new Error("MSH.9.1 & MSH 9.2 must be defined."));
      }
    });

    test("error - Message Object - msh 9.2 is empty ", async () => {
      try {
        new Message({
          // @ts-expect-error 9.2 should be not empty
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error("MSH.9.2 must be 3 characters in length."),
        );
      }
    });

    test("error - Message Object - msh 9.1 is not 3 character long ", async () => {
      try {
        new Message({
          // @ts-expect-error not filling this out for unit testing
          messageHeader: {
            msh_9_1: "ADTY",
            msh_9_2: "A01",
            msh_10: "123456",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error("MSH.9.1 must be 3 characters in length."),
        );
      }
    });

    test("error - Message Object - msh 9.2 is not 3 character long ", async () => {
      try {
        new Message({
          // @ts-expect-error not filling this out for unit testing
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01Y",
            msh_10: "123456",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error("MSH.9.2 must be 3 characters in length."),
        );
      }
    });

    test("error - Message Object - msh 9.3 less than 3.", async () => {
      try {
        new Message({
          specification: new HL7_2_4(),
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_9_3: "AC",
            msh_10: "12345",
            msh_11_1: "D",
            msh_11_2: "A",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error(
            "MSH.9.3 must be 3 to 10 characters in length if specified.",
          ),
        );
      }
    });

    test("error - Message Object - msh 9.3 more than 10.", async () => {
      try {
        new Message({
          specification: new HL7_2_4(),
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_9_3: "ADT_A01Y",
            msh_10: "12345",
            msh_11_1: "D",
            msh_11_2: "A",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error(
            "MSH.9.3 must be 3 to 10 characters in length if specified.",
          ),
        );
      }
    });

    test("error - Message Object - msh 10 is more than 199 characters ", async () => {
      try {
        new Message({
          // @ts-expect-error not filling this out for unit testing
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10:
              "AaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdf",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error(
            "MSH.10 must be greater than 0 and less than 199 characters.",
          ),
        );
      }
    });

    test("error - Message Object - msh 10 can not be blank", async () => {
      try {
        new Message({
          // @ts-expect-error not filling this out for unit testing
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: "",
          },
        });
      } catch (err) {
        expect(err).toEqual(
          new Error(
            "MSH.10 must be greater than 0 and less than 199 characters.",
          ),
        );
      }
    });
  });

  describe("...Batch", () => {
    test("error - Batch Object - single MSH passed", async () => {
      try {
        // @ts-expect-error
        const batch = new Batch({
          text: "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231",
        });
      } catch (err) {
        expect(err).toEqual(
          new HL7FatalError(
            "Unable to process a single MSH as a batch. Use Message.",
          ),
        );
      }
    });

    test("utils - isBatch - on Message - false", async () => {
      const message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      expect(isBatch(message.toString())).toBe(false);
    });

    test("utils - isBatch -should be false", async () => {
      const batch = new Batch();
      batch.start();
      batch.end();
      expect(isFile(batch.toString())).toBe(false);
    });

    test("utils - isBatch - should now be true", async () => {
      const batch = new Batch();
      batch.start();
      batch.end();
      expect(isBatch(batch.toString())).toBe(true);
    });
  });

  describe("...FileBatch", () => {
    test("utils - isFile - on Message - false", async () => {
      const message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      expect(isFile(message.toString())).toBe(false);
    });

    test("utils - isFile - should now be true", async () => {
      const file = new FileBatch();
      file.start();
      file.end();
      expect(isFile(file.toString())).toBe(true);
    });
  });

  describe("parse message, batch, and file", () => {
    const hl7_string: string =
      "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231";
    const hl7_batch_msh_string: string =
      "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231\rMSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231";
    const hl7_non_standard: string =
      "MSH:-+?*:field2:field3component1-field3component2:field4repeat1+field4repeat2:field5subcomponent1*field5subcomponent2:field6?R?";
    const hl7_batch: string =
      "BHS|^~\\&|||||20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1";
    const hl7_batch_non_standard: string =
      "BHS:-+?*:::::20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1";
    const hl7_line_breaks: string =
      "MSH|^~\\&|device||Host||20240101000000+0000||OUL^R22^OUL_R22|2|P|2.5.1|||NE|AL||UNICODE UTF-8|||LAB-01^IHE\r";

    test("...clean up line breaks", async () => {
      const message = new Message({ text: hl7_line_breaks });
      expect(message.get("MSH.12").toString()).toBe("2.5.1");
    });

    test("...verify MSH input", async () => {
      const message = new Message({ text: hl7_string });

      expect(message.toString().substring(0, 8)).toBe("MSH|^~\\&");
      expect(message.get("MSH.3").exists("")).toBe(false);
      expect(message.get("MSH.9.1").toString()).toBe("ADT");
      expect(message.get("MSH.9.2").toString()).toBe("A01");
      expect(message.get("MSH.9.3").toString()).toBe("ADT_A01");
      expect(message.get("MSH.10").toString()).toBe("12345");
      expect(message.get("MSH.11.1").toString()).toBe("");
      expect(message.get("MSH.12").toString()).toBe("2.7");
      expect(message.get("EVN.2").toString()).toBe("20081231");

      let count: number = 0;
      message.get("EVN").forEach((segment): void => {
        expect(segment.name).toBe("EVN");
        count++;
      });

      expect(count).toBe(1);
    });

    test("...parse non standard delimiters defined in MSH header", async () => {
      const message = new Message({ text: hl7_non_standard });

      expect(message.get("MSH.3").toString()).toBe("field2");
      expect(message.get("MSH.4.2").toString()).toBe("field3component2");
      expect(message.get("MSH.5").get(0).toString()).toBe("field4repeat1");
      expect(message.get("MSH.5").get(1).toString()).toBe("field4repeat2");
      expect(message.get("MSH.6.1.1").toString()).toBe("field5subcomponent1");
      expect(message.get("MSH.6.1.2").toString()).toBe("field5subcomponent2");
      expect(message.get("MSH.7").toString()).toBe("field6+");
    });

    test("...verify BHS input", async () => {
      const batch = new Batch({ text: hl7_batch });

      expect(batch.toString().substring(0, 8)).toBe("BHS|^~\\&");
    });

    test("...parse non standard delimiters defined in BHS header", async () => {
      const batch = new Batch({ text: hl7_batch_non_standard });

      expect(batch.toString().substring(0, 8)).toBe("BHS:-+?*");
    });

    test("...verify BHS input ... 1 message should exist ... 2 EVN segments inside", async () => {
      const batch = new Batch({ text: hl7_batch });
      const messages = batch.messages();
      expect(messages.length).toBe(1);

      messages.forEach((message: Message): void => {
        let count: number = 0;
        message.get("EVN").forEach((segment): void => {
          expect(segment.name).toBe("EVN");
          count++;
        });
        expect(count).toBe(2);
      });
    });

    test("...should be used as a Batch", async () => {
      try {
        // @ts-expect-error
        const message = new Message({ text: hl7_batch_msh_string });
      } catch (err) {
        expect(err).toEqual(
          new HL7FatalError("Multiple MSH segments found. Use Batch."),
        );
      }
    });

    test("...many MSH not wrapped in a BHS is still a Batch", async () => {
      const batch = new Batch({ text: hl7_batch_msh_string });

      const messages = batch.messages();
      expect(messages.length).toBe(2);

      messages.forEach((message: Message): void => {
        let count: number = 0;
        message.get("EVN").forEach((segment): void => {
          expect(segment.name).toBe("EVN");
          count++;
        });
        expect(count).toBe(1);
      });
    });
  });
});
