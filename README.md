## Node HL7 Client

> A pure Node.js HL7 Client
that allows for communication to a HL7 Broker/Server that can send properly formatted HL7 messages with ease.
Separately, it can also parse and extract out any segment within an HL7 message.
Messages could come as one after the other (MSH), as a Batch (BHS), or in a batch file (FHS).

Included in this package:
* The Client, which can connect to a HL7 server and send messages and get response back from that Hl7 Server and do something with the results if needed.
* The Parser will decode an HL7 message string for your manipulation.
* The Builder can create a properly formatted HL7 message(s) to be sent either a single message, batch of messages, or batch of messages written into a file for further processing.

Benefits:

- :fast_forward: No external dependencies, making this ultra-fast.
- :electric_plug: Automatically re-connect or retry sending
- :memo: Written in typescript and published with heavily commented type definitions
- :bust_in_silhouette: Peer `node-hl7-server` npm package that in conjunction with this one could create a powerful HL7 system.
- :computer: Works in Windows or Linux-based systems
- :guide_dog: With typed settings of key segment generation of the HL7 message (MSH, BHS, and FHS) it ensures that you are building your message in compliance with the HL7 standards defined at [https://www.hl7.org](https://www.hl7.org/implement/standards/index.cfm?ref=nav)

If you are using this NPM package, please consider giving it a :star: star.
This will increase its visibility and solicit more contribution from the outside.

## Install

Install using NPM into your package:
```
npm install node-hl7-client
```

## Table of Contents

1. [Keyword Definitions](#Keyword-Definitions)
2. [Documentation](#documentation)
3. [Acknowledgements](#acknowledgements)
4. [License](#license)

## Keyword Definitions

This NPM is designed to support medical applications with potential impact on patient care and diagnoses,
this package documentation,
and its peer package [node-hl7-server](https://www.npmjs.com/package/node-hl7-server) follow these definitions when it comes to the documentation.

Keywords such as "MUST", "MUST NOT", "REQUIRED",
"SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL".
These are standardized terms for technology documentation interoperability.
These words should have these meaning when you are reading them.
They might be sans uppercase throughout the documentation, but they would have the same meaning regardless.

* **MUST** - This word, or the terms "**REQUIRED**" or "**SHALL**", mean that the definition is an absolute requirement of the specification.
* **MUST NOT** - This phrase, or the phrase "**SHALL NOT**", mean that the definition is an absolute prohibition of the specification.
* **SHOULD** - This word, or the adjective "**RECOMMENDED**", mean that there may exist valid reasons in particular circumstances to ignore a particular item, but the full implications must be understood and carefully weighed before choosing a different course.
* **SHOULD NOT** - This phrase, or the phrase "**NOT RECOMMENDED**", mean that there may exist valid reasons in particular circumstances when the particular behavior is acceptable or even useful. The full implications should be understood, and the case carefully weighed before implementing any behavior described with this label.
* **MAY** - This word, or the adjective "**OPTIONAL**", mean that an item is truly optional.  Any implementation which does not include a particular option MUST be prepared to interoperate with another implementation which does include the option, though perhaps with reduced functionality. In the same vein, an implementation which does include a particular option MUST be prepared to interoperate with another implementation, which does not include the option (except, of course, for the feature the option provides.)

## Documentation

It's way too extensive to include on this README alone.
Please [read this](pages/index.md) to gain more information.
GitHub pages now has mostly full listing of all methods, classes, etc., but only for the most recent release.
You can view it [here](https://bugs5382.github.io/node-hl7-client/).

## Acknowledgements

- [node-rabbitmq-client](https://github.com/cody-greene/node-rabbitmq-client): Code Design/Auto Re-Connect/Resend, Inspiration
- [artifacthealth/hl7parser](https://github.com/artifacthealth/hl7parser): Used as a template for HL7 builder/parser
- My Wife and Baby Girl.

## License

Licensed under [MIT](LICENSE).