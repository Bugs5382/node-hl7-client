# Node HL7 Client :: Builder

## Introduction

The builder is very easy to use. It's made so you can easily build an Hl7 message with ease. It has three main parts:

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

## Main Contents of HL7

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
const PID = message.addSegment('PID') // adds the PD1 to to the PD1.1 field
PID.set('3', 'UniqueIDForPatent')    // ususally the MRN or Billing Order Number
PID.set('5.1', 'Bunny')   // last name
PID.set('5.2', 'Bugs')    // first name
PID.set('5.7', 'L')       // indicating what type of name it is. Example here is "Legal"
```

Sp with this built, the result will be if outputed from 

```ts
const myMessage: string = message.toString()
```

Comes out to be:

```
MSH|^~\\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3
PID|||UniqueIDForPatent||Bunny^Bugs^^^^^L|||||
```
 
