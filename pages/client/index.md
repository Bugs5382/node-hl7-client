# Node HL7 Client :: Client

## Introduction

To send an HL7 message, your client must connect to a server or broker that accepts messages on a specific port. Traditionally, this communication has used the TCP/MLLP protocol. UDP is not generally used because clients typically need confirmation that their message was received and accepted by the server.

While HTTPS/HTTP (via REST APIs) has become more common in modern architectures, this library currently supports only the traditional TCP/MLLP transport. MLLP does not natively provide encryption, but since HL7 messages are often exchanged within trusted networks or over secure IPSEC tunnels, additional message-level security has not always been prioritized.

> **Note:** Future versions of this library may include hooks that allow message encryption prior to transmission. The recipient would be responsible for decrypting the message before processing.

In many HL7 environments, multiple ports on the same server handle different types of messages (e.g., ADT vs. ORU), each associated with a specific workflow. While most systems use dedicated ports for specific message types, some can handle multiple types on the same port and parse accordingly.

Let's walk through how to get started using this library's `Client`.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)
3. [Running in Kubernetes](#running-in-kubernetes)

## Basic Usage

This library supports connections over IPv4, IPv6, or Fully Qualified Domain Names (FQDNs).

> **Note:** IPv4 and IPv6 formats are validated for correctness. FQDNs are not checked against DNS for resolution.

> **Note:** The IP addresses shown in this documentation follow [RFC5737](https://datatracker.ietf.org/doc/html/rfc5737) and [RFC3849](https://datatracker.ietf.org/doc/html/rfc3849) for documentation use. Replace them with actual internal or external IPs in production.

### Step 1: Create the Client

```ts
const client = new Client({ host: "192.0.2.1" });
```

This initializes a client targeting `192.0.2.1`, but does not yet establish a connection.

### Step 2: Create an Outbound Connection

HL7 messages are sent to specific ports. You must initiate an outbound connection to begin sending.

```ts
const OB_ADT = client.createConnection({ port: 5678 }, async (res) => {
  const messageRes = res.getMessage();
  const status = messageRes.get("MSA.1").toString(); // MSA is the Message Acknowledgment Segment

  if (status === "AA") {
    // Message was accepted successfully
  } else {
    // The message may have failed to process
  }
});
```

### Step 3: Send a Message

```ts
await OB_ADT.sendMessage(message); // `message` must be a Message object, not a raw string.
```

Outbound connections are persistent by design. This allows multiple messages to be sent without repeatedly re-establishing the connection.

If the connection drops, the library will attempt to reconnect up to 10 times (or a user-defined limit) before giving up. If reconnection fails, your application will need to restart the connection process.

### Step 4: Close the Connection

To permanently close a connection without attempting to reconnect:

```ts
await OB_ADT.close();
```

## Saved Messages

This library allows you to override the default in-memory message queue behavior
by supplying your own message queuing logic.
You can provide two functions:

- `enqueueMessage(message)` – called when a message is ready to be stored.
- `flushQueue(callback)` – called to retrieve messages and deliver them back to the client for processing.

### Default Behavior (In-Memory)

If you don't supply these functions, messages are stored in an internal array (`_pendingMessages`), and flushed in order.

Example (default):

```ts
this._enqueueMessageFn =
  props.enqueueMessage ??
  ((message: Message | Batch | FileBatch) =>
    this._pendingMessages.push(message));

this._flushQueueFn =
  props.flushQueue ??
  ((cb: (message: Message | Batch | FileBatch) => void) => {
    while (this._pendingMessages.length > 0) {
      const msg = this._pendingMessages.shift();
      if (typeof msg !== "undefined") {
        cb(msg);
      }
    }
  });
```

### Custom Behavior (Using Redis)

You can override the default queue to use Redis or any other external storage like RabbitMQ, file-based queues, etc.

**Redis Example (with `node-redis`):**

```ts
import { createClient } from "@redis/client";

const redis = createClient(); // assumision your server is put in here
await redis.connect();

const enqueueMessage = async (message: Message | Batch | FileBatch) => {
  await redis.lPush("hl7queue", message.toString());
};

const flushQueue = async (
  callback: (message: Message | Batch | FileBatch) => void,
) => {
  while ((await redis.lLen("hl7queue")) > 0) {
    const result = await redis.blPop("hl7queue", 1); // 1 second timeout

    if (result && result.element) {
      const msg = new Message({ text: result.element });
      callback(msg);
    }
  }
};

const client = new Client({ host: "0.0.0.0" });

// Create connection without auto-connecting
const outbound = client.createConnection(
  {
    port,
    autoConnect: false,
    enqueueMessage,
    flushQueue,
  },
  async () => {}, // simplied here
);
```

**Important:**

- `enqueueMessage` must be a synchronous or non-async function.
- `flushQueue` can be `async`, but it should call `callback(message)` rather than processing the message directly.
- The message passed to `enqueueMessage` is always one of `Message`, `Batch`, or `FileBatch`.

This flexible queuing system allows seamless integration with external storage systems—such as Redis, RabbitMQ, databases, or even flat files—enabling you to offload in-memory storage and better manage system resources.

> 🔐 **Data Safety Warning:**
> If using shared queues (like Redis), **tag or isolate messages per client instance** to prevent sending messages to the wrong downstream service. Mismatching or leaking data between client/ports can result in serious issues in production systems.

### ⚙️ Scalability & Message Reliability in Kubernetes

This library has been **successfully tested** running across **multiple pod instances** in a **Kubernetes** environment. Because this is an **outbound client connection**, the upstream HL7 server or broker returns its response to the **same client instance** that initiated the request.

> ⚠️ **Important Note on Reliability:**
> If a pod sends a message and then crashes or is terminated **before receiving the response**, that response may be **lost permanently** unless handled by an external failover or retry strategy.

### 💾 Offloading Messages with Custom Queues

When inside Kubertnues setup you should use custom logic to store outbound messages (via `enqueueMessage`) ,
you must avoid using the built-in in-memory storage within the pod.
Always offload the queue to a **persistent, external system** such as:

- Redis (Prefered)
- RabbitMQ
- SQL/NoSQL Databases
- Flat files or S3 buckets (need Presentation Storage)

This ensures your message queue is resilient to pod restarts, crashes, and horizontal scaling.

> 🔐 **Data Safety Warning:**
> If using shared queues (like Redis), **tag or isolate messages per client instance** to prevent sending messages to the wrong downstream service. Mismatching or leaking data between client/ports can result in serious issues in production systems.
