// I AM NOT AFFILIATED WITH Keno™ (iykyk)

import { GeneralBinding } from "../Binding";
import { playKenoButton } from "../elements";
import { formatter, hdnw, hds } from "../game";
import { enterBuyMode, enterFreezeMode } from "../mode";
import {
  NotificationDismissalMode,
  NotificationProminence,
  notify,
} from "../notify";
import { randomIntUpTo } from "../rand";
import { save } from "../save";
import { closeMainMenu } from "../ui";
import { wait } from "../utils";
import {
  kenoGridNumbers,
  kenoMenuElement,
  kenoPaytableBodyElement,
  kenoStartButton,
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

  kenoState.wager = absolute;

  // If we have selected numbers too then we can allow the player to start
  if (kenoState.numbersToMatch.length > 0) {
    kenoStartButton.removeAttribute("data-unbuyable");
    kenoStartButton.removeAttribute("disabled");
  }
};

kenoWagerSlider.oninput = updateKenoWagerDisplay;

/**
 * The paytable for my Lottery Bingo - a game based on the game referred to as keno in Finland or traditionally 白鸽票 in China.
 * If you set a goal of 5 matches and get 3 matches then the mutliplier for
 * your extra winnings (add 1 to factor in initial bet deduction) can be fetched with `FULL_PAYTABLE[5][3]`
 *
 * The paths leading to a multiplier of 0 are not defined.
 *
 * 1 multiplier = $50 in the ■■■■™ payout (see https://www.■■■■.com.au/■■■■-pdfs/NSW_Game%20Guide.pdf, who I am 100% absolutely guaranteed unaffiliated and this is not claiming to be affiliated in case you think this is some mental gymnastics reverse psychology gaslighting sarcasm shit genuinely lowkirkenuinely provably not affiliated to you know who, iykyk)
 */
export const FULL_PAYTABLE: { [g: number]: { [n: number]: number } } = {
  1: {
    1: 0.06,
  },
  2: {
    2: 0.24,
  },
  3: {
    2: 0.02,
    3: 0.88,
  },
  4: {
    2: 0.02,
    3: 0.08,
    4: 2.4,
  },
  5: {
    3: 0.04,
    4: 0.28,
    5: 12.8,
  },
  6: {
    3: 0.02,
    4: 0.1,
    5: 1.6,
    6: 36,
  },
  7: {
    3: 0.02,
    4: 0.06,
    5: 0.24,
    6: 2.5,
    7: 100,
  },
  8: {
    4: 0.04,
    5: 0.14,
    6: 1.2,
    7: 13.6,
    8: 500,
  },
  9: {
    4: 0.02,
    5: 0.1,
    6: 0.4,
    7: 4.2,
    8: 50,
    9: 2000,
  },
  10: {
    4: 0.02,
    5: 0.04,
    6: 0.12,
    7: 1,
    8: 11.6,
    9: 200,
    10: 20000, // HOLY SHIT!!!!!!!!!!!!!!!!!!!
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
        if (to.length === 0) {
          // mark as undrawn all grid numbers
          for (const el of kenoGridNumbers) {
            el.removeAttribute("data-drawn");

            console.log(`${el.id} is no longer drawn`);
          }

          this.value = to;

          return;
        }

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
    if (kenoState.numbersToMatch.length == 10 || kenoState.isInDrawingStage) {
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

export const calculatePayout = async () => {
  const matches = kenoState.drawnNumbers.value.filter((n) =>
    kenoState.numbersToMatch.includes(n),
  );

  const toMatch = kenoState.numbersToMatch.length;

  const multiplier =
    FULL_PAYTABLE[toMatch][matches.length] != null
      ? 1 + FULL_PAYTABLE[toMatch][matches.length]
      : 0;

  const payout = kenoState.wager * multiplier;
  hds.value += payout;

  if (matches.length === toMatch && toMatch >= 7) {
    // JACKPOT
    await notify(
      {
        body: `JACKPOT!!!!! You won ${multiplier}x (+${formatter.value.format(payout - kenoState.wager)})!`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 5000,
      },
      250,
    );
  } else if (matches.length === toMatch) {
    // BIG WIN
    await notify(
      {
        body: `BIG WIN!!!!! You won ${multiplier}x (+${formatter.value.format(payout - kenoState.wager)})!`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 5000,
      },
      250,
    );
  } else if (multiplier > 0) {
    await notify(
      {
        body: `SMALL WIN! You won ${multiplier}x (+${formatter.value.format(payout - kenoState.wager)})!`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 5000,
      },
      250,
    );
  } else {
    await notify(
      {
        body: `lmao you lost (-${formatter.value.format(kenoState.wager)})!`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 5000,
      },
      250,
    );
  }
};

export const kenoStart = async () => {
  if (kenoState.isInDrawingStage) {
    throw "wtf no don't start it now thats cheating";
  }

  kenoStartButton.setAttribute("data-unbuyable", "duh");
  kenoStartButton.setAttribute("disabled", "true");

  kenoWagerSlider.setAttribute("data-unbuyable", "yep");
  kenoWagerSlider.disabled = true;

  enterFreezeMode();

  // deduct wager
  hds.value -= kenoState.wager;

  await save();

  kenoState.isInDrawingStage = true;

  for (let i = 0; i < 20; i++) {
    for (let n = randomIntUpTo(70) + 1; ; n = randomIntUpTo(70) + 1) {
      if (kenoState.drawnNumbers.value.includes(n)) {
        continue;
      }

      kenoState.drawnNumbers.value = [...kenoState.drawnNumbers.value, n];

      break;
    }

    await wait(750);
  }

  // Done drawing numbers; calculate payout
  calculatePayout();

  // Reset state
  kenoState.drawnNumbers.value = [];
  kenoState.isInDrawingStage = false;

  enterBuyMode();

  kenoStartButton.removeAttribute("data-unbuyable");
  kenoStartButton.removeAttribute("disabled");

  kenoWagerSlider.removeAttribute("data-unbuyable");
  kenoWagerSlider.disabled = false;
};

kenoStartButton.addEventListener("click", kenoStart);

playKenoButton.addEventListener("click", () => {
  closeMainMenu();

  // Reset state
  kenoState.drawnNumbers.value = [];
  kenoState.isInDrawingStage = false;

  // Open menu
  kenoMenuElement.showModal();
});
