## Node HL7 Client
A pure Node.js HL7 Client
that allows for communication to a HL7 Broker/Server that can send properly formatted HL7 messages with ease.
It can also parse and then you can extract message segments out.

This includes a:
* the Client, which can connect to a HL7 server and send messages and get response back from that Hl7 Server and do something with the results if needed.
* The Parser, will decode an HL7 messages
* the Builder, can create a properly formatted HL7 message(s) to be sent either a single message, batch of messages, or batch of messages written into a file.

Benefits:

- No dependencies, making this ultra-fast.
- Automatically re-connect or retry sending
- Written in typescript and published with heavily commented type definitions
- Peer `node-hl7-server' npm package that in conjunction with this one could create a powerful HL7 system.
- Works in Windows or Linux-based systems

## Table of Contents

1. [Acknowledgements](#acknowledgements)
2. [License](#license)

## Acknowledgements

- Code Design/Auto Re-Connect/Resend, Inspiration:
- [node-rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client)
- [artifacthealth/hl7parser](https://github.com/artifacthealth/hl7parser)
- My Wife and Baby Girl.

## License

Licensed under [MIT](LICENSE).