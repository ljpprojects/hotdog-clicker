import { hds, hdnw } from "./game"
import { taxPopupElement } from "./elements";

export const doJoke = () => {
  const time = new Date(Date.now())

  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const hourUTC = time.getUTCHours();
  const minuteUTC = time.getUTCMinutes();
  const secondUTC = time.getUTCSeconds();

  if ((hour + second - minute) % 2 === 0 || (hourUTC + secondUTC - minuteUTC) % 2 === 0) {
    // Tax the player
    taxationJoke()
  }

  setTimeout(doJoke, 42069 * Math.random())
}

type TaxBracket = "broke" |
  "poor" |
  "barely" |
  "wealthy" |
  "well-off" |
  "rich" |
  "no-life" |
  "touch-grass"

const getTaxBracket = (): TaxBracket => {
  const determiners: Record<TaxBracket, (w: number) => boolean> = {
    "broke": (w) => w <= 1e3,
    "poor": (w) => w > 1e3 && w <= 1e4,
    "barely": (w) => w > 1e4 && w <= 1e5,
    "wealthy": (w) => w > 1e5 && w <= 1e6,
    "well-off": (w) => w > 1e6 && w <= 1e7,
    "rich": (w) => w > 1e7 && w <= 1e8,
    "no-life": (w) => w > 1e8 && w <= 1e10,
    "touch-grass": (w) => w > 1e10,
  }

  for (const [k, v] of Object.entries(determiners)) {
    if (v(hds.value)) {
      return k as TaxBracket
    }
  }

  return "broke"
}

// Whenever this function is ran, immediately tax the player's income
const taxationJoke = () => {
  // Get the tax bracket of the player
  const bracket = getTaxBracket()

  const bracketTaxRateMap: Record<TaxBracket, number> = {
    "broke": 1 / 5,
    "poor": 2 / 7,
    "barely": 6 / 19,
    "wealthy": 2 / 5,
    "well-off": 4 / 7,
    "rich": 3 / 5,
    "no-life": 4 / 5,
    "touch-grass": 19 / 20,
  }

  const gross = hds.value

  // TAX TIME!!!!!!!!!!!!!!!!!!!!!!!

  const net = hds.value * (1 - bracketTaxRateMap[bracket])

  hds.value = net

  console.log("You have been TAXED")

  taxPopupElement.classList.remove("hide")

  setTimeout(() => taxPopupElement.classList.add("hide"), 3000)
}
