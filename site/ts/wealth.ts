import { hdnw } from "./game";
import { wealthinessElement } from "./elements";
import { GeneralBinding, ImmutableBinding } from "./Binding";

type WealthinessLevel =
  | "broke"
  | "poor"
  | "barely-scraping-by"
  | "wealthy"
  | "well-off"
  | "rich"
  | "no-life"
  | "touch-grass";

const getWealthinessLevel = (): WealthinessLevel => {
  const determiners: Record<WealthinessLevel, (w: number) => boolean> = {
    broke: (w) => w <= 1e3,
    poor: (w) => w > 1e3 && w <= 1e4,
    "barely-scraping-by": (w) => w > 1e4 && w <= 1e5,
    wealthy: (w) => w > 1e5 && w <= 1e7,
    "well-off": (w) => w > 1e7 && w <= 1e9,
    rich: (w) => w > 1e9 && w <= 1e10,
    "no-life": (w) => w > 1e10 && w <= 1e12,
    "touch-grass": (w) => w > 1e12,
  };

  for (const [k, v] of Object.entries(determiners)) {
    if (v(hdnw.value)) {
      return k as WealthinessLevel;
    }
  }

  return "broke";
};

let prevWealthinessLevel: WealthinessLevel = "broke";

export const updateWealthinessDisplay = () => {
  const wealthinessLevel = getWealthinessLevel();

  if (wealthinessLevel === prevWealthinessLevel) {
    return;
  } else {
    prevWealthinessLevel = wealthinessLevel;
  }

  const wealthinessLevelFmtMap: Record<WealthinessLevel, string> = {
    broke: "Broke",
    poor: "Poor",
    "barely-scraping-by": "Barely scraping by",
    wealthy: "Wealthy",
    "well-off": "Well-off",
    rich: "Rich",
    "no-life": "You have no life",
    "touch-grass": "Go touch grass",
  };

  wealthinessElement.textContent = wealthinessLevelFmtMap[wealthinessLevel];
};

export const wealthiness = new ImmutableBinding<WealthinessLevel>({
  getfn: getWealthinessLevel,
});
