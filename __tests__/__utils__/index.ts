import EventEmitter from "node:events";

/** @internal */
export const sleep = async (ms: number): Promise<unknown> => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

/** @internal */
export const expectEvent = async <T = any>(
  emitter: EventEmitter,
  name: string | symbol,
): Promise<T> => {
  return await new Promise<T>((resolve) => {
    emitter.once(name, resolve);
  });
};
