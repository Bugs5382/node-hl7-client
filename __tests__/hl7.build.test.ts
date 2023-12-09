import {randomUUID} from "crypto";
import * as Util from '../src/utils/'
import {Batch, Message} from "../src";

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
        new Message({ text: "PV1|||||||^Jones\rMSH|^~\\&\r"})
      } catch (err) {
        expect(err).toEqual(new Error('text must begin with the MSH segment.'))
      }
    })

    test("error - Message Object - msh 9.1 is empty ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9: {
              // @ts-expect-error 9.1 should be not empty
              msh_9_1: "",
            },
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.1 & MSH 9.2 & MSH 9.3 must be defined.'))
      }
    })

    test("error - Message Object - msh 9.2 is empty ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9: {
              // @ts-expect-error 9.2 should be not empty
              msh_9_2: "",
            },
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.1 & MSH 9.2 & MSH 9.3 must be defined.'))
      }
    })

    test("error - Message Object - msh 9.3 is empty ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9: {
              // @ts-expect-error 9.3 should be not empty
              msh_9_3: "",
            },
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.1 & MSH 9.2 & MSH 9.3 must be defined.'))
      }
    })

    test("error - Message Object - msh 9.1 is not 3 character long ", async () => {
      try {
        new Message({
          messageHeader: {
            msh_9: {
              // @ts-expect-error 9.1 should be 3 characters
              msh_9_1: "ADTY",
              msh_9_2: "A01",
              msh_9_3: "ADT_A01"
            },
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
            msh_9: {
              msh_9_1: "ADT",
              // @ts-expect-error 9.2 should be 3 characters
              msh_9_2: "A01Y",
              msh_9_3: "ADT_A01"
            },
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
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
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
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: ""
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.10 must be greater than 0 and less than 199 characters.'))
      }
    })

  })

  describe(`'build message basics`, () => {

    let message: Message
    const randomControlID = randomUUID()

    beforeEach(async () => {
      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: randomControlID
        }
      })
    })

    test("... initial build", async () => {
      expect(message.toString()).toContain("MSH|^~\\&")
      expect(message.toString()).toContain(`|ADT^A01^ADT_A01|${randomControlID}||2.7`)
    })

    test("... verify MSH header is correct", async () => {
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

    test('... add onto the MSH header', async () => {
      message.set("MSH.3", "SendingApp");
      message.set("MSH.4", "SendingFacility");
      message.set("MSH.5", "ReceivingApp");
      message.set("MSH.6", "ReceivingFacility");

      expect(message.get("MSH.3").toString()).toBe("SendingApp");
      expect(message.get("MSH.4").toString()).toBe( "SendingFacility");
      expect(message.get("MSH.5").toString()).toBe( "ReceivingApp");
      expect(message.get("MSH.6").toString()).toBe( "ReceivingFacility");
    })

    test.todo('...override MSH.7 to short - error out')

    test.todo('...override MSH.7 to long - error out')

    test('... MSH.3.1 can be gotten with MSH.3', async () => {
      message.set("MSH.3.1", "SendingApp");
      expect(message.get("MSH.3").toString()).toBe("SendingApp");
    })

    test('... MSH.3 can be gotten with MSH.3.1', async () => {
      message.set("MSH.3", "SendingApp");
      expect(message.get("MSH.3.1").toString()).toBe("SendingApp");
    })

  })

  describe('complex builder message tests', () => {

    let message: Message

    beforeEach(async () => {
      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: "12345"
        }
      })
      message.set('MSH.7', '20081231')
    })

    // this is currently failing
    test.skip('... add segment EVN field - using full path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('EVN.2.1', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('... add segment EVN field - using number path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('2.1', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('... add segment EVN field - using simple number path', async () => {
      const segment = message.addSegment('EVN')
      segment.set('2', '20081231')
      expect(message.toString()).toBe("MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7\rEVN||20081231")
    })

    test('... add segment EVN field - using simple number', async () => {
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

    test('... initial build', async() => {
      batch.end()
      expect(batch.toString()).toContain("BHS|^~\\&")
      expect(batch.toString()).toContain("BTS|0")
    })

    test('... verify BHS header is correct', async() => {
      batch.set('BHS.7', '20081231')
      batch.end()
      expect(batch.get('BHS.7').toString()).toBe("20081231")
      expect(batch.toString()).toBe("BHS|^~\\&|||||20081231\rBTS|0")
    })

    test('... add onto the BHS header', async() => {
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

    test.todo('...override BSH.7 to short - error out')

    test.todo('...override BSH.7 to long - error out')

  })

  describe('complex builder batch tests', () => {

    let batch: Batch
    let message: Message
    const date = Util.createHL7Date(new Date(), "8")

    beforeEach(async () => {
      batch = new Batch()
      batch.start()
      batch.set('BHS.7', date)
    })

    test('... add single message to batch', async () => {

      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', date)

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe([`BHS|^~\\&|||||${date}`, `MSH|^~\\&|||||${date}||ADT^A01^ADT_A01|CONTROL_ID||2.7`, "BTS|1"].join("\r"))
    })

    test('... add 10 message to batch', async () => {

      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
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

    test('... add message to batch with additional segments in message', async () => {

      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', date)

      const segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe("BHS|^~\\&|||||20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rBTS|1")
    })

    test('... add message to batch with 2x additional segments in message', async () => {

      message = new Message({
        messageHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: 'CONTROL_ID'
        }
      })
      message.set('MSH.7', date)

      let segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      segment = message.addSegment('EVN')
      segment.set(2, '20081231')

      batch.add(message)
      batch.end()
      expect(batch.toString()).toBe("BHS|^~\\&|||||20231208\rMSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7\rEVN||20081231\rEVN||20081231\rBTS|1")
    })

  })

})