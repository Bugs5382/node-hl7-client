import { Deferred } from "@/declaration/deferred";

/**
 * Create Deferred
 * @since 2.0.0
 * @param noUncaught
 */
export const createDeferred = <T = any>(noUncaught?: boolean): Deferred<T> => {
  const dfd: any = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  /* istanbul ignore next */
  if (noUncaught === false) {
    dfd.promise.catch(() => {});
  }
  return dfd;
};
