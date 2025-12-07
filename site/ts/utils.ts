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

type DeepObject<T> = {
  [P in keyof T]: DeepObject<T[P]> | T[P];
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
}

export const deepFreeze = function <T extends { [name: string]: any }>(obj: T): DeepReadonly<T> {
  const propNames = Object.getOwnPropertyNames(obj);
  const newObj: DeepObject<T> = obj;

  propNames.forEach((name) => {
    const prop = obj[name];

    if (typeof prop === 'object' && prop !== null) {
      // @ts-ignore
      newObj[name] = deepFreeze(prop);
    }
  });

  return newObj as DeepReadonly<T>;
};

export const equal = function <A, B>(lhs: A, rhs: B): boolean {
  if (typeof lhs !== typeof rhs) {
    return false;
  }

  if (lhs != null && rhs != null && Array.isArray(lhs) && Array.isArray(rhs)) {
    return lhs.length === rhs.length && lhs.every((v, i) => equal(v, rhs[i]))
  }

  if (lhs != null && rhs != null && typeof lhs === "object" && typeof rhs === "object") {
    return deepEqual(lhs, rhs)
  }

  return lhs as any === rhs as any;
}

export const arraysOverlap = function <A, B>(a: A[], b: B[]) {
  const [largest, smallest]: [any[], any[]] = a.length <= b.length ? [a, b] : [b, a];

  return smallest.every(v => largest.includes(v))
}

export const deepEqual = function <A extends { [name: string]: any }, B extends { [name: string]: any }>(lhs: A, rhs: B) {
  // Check if they are the same reference
  if (lhs as object === rhs as object) {
    return true;
  }

  const
    keysA = Object.getOwnPropertyNames(lhs),
    keysB = Object.getOwnPropertyNames(rhs);

  console.log(keysA, keysB);

  if (!arraysOverlap(keysA, keysB)) {
    return false;
  }

  if (keysA.some((k, i) => !equal(lhs[k], rhs[k]))) {
    return false;
  }

  return true;
}
