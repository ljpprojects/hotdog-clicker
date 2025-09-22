import { hds, hdnw } from "./game";
import { taxPopupElement } from "./elements";
import BigNumber from "./lib/bignumber";
import { generateTaxed, makeWorkerReq } from "./worker/interfacing";

BigNumber.config({
  DECIMAL_PLACES: 48,
});

export const doJoke = () => {
  const time = new Date(Date.now());

  const hour = time.getHours();
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const hourUTC = time.getUTCHours();
  const minuteUTC = time.getUTCMinutes();
  const secondUTC = time.getUTCSeconds();

  if (
    (hour + second - minute) % 2 === 0 ||
    (hourUTC + secondUTC - minuteUTC) % 2 === 0
  ) {
    console.log("TAXES");
    // Tax the player
    taxationJoke();
  } else {
    console.log("NO TAXES");
  }

  const t = 16942 * Math.random();

  console.log(t);

  setTimeout(doJoke, t);
};

type TaxBracket =
  | "broke"
  | "poor"
  | "barely"
  | "wealthy"
  | "well-off"
  | "rich"
  | "no-life"
  | "touch-grass";

const getTaxBracket = (): TaxBracket => {
  const determiners: Record<TaxBracket, (w: number) => boolean> = {
    broke: (w) => w <= 1e3,
    poor: (w) => w > 1e3 && w <= 1e4,
    barely: (w) => w > 1e4 && w <= 1e5,
    wealthy: (w) => w > 1e5 && w <= 1e6,
    "well-off": (w) => w > 1e6 && w <= 1e7,
    rich: (w) => w > 1e7 && w <= 1e8,
    "no-life": (w) => w > 1e8 && w <= 1e10,
    "touch-grass": (w) => w > 1e10,
  };

  for (const [k, v] of Object.entries(determiners)) {
    if (v(hds.value)) {
      return k as TaxBracket;
    }
  }

  return "broke";
};

// Whenever this function is ran, immediately tax the player's income
const taxationJoke = async () => {
  // Get the tax bracket of the player
  const bracket = getTaxBracket();

  const bracketTaxRateMap: Record<TaxBracket, number> = {
    broke: 1 / 5,
    poor: 2 / 7,
    barely: 6 / 19,
    wealthy: 2 / 5,
    "well-off": 4 / 7,
    rich: 3 / 5,
    "no-life": 4 / 5,
    "touch-grass": 19 / 20,
  };

  const gross = hds.value;

  // TAX TIME!!!!!!!!!!!!!!!!!!!!!!!

  const net = hds.value * (1 - bracketTaxRateMap[bracket]);

  hds.value = net;

  console.log(`You have been TAXED ${gross - net}`);

  taxPopupElement.classList.remove("hide");

  const req = generateTaxed(gross - net);

  console.log(await makeWorkerReq(req));

  setTimeout(() => taxPopupElement.classList.add("hide"), 3000);
};

const fleeJoke = () => {
  // Get every button
  const buttons = document.getElementsByTagName("button");

  // Get the length of the diagonal(s) of the viewport
  const viewportDiagonal = BigNumber(window.innerHeight)
    .pow(2)
    .plus(BigNumber(window.innerWidth).pow(2))
    .sqrt();

  window.onmousemove = (e) => {
    const [mouseX, mouseY] = [BigNumber(e.x), BigNumber(e.y)];

    for (const button of buttons) {
      const bounds = button.getBoundingClientRect();
      const [centreX, centreY] = [
        BigNumber(bounds.left).plus(BigNumber(bounds.width).div(2)),
        BigNumber(bounds.top).plus(BigNumber(bounds.height).div(2)),
      ];

      if ("original-cen-x"! in button.dataset) {
        button.dataset["original-cen-x"] = centreX.toString();
      }

      if ("original-cen-y"! in button.dataset) {
        button.dataset["original-cen-y"] = centreY.toString();
      }

      const [originalCentreX, originalCentreY] = [
        BigNumber(button.dataset["original-cen-x"]!),
        BigNumber(button.dataset["original-cen-y"]!),
      ];

      // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
      // MATHEMATICS
      // I hadn't had any uses for the Pyhtagorean theorem until now

      const a1 = mouseY.minus(centreY).abs();
      const b1 = mouseX.minus(centreX).abs();
      const c1 = a1.pow(2).plus(b1.pow(2)).sqrt();

      const relativeDist = c1.div(viewportDiagonal);

      // EVEN
      // MORE
      // MATHEMATICS
      // I did NOT sign up for this much MATHEMATICS when I thought of this joke
      // This time we need to get the distnace the button has strayed from its
      // original position
      const a2 = centreY.minus(originalCentreY).abs();
      const b2 = centreX.minus(originalCentreX).abs();
      const distanceStrayed = a2.pow(2).plus(b2.pow(2)).sqrt();

      // a = 200
      const th = BigNumber(200)

      // b = 100
      const tw = BigNumber(100)

      // l = 1.35
      const l = BigNumber(1.35)

      // k = a / b^l
      const k = th.div(tw.pow(l))

      // a / 2 - c^l*k
      const relativeDistanceToMoveAway = th.div(2).minus(relativeDist.times(100).pow(l)).times(k)
      const distanceToMoveAway = relativeDistanceToMoveAway.times(relativeDistanceToMoveAway.lt(0) ? distanceStrayed : viewportDiagonal)

      // Now to actually MOVE the button instead of doing MATHEMATICS
    }
  };
};
