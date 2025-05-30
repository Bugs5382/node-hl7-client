import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import {
  Batch,
  createHL7Date,
  EmptyNode,
  FileBatch,
  HL7Node,
  Message,
} from "../src";
import {
  HL7_2_1,
  HL7_2_2,
  HL7_2_3,
  HL7_2_3_1,
  HL7_2_4,
  HL7_2_5,
  HL7_2_5_1,
  HL7_2_6,
  HL7_2_7,
  HL7_2_7_1,
  HL7_2_8,
} from "../src/hl7";
import { MSH_HEADER } from "./__data__/constants";
import { sleep } from "./__utils__";

describe("node hl7 client - builder tests", () => {
  describe("build message basics", () => {
    let message: Message;
    const randomControlID = randomUUID();

    beforeEach(async () => {
      message = new Message({
        // @ts-expect-error not filling this out for unit testing
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: randomControlID,
        },
      });
    });

    test("...initial build", async () => {
      expect(message.toString()).toContain("MSH|^~\\&");
      expect(message.toString()).toContain(
        `|ADT^A01^ADT_A01|${randomControlID}||2.7`,
      );
    });

    test("...extend Message build", async () => {
      const newMessage = () => {
        return new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_11: "P",
          },
        });
      };

      // this is the original message creation at line 17
      expect(message.toString()).toContain("MSH|^~\\&");
      expect(message.toString()).toContain(
        `|ADT^A01^ADT_A01|${randomControlID}||2.7`,
      );

      // this is creating a new message using a function that returns the message object
      const newResult = newMessage();
      expect(newResult.toString()).not.toContain(randomControlID);

      const newRandomControlID = newResult.get("MSH.10").toString();

      // again, this is creating a new message using a function that returns the message object
      const newResultTwo = newMessage();
      expect(newResultTwo.toString()).not.toContain(newRandomControlID);
    });

    test("...verify MSH header is correct", async () => {
      expect(message.toString().substring(0, 8)).toBe("MSH|^~\\&");
      expect(message.get("MSH.3").exists("")).toBe(false);
      expect(message.get("MSH.9.1").toString()).toBe("ADT");
      expect(message.get("MSH.9.2").toString()).toBe("A01");
      expect(message.get("MSH.9.3").toString()).toBe("ADT_A01");
      expect(message.get("MSH.10").toString()).toBe(randomControlID);
      expect(message.get("MSH.12").toString()).toBe("2.7");
    });

    test("...add onto the MSH header", async () => {
      message.set("MSH.3", "SendingApp");
      message.set("MSH.4", "SendingFacility");
      message.set("MSH.5", "ReceivingApp");
      message.set("MSH.6", "ReceivingFacility");

      expect(message.get("MSH.3").toString()).toBe("SendingApp");
      expect(message.get("MSH.4").toString()).toBe("SendingFacility");
      expect(message.get("MSH.5").toString()).toBe("ReceivingApp");
      expect(message.get("MSH.6").toString()).toBe("ReceivingFacility");
    });

    test("...MSH.3.1 can be gotten with MSH.3", async () => {
      message.set("MSH.3.1", "SendingApp");
      expect(message.get("MSH.3").toString()).toBe("SendingApp");
    });

    test("...MSH.3 can be gotten with MSH.3.1", async () => {
      message.set("MSH.3", "SendingApp");
      expect(message.get("MSH.3.1").toString()).toBe("SendingApp");
    });
  });

  describe("builder message (MSH) specification", () => {
    test("2.1 - build", async () => {
      const message = new Message({
        specification: new HL7_2_1(),
        messageHeader: {
          msh_9: "ADT",
          msh_10: "12345",
          msh_11: "D",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT|12345|D|2.1",
      );
    });

    test("2.2 - build", async () => {
      const message = new Message({
        specification: new HL7_2_2(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11: "D",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01|12345|D|2.2",
      );
    });

    test("2.3 - build", async () => {
      const message = new Message({
        specification: new HL7_2_3(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01|12345|D^A|2.3",
      );
    });

    test("2.3.1 - build", async () => {
      const message = new Message({
        specification: new HL7_2_3_1(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01|12345|D^A|2.3.1",
      );
    });

    test("2.3.1 - build - MSH9.3 has no bearing", async () => {
      const message = new Message({
        specification: new HL7_2_3_1(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_9_3: "ACK",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01|12345|D^A|2.3.1",
      );
    });

    test("2.4 - build", async () => {
      const message = new Message({
        specification: new HL7_2_4(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D^A|2.4",
      );
    });

    test("2.4 - build - MSH9.3 override", async () => {
      const message = new Message({
        specification: new HL7_2_4(),
        messageHeader: {
          msh_9_1: "ACK",
          msh_9_2: "A01",
          msh_9_3: "ACK",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ACK^A01^ACK|12345|D^A|2.4",
      );
    });

    test("2.5 - build", async () => {
      const message = new Message({
        specification: new HL7_2_5(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D^A|2.5",
      );
    });

    test("2.5.1 - build", async () => {
      const message = new Message({
        specification: new HL7_2_5_1(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D^A|2.5.1",
      );
    });

    test("2.6 - build", async () => {
      const message = new Message({
        specification: new HL7_2_6(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
          msh_11_2: "A",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D^A|2.6",
      );
    });

    test("2.7 - build", async () => {
      const message = new Message({
        specification: new HL7_2_7(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7",
      );
    });

    test("2.7.1 - build", async () => {
      const message = new Message({
        specification: new HL7_2_7_1(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7.1",
      );
    });

    test("2.8 - build", async () => {
      const message = new Message({
        specification: new HL7_2_8(),
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
        },
      });
      message.set("MSH.7", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.8",
      );
    });
  });

  describe("complex builder message", () => {
    let message: Message;

    beforeEach(async () => {
      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345",
          msh_11_1: "D",
        },
      });
      message.set("MSH.7", "20081231");
    });

    test("...real basic", async () => {
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7",
      );
    });

    test("...should accept a number as a value", async () => {
      message.set("EVN.2", 1);
      expect(message.toString()).toContain("EVN||1");
    });

    test("...should accept a Date without time as a value", () => {
      message.set("PV1.1", new Date(2012, 9, 31));
      expect(message.toString()).toContain("PV1|20121031");
    });

    test("...should accept a Date with time as a value", () => {
      message.set("PV1.1", new Date(2012, 9, 31, 22, 51, 13));
      expect(message.toString()).toContain("PV1|20121031225113");
    });

    test("...should accept a float as a value", () => {
      message.set("PV1.1", 1.2);
      expect(message.toString()).toContain("PV1|1.2");
    });

    test("...should accept a boolean as a value", () => {
      message.set("PV1.1", true);
      expect(message.toString()).toContain("PV1|Y");
      message.set("PV1.1", false);
      expect(message.toString()).toContain("PV1|N");
    });

    test("...should set the specified field", () => {
      message.set("PID.4", "1273462894723");
      expect(message.toString()).toContain("PID||||1273462894723");
    });

    test("...should be able to set more than one field on the same segment", () => {
      message.set("PID.4", "1273462894723");
      message.set("PID.10", "TEST");
      expect(message.toString()).toContain("PID||||1273462894723||||||TEST");
    });

    test("...should set the specified component", () => {
      message.set("PV1.7.2", "Jones");
      expect(message.toString()).toContain("PV1|||||||^Jones");
    });

    test("...should be able to set more that one component on the same field", () => {
      message.set("PV1.7.2", "Jones");
      message.set("PV1.7.3", "John");
      expect(message.toString()).toContain("PV1|||||||^Jones^John");
    });

    // not working...
    test.skip("...should be able to set repeating fields", async () => {
      message.set("PID.3").set(0).set("PID.3.1", "abc");
      message.set("PID.3").set(0).set("PID.3.5", "MRN");
      message.set("PID.3").set(1).set("PID.3.1", 123);
      message.set("PID.3").set(1).set("PID.3.5", "ID");
      expect(message.toString()).toContain("PID|||abc^^^^MRN~123^^^^ID");
    });

    // not working...
    test.skip("...can chain component setters", async () => {
      message
        .set("PV1.7")
        .set(0)
        .set("PV1.7.2", "Jones")
        .set("PV1.7.3", "John");
      message.set("PV1.7").set(1).set("PV1.7.2", "Smith").set("PV1.7.3", "Bob");
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    test("...can chain component setters with numeric indexers", async () => {
      message.set("PV1.7").set(0).set(1, "Jones").set(2, "John");
      message.set("PV1.7").set(1).set(1, "Smith").set(2, "Bob");
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    test("...can set field component by number", async () => {
      message.set("PV1.7").set(0).set(1, "Jones").set(2, "John");
      expect(message.toString()).toContain("PV1|||||||^Jones^John");
    });

    test("...can set field component by number and array", async () => {
      message
        .set("PV1.7")
        .set(0, ["", "Jones", "John"])
        .set(1, ["", "Smith", "Bob"]);
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    // This is currently failing, why... I have no idea. Help!
    test.skip("... add segment EVN field - using full path", async () => {
      const segment = message.addSegment("EVN");
      segment.set("EVN.2.1", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231",
      );
    });

    test("...add segment EVN field - using number path", async () => {
      const segment = message.addSegment("EVN");
      segment.set("2.1", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231",
      );
    });

    test("...add segment EVN field - using simple number path", async () => {
      const segment = message.addSegment("EVN");
      segment.set("2", "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231",
      );
    });

    test("...add segment EVN field - using simple number", async () => {
      const segment = message.addSegment("EVN");
      segment.set(2, "20081231");
      expect(message.toString()).toBe(
        "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345|D|2.7\rEVN||20081231",
      );
    });
  });

  describe("basic batch basics", () => {
    let batch: Batch;

    beforeEach(async () => {
      batch = new Batch();
      batch.start();
    });

    test("...initial build", async () => {
      batch.end();
      expect(batch.toString()).toContain("BHS|^~\\&");
      expect(batch.toString()).toContain("BTS|0");
    });

    test("...verify BHS header is correct", async () => {
      batch.set("BHS.7", "20081231");
      batch.end();
      expect(batch.get("BHS.7").toString()).toBe("20081231");
      expect(batch.toString()).toBe("BHS|^~\\&|||||20081231\rBTS|0");
    });

    test("...add onto the BHS header", async () => {
      batch.set("BHS.7", "20081231");
      batch.set("BHS.3", "SendingApp");
      batch.set("BHS.4", "SendingFacility");
      batch.set("BHS.5", "ReceivingApp");
      batch.set("BHS.6", "ReceivingFacility");
      batch.end();

      expect(batch.get("BHS.3").toString()).toBe("SendingApp");
      expect(batch.get("BHS.4").toString()).toBe("SendingFacility");
      expect(batch.get("BHS.5").toString()).toBe("ReceivingApp");
      expect(batch.get("BHS.6").toString()).toBe("ReceivingFacility");
      expect(batch.toString()).toBe(
        "BHS|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20081231\rBTS|0",
      );
    });
  });

  describe("complex builder batch", () => {
    let batch: Batch;
    let message: Message;
    const date = createHL7Date(new Date(), "8");

    beforeEach(async () => {
      batch = new Batch();
      batch.start();
      batch.set("BHS.7", date);
    });

    test("...add single message to batch", async () => {
      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", date);

      batch.add(message);
      batch.end();
      expect(batch.toString()).toBe(
        [
          `BHS|^~\\&|||||${date}`,
          `MSH|^~\\&|||||${date}||ADT^A01^ADT_A01|CONTROL_ID|D|2.7`,
          "BTS|1",
        ].join("\r"),
      );
    });

    test("...add 10 message to batch", async () => {
      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", date);

      for (let i = 0; i < 10; i++) {
        batch.add(message);
      }
      batch.end();
      expect(batch.toString()).toContain("BTS|10");
    });

    test("...add message to batch with additional segments in message", async () => {
      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", "20231208");

      const segment = message.addSegment("EVN");
      segment.set(2, "20081231");

      batch.add(message);
      batch.end();
      expect(batch.toString()).toBe(
        `BHS|^~\\&|||||${date}\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID|D|2.7\rEVN||20081231\rBTS|1`,
      );
    });

    test("...add message to batch with 2x additional segments in message", async () => {
      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", "20231208");

      let segment = message.addSegment("EVN");
      segment.set(2, "20081231");

      segment = message.addSegment("EVN");
      segment.set(2, "20081231");

      batch.add(message);
      batch.end();
      expect(batch.toString()).toBe(
        `BHS|^~\\&|||||${date}\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID|D|2.7\rEVN||20081231\rEVN||20081231\rBTS|1`,
      );
    });
  });

  describe("basic file basics", () => {
    let file: FileBatch;

    beforeEach(async () => {
      file = new FileBatch();
      file.start();
      file.set("FHS.7", "20081231");
    });

    test("...initial build", async () => {
      let message: Message;

      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", "20081231");

      // add this message to the file
      file.add(message);

      // end making a file batch
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID|D|2.7",
          "FTS|1",
        ].join("\r"),
      );
    });

    test("...add 10 message", async () => {
      let message: Message;

      for (let i = 0; i < 10; i++) {
        message = new Message({
          messageHeader: {
            ...MSH_HEADER,
            msh_10: `CONTROL_ID${i + 1}`,
          },
        });
        message.set("MSH.7", "20081231");

        // add this message to the file
        file.add(message);
      }

      // end making a file batch
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID1|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID2|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID3|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID4|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID5|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID6|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID7|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID8|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID9|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID10|D|2.7",
          "FTS|10",
        ].join("\r"),
      );
    });

    test("...add single a batch", async () => {
      // basic batch
      const batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");
      batch.end();

      // add this message to the file
      file.add(batch);

      // end making a file batch for output
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "BHS|^~\\&|||||20081231",
          "BTS|0",
          "FTS|1",
        ].join("\r"),
      );
    });

    test("...add single a batch with a single message", async () => {
      const batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");

      const message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", "20081231");

      // add message to the batch
      batch.add(message);

      // batch ended
      batch.end();

      // add this message to the file
      file.add(batch);

      // end making a file batch
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "BHS|^~\\&|||||20081231",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID|D|2.7",
          "BTS|1",
          "FTS|1",
        ].join("\r"),
      );
    });

    test("...add single a batch with a single message, if add a message to the file, it should add it to the batch", async () => {
      const batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");

      let message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID1",
        },
      });
      message.set("MSH.7", "20081231");

      // add message to the batch
      batch.add(message);

      // batch ended
      batch.end();

      // add this message to the file
      file.add(batch);

      // create a new message
      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID2",
        },
      });
      message.set("MSH.7", "20081231");

      // add this message to the file, but it will get added to the batch segment since there is a batch segment,
      // and you can't add a msh outside the BHS if it exists already
      file.add(message);

      message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID3",
        },
      });
      message.set("MSH.7", "20081231");

      // add this message to the file, but it will get added to the batch segment since there is a batch segment,
      // and you can't add a msh outside the BHS if it exists already
      file.add(message);

      // end making a file batch
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "BHS|^~\\&|||||20081231",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID1|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID2|D|2.7",
          "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|CONTROL_ID3|D|2.7",
          "BTS|3",
          "FTS|1",
        ].join("\r"),
      );
    });

    test("...add 2 batch", async () => {
      let batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");
      batch.end();

      // add this message to the file
      file.add(batch);

      batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");
      batch.end();

      file.add(batch);

      // end making a file batch
      file.end();

      // unit checking
      expect(file.toString()).toBe(
        [
          "FHS|^~\\&|||||20081231",
          "BHS|^~\\&|||||20081231",
          "BTS|0",
          "BHS|^~\\&|||||20081231",
          "BTS|0",
          "FTS|2",
        ].join("\r"),
      );
    });
  });

  describe("complex file generation", () => {
    beforeAll(async () => {
      fs.readdir("temp/", (err, files) => {
        if (err != null) return;
        for (const file of files) {
          fs.unlink(path.join("temp/", file), (err) => {
            if (err != null) throw err;
          });
        }
      });

      await sleep(5);
    });

    test("...create file", async () => {
      const file = new FileBatch({ location: "temp/" });
      file.start();
      file.set("FHS.7", "20081231");
      file.end();
      file.createFile("HELLO");
    });

    test("...create file from message", async () => {
      const message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });
      message.set("MSH.7", "20081231");
      message.toFile("ADT", true, "temp/");
    });

    test("...create file from batch", async () => {
      const batch = new Batch();
      batch.start();
      batch.set("BHS.7", "20081231");
      batch.end();
      batch.toFile("ADTs", true, "temp/");
    });
  });

  describe("non standard tests", () => {
    test("...returns true if specified path exists", () => {
      const message = new Message({ text: "MSH|^~\\&|value\rPV1|" });
      expect(message.exists("MSH.3")).toBe(true);
      expect(message.exists("PV1")).toBe(true);
    });

    test("...returns false if specified path does not exists", () => {
      const message = new Message({ text: "MSH|^~\\&|value" });
      expect(message.exists("MSH.4")).toBe(false);
      expect(message.exists("PV1")).toBe(false);
    });

    test("...should return EmptyNode for out-of-range indexes", () => {
      const message = new Message({ text: "MSH|^~\\&|" });
      expect(message.get(10)).toBeInstanceOf(EmptyNode);
      expect(message.get("PV1").get(10)).toBeInstanceOf(EmptyNode);
    });

    test("...should resolve escape sequence for hex character sequence", () => {
      const field = new Message({ text: "MSH|^~\\&|\\X0D\\" }).get("MSH.3");
      expect(field.toString()).toBe("\r");
    });

    test("...should pass through invalid escape sequences", () => {
      expect(
        new Message({ text: "MSH|^~\\&|\\a\\" }).get("MSH.3").toString(),
      ).toBe("\\a\\");
    });

    test("...count 2x EVN segments as nodes", async () => {
      const message = new Message({
        messageHeader: {
          ...MSH_HEADER,
          msh_10: "CONTROL_ID",
        },
      });

      let segment = message.addSegment("EVN");
      segment.set(2, "20081231");

      segment = message.addSegment("EVN");
      segment.set(2, "20081231");

      let count: number = 0;
      message.get("EVN").forEach((segment: HL7Node): void => {
        expect(segment.name).toBe("EVN");
        count++;
      });

      expect(count).toBe(2);
    });
  });

  describe("file tests", () => {
    const hl7_string: string =
      "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231";
    const hl7_batch: string =
      "BHS|^~\\&|||||20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1";

    beforeAll(async () => {
      fs.readdir("temp/", (err, files) => {
        if (err != null) return;
        for (const file of files) {
          fs.unlink(path.join("temp/", file), (err) => {
            if (err != null) throw err;
          });
        }
      });

      await sleep(2);

      const message = new Message({ text: hl7_string });
      message.toFile("readTestMSH", true, "temp/");

      const batch = new Batch({ text: hl7_batch });
      batch.toFile("readTestBHS", true, "temp/");

      await sleep(2);
    });

    beforeEach(async () => {
      await sleep(1);
    });

    test("...test parsing - file path", async () => {
      const fileBatch_one = new FileBatch({
        fullFilePath: path.join("temp/", "hl7.readTestMSH.20081231.hl7"),
      });
      expect(fileBatch_one._opt.text).toContain(hl7_string);

      const fileBatch_two = new FileBatch({
        fullFilePath: path.join("temp/", "hl7.readTestBHS.20231208.hl7"),
      });
      expect(fileBatch_two._opt.text).toContain(hl7_batch);
    });

    test("...test parsing - buffer", async () => {
      const fileBatch_one = new FileBatch({
        fileBuffer: fs.readFileSync(
          path.join("temp/", "hl7.readTestMSH.20081231.hl7"),
        ),
      });
      expect(fileBatch_one._opt.text).toContain(hl7_string);

      const fileBatch_two = new FileBatch({
        fileBuffer: fs.readFileSync(
          path.join("temp/", "hl7.readTestBHS.20231208.hl7"),
        ),
      });
      expect(fileBatch_two._opt.text).toContain(hl7_batch);
    });

    test("...get MSH", async () => {
      const fileBatch = new FileBatch({
        fullFilePath: path.join("temp/", "hl7.readTestMSH.20081231.hl7"),
      });
      expect(fileBatch._opt.text).toContain(hl7_string);

      const messages = fileBatch.messages();
      expect(messages.length).toBe(1);

      messages.forEach((message: Message): void => {
        let count: number = 0;
        message.get("EVN").forEach((segment: HL7Node): void => {
          expect(segment.name).toBe("EVN");
          count++;
        });
        expect(count).toBe(1);
      });
    });

    test("...get MSH in a BHS", async () => {
      const fileBatch = new FileBatch({
        fullFilePath: path.join("temp/", "hl7.readTestBHS.20231208.hl7"),
      });
      expect(fileBatch._opt.text).toContain(hl7_batch);

      const messages = fileBatch.messages();
      expect(messages.length).toBe(1);

      messages.forEach((message: Message): void => {
        let count: number = 0;
        message.get("EVN").forEach((segment: HL7Node): void => {
          expect(segment.name).toBe("EVN");
          count++;
        });
        expect(count).toBe(2);
      });
    });
  });
});
