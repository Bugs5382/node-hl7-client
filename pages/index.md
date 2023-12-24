# Node HL7 Client :: Documentation

## Introduction

In short, the point of the Health Level Seven International ("HL7") is so that any application that needs to integrate into the health care eco-system can talk to each other in a common language.

For example, different companies make a GE Healthcare and a Philips Healthcare device. But while they have simular functionally, GE and Philips systems sometimes need to share to another system, like a Electronic Medical Record ("EMR") to send results. Since the EMR, GE, and Philips are all different companies, they all have their own proprietary code and can't talk to each other naturally.

So HL7 was born. HL7 allows GE, Philips, or the EMR to generate "results" and/or "communicate" using a common framework. You need something in the middle to do so. While there are plenty of paid interface HL7 engines out there, they are expensive, and not to say they don't work, they do work. But nothing is more needed than an HL7 Parser/Builder/Client (Send) ("HL7 Client") message that be important to do.

This is not the world's authority on HL7.
If you need a more compressive on how to read and understand HL7 structure,
please visit [https://www.hl7.org](https://www.hl7.org/implement/standards/index.cfm?ref=nav) for more information.

## Table of Contents

1. [Introduction](#introduction)
2. [Solving the Divide](#solving-the-divide)
3. [Keyword Definitions](#Keyword-Definitions)
4. [Layout of Documentation](#layout-of-documentation)

## Solving the Divide

So what we are trying to solve with this NPM library is build an HL7 Client that can be brought into the NodeJS space that is very well documented, and also very well strongly typed. It was also meant to not have to realize on outside NPM packages (other than for development) so that it's super fast and super lightweight. At just under 500KB, this package does it all. There is still more to be developed, but this NPM library can do a lot all ready.

## Keyword Definitions

This NPM is designed to support medical applications with potential impact on patient care and diagnoses, this package documentation, and it's peer package [node-hl7-server](https://www.npmjs.com/package/node-hl7-server) follow these definitions when it comes to the documentation. This is key as it will help ensure that everything is interoperable between the application you develop and communicating with another HL7 interface, and that you unit test your HL7 interfaces fully. Communication could even be a paid/commercial interface engine.

Keywords such as "MUST", "MUST NOT", "REQUIRED",
"SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL".
These are standardized terms for  technology documentation interoperability.
These words should have these meaning when you are reading them.
They might be sans uppercase throughout the documentation, but they would have the same meaning regardless.

* **MUST** - This word, or the terms "**REQUIRED**" or "**SHALL**", mean that the definition is an absolute requirement of the specification.
* **MUST NOT** - This phrase, or the phrase "**SHALL NOT**", mean that the definition is an absolute prohibition of the specification.
* **SHOULD** - This word, or the adjective "**RECOMMENDED**", mean that there may exist valid reasons in particular circumstances to ignore a particular item, but the full implications must be understood and carefully weighed before choosing a different course.
* **SHOULD NOT** - This phrase, or the phrase "**NOT RECOMMENDED**", mean that there may exist valid reasons in particular circumstances when the particular behavior is acceptable or even useful. The full implications should be understood, and the case carefully weighed before implementing any behavior described with this label.
* **MAY** - This word, or the adjective "**OPTIONAL**",  mean that an item is truly optional.  Any implementation which does not include a particular option MUST be prepared to interoperate with another implementation which does include the option, though perhaps with reduced functionality. In the same vein, an implementation which does include a particular option MUST be prepared to interoperate with another implementation, which does not include the option (except, of course, for the feature the option provides.)

## Layout of Documentation

This documentation is laid out into three parts:

| Section                     | Purposes                                                                                                                                                                                                                                                                                |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Builder](builder/index.md) | The builder helps you generate standardized and proper HL7 messages. It's the heart of generating the message that need to be sent.                                                                                                                                                     |
| [Client](client/index.md)   | The client connects you to a server/broker service to send a HL7 message, and then process the response from the server/broker as needed. If you need to accept messages from an outside source, you need to use the peer package of node-hl7-server, which can run along this package. |
| [Parser](parser/index.md)   | The parser, which is built within the same builder, parses HL7 messages, either from a server response from the client connection or from HL7 formatted "files" which could also store messages.                                                                                        |


