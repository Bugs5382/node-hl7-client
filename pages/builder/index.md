# Node HL7 Client :: Builder

## Introduction

The builder is very easy to use. It's made, so you can easily build a Hl7 message with ease. It has three main parts:

* Message
* Batch
* File Batch

In the end, the Message {@see Message} ("MSH"), does the bulk of the work building out the HL7 message to be sent to the server/broker. However, there are times that your app might be processing lots of messages and you might want to send those off all together. This is where you would batch those messages and send it off as a Batch ("BHS"). The other side just sees it as individual Messages when being parsed, however, the MSH segments could contain the unique Batch ID that it was sent it in case the server/broker needed to get the messages again. More on this later.

At times you might even need to group your Batch's and/or Messages into a flat file (a File Batch ("FHS")) and do something with it. Sometimes some applications or even developers, technicians, need to see the raw data. This is where the File Batch process comes in. This will generate a standardized format that could be in turn read and then distracted over like any other message or parsed locally.

Medical exports that deal with interfaces on a day-to-day basis would be able to understand where certain strings and requirements on how to structure an Hl7 message in the end, but it's all about interoperability. Some applications might need certain data in certain fields/locations in order to process it correctly.

Please note that HL7 messages group each line into Segments. The standard currently for 2.x HL7 messages from 2.1 to 2.8 is that the Segment name is only three characters long. No more, no less. Exactly three.

This NPM package assumes that you understand HL7 requirements and understand where certain data goes. This documentation is just teaching you how to use it, and not teaching you all the possible values of what should go where.

## Table of Contents

