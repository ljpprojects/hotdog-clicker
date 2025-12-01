// Not so boring now, is it, bitch?

import { Binding } from "./Binding";
import { gamblingDialog, openGamblingButton, pokiesWagerDisplay, pokiesWagerSlider, slotBoxes, spinSlotsButton } from "./elements";
import { formatter, hdnw, hds } from "./game";
import { HDCNotification, NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { wait, wrappingAdd } from "./utils";
import { closeMainMenu } from "./ui";
import { compileSave, load, loadFromSave, save } from "./save";
import { randomUint32 } from "./rand";
import { enterBuyMode, enterFreezeMode } from "./mode";

export const GAMBLING_NW_THRESHOLD = 250;

export type SlotSymbol =
  "▼" | "🍇" | "🍋" | "🍒" | "🍉" | "🥝" | "♥️" | "♣️" | "♦️" | "♠️" | "𝟳";

export type SlotSymbolCategory =
  "none" | "low" | "medium" | "𝟳";

export type SlotWinKind = "none" | "2-split" | "2-cons" | "3-kind";

export const symbols: SlotSymbol[] = [
  /****** LOSING SYMBOLS (9/25 on reel) ******/

  "▼",
  "▼",
  "▼",
  "▼",
  "▼",
  "▼",
  "▼",
  "▼",
  "▼",

  /****** LOW-PAYOUT SYMBOLS (9/25 on reel) ******/

  "🍇",
  "🍇",
  "🍋",
  "🍋",
  "🍒",
  "🍒",
  "🍉",
  "🍉",
  "🥝",

  /****** MEDIUM-PAYOUT SYMBOLS (6/25 on reel) ******/

  "♥️",
  "♥️",
  "♦️",
  "♠️",
  "♣️",
  "♣️",

  /****** HIGH-PAYOUT SYMBOLS (1 per reel) ******/

  "𝟳"
];

export const symbolCategoryTable: Record<SlotSymbol, SlotSymbolCategory> = {
  "▼": "none",

  "🍇": "low",
  "🍋": "low",
  "🍒": "low",
  "🍉": "low",
  "🥝": "low",

  "♥️": "medium",
  "♣️": "medium",
  "♦️": "medium",
  "♠️": "medium",

  "𝟳": "𝟳",
};

export const payoutTable: Record<SlotWinKind, Record<SlotSymbolCategory, number>> = {
  "none": {
    "none": 0,
    "low": 0,
    "medium": 0,
    "𝟳": 0,
  },

  "2-split": {
    "none": 0,
    "low": 0.7,
    "medium": 1.2,
    "𝟳": 10,
  },

  "2-cons": {
    "none": 0,
    "low": 1.3,
    "medium": 1.5,
    "𝟳": 25,
  },

  "3-kind": {
    "none": 0,
    "low": 5,
    "medium": 10,
    "𝟳": 1000,
  },
};

export const payout = (wager: number, symbols: [SlotSymbol, SlotSymbol, SlotSymbol], delayMs: number): number => {
  console.log(symbols)

  const formatterConfig: Intl.ResolvedNumberFormatOptions = {
    ...formatter.value.resolvedOptions(),
    notation: "compact",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  };

  const compactFormatter = new Intl.NumberFormat(navigator.languages, formatterConfig);

  if (symbols.every((s, _, a) => s === a[0])) {
    // 3-of-a-kind
    const category = symbolCategoryTable[symbols[0]];
    const multiplier = payoutTable["3-kind"][category];
    const winnings = wager * multiplier;

    notify({
      body: `3-of-a-kind! You win ${multiplier}x (${compactFormatter.format(winnings)})!`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 5000,
    }, delayMs)

    return winnings;
  } else if (symbols.some((s, i, a) => i !== 0 && s === a[i - 1])) {
    // 2-of-a-kind consecutive
    const category = symbolCategoryTable[symbols.find((s, i, a) => i !== a.length - 1 && s === a[i + 1])!];
    const multiplier = payoutTable["2-cons"][category];
    const winnings = wager * multiplier;

    notify({
      body: `2-of-a-kind (consecutive)! You win ${multiplier}x (${compactFormatter.format(winnings)})!`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 5000,
    }, delayMs)

    return winnings;
  } else if (symbols[0] === symbols[2]) {
    // 2-of-a-kind consecutive
    const category = symbolCategoryTable[symbols[0]];
    const multiplier = payoutTable["2-split"][category];
    const winnings = wager * multiplier;

    notify({
      body: `2-of-a-kind (split)! You win ${multiplier}x (${compactFormatter.format(winnings)})!`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 5000,
    }, delayMs)

    return winnings;
  } else {
    // LOSEERRRRRRRR

    notify({
      body: `You lost`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 3000,
    }, delayMs)

    return 0
  }
}

const slot1Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(index) {
    this.setBacking(index)

    slotBoxes[0].textContent = symbols[index];
  },
});

const slot2Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(index) {
    this.setBacking(index)

    slotBoxes[1].textContent = symbols[index];
  },
});

const slot3Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(index) {
    this.setBacking(index)

    slotBoxes[2].textContent = symbols[index];
  },
});

const SLOTS_COOLDOWN = 500;

export const updatePokiesWagerDisplay = () => {
  // Calculate maximum amount of hdnw we can gamble without going under GAMBLING_NW_THRESHOLD
  const maxPercent = (hdnw.value - GAMBLING_NW_THRESHOLD) / hdnw.value * 100;

  pokiesWagerSlider.max = `${maxPercent}`;
  pokiesWagerSlider.valueAsNumber %= maxPercent;

  const formatterConfig: Intl.ResolvedNumberFormatOptions = {
    ...formatter.value.resolvedOptions(),
    notation: "compact",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  };

  const compactFormatter = new Intl.NumberFormat(navigator.languages, formatterConfig);

  const absolute = pokiesWagerSlider.valueAsNumber / 100 * hdnw.value;
  pokiesWagerDisplay.textContent = `${pokiesWagerSlider.valueAsNumber}% (${compactFormatter.format(absolute)})`
}

pokiesWagerSlider.oninput = updatePokiesWagerDisplay

spinSlotsButton.addEventListener("click", async () => {
  enterFreezeMode();

  pokiesWagerSlider.disabled = true;

  const wager = pokiesWagerSlider.valueAsNumber / 100 * hdnw.value;
  hds.value -= wager;

  spinSlotsButton.setAttribute("disabled", "true");
  spinSlotsButton.setAttribute("data-unbuyable", "true");

  const WRAP_THRESH = symbols.length;

  // Get random symbols
  const symbol1Index = randomUint32() % WRAP_THRESH;
  const symbol2Index = randomUint32() % WRAP_THRESH;
  const symbol3Index = randomUint32() % WRAP_THRESH;

  // The (approximate) time to wait before showing results
  const TIME_TO_WAIT_MS = 1000;
  const LOOP_DELAY = 10;
  const REVEAL_DELAY = 400;

  const endTime = performance.now() + TIME_TO_WAIT_MS;

  let notification: HDCNotification | null = null;

  let digit1Locked = false;
  let digit2Locked = false;

  // "Shadow save"
  const amountWon = payout(
    wager,
    [
      symbols[symbol1Index],
      symbols[symbol2Index],
      symbols[symbol3Index]
    ],
    TIME_TO_WAIT_MS + 3 * REVEAL_DELAY
  );

  const shadowSave = compileSave();

  shadowSave.hdc += amountWon;
  shadowSave.hdnw += amountWon;

  {
    enterBuyMode();

    await save(shadowSave);

    enterFreezeMode();
  }

  let i = 0;
  let id = setInterval(async () => {
    const durationMs = performance.now() - (endTime - LOOP_DELAY * i);

    if (durationMs >= 0 && durationMs < REVEAL_DELAY) {
      slot1Binding.value = symbol1Index;
      digit1Locked = true;
    } else if (durationMs >= REVEAL_DELAY && durationMs < 2 * REVEAL_DELAY) {
      slot2Binding.value = symbol2Index;
      digit2Locked = true;
    } else if (durationMs >= 2 * REVEAL_DELAY) {
      clearInterval(id)

      slot3Binding.value = symbol3Index;

      if (notification != null) {
        notify(notification)
      }

      enterBuyMode();
      loadFromSave(shadowSave);

      pokiesWagerSlider.disabled = false;
      updatePokiesWagerDisplay();

      return
    }

    if (!digit1Locked) {
      slot1Binding.value = (slot1Binding.value + 1) % WRAP_THRESH;
    }

    if (!digit2Locked) {
      slot2Binding.value = (slot2Binding.value + 1) % WRAP_THRESH;
    }

    slot3Binding.value = (slot3Binding.value + 1) % WRAP_THRESH;
  }, LOOP_DELAY)

  setTimeout(() => {
    spinSlotsButton.removeAttribute("disabled");
    spinSlotsButton.removeAttribute("data-unbuyable");
    spinSlotsButton.focus();
  }, SLOTS_COOLDOWN + TIME_TO_WAIT_MS + 3 * REVEAL_DELAY)
})

openGamblingButton.addEventListener("click", () => {
  closeMainMenu();
  gamblingDialog.showModal();
})
