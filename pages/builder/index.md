# Node HL7 Client :: Builder

## Introduction

The Node HL7 Client builder makes it easy to construct HL7 messages. It focuses on three primary components:

* **Message**
* **Batch**
* **File Batch**

The core functionality lies in the `Message` class (`@see Message`), which constructs HL7 messages—starting with the MSH segment—to be sent to a server or broker.

However, if your application needs to process and send multiple messages at once, you can group them into a **Batch** (starting with a BHS segment). While the receiving system parses these as individual messages, you can include a unique Batch ID in each MSH segment for traceability.

You can also group Messages or Batches into a **File Batch** (starting with an FHS segment). This is useful for generating flat files that can be inspected or processed manually, often required by legacy applications, developers, or support staff.

> 💡 **Note**: HL7 messages are composed of segments, each represented by a three-character code (e.g., `MSH`, `PID`). HL7 2.x standards (2.1–2.8) strictly require these segment names to be exactly three characters long.

This library assumes familiarity with HL7 standards—it teaches how to use the builder, not how HL7 itself works.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Main Contents of HL7](#main-contents-of-hl7)
   * [Building a Sample HL7 MSH Segment](#building-a-sample-hl7-msh-segment)
   * [Using Non-Standard Encoding](#using-non-standard-encoding)
   * [Chain Method Building](#chain-method-building)
3. [Detailed Examples](#detailed-examples)
   * [Refactoring the Message Class](#refactoring-the-message-class)

## Main Contents of HL7

### HL7 Specifications

HL7 standards range from version 2.1 to 2.8. For segment definitions and version-specific differences, refer to [Caristix HL7 Definitions](https://hl7-definition.caristix.com/v2/).

One key difference across versions lies in the `MSH.9.3` field:

* **HL7 v2.1–2.3.1**: `MSH.9.3` is a combination of `MSH.9.1` and `MSH.9.2`
* **HL7 v2.4+**: You can optionally set `MSH.9.3` to `ACK` or a composite string

**Example** (using HL7 2.4):

```ts
const message = new Message({
  specification: new HL7_2_4(),
  messageHeader: {
    msh_9_1: "ADT",
    msh_9_2: "A01",
    msh_9_3: "ACK",
    msh_10: "12345",
    msh_11_1: "D",
    msh_11_2: "A",
  },
});
```

**Resulting HL7 MSH Segment:**

```
MSH|^~\&|||||20081231||ADT^A01^ACK|12345|D^A|2.4
```

If `msh_9_3` is omitted:

```
MSH|^~\&|||||20081231||ADT^A01^ADT_A01|12345|D^A|2.4
```

### Building a Sample HL7 MSH Segment

All HL7 messages begin with an MSH segment. While Batch and File Batch messages encapsulate multiple messages, each message still starts with its own MSH.

Here is a sample MSH segment (from HL7 v2.3):

```
MSH|^~\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3
```

**Field Breakdown** ([View full MSH reference](https://hl7-definition.caristix.com/v2/HL7v2.3/Segments/MSH)):

| Field     | Description                             |     |
| --------- | --------------------------------------- | --- |
| `MSH.1`   | Field separator (\`                     | \`) |
| `MSH.2`   | Encoding characters (`^~\&`)            |     |
| `MSH.3`   | Sending application (`HNAM_PM`)         |     |
| `MSH.4`   | Sending facility (`HNA500`)             |     |
| `MSH.5`   | Receiving application (`AIG`)           |     |
| `MSH.7`   | Date/Time of message (`YYYYMMDDHHMMSS`) |     |
| `MSH.9.1` | Message type (`ADT`)                    |     |
| `MSH.9.2` | Trigger event (`A01`)                   |     |
| `MSH.10`  | Message control ID                      |     |
| `MSH.11`  | Processing ID (`P` for production)      |     |
| `MSH.12`  | HL7 version (`2.3`)                     |     |

**Creating the message in code:**

```ts
import { HL7_2_3 } from "node-hl7-client/hl7";

const message = new Message({
  specification: new HL7_2_3(),
  messageHeader: {
    msh_9_1: "ADT",
    msh_9_2: "A01",
    msh_10: "Q150084616T145947960",
    msh_11_1: "P",
  },
});

message.set("MSH.3", "HNAM_PM");
message.set("MSH.4", "HNA500");
message.set("MSH.5", "AIG");
message.set("MSH.7", "20131017140041"); // Optional override; auto-set by default
```

**Exporting to a string:**

```ts
const hl7String = message.toString();
```

This message can then be sent to a broker or HL7 server. Note that HL7 messages are plain text. To secure them, consider sending over a TLS or HTTPS transport. This library supports TLS but not HTTP out of the box.

### Adding Segments

A valid message starts with `MSH`, but it's often necessary to include additional segments such as `PID` for patient information.

```ts
const PID = message.addSegment("PID");
PID.set("3", "123456789");     // Patient ID (e.g., MRN)
PID.set("5.1", "Bunny");       // Last name
PID.set("5.2", "Bugs");        // First name
PID.set("5.7", "L");           // Name type (e.g., Legal)
```

**Resulting HL7 Message:**

```
MSH|^~\&|HNAM_PM|HNA500|AIG||20131017140041||ADT^A01|Q150084616T145947960|P|2.3
PID|||123456789||Bunny^Bugs^^^^^L|||||
```

### Using Non-Standard Encoding

Default HL7 encoding characters:

| Character | Meaning                |                 |
| --------- | ---------------------- | --------------- |
| \`        | \`                     | Field separator |
| `^`       | Component separator    |                 |
| `&`       | Subcomponent separator |                 |
| `~`       | Repetition separator   |                 |
| `\`       | Escape character       |                 |

These are configurable when instantiating a `Message`, `Batch`, or `FileBatch`:

```ts
const message = new Message({
  separatorComponent: "^",
  separatorEscape: "\\",
  separatorField: "|",
  separatorRepetition: "~",
  separatorSubComponent: "&",
});
```

Note: Encoding characters cannot be set using the `.set()` method on a segment—they must be set during initialization.



| Encoding Character |     Designates      |
| :----------------: | :-----------------: |
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
separatorComponent: string;
/** The character used to escape characters that need it in order for the computer to interpret the string correctly.
 * @since 1.0.0
 * @default \\ */
separatorEscape: string;
/** The character used for separating fields.
 * @since 1.0.0
 * @default | */
separatorField: string;
/** The character used for repetition field/values pairs.
 * @since 1.0.0
 * @default ~ */
separatorRepetition: string;
/** The character used to have subcomponents seperated.
 * @since 1.0.0
 * @default & */
separatorSubComponent: string;
```

These can not be set using segment command.

```ts
import { HL7_2_3 } from "node-hl7-client/hl7";

const message = new Message({
  specification: new HL7_2_3(), // we are doing spec 2.3
  messageHeader: {
    msh_9_1: "ADT", // required, there is "set" table of data this can be
    msh_9_2: "A01", // required, there is "set" table of data this can be
    msh_10: "Q150084616T145947960", // randomized by the class or set by you.
    msh_11_1: "P", // required
  },
});
message.set("MSH.2", "*+-02"); //  this will throw an ecepetio error
```

Valid Example:

```ts
import { HL7_2_3 } from "node-hl7-client/hl7";

const message = new Message({
  separatorComponent: "+",
  separatorEscape: "#",
  separatorField: "!",
  separatorRepetition: "?",
  separatorSubComponent: "]",
  specification: new HL7_2_3(), // we are doing spec 2.3
  messageHeader: {
    msh_9_1: "ADT", // required, there is "set" table of data this can be
    msh_9_2: "A01", // required, there is "set" table of data this can be
    msh_10: "Q150084616T145947960", // randomized by the class or set by you.
    msh_11_1: "P", // required
  },
});
```

### Chain Method Building

This library allows you to chain methods to build segments in a single line for sub-component and repeating fields.

```ts
message.set("PV1.7").set(0).set(1, "Jones").set(2, "John");
message.set("PV1.7").set(1).set(1, "Smith").set(2, "Bob");
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

```ts
const createADT_A01 = (messageControlId: string) => {
  return new Message({
    messageHeader: {
      msh_9_1: "ADT",
      msh_9_2: "A01",
      msh_10: messageControlId, // dynamically set
      msh_11_1: "P",
    },
  });
};
```

Now your developers can create multiple unique messages while reusing the same base structure:

```ts
const messageOne = createADT_A01("Q150084616T145947960");
const messageTwo = createADT_A01("Q150084617T145947961");
```

This pattern keeps your code clean, consistent, and easy to maintain — especially when working with multiple HL7 messages of the same type.
