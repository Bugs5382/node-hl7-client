## Node HL7 Client
A pure Node.js HL7 Client
that allows for communication to a HL7 Broker/Server that can send properly formatted HL7 messages with ease.
Separately it can also parse and extract out any segment within an HL7 message.
Messages could come as one after the other (MSH), as a Batch (BHS), or in a batch file (FHS).

Included in this package:
* The Client, which can connect to a HL7 server and send messages and get response back from that Hl7 Server and do something with the results if needed.
* The Parser, will decode an HL7 messages for your manipulation.
* The Builder can create a properly formatted HL7 message(s) to be sent either a single message, batch of messages, or batch of messages written into a file for further processing.

**Note: This is under active development. Something might still break and not work correctly. API and Documentation are still under development. Consider contributing.**

Benefits:

- No external dependencies, making this ultra-fast.
- Automatically re-connect or retry sending
- Written in typescript and published with heavily commented type definitions
- Peer `node-hl7-server' npm package that in conjunction with this one could create a powerful HL7 system.
- Works in Windows or Linux-based systems
- With typed settings of key segments of the HL7 message (MSH, BHS, and FHS) it ensures that you are building your message in compliance with the HL7 standards defined at [https://www.hl7.org](https://www.hl7.org/implement/standards/index.cfm?ref=nav)

## Table of Contents

1. [Acknowledgements](#acknowledgements)
2. [License](#license)

## Acknowledgements

- [node-rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client): Code Design/Auto Re-Connect/Resend, Inspiration
- [artifacthealth/hl7parser](https://github.com/artifacthealth/hl7parser): Used as a template for HL7 builder/parser
- My Wife and Baby Girl.

## License

Licensed under [MIT](LICENSE).