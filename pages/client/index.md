# Node HL7 Client :: Client

## Introduction

To send a HL7 message, your client connects to a server/broker on a port that will accept a message.
THis has been traditionally done over the TCP/MLLP design.
UDP is not generally accepted
since the client usually wants to know if they got a proper response from the server that the message was accepted.

Over time and now that REST API has become more widely accepted,
HTTPS/HTTP can be used as long as the system parses the message correctly.
This method
used not done in this library.
It uses the standard TCP/MLLP which has not generally been secured since the message itself.
From a networking perspective, most HL7 messages do not transit the public internet.
They are internal to each other or over an IPSEC tunnel with a remote site
creating a networking layer separation from normal day-to-day traffic.

> Note: There are plans within this library to allow you to "hook" into the sending sequence and return an encrypted text string and then the other side would have to decrypt it prior to processing the HL7 message.

There might be times when you're connecting to the same server/broker, but over multiple ports.
Each port, usually designed in HL7 interfaced systems, handles a single type of message type.
From ADTs to ORU since the work they are doing is far different.
This is the most common method;
however, some setups can accept both,
parse the messages, and determine their best course of action on the received data.

Thus, let's show you would start using this library Client.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Usage](#basic-usage)
3. [Running in Kubernetes](#running-in-kubernetes)

## Basic Usage

THis library supports IPv4, IPv6, or Fully Qualified Domain Names ("FQDN").

> Note: IPv4 and IPv6 format testing are done to ensure they are correctly formatted. FQDNs are not check that it's resolved correctly from DNS.

> Note: The IP address used in this document follow [RFC5737](https://datatracker.ietf.org/doc/html/rfc5737) and [RFC3849](https://datatracker.ietf.org/doc/html/rfc3849) and are not production IPs. Please use real IPs, either internal or external.

```ts
const client = new Client({ host: "192.0.2.1" });
```

This starts a basic client to host `192.0.2.1`, but no connection has yet to take place.
Since HL7 message are sent to ports,
and to establish a connection you have to start an outbound connection ("OB") and for this example, port `5678`

```ts
const OB_ADT = client.createConnection({ port: 5678 }, async (res) => {
  const messageRes = res.getMessage();
  const check = messageRes.get("MSA.1").toString(); // MSA is a Message Acknoedlgement Segment
  if (check === "AA") {
    // yep. the server got our message.
  } else {
    // something might have gone wrong.
  }
});
```

Now you can send a message to this port by:

```ts
await OB_ADT.sendMessage(message); //  message being a Message object and not the string of the message.
```

Outbound connections are designed to "stay" connected until they need to be closed,
so this way messages can be sent at any time without having to re-establish the connection.

If it does disconnect, the library will attempt to reconnect for up to 10 times,
or user configured, to re-established before closing the connection.
Your app would have to restart the connection process if it completely died.

To close your connection without it trying to reconnect:

```ts
await OB_ADT.close();
```

Will close the connection permanently.

## Running in Kubernetes

In theory (to be tested in the near future)
this library will work on a instance running in Kubernetes including more than one instance of the pod.
Since this is an outbound connection,
the server/broker should be able to return to the instance that sent the message in the first place.
If that instance dies after sending the message and not getting a response,
the response from the server might be lost forever.
