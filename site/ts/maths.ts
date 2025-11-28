export const INCREMENT: number = 1.3;

/**
 * Given the current price of the asset and how many of it are owned, get the new price of that asset.
 * ```
 *                 c
 * f(x, c) = Px +  ─
 *                 P
 * ```
 *
 * Where `P = INCREMENT`
 *
 * @param price The current price of the asset
 * @param count The count of how many of that asset is owned
 * @returns The new price
 */
export const increase = (price: number, count: number): number => {
  return price * INCREMENT + count / INCREMENT;
};

/**
 * Given the starting price of an asset and how many of it are owned, calculate
 * the current price of that asset.
 *
 * This is (in my limited testing!!!!) mathematically equivalent to
 * ```
 *                              ₙ₋₂       ₙ₋₂
 * f(x, n) = xPⁿ + (c - 2)  *   Σ Pⁱ  -  Σ iPⁱ
 *                              ⁱ⁼⁻¹     ⁱ⁼⁻¹
 * ```
 *
 * Or, in closed form:
 *
 * ```
 * f(x, n) = xPⁿ + P⁻¹
 *
 *              nP⁻¹ - 2P⁻¹ - nPⁿ⁻¹ + 2Pⁿ⁻¹
 *           +  ───────────────────────────
 *                         1 - P
 *
 *              P - nPⁿ⁻¹ + Pⁿ⁻¹ + nPⁿ - 2Pⁿ
 *           -  ────────────────────────────
 *                        1 - 2P + P²
 * ```
 *
 * @param startPrice The starting price of the asset
 * @param count How many of the asset is owned
 * @returns The current price of the asset
 */
export const calcCost = (startPrice: number, count: number) => {
  let acc = startPrice;

  for (let i = 0; i < count; i++) {
    acc = increase(acc, i);
  }

  return acc;
};

/**
 * Calculate the inverse of calcCost by calculating the inverse of its closed
 * form alterative
 *
 * ```
 * f(x, n) = xPⁿ + P⁻¹
 *
 *             nP⁻¹ - 2P⁻¹ - nPⁿ⁻¹ + 2Pⁿ⁻¹
 *          +  ───────────────────────────
 *                        1 - P
 *
 *             P - nPⁿ⁻¹ + Pⁿ⁻¹ + nPⁿ - 2Pⁿ
 *          -  ────────────────────────────
 *                       1 - 2P + P²
 * ```
 *
 * This is trivial because all but the first term are independent from x
 */
export const calculateStartingPrice = (currentPrice: number, count: number) => {
  // P⁻¹
  const second_term = 1 / INCREMENT;

  // Pⁿ
  const first_intermediate = Math.pow(INCREMENT, count);

  // Pⁿ⁻¹
  const second_intermediate = first_intermediate / INCREMENT;

  // nP⁻¹ - 2P⁻¹ - nPⁿ⁻¹ + 2Pⁿ⁻¹
  // ───────────────────────────
  //           1 - P
  const third_term =
    (count * second_term
      - 2 * second_term
      - count * second_intermediate
      + 2 * second_intermediate) / (1 - INCREMENT);

  // P - nPⁿ⁻¹ + Pⁿ⁻¹ + nPⁿ - 2Pⁿ
  // ────────────────────────────
  //          1 - 2P + P²
  const fouth_term =
    (INCREMENT
      - count * second_intermediate
      + second_intermediate
      + count * first_intermediate
      + 2 * first_intermediate) / (1 - 2 * INCREMENT + Math.pow(INCREMENT, 2))

  const startPrice = (currentPrice + fouth_term - third_term - second_term) / first_intermediate;

  return startPrice;
}
