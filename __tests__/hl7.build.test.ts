import {randomUUID} from "crypto";
import {EmptyNode} from "../src/builder/modules/emptyNode";
import {Batch, createHL7Date, isBatch, isFile, Message} from "../src";
import { Node } from "../src/builder/interface/node";

describe('node hl7 client - builder tests', () => {

  describe('sanity checks', () => {

    test("error - Message Object - nothing passed", async () => {
      try {
        new Message()
      } catch (err) {
        expect(err).toEqual(new Error('mshHeader must be set if no HL7 message is being passed.'))
      }
    })

    test("error - Message Object - text empty ", async () => {
      try {
        new Message({ text: ""})
      } catch (err) {
        expect(err).toEqual(new Error('mshHeader must be set if no HL7 message is being passed.'))
      }
    })

    test("error - Message Object - text must start with MSH ", async () => {
      try {
        new Message({ text: "PV1|||||||^Jones\r"})
      } catch (err) {
        expect(err).toEqual(new Error('text must begin with the MSH segment.'))
      }
    })

    test("error - Message Object - msh 9.1 is empty ", async () => {
      try {
        new Message({
          // @ts-expect-error 9.1 should be not empty
          messageHeader: {
            msh_9_1: "",
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.1 & MSH 9.2 must be defined.'))
      }
    })

    test("error - Message Object - msh 9.2 is empty ", async () => {
      try {
        new Message({
          // @ts-expect-error 9.2 should be not empty
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "",
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.2 must be 3 characters in length.'))
      }
    })

    test("error - Message Object - msh 9.1 is not 3 character long ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9_1: "ADTY",
            msh_9_2: "A01",
            msh_10: "123456"
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.1 must be 3 characters in length.'))
      }
    })

    test("error - Message Object - msh 9.2 is not 3 character long ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01Y",
            msh_10: "123456"
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.2 must be 3 characters in length.'))
      }
    })

    test("error - Message Object - msh 10 is more than 199 characters ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: "AaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdf"
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.10 must be greater than 0 and less than 199 characters.'))
      }
    })

    test("error - Message Object - msh 10 can not be blank", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9_1: "ADT",
            msh_9_2: "A01",
            msh_10: ""
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.10 must be greater than 0 and less than 199 characters.'))
      }
    })

  })

  describe('build message basics', () => {

    let message: Message
    const randomControlID = randomUUID()

    beforeEach(async () => {
      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: randomControlID
        }
      })
    })

    test("...initial build", async () => {
      expect(message.toString()).toContain("MSH|^~\\&")
      expect(message.toString()).toContain(`|ADT^A01^ADT_A01|${randomControlID}||2.7`)
    })

    test("...verify MSH header is correct", async () => {
      expect(message.toString().substring(0, 8)).toBe("MSH|^~\\&")
      expect(message.get('MSH.1').toString()).toBe("|")
      expect(message.get('MSH.2').toString()).toBe("^~\\&")
      expect(message.get('MSH.3').exists("")).toBe(false)
      expect(message.get('MSH.9.1').toString()).toBe("ADT")
      expect(message.get('MSH.9.2').toString()).toBe("A01")
      expect(message.get('MSH.9.3').toString()).toBe("ADT_A01")
      expect(message.get('MSH.10').toString()).toBe(randomControlID)
      expect(message.get('MSH.12').toString()).toBe("2.7")
    })

    test('...add onto the MSH header', async () => {
      message.set("MSH.3", "SendingApp");
      message.set("MSH.4", "SendingFacility");
      message.set("MSH.5", "ReceivingApp");
      message.set("MSH.6", "ReceivingFacility");

      expect(message.get("MSH.3").toString()).toBe("SendingApp");
      expect(message.get("MSH.4").toString()).toBe( "SendingFacility");
      expect(message.get("MSH.5").toString()).toBe( "ReceivingApp");
      expect(message.get("MSH.6").toString()).toBe( "ReceivingFacility");
    })

    test('...MSH.3.1 can be gotten with MSH.3', async () => {
      message.set("MSH.3.1", "SendingApp");
      expect(message.get("MSH.3").toString()).toBe("SendingApp");
    })

    test('...MSH.3 can be gotten with MSH.3.1', async () => {
      message.set("MSH.3", "SendingApp");
      expect(message.get("MSH.3.1").toString()).toBe("SendingApp");
    })

  })

  describe('complex builder message', () => {

    let message: Message

    beforeEach(async () => {
      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: "12345"
        }
      })
      message.set('MSH.7', '20081231')
    })

    test("...should accept a number as a value", async () => {
      message.set("EVN.2", 1);
      expect(message.toString()).toContain("EVN||1");
    });

    test('...should accept a Date without time as a value', () => {
      message.set("PV1.1", new Date(2012, 9, 31));
      expect(message.toString()).toContain( "PV1|20121031");
    });

    test('...should accept a Date with time as a value', () => {
      message.set("PV1.1", new Date(2012, 9, 31, 22, 51, 13));
      expect(message.toString()).toContain( "PV1|20121031225113");
    });

    test('...should accept a float as a value', () => {
      message.set("PV1.1", 1.2);
      expect(message.toString()).toContain( "PV1|1.2");
    });

    test('...should accept a boolean as a value', () => {
      message.set("PV1.1", true);
      expect(message.toString()).toContain( "PV1|Y");
      message.set("PV1.1", false);
      expect(message.toString()).toContain( "PV1|N");
    });

    test('...should set the specified field', () => {
      message.set("PID.4", "1273462894723");
      expect(message.toString()).toContain( "PID||||1273462894723");
    });

    test('...should be able to set more than one field on the same segment', () => {
      message.set("PID.4", "1273462894723");
      message.set("PID.10", "TEST");
      expect(message.toString()).toContain("PID||||1273462894723||||||TEST");
    });

    test('...should set the specified component', () => {
      message.set("PV1.7.2", "Jones");
      expect(message.toString()).toContain( "PV1|||||||^Jones");
    });

    test('...should be able to set more that one component on the same field', () => {
      message.set("PV1.7.2", "Jones");
      message.set("PV1.7.3", "John");
      expect(message.toString()).toContain("PV1|||||||^Jones^John");
    });

    // not working...
    test.skip('...should be able to set repeating fields', async () => {
      message.set('PID.3').set(0).set('PID.3.1', 'abc');
      message.set('PID.3').set(0).set('PID.3.5', 'MRN');
      message.set('PID.3').set(1).set('PID.3.1', 123);
      message.set('PID.3').set(1).set('PID.3.5', 'ID');
      expect(message.toString()).toContain("PID|||abc^^^^MRN~123^^^^ID");
    });

    // not working...
    test.skip('...can chain component setters', async () => {
      message.set("PV1.7").set(0).set("PV1.7.2", "Jones").set("PV1.7.3", "John");
      message.set("PV1.7").set(1).set("PV1.7.2", "Smith").set("PV1.7.3", "Bob");
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    test('...can chain component setters with numeric indexers', async () => {
      message.set("PV1.7").set(0).set(1, "Jones").set(2, "John");
      message.set("PV1.7").set(1).set(1, "Smith").set(2, "Bob");
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    test('...can set field component by number', async () => {
      message.set("PV1.7").set(0).set(1, "Jones").set(2, "John");
      expect(message.toString()).toContain("PV1|||||||^Jones^John");
    });

    test('...can set field component by number and array', async () => {
      message.set("PV1.7").set(0, ["", "Jones", "John"]).set(1, ["", "Smith", "Bob"]);
      expect(message.toString()).toContain("PV1|||||||^Jones^John~^Smith^Bob");
    });

    // This is currently failing, why... I have no idea. Help!
    test.skip('... add segment EVN field - using full path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('EVN.2.1', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('...add segment EVN field - using number path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('2.1', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('...add segment EVN field - using simple number path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('2', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('...add segment EVN field - using simple number', async () => {
      const segment = message.addSegment('EVN')
      segment.set(2, '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

  })

  describe('basic batch basics', () => {

    let batch: Batch

    beforeEach(async () => {
      batch = new Batch()
      batch.start()
    })

    test('...initial build', async() => {
      batch.end()
      expect(batch.toString()).toContain("BHS|^~\\&")
      expect(batch.toString()).toContain("BTS|0")
    })

    test('...verify BHS header is correct', async() => {
      batch.set('BHS.7', '20081231')
      batch.end()
      expect(batch.get('BHS.7').toString()).toBe("20081231")
      expect(batch.toString()).toBe("BHS|^~\\&|||||20081231\rBTS|0")
    })

    test('...add onto the BHS header', async() => {
      batch.set('BHS.7', '20081231')
      batch.set("BHS.3", "SendingApp");
      batch.set("BHS.4", "SendingFacility");
      batch.set("BHS.5", "ReceivingApp");
      batch.set("BHS.6", "ReceivingFacility");
      batch.end()

      expect(batch.get("BHS.3").toString()).toBe("SendingApp");
      expect(batch.get("BHS.4").toString()).toBe( "SendingFacility");
      expect(batch.get("BHS.5").toString()).toBe( "ReceivingApp");
      expect(batch.get("BHS.6").toString()).toBe( "ReceivingFacility");
      expect(batch.toString()).toBe("BHS|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20081231\rBTS|0")
    })

  })

  describe('complex builder batch', () => {

    let batch: Batch
    let message: Message
    const date = createHL7Date(new Date(), "8")

    beforeEach(async () => {
      batch = new Batch()
      batch.start()
      batch.set('BHS.7', date)
    })

    test('...add single message to batch', async () => {

      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', date)

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe([`BHS|^~\\&|||||${date}`, `MSH|^~\\&|||||${date}||ADT^A01^ADT_A01|CONTROL_ID||2.7`, "BTS|1"].join("\r"))
    })

    test('...add 10 message to batch', async () => {

      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', date)

      for (let i = 0; i < 10; i ++) {
        batch.add(message)
      }
      batch.end()
      expect(batch.toString()).toContain("BTS|10")
    })

    test('...add message to batch with additional segments in message', async () => {

      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', '20231208')

      const segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe(`BHS|^~\\&|||||${date}\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rBTS|1`)
    })

    test('...add message to batch with 2x additional segments in message', async () => {

      message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', '20231208')

      let segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe(`BHS|^~\\&|||||${date}\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1`)
    })

  })

  describe('non standard tests', () => {

    test('...returns true if specified path exists', () => {
      let message = new Message({text:"MSH|^~\\&|value\rPV1|"});
      expect(message.exists("MSH.3")).toBe(true)
      expect(message.exists("PV1")).toBe(true)
    });

    test('...returns false if specified path does not exists', () => {
      let message = new Message({text: "MSH|^~\\&|value"});
      expect(message.exists("MSH.4")).toBe(false)
      expect(message.exists("PV1")).toBe(false)
    });

    test('...should return EmptyNode for out-of-range indexes', () => {
      let message = new Message({text: "MSH|^~\\&|"});
      expect(message.get(10)).toBeInstanceOf(EmptyNode)
      expect(message.get("PV1").get(10)).toBeInstanceOf(EmptyNode)
    });

    test('...should resolve escape sequence for hex character sequence', () => {
      let field = new Message({text: "MSH|^~\\&|\\X0D\\"}).get("MSH.3");
      expect(field.toString()).toBe("\r");
    })

    test('...should pass through invalid escape sequences', () => {
      expect(new Message({text: "MSH|^~\\&|\\a\\"}).get("MSH.3").toString()).toBe("\\a\\")
    })

    test('...count 2x EVN segments as nodes', async () => {

      let message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })

      let segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      let count: number = 0
      message.get("EVN").forEach((segment: Node): void => {
       expect(segment.name).toBe( "EVN");
        count++;
      });

      expect(count).toBe(2)

    })

    test('...isFile - on Message - false', async() => {

      const message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      expect(isFile(message.toString())).toBe(false)

    })

    test('...isBatch - on Message - false', async() => {

      const message = new Message({
        messageHeader: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_10: 'CONTROL_ID'
        }
      })
      expect(isBatch(message.toString())).toBe(false)

    })

    test('...isBatch -should be false', async() => {

      let batch = new Batch()
      batch.start()
      batch.end()
      expect(isFile(batch.toString())).toBe(false)

    })

    test('...isBatch - should now be true', async() => {

      let batch = new Batch()
      batch.start()
      batch.end()
      expect(isBatch(batch.toString())).toBe(true)

    })

  })

  describe('parse message and batch', () => {

    const hl7_string: string = "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231"
    const hl7_non_standard: string = "MSH:-+?*:field2:field3component1-field3component2:field4repeat1+field4repeat2:field5subcomponent1*field5subcomponent2:field6?R?"
    const hl7_batch: string = "BHS|^~\\&|||||20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1"
    const hl7_batch_non_standard: string = "BHS:-+?*:::::20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1"
    // const hl7_batch_non_standard_mixed: string = "BHS:-+?*:::::20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1"

    test('...verify MSH input', async () => {

      const message = new Message({text: hl7_string})

      expect(message.toString().substring(0, 8)).toBe("MSH|^~\\&")
      expect(message.get('MSH.1').toString()).toBe("|")
      expect(message.get('MSH.2').toString()).toBe("^~\\&")
      expect(message.get('MSH.3').exists("")).toBe(false)
      expect(message.get('MSH.9.1').toString()).toBe("ADT")
      expect(message.get('MSH.9.2').toString()).toBe("A01")
      expect(message.get('MSH.9.3').toString()).toBe("ADT_A01")
      expect(message.get('MSH.10').toString()).toBe("12345")
      expect(message.get('MSH.12').toString()).toBe("2.7")
      expect(message.get('EVN.2').toString()).toBe("20081231")

      let count: number = 0
      message.get("EVN").forEach((segment: Node): void => {
        expect(segment.name).toBe( "EVN");
        count++;
      });

      expect(count).toBe(1)

    })

    test('...parse non standard delimiters defined in MSH header', async () => {

      const message = new Message({text: hl7_non_standard});

      expect(message.get("MSH.3").toString()).toBe( "field2");
      expect(message.get("MSH.4.2").toString()).toBe( "field3component2");
      expect(message.get("MSH.5").get(0).toString()).toBe( "field4repeat1");
      expect(message.get("MSH.5").get(1).toString()).toBe( "field4repeat2");
      expect(message.get("MSH.6.1").toString()).toBe( "field5subcomponent1*field5subcomponent2");
      expect(message.get("MSH.6.1.2").toString()).toBe( "field5subcomponent2");
      expect(message.get("MSH.7").toString()).toBe( "field6+");
    })

    test('...verify BHS input', async () => {

      const batch = new Batch({text: hl7_batch})

      expect(batch.toString().substring(0, 8)).toBe("BHS|^~\\&")
      expect(batch.get('BHS.1').toString()).toBe("|")
      expect(batch.get('BHS.2').toString()).toBe("^~\\&")
    })

    test('...parse non standard delimiters defined in BHS header', async () => {

      const batch = new Batch({text: hl7_batch_non_standard})

      expect(batch.toString().substring(0, 8)).toBe("BHS:-+?*")
      expect(batch.get('BHS.1').toString()).toBe(":")
      expect(batch.get('BHS.2').toString()).toBe("-+?*")
    })

    test('...verify BHS input ... 1 message should exist ... 2 EVN segments inside', async () => {

      const batch = new Batch({text: hl7_batch})
      const messages = batch.messages()
      expect(messages.length).toBe(1)

      messages.forEach((message: Message): void  => {

        let count: number = 0
        message.get("EVN").forEach((segment: Node): void => {
          expect(segment.name).toBe( "EVN");
          count++;
        });
        expect(count).toBe(2)
      })

    })

  })

})