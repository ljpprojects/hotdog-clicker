export const NaNNullCoerce = function <T>(n: T | null | undefined, to: T): T {
  return typeof n == "number"
    ? Number.isNaN(n)
      ? to
      : n ?? to
    : n ?? to
}

/**
 * Waits for a certain amount of time, resolving once that duration has passed.
 * @param ms The amount of milliseconds to wait before resolving.
 * @returns A promise that resolves after the given time.
 */
export const wait = async (ms: number): Promise<void> => {
  return new Promise(res => {
    setTimeout(res, ms)
  })
};

export type TimeoutError = "Error: promise timed out";
export const TIMEOUT_ERROR: TimeoutError = "Error: promise timed out";

/**
 * Waits for a certain amount of time, rejecting once that duration has passed.
 * @param ms The amount of milliseconds to wait before rejecting.
 * @returns A promise that rejects after the given time.
 */
export const timeout = async (ms: number): Promise<TimeoutError> => {
  return new Promise((_, rej) => {
    setTimeout(rej, ms, TIMEOUT_ERROR)
  })
};

/**
 * Introduces a timeout on a promise.
 * @param task The promise to introduce a timeout on.
 * @param ms The time to wait before timing out the task.
 * @returns A promise that has either the resolved promise's value or a TimeoutError.
 */
export const withTimeout = async function _<T>(task: Promise<T>, ms: number): Promise<T | TimeoutError> {
  return Promise.race([task, timeout(ms)])
};

/**
 * Performs a wrapping add on two numbers.
 * The output is always less than thresh.
 * @param x The first number
 * @param y The second number
 * @param thresh The threshold at which to wrap the value
 * @returns The wrapped sum
 */
export const wrappingAdd = (x: number, y: number, thresh: number) => (x + y) % thresh
