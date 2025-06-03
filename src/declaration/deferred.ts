/**
 * @since 2.0.0
 */
export interface Deferred<T = any> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  promise: Promise<T>;
}
