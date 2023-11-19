/* istanbul ignore next */

import EventEmitter from "node:events";

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface Deferred<T=any> {
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: any) => void
  promise: Promise<T>
}

export function createDeferred<T=any>(noUncaught?: boolean): Deferred<T> {
  let dfd: any = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  /* istanbul ignore next */
  if (noUncaught) {
    dfd.promise.catch(() => {})
  }
  return dfd
}

export function expectEvent<T=any>(emitter: EventEmitter, name: string|symbol): Promise<T> {
  return new Promise<T>((resolve) => { emitter.once(name, resolve) })
}