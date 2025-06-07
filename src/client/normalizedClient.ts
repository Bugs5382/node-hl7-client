import { HL7FatalError } from "@/helpers/exception";
import { ClientListenerOptions, ClientOptions } from "@/modules/types";
import { assertNumber } from "@/utils";
import { validIPv4, validIPv6 } from "@/utils/ipAddress";
import { TcpSocketConnectOpts } from "node:net";
import type { ConnectionOptions as TLSOptions } from "node:tls";

const DEFAULT_CLIENT_OPTS = {
  encoding: "utf-8",
  connectionTimeout: 0,
  maxAttempts: 10,
  maxConnectionAttempts: 10,
  maxTimeout: 10,
  retryHigh: 30000,
  retryLow: 1000,
};

const DEFAULT_LISTEN_CLIENT_OPTS = {
  autoConnect: true,
  maxAttempts: 10,
  maxConnectionAttempts: 10,
  waitAck: true,
  maxLimit: 10000,
};

type ValidatedClientKeys = "host" | "connectionTimeout";

type ValidatedClientListenerKeys =
  | "autoConnect"
  | "port"
  | "maxAttempts"
  | "maxConnectionAttempts";

interface ValidatedClientOptions
  extends Pick<Required<ClientOptions>, ValidatedClientKeys> {
  connectionTimeout: number;
  host: string;
  maxTimeout: number;
  retryHigh: number;
  retryLow: number;
  socket?: TcpSocketConnectOpts;
  tls?: TLSOptions;
}

interface ValidatedClientListenerOptions
  extends Pick<Required<ClientListenerOptions>, ValidatedClientListenerKeys> {
  autoConnect: boolean;
  encoding: BufferEncoding;
  extendMaxLimit: boolean;
  port: number;
  maxAttempts: number;
  maxConnectionAttempts: number;
  maxLimit: number;
  notifyOnLimitExceeded: boolean;
  retryHigh: number;
  retryLow: number;
  waitAck: boolean;
}

/** @internal */
export function normalizeClientOptions(
  raw?: ClientOptions,
): ValidatedClientOptions {
  const props: any = { ...DEFAULT_CLIENT_OPTS, ...raw };

  if (typeof props.host === "undefined" || props.host.length <= 0) {
    throw new HL7FatalError(
      "host is not defined or the length is less than 0.",
    );
  }

  if (props.ipv4 === true && props.ipv6 === true) {
    throw new HL7FatalError(
      "ipv4 and ipv6 both can't be set to be both used exclusively.",
    );
  }

  if (
    typeof props.host !== "string" &&
    props.ipv4 === false &&
    props.ipv6 === false
  ) {
    throw new HL7FatalError("host is not valid string.");
  } else if (
    typeof props.host === "string" &&
    props.ipv4 === true &&
    props.ipv6 === false
  ) {
    if (!validIPv4(props.host)) {
      throw new HL7FatalError("host is not a valid IPv4 address.");
    }
  } else if (
    typeof props.host === "string" &&
    props.ipv4 === false &&
    props.ipv6 === true
  ) {
    if (!validIPv6(props.host)) {
      throw new HL7FatalError("host is not a valid IPv6 address.");
    }
  }

  if (props.tls === true) {
    props.tls = {};
  }

  assertNumber(props, "connectionTimeout", 0, 60000);
  assertNumber(props, "maxTimeout", 1, 50);

  return props;
}

/** @internal */
export function normalizeClientListenerOptions(
  client: ClientOptions,
  raw?: ClientListenerOptions,
): ValidatedClientListenerOptions {
  const props: any = { ...DEFAULT_LISTEN_CLIENT_OPTS, ...raw };

  if (typeof props.port === "undefined") {
    throw new HL7FatalError("port is not defined.");
  }

  if (typeof props.port !== "number") {
    throw new HL7FatalError("port is not valid number.");
  }

  if (typeof props.retryHigh === "undefined") {
    props.retryHigh = client.retryHigh;
  }

  if (typeof props.retryLow === "undefined") {
    props.retryLow = client.retryLow;
  }

  if (
    typeof props.enqueueMessage !== "undefined" &&
    typeof props.flushQueue === "undefined"
  ) {
    throw new HL7FatalError("flushQueue is not set.");
  }

  if (
    typeof props.enqueueMessage == "undefined" &&
    typeof props.flushQueue !== "undefined"
  ) {
    throw new HL7FatalError("enqueueMessage is not set.");
  }

  assertNumber(props, "maxLimit", 1);
  assertNumber(props, "maxAttempts", 1, 50);
  assertNumber(props, "maxConnectionAttempts", 1, 50);
  assertNumber(props, "port", 1, 65353);

  return props;
}
