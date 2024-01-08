# Node HL7 Client :: Parser 

## Introduction

The builder is the parser, the parser is the builder.
They are one and the same.
However, in this case, you do not set any specifications at all for anything.
It is just a matter of how it's used to initialize will it work correctly.
This should be mostly used on the [node-hl7-server](https://www.npmjs.com/package/node-hl7-server) sister library

The parser will only accept valid HL7 strings in order for them to be fully processed.
Any errors within the HL7 segment, even in the exact issue, will cause a failure.
There are circumstances that this will not work, and you should do proper testing withing your unit tests of your app,
to ensure the message design you expect to get 
is correct before treating the values like "gold."

As mentioned in the [client](../client/index.md) or [builder](../builder/index.md),
you should know what your receiving on what port so getting the proper string either from you getting it from a client

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)

## Basic Usage

### Non-File

Taking your HL7 String, either as a single Message or a Batch containing more than one Message segment,
you process it like this:

> Note: I am making the code readable, but normally this would be in _one_ long string with the "\r" separating each part of the message.

#### Message

```ts
const hl7 = [
  'MSH|^~\\&|||||20081231||ADT^A01^ADT_A01|12345||2.7',
  'EVN||20081231'
].join('\r')

const message = new Message({ text: hl7 })

const msh_9_1 = message.get('MSH.9.1').toString() //  should be ADT
```

#### Batch

```ts
const hl7 = [
  'BHS|^~\\&|||||20231208',
  'MSH|^~\\&|||||20231208||ADT^A01^ADT_A01|CONTROL_ID||2.7',
  'EVN||20081231',
  'BTS|1'
].join('\r')

const batch = new Batch({ text: hl7 })

const messages = batch.messages() // get all the MSH segments, in this case one should return

let msh_9_1, evn_2 = ''
messages.forEach((message: Message): void => {
  msh_9_1 = message.get('MSH.9.1').toString() // should be ADT
  evn_2 = message.get('EVN.2').toString()     // should be 20081231
})

// your code here...
```

#### Files

Files are a bit different to parse, but they follow the same basic structure to process.

First, you must read the file either by passing the file path into the class:

```ts
const fileBatch = new FileBatch({ fullFilePath: path.join('your/path/here/maybe', 'hl7.ADT.20081231.hl7') })
```

...or input the Buffer version of the file into the class:

```ts
const fileBatch = new FileBatch({ fileBuffer: fs.readFileSync(path.join('temp/', 'hl7.ADT.20081231.hl7')) })
```

The concept is the same as Batch where you get your message:

```ts
const messages = fileBatch.messages()

let msh_9_1, evn_2 = ''

messages.forEach((message: Message): void => {
  msh_9_1 = message.get('MSH.9.1').toString() // could be ADT
  evn_2 = message.get('EVN.2').toString()     // could be 20081231
})

// your code here...

```

... and then loop through the messages in the array as needed.

## Where to parse?

This part would normally be used on the server/broker side.
The documentation is included in here,
even though this library is a dependency of the [node-hl7-server](https://www.npmjs.com/package/node-hl7-server) sister library,
this library is not accessible via ```node-hl7-server``` and should be imported on its own if you want to use it.

The client response is already parsed prior to going back through the Client response handler.
