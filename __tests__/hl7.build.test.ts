import {Message} from "../src/message";
import {HL7_2_7_MSH} from "../src/specification/2.7";

describe('node hl7 client - builder tests', () => {

  describe('message', () => {

    test("blank message", async () => {

      const message = new Message()
      await message.createHeader<HL7_2_7_MSH>({
        msh_9: {
          msh_9_1: "ADT",
          msh_9_2: "A01",
          msh_9_3: "ADT_A01"
        },
        msh_10: ""
      })

    })

  })

})