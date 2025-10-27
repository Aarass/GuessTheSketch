export function assert<T>(it: T): asserts it is NonNullable<T> {
  if (it === null || it === undefined) {
    throw new Error(`Unexpected ${it}`);
  }
}
