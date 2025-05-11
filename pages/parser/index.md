# Node HL7 Client :: Parser

## Introduction

This library serves as both the **builder** and **parser** for HL7 messages. There are no strict configuration requirements — the behavior is determined entirely by how it's initialized. While it is designed to be used with its sister library, [node-hl7-server](https://www.npmjs.com/package/node-hl7-server), it functions independently.

> ⚠️ **Note**: The parser strictly requires valid HL7 strings. Any errors or malformed segments will cause parsing to fail. It’s strongly recommended to write thorough unit tests for your application to validate HL7 message structures before consuming them.

If you're using the [client](../client/index.md) or [builder](../builder/index.md), be aware of what messages you're receiving on which ports to ensure proper parsing.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)
   - [Single Message](#single-message)
   - [Batch Message](#batch-message)
   - [File-Based Parsing](#file-based-parsing)
3. [Recommended Use](#recommended-use)

## Basic Usage

### Single Message

Use this when you're dealing with a single HL7 message string:

```ts
const hl7 = [
  "MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7",
  "EVN||20081231",
].join("\r");

const message = new Message({ text: hl7 });

const msh_9_1 = message.get("MSH.9.1").toString(); // ADT
```

### Batch Message

For HL7 batches that include multiple messages:

```ts
const hl7 = [
  "BHS|^~\\&|||||20231208",
  "MSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7",
  "EVN||20081231",
  "BTS|1",
].join("\r");

const batch = new Batch({ text: hl7 });

const messages = batch.messages();

messages.forEach((message: Message) => {
  const msh_9_1 = message.get("MSH.9.1").toString(); // ADT
  const evn_2 = message.get("EVN.2").toString(); // 20081231

  // your logic here...
});
```

### File-Based Parsing

To parse HL7 messages from a file, use either a file path or a `Buffer`.

**From file path:**

```ts
const fileBatch = new FileBatch({
  fullFilePath: path.join("your/path/here", "hl7.ADT.20081231.hl7"),
});
```

**From file buffer:**

```ts
const fileBatch = new FileBatch({
  fileBuffer: fs.readFileSync(path.join("temp", "hl7.ADT.20081231.hl7")),
});
```

Then extract messages just like a regular batch:

```ts
const messages = fileBatch.messages();

messages.forEach((message: Message) => {
  const msh_9_1 = message.get("MSH.9.1").toString();
  const evn_2 = message.get("EVN.2").toString();

  // your logic here...
});
```

## Recommended Use

This parser is typically used on the **server or broker** side of your architecture.

While it is a dependency of [node-hl7-server](https://www.npmjs.com/package/node-hl7-server), this parser is not directly exposed through that library and must be imported independently for use.

> ℹ️ On the client side, messages are parsed _before_ being sent back via the response handler — so you typically won’t need to use this parser in client response logic.
