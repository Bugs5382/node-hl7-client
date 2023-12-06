import {randomUUID} from "crypto";
import {Message} from "../src";

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
          mshHeader: {
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
          mshHeader: {
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
          mshHeader: {
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
          mshHeader: {
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
          mshHeader: {
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
          mshHeader: {
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: "AaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdfAaasdfjlsdjflskdfsdflkjjsdlkflkasdflsjdflkjasdlfjsldkjlskjdfksajflksjdf"
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.10 must be greater than 0 and less than 199 characters.'))
      }
    })

    test("error - Message Object - msh 10 can not be blank", async () => {
      try {
        new Message({
          mshHeader: {
            msh_9: {
              msh_9_1: "ADT",
              msh_9_2: "A01"
            },
            msh_10: ""
          }
        })
      } catch (err) {
        expect(err).toEqual(new Error('MSH.9.10 must be greater than 0 and less than 199 characters.'))
      }
    })

  })

  describe(`'build basics`, () => {

    let message: Message
    const randomControlID = randomUUID()

    beforeEach(async () => {

      message = new Message({
        mshHeader: {
          msh_9: {
            msh_9_1: "ADT",
            msh_9_2: "A01"
          },
          msh_10: randomControlID
        }
      })

    })

    test("basic build", async () => {
      expect(message.toString()).toContain("MSH|^~\\&")
      expect(message.toString()).toContain(`|ADT^A01^ADT_A01|${randomControlID}||2.7`)
    })

    test("basic build - verify MSH header is correct", async () => {
      expect(message.toString()).toContain("MSH|^~\\&")
      expect(message.get('MSH.1').toRaw()).toBe("|")
      expect(message.get('MSH.2').toRaw()).toBe("^~\\&")
      expect(message.get('MSH.3').toRaw()).toBe("")
      expect(message.get('MSH.9.1').toRaw()).toBe("ADT")
      expect(message.get('MSH.9.2').toRaw()).toBe("A01")
      expect(message.get('MSH.9.3').toRaw()).toBe("ADT_A01")
      expect(message.get('MSH.10').toRaw()).toBe(randomControlID)
      expect(message.get('MSH.12').toRaw()).toBe("2.7")
    })

  })

})