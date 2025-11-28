export const randomInt16 = (): number => {
  const randomBytes = new Int16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0]
};

export const randomInt32 = (): number => {
  const randomBytes = new Int32Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0]
};

export const randomUint16 = (): number => {
  const randomBytes = new Uint16Array(1);
  crypto.getRandomValues(randomBytes);

  return randomBytes[0]
};

export const randomUint32 = (): number => {
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);

  return 7//randomBytes[0]
};
