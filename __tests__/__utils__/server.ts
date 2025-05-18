import { createHL7Date, Message } from "../../src";

/**
 * Create a Ack Message
 * @since 1.0.0
 * @param type
 * @param message
 */
export function _createAckMessage(type: string, message: Message): Message {
  const ackMessage = new Message({
    messageHeader: {
      msh_9_1: "ACK",
      msh_9_2: message.get("MSH.9.2").toString(),
      msh_10: `ACK${createHL7Date(new Date())}`,
      msh_11_1: message.get("MSH.11.1").toString() as "P" | "D" | "T",
    },
  });

  ackMessage.set("MSH.3", message.get("MSH.5").toString());
  ackMessage.set("MSH.4", message.get("MSH.6").toString());
  ackMessage.set("MSH.5", message.get("MSH.3").toString());
  ackMessage.set("MSH.6", message.get("MSH.4").toString());
  ackMessage.set("MSH.12", message.get("MSH.12").toString());

  const segment = ackMessage.addSegment("MSA");
  segment.set("1", type);
  segment.set("2", message.get("MSH.10").toString());

  return ackMessage;
}