1. [Introduction](#introduction)
2. [Main Contents of HL7](#main-contents-of-hl7)
   1. [Build of Sample HL7 MSH Segment](#build-a-sample-hl7-msh-segment)
   2. [Using Non-Standard Encoding](#using-non-standard-encoding)
   3. [Chain Method Building](#chain-method-building)
3. [Detailed Examples](#detailed-examples)
   1. [Refactoring the Message Class](#refactoring-the-message-class)

## Main Contents of HL7

### HL7 Specifications

HL7 is set to a set of specification.
They range from 2.1 to 2.8.
While it would take hundreds of pages here to describe the difference between the different specification,
[this site](https://hl7-definition.caristix.com/v2/) can review what the different segments do.

The major difference for the MSH header segment for the versions is from 2.1 to 2.3.1,
where the field MSH 9.3 is a combined string of MSH 9.1 and MSH 9.2.
From HL7 version 2.4 and onward, MSH 9.3 can either be ACK or a combined string of MSH 9.1 and MSH 9.2.
To override MSH 9.3 in 2.4 and higher, follow this example:

```ts
const message = new Message({
   specification: new HL7_2_4(),
   messageHeader: {
      msh_9_1: 'ADT',
      msh_9_2: 'A01',
      msh_9_3: 'ACK',
      msh_10: '12345',
      msh_11_1: 'D',
      msh_11_2: 'A'
   }
})
```

This will results in this:

```
MSH|^~\&|||||20081231||ADT^A01^ACK|12345|D^A|2.4
```

As the MSH header segment. Otherwise, not including the msh_9_3 above will make it:

```
MSH|^~\&|||||20081231||ADT^A01^ADT_A02|12345|D^A|2.4
```

### Build a Sample HL7 MSH Segment

All HL7 messages (not the Batch or File Batch which could contain Messages) start with MSH segments, and they are build quite easily. Right not the deface standard has been version 2.7 of its most common use. There isn't much different between v2.7, v2.7.1 and v2.8, and this is to the fact that v2.5 really expanded the segment types that exist was we moved to more modern Electronic Medical Record systems.

> MSH|^~\\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3

First, let's break this message down. Use the Pipe ("|") as the field separator we get these results. ([VIew Here For More Details](https://hl7-definition.caristix.com/v2/HL7v2.3/Segments/MSH))

|    MSH.1     |                           MSH.2                           |        MSH.3        |       MSH.4       |               MSH.5               |       MSH.6        |      MSH.7      |      MSH,8      |            MSH.9.1             |         MSH.9.2          |                                          MSH.10                                          |      MSH.11       |  MSH.12  |
|:------------:|:---------------------------------------------------------:|:-------------------:|:-----------------:|:---------------------------------:|:------------------:|:---------------:|:---------------:|:------------------------------:|:------------------------:|:----------------------------------------------------------------------------------------:|:-----------------:|:--------:|
| Segment Name |                    Encoding Characters                    | Sending Application | Sending Facility  |       Receiving Application       | Receiving Facility | Date of Message |    Security     |       Message Type Code        |   Message Type Trigger   |                                        Unique ID                                         | Production? Test? | HL7 Spec |
|     MSH      |                           ^~\\&                           |       HNAM_PM       |      HNA500       |                AIG                |                    | 20131017140041  |                 |              ADT               |           A01            |                                   Q150084616T145947960                                   |         P         |   2.3    |
|     n/a      | What the servers should use to parse the message we send. |   Who's sending?    | Name of Facility. | What system are we sending it to? |      Facility      |  YYYYMMDDHHMM   | See Note Below  | Admitting, Discharge, Transfer | Admit/visit notification | How to track this message. Used to be able to uniquely find the message from both sides. |    Production     |          |

Now this is just the start of a HL7 message. Normally, after this, there are plenty of other segments included that you might need to include as part of your application build to be able to interoperate between systems following their specific requirements.

The way this would be built using this library:

```ts
import {HL7_2_3} from "node-hl7-client/hl7" // note this the spefications are a submobule
const message = new Message({
  specification: new HL7_2_3(), // we are doing spec 2.3
  messageHeader: {
    msh_9_1: 'ADT', // required, there is "set" table of data this can be
    msh_9_2: 'A01', // required, there is "set" table of data this can be
    msh_10: 'Q150084616T145947960', // randomized by the class or set by you.
    msh_11_1: 'P'   // required
  }
})
message.set('MSH.3', 'HNAM_PM')   // not required
message.set('MSH.4', 'HNA500')    // not required
message.set('MSH.5', 'AIG')       // not required
message.set('MSH.7', '20131017140041') // note: this is not required normally as Message sets this automaticlly, but you can override 
```
And at this point you could use the [Client](../client/index.md) to send it off to a server/broker. HL7 messages _are_ always in plain text. They are not encrypted. This library aims to change that by allowing you to create a TLS connection. HTTPS "REST POST" can be done as well, however, you would need to take the result and send it over for the other side to interrupt. This package doesn't include an HTTP client. As far as the security field, it was built into the specification, but has yet to be used for anything.

To export this code back into a string, you can easily do:

```ts
const myMessageString: string = message.toString()
```

And, Voilà! You can now send this message as string, with even other segments attached to it to a remote side.

### Adding Segments

While a single MSH segment/header is all that is needed for the remote side, it does no good if you didn't include any information. In an ADT/A01 message type, you normally have the patient's demographic information.

In this next example, we are going to add a [PID](https://hl7-definition.caristix.com/v2/HL7v2.3/Segments/PID) segment that contains it. All fields in this case _are_ optional. Two fields are required, PID.3 and PID.5, but this page does guide us on how to build the PID segment for the other fields

```ts
const PID = message.addSegment('PID') // Adds the PD1 as a segment for this MSH.
PID.set('3', '123456789')   // Ususally the MRN or Billing Order Number
PID.set('5.1', 'Bunny')     // Last name
PID.set('5.2', 'Bugs')      // First name
PID.set('5.7', 'L')         // Indicating what type of name it is. Example here is "Legal"
```

So with this built, the result will be if output from 

```ts
const myMessage: string = message.toString()
```

Comes out to be:

```
MSH|^~\\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3
PID|||123456789||Bunny^Bugs^^^^^L|||||
```

While this is a simple HL7 message, it's still valid. 

### Using Non-Standard Encoding

By default, HL7 standard community has come up with these characters used to encode the HL7 string:

| Encoding Character |      Designates     |
|:------------------:|:-------------------:|
|         \|         |   Field Separator   |
|         ^          | Component Separator |
|         &          |    Sub-Component    |
|         ~          |      Repeating      |
|         \          |  Escape Character   |

These are set by default within this library.
Naturally, the community assumes that these characters shall not be included in normal documentation purposes.
However, on the flip side, this library can provide changing any of the encoding characters as needed to be sent.
The other side just needs to know how to interpret it,
which may or may not need to be sent to a different interface port for parsing.

You can change any of these by setting these options when contracting the Message, Batch, or File Batch classes.

From _normalizedBuilder.ts_:
```ts
  /** The character used to separate different components.
   * @since 1.0.0
   * @default ^ */
  separatorComponent: string
  /** The character used to escape characters that need it in order for the computer to interpret the string correctly.
   * @since 1.0.0
   * @default \\ */
  separatorEscape: string
  /** The character used for separating fields.
   * @since 1.0.0
   * @default | */
  separatorField: string
  /** The character used for repetition field/values pairs.
   * @since 1.0.0
   * @default ~ */
  separatorRepetition: string
  /** The character used to have subcomponents seperated.
   * @since 1.0.0
   * @default & */
  separatorSubComponent: string
```

These can not be set using segment command.

```ts
import {HL7_2_3} from "node-hl7-client/hl7";
const message = new Message({
   specification: new HL7_2_3(), // we are doing spec 2.3
   messageHeader: {
      msh_9_1: 'ADT', // required, there is "set" table of data this can be
      msh_9_2: 'A01', // required, there is "set" table of data this can be
      msh_10: 'Q150084616T145947960', // randomized by the class or set by you.
      msh_11_1: 'P'   // required
   }
})
message.set('MSH.2', '*+-02')   //  this will throw an ecepetio error
```

Valid Example:

```ts
import {HL7_2_3} from "node-hl7-client/hl7";
const message = new Message({
   separatorComponent: "+",
   separatorEscape:  "#",
   separatorField:  "!",
   separatorRepetition: "?",
   separatorSubComponent: "]",
   specification: new HL7_2_3(), // we are doing spec 2.3
   messageHeader: {
      msh_9_1: 'ADT', // required, there is "set" table of data this can be
      msh_9_2: 'A01', // required, there is "set" table of data this can be
      msh_10: 'Q150084616T145947960', // randomized by the class or set by you.
      msh_11_1: 'P'   // required
   }
})
```

### Chain Method Building

This library allows you to chain methods to build segments in a single line for sub-component and repeating fields. 

```ts
message.set('PV1.7').set(0).set(1, 'Jones').set(2, 'John')
message.set('PV1.7').set(1).set(1, 'Smith').set(2, 'Bob')
```

Sets:
```
PV1|||||||^Jones^John~^Smith^Bob
```

## Detailed Examples

### Refactoring the Message Class

When you are sending the same type of HL7 message over and over again,
you can create a function in your code/framework that will generate a new "Message"
object each and everytime the same way, format, etc. so that you have 100% consistency.

For example, if you have this:

```ts
const message = new Message({
   specification: new HL7_2_3(), // we are doing spec 2.3
   messageHeader: {
      msh_9_1: 'ADT', // required, there is "set" table of data this can be
      msh_9_2: 'A01', // required, there is "set" table of data this can be
      msh_11_1: 'P'   // required
   }
})
```
... you can do it again later in the code:

```ts
const newMessage = new Message({
  specification: new HL7_2_3(), // we are doing spec 2.3
  messageHeader: {
    msh_9_1: 'ADT', // required, there is "set" table of data this can be
    msh_9_2: 'A01', // required, there is "set" table of data this can be
    msh_11_1: 'P'   // required
  }
})
```

The issue gets messy. So wrapping this in a function like ```createADT_A01```:

```ts
const createADT_A01 = () => {
   return new Message({
      messageHeader: {
         msh_9_1: 'ADT',
         msh_9_2: 'A01',
         msh_11_1: 'P'
      }
   })
}
```

will create a new object each time and your developers wouldn't have to use the entire Message specs.
Your developers would just need to use:

```ts
const messageOne = createADT_A01()
const messageTwo = createADT_A01()
```

You can
if you want
pass any parameter into your ```createADT_A01``` function as long in the end
the Message class is being properly created.
