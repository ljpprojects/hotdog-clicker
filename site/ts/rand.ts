export const randomInt16 = (): number => {
  const randomBytes = new Int16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomInt32 = (): number => {
  const randomBytes = new Int32Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomUint16 = (): number => {
  const randomBytes = new Uint16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0];
};

export const randomUint32 = (): number => {
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
  for (const r = randomUint32(); ; ) {
    if (r >= t) {
      return r % N;
    }
  }
};
