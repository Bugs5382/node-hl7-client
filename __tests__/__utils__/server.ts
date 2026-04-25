import { Message } from "../../src";
import { HL7_2_1 } from "../../src/hl7/2.1";

/**
 * Create a Ack Message
 * @since 1.0.0
 * @param type
 * @param message
 */
export function _createAckMessage(type: string, message: Message): Message {
  const messageBuild = new HL7_2_1();

  messageBuild.buildMSH({
    msh_3: message.get("MSH.5").toString(),
    msh_4: message.get("MSH.6").toString(),
    msh_5: message.get("MSH.3").toString(),
    msh_6: message.get("MSH.4").toString(),
    msh_9: "ACK",
    msh_10: "12345",
    msh_11: "T",
  });

  messageBuild.buildMSA({
    msa_1: type,
    msa_2: message.get("MSH.10").toString(),
  });

  return messageBuild.toMessage();
}
