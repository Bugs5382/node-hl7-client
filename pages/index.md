# Node HL7 Client :: Documentation

## Introduction

The point of Health Level Seven International ("HL7")
is to allow any application that needs to integrate into the healthcare ecosystem to communicate using a common language.

For example, let's take three different medical application and equipment companies:

* **GE Healthcare** — Produces medical equipment and software that goes along with it.
* **Philips Healthcare** — Produces medical equipment and software that goes along with it.
* **Epic** — A premier Electronic Medical Record ("EMR") system.

GE and Philips systems sometimes need to share data with another system,
like an EMR, to send the results of a patient’s diagnosis.
Or in the other direction, Epic needs to send information that a patient has been admitted to a facility and transmit orders (i.e., tests to be done) to GE or Philips systems to ensure they are performed — and performed correctly.

Since the EMR, GE, and Philips are all different companies,
they each have their own proprietary systems and can't naturally talk to each other.

So HL7 was born.
HL7 allows GE, Philips, and/or the EMR to generate "results" and/or "communicate" using a shared standard framework.
You need something in the middle to do that. While there are plenty of paid HL7 interface engines out there — and they do work — they are often expensive.

What’s really needed is an HL7 Parser/Builder/Client (Send) — an **"HL7 Client"** — that can do this work programmatically.

> ⚠️ **Note**: This is not the world’s authority on HL7.
> If you need more comprehensive guidance on how to read and understand the HL7 structure,
> please visit the official HL7 site:
> [https://www.hl7.org](https://www.hl7.org/implement/standards/index.cfm?ref=nav)

## Table of Contents

1. [Introduction](#introduction)
2. [Solving the Divide](#solving-the-divide)
3. [Keyword Definitions](#keyword-definitions)
4. [Layout of Documentation](#layout-of-documentation)
5. [Copyright Notice](#copyright-notice)

## Solving the Divide

What we are trying to solve with this NPM library is the ability to build an HL7 Client
that can be brought into the Node.js ecosystem — one that is well documented and strongly typed.

It was also intentionally built to **not rely on outside NPM packages** (other than for development),
making it both fast and lightweight. At just under 500KB, this package does it all.

There is still more to develop, but this NPM library already covers a lot.

---

## Keyword Definitions

This NPM package is designed to support medical applications with potential impact on patient care and diagnoses.
This package documentation, and its peer package [`node-hl7-server`](#), follow these definitions when it comes to terminology.

Keywords such as "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" are standardized terms for technology documentation interoperability. These words carry the following meanings when you encounter them. They may appear in lowercase throughout the documentation, but the intent remains the same.

* **MUST** – This word, or the terms **REQUIRED** or **SHALL**, means that the definition is an absolute requirement of the specification.
* **MUST NOT** – This phrase, or the term **SHALL NOT**, means that the definition is an absolute prohibition within the specification.
* **SHOULD** – This word, or the adjective **RECOMMENDED**, means that there may exist valid reasons in particular circumstances to ignore a specific item, but the full implications must be understood and carefully weighed before choosing a different course.
* **SHOULD NOT** – This phrase, or the phrase **NOT RECOMMENDED**, means that there may exist valid reasons in particular circumstances when the specified behavior is acceptable or even useful. The full implications should be understood and the case carefully weighed before implementing any behavior described with this label.
* **MAY** – This word, or the adjective **OPTIONAL**, means that an item is truly optional. Any implementation which does not include a particular option MUST be prepared to interoperate with another implementation that does include the option, though perhaps with reduced functionality. Likewise, an implementation that does include a particular option MUST be prepared to interoperate with another implementation that does not — except, of course, for the feature that the option provides.

---

## Layout of Documentation

This documentation is laid out into three parts:

| Section                     | Purpose                                                                                                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Builder](builder/index.md) | The builder helps you generate standardized and proper HL7 messages. It’s the heart of generating the messages that need to be sent.                                                                                                                   |
| [Client](client/index.md)   | The client connects you to a server or broker service to send an HL7 message, and then process the response as needed. If you need to accept messages from an external source, use the peer package `node-hl7-server`, which complements this package. |
| [Parser](parser/index.md)   | The parser — which is built into the same builder — parses HL7 messages, either from a server response or from HL7-formatted files containing stored messages.                                                                                         |

---

## Copyright Notice

Epic, GE, and Philips are all registered trademarks of their respective owners.
We are using them only as illustrative examples, and we are **not in any way affiliated with or sponsored by** them.
They are referenced solely to demonstrate how HL7 communication works.
