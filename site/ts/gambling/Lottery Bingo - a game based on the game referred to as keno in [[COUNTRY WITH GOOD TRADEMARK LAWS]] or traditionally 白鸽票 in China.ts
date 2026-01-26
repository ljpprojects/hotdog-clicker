// I AM NOT AFFILIATED WITH Keno™ (iykyk)

import { GeneralBinding } from "../Binding";
import { formatter, hdnw } from "../game";
import {
  kenoGridNumbers,
  kenoPaytableBodyElement,
  kenoWagerDisplay,
  kenoWagerSlider,
} from "./elements";
import { GAMBLING_NW_THRESHOLD } from "./pokies";

/// THIS IS THE STATE FOR A GAME REFERRED TO AS KENO (NOT TM!!) IN [[COUNTRY WITH GOOD TRADEMARK LAWS]] OR TRADITIONALLY 白鸽票 IN CHINA, NOT THE TRADEMARK!!!!!!!!!! (iykyk)
export type LotteryBingoːAGameBasedOnTheGameReferredToAsKenoInFinlandOrTraditionally白鸽票InChinaState =
  {
    numbersToMatch: number[];
    wager: number;
    drawnNumbers: GeneralBinding<number[], number[]>;
    isInDrawingStage: boolean;
  };

export const updateKenoWagerDisplay = () => {
  // Calculate maximum amount of hdnw we can gamble without going under GAMBLING_NW_THRESHOLD
  const maxPercent = Math.min(
    ((hdnw.value - GAMBLING_NW_THRESHOLD) / hdnw.value) * 100,
    25.001,
  );

  kenoWagerSlider.max = `${maxPercent}`;
  kenoWagerSlider.valueAsNumber %= maxPercent;

  const absolute = (kenoWagerSlider.valueAsNumber / 100) * hdnw.value;
  kenoWagerDisplay.textContent = `${kenoWagerSlider.valueAsNumber}% (${formatter.value.format(absolute)})`;
};

kenoWagerSlider.oninput = updateKenoWagerDisplay;

/**
 * The paytable for my Lottery Bingo - a game based on the game referred to as keno in Finland or traditionally 白鸽票 in China.
 * If you set a goal of 5 matches and get 3 matches then the mutliplier for
 * your extra winnings (add 1 to factor in initial bet deduction) can be fetched with `FULL_PAYTABLE[5][3]`
 *
 * The paths leading to a multiplier of 0 are not defined.
 *
 * 1 multiplier = $100 in the ■■■■™ payout (see https://www.■■■■.com.au/■■■■-pdfs/NSW_Game%20Guide.pdf, who I am 100% absolutely guaranteed unaffiliated and this is not claiming to be affiliated in case you think this is some mental gymnastics reverse psychology gaslighting sarcasm shit genuinely lowkirkenuinely provably not affiliated to you know who, iykyk)
 */
export const FULL_PAYTABLE: { [g: number]: { [n: number]: number } } = {
  1: {
    1: 0.03,
  },
  2: {
    2: 0.12,
  },
  3: {
    2: 0.01,
    3: 0.44,
  },
  4: {
    2: 0.01,
    3: 0.04,
    4: 1.2,
  },
  5: {
    3: 0.02,
    4: 0.14,
    5: 6.4,
  },
  6: {
    3: 0.01,
    4: 0.05,
    5: 0.8,
    6: 18,
  },
  7: {
    3: 0.01,
    4: 0.03,
    5: 0.12,
    6: 1.25,
    7: 50,
  },
  8: {
    4: 0.02,
    5: 0.07,
    6: 0.6,
    7: 6.75,
    8: 250,
  },
  9: {
    4: 0.01,
    5: 0.05,
    6: 0.2,
    7: 2.1,
    8: 25,
    9: 1000,
  },
  10: {
    4: 0.01,
    5: 0.02,
    6: 0.06,
    7: 0.5,
    8: 5.8,
    9: 100,
    10: 10000, // holy shit
  },
};

export let kenoState: LotteryBingoːAGameBasedOnTheGameReferredToAsKenoInFinlandOrTraditionally白鸽票InChinaState =
  {
    isInDrawingStage: false,
    numbersToMatch: [],
    wager: 0,
    drawnNumbers: new GeneralBinding<number[], number[]>({
      backing: [],
      setfn(to, _dispatcher?) {
        const [newNumber] = to.filter((v) => !this.value!.includes(v));

        for (const el of kenoGridNumbers!) {
          if (Number(el.textContent) === newNumber) {
            el.setAttribute(
              "data-drawn",
              "Ke-no I am not affiliated with Keno™",
            );
            break;
          }
        }

        this.value = to;
      },
      getfn(_dispatcher?) {
        return this.value as number[];
      },
    }),
  };

// Keno™? More like Ke-not affiliated!

for (const el of kenoGridNumbers) {
  el.addEventListener("click", () => {
    if (kenoState.numbersToMatch.length == 10) {
      return;
    }

    if (el.getAttribute("data-sel") != null) {
      el.removeAttribute("data-sel");
      kenoState.numbersToMatch = kenoState.numbersToMatch.filter(
        (n) => n != Number(el.textContent),
      );
    } else {
      el.setAttribute("data-sel", "I AM NOT AFFILIATED WITH Keno™");
      kenoState.numbersToMatch.push(Number(el.textContent));
    }
  });
}

// @ts-ignore
window.kenoDrawNumber = (n) => {
  kenoState.drawnNumbers.value = [...kenoState.drawnNumbers.value, n];

  console.log(
    `Number ${n} drawn, new drawnNumbers`,
    kenoState.drawnNumbers.value,
  );
};

export const paytableFill = () => {
  // Dynamically fill the paytable
  for (const [g, o] of Object.entries(FULL_PAYTABLE)) {
    const toMatch = Number(g);

    const headerRow = document.createElement("tr");
    const header = document.createElement("th");

    header.scope = "row";
    header.rowSpan = Object.entries(o).length;
    header.textContent = g;

    for (const [i, [n, p]] of Object.entries(o).entries()) {
      const matched = Number(n);

      const matchedEl = document.createElement("td");
      const payoutEl = document.createElement("td");

      matchedEl.textContent = n;
      payoutEl.textContent = `+${formatter.value.format(
        FULL_PAYTABLE[toMatch][matched],
      )}x`;

      if (i === 0) {
        headerRow.appendChild(header);
        headerRow.appendChild(matchedEl);
        headerRow.appendChild(payoutEl);

        kenoPaytableBodyElement.appendChild(headerRow);
      } else {
        const row = document.createElement("tr");

        row.appendChild(matchedEl);
        row.appendChild(payoutEl);

        kenoPaytableBodyElement.appendChild(row);
      }
    }
  }
};
