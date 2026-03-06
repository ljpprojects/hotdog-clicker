import { pageLoadedGetRandomValues } from "./game";
import { wipe } from "./save";

export const tamperingLikely = (): boolean => {
  if (crypto.getRandomValues !== pageLoadedGetRandomValues) {
    return true;
  }

  // This would immediately throw for a correct implementation
  const test2 = new Uint8Array(65537);
  try {
    crypto.getRandomValues(test2);

    return true;
  } catch {
    // Do nothing, this is expected.
  }

  return false;
};

// If we are here things are bad
export const tamperingEvenMoreLikely = (): boolean => {
  // First test: make sure the function still rejects appropriate values
  const testValues = [
    "string",
    420, // Number
    NaN,
    Infinity,
    true, // Boolean
    {
      // Object
      no: "tampering",
    },
    {
      // Object that looks like an array
      length: 3,
      0: 420,
      1: 69,
      2: 890,
    },
    [1, 2, 3], // Actual array
    () => "Function",
    null,
    undefined,
  ];

  // Check if ANY of the values are accepted
  // If any is, the function has been tampered
  for (const value of testValues) {
    try {
      // @ts-expect-error
      crypto.getRandomValues(value);

      return true;
    } catch {
      continue;
    }
  }

  // If we are even here this is either the actual one or very sophisticated tampered one

  // Maybe they forgot to make it return the same value?
  const test = new BigUint64Array(8);
  if (crypto.getRandomValues(test) !== test) {
    return true;
  }

  // Basic check also just to make sure it hasnt been obviously tampered with
  // @ts-ignore
  if (test.reduce((a, v) => (a.includes(v) ? a : [...a, v]), []).length < 7) {
    // If we have only 7 unique values after getting 8 "random" 64-bit numbers just reject it anyway, even if it is the real deal
    return true;
  }

  return false;
};

export const randomInt16 = (): number => {
  if (tamperingLikely()) {
    throw "Bitch don't tamper with the RNG";
  } else if (tamperingEvenMoreLikely()) {
    wipe().then(() => window.location.reload());

    throw "YOU THINK YOU'RE SO FUCKING SMART?????? WELL BITCH, YOU AREN'T. WE CAUGHT YOU. GET YOUR SAVE FUCKING WIPED.";
  }

  const randomBytes = new Int16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomInt32 = (): number => {
  if (tamperingLikely()) {
    throw "Bitch don't tamper with the RNG";
  } else if (tamperingEvenMoreLikely()) {
    wipe().then(() => window.location.reload());

    throw "YOU THINK YOU'RE SO FUCKING SMART?????? WELL BITCH, YOU AREN'T. WE CAUGHT YOU. GET YOUR SAVE FUCKING WIPED.";
  }

  const randomBytes = new Int32Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomUint16 = (): number => {
  if (tamperingLikely()) {
    throw "Bitch don't tamper with the RNG";
  } else if (tamperingEvenMoreLikely()) {
    wipe().then(() => window.location.reload());

    throw "YOU THINK YOU'RE SO FUCKING SMART?????? WELL BITCH, YOU AREN'T. WE CAUGHT YOU. GET YOUR SAVE FUCKING WIPED.";
  }

  const randomBytes = new Uint16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomUint32 = (): number => {
  if (tamperingLikely()) {
    throw "Bitch don't tamper with the RNG";
  } else if (tamperingEvenMoreLikely()) {
    wipe().then(() => window.location.reload());

    throw "YOU THINK YOU'RE SO FUCKING SMART?????? WELL BITCH, YOU AREN'T. WE CAUGHT YOU. GET YOUR SAVE FUCKING WIPED.";
  }

  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

/**
 * Uses OpenBSD's method to get a random number up to a limit without bias
 * (see https://www.pcg-random.org/posts/bounded-rands.html)
 * @param n The number which all outputs will be less than (x < n)
 */
export const randomIntUpTo = (N: number) => {
  const t = 2 ** 32 % N;
  for (let r = randomUint32(); ; r = randomUint32()) {
    if (r >= t) {
      return r % N;
    }
  }
};
