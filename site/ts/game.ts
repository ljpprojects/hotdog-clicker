import { GeneralBinding } from "./Binding";
import {
  save,
  load,
  wipe,
  DEFAULT_SAVE_DATA,
  wipeTimeoutEnd,
} from "./save";

import {
  hdpsElement,
  hdsElement,
  hdnwElement,
  butchersOwnedElement,
  standsOwnedElement,
  cartsOwnedElement,
  trucksOwnedElement,
  plantationsOwnedElement,
  factoriesOwnedElement,
  abattoirsOwnedElement,
  restaurantsOwnedElement,
  franchisesOwnedElement,
  butcherPriceElement,
  standPriceElement,
  cartPriceElement,
  truckPriceElement,
  plantationPriceElement,
  factoryPriceElement,
  abattoirPriceElement,
  restaurantPriceElement,
  franchisePriceElement,
  openGamblingButton,
  pokiesDialog,
  spinSlotsButton,
  pokiesWagerSlider,
  playBlackjackButton,
} from "./elements";

import './settings/index';

import { updateLeaderboard } from "./leaderboard";
import { SharedMutable } from "./SharedMutable";
import { updateWealthinessDisplay } from "./wealth";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { GAMBLING_NW_THRESHOLD } from "./pokies";
import { mode, Mode, ModeBasedAction } from "./mode";

import "./sound";
import "./ui";
import "./gambling/blackjack";
import { checkBuyables } from "./ui";
import { settings } from "./settings/index";
import { wait } from "./utils";
import { bjGameDialog, bjWagerDialog } from "./gambling/elements";

export const formatter = new SharedMutable(
  new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
    notation: "standard",
    localeMatcher: "best fit"
  })
)

/**
 * How many hotdogs the user will earn passively (i.e. without action)
 * in one second.
 */
export const hdps = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      hdpsElement.textContent = formatter.value.format(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

let canGamble = true;

/**
 * The total worth of the user's assets.
 * The way assets work is similar to how shares work; when you buy a new asset
 * each of those assets which you already owned increases to the new price of
 * that asset.
 */
export const hdnw = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    this.value = to;
    hdnwElement.textContent = formatter.value.format(to);

    updateWealthinessDisplay();

    // Check if we should allow gambling (> 50 hdnw)
    if (hdnw.value >= GAMBLING_NW_THRESHOLD && !canGamble && settings.value.enableGambling) {
      canGamble = true;

      openGamblingButton.removeAttribute("disabled")
      openGamblingButton.removeAttribute("data-unbuyable")
      openGamblingButton.title = "Pokies";

      playBlackjackButton.removeAttribute("disabled")
      playBlackjackButton.removeAttribute("data-unbuyable")
      playBlackjackButton.title = "Blackjack";

      notify({
        body: "You can gamble now.",
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 1000,
        pauseGame: false,
      });
    } else if (hdnw.value < GAMBLING_NW_THRESHOLD && canGamble) {
      canGamble = false;

      openGamblingButton.setAttribute("disabled", "true")
      openGamblingButton.setAttribute("data-unbuyable", "true")
      openGamblingButton.title = "Pokies (LOCKED)";

      playBlackjackButton.setAttribute("disabled", "true")
      playBlackjackButton.setAttribute("data-unbuyable", "true")
      playBlackjackButton.title = "Blackjack (LOCKED)";

      const notifyKickedOut = () => notify({
        body: "You have been kicked out of the casino for being too poor.",
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
      });

      // Kick the player out of any gambling menus
      if (pokiesDialog.open) {
        pokiesDialog.close();
        notifyKickedOut();
      }

      if (bjWagerDialog.open) {
        bjWagerDialog.close();
        notifyKickedOut();
      }

      if (bjGameDialog.open) {
        bjGameDialog.close();
        notifyKickedOut();
      }
    } else if (canGamble && !settings.value.enableGambling) {
      canGamble = false;

      openGamblingButton.setAttribute("disabled", "true")
      openGamblingButton.setAttribute("data-unbuyable", "true")
      openGamblingButton.title = "Gamble (DISABLED in settings)";

      playBlackjackButton.setAttribute("disabled", "true")
      playBlackjackButton.setAttribute("data-unbuyable", "true")
      playBlackjackButton.title = "Blackjack (DISABLED in settings)";
    }
  },

  getfn(): number {
    return this.value!;
  },
});

let hdsIncTimeoutEnd = Date.now();
let slotsAreSafe = true;

export const HD_CLICKS_PER_SEC = 20;

/**
 * The amount of hot dogs the user has.
 */
export const hds = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    if (hdsIncTimeoutEnd > Date.now() && dispatcher === "btn-click") return;

    const prev = this.value ?? 0;
    this.value = to;

    ModeBasedAction.empty()
      .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.setValue(
        Math.abs(hdnw.getValue() - (prev - to)),
        "hds-change"
      ))
      .do();

    hdsElement.textContent = formatter.value.format(to);

    checkBuyables();

    if (dispatcher === "btn-click") hdsIncTimeoutEnd = Date.now() + (1000 / HD_CLICKS_PER_SEC);
  },

  getfn(): number {
    return this.value!;
  },
});

// slaves?????????
export const butchersOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;

    const prevPrice = butcherPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = butcherPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-butcher",
    );

    this.value = to;
    butchersOwnedElement.textContent = to.toFixed(0);
  },

  getfn(): number {
    return this.value!;
  },
});

export const standsOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;

    const prevPrice = standPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = standPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-stand",
    );

    this.value = to;
    standsOwnedElement.textContent = to.toFixed(0);
  },

  getfn(dispatcher): number {
    return this.value!;
  },
});

export const cartsOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = cartPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = cartPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-cart",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      cartsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const trucksOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = truckPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = truckPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-truck",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      trucksOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const plantationsOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = plantationPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = plantationPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-plantation",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      plantationsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const factoriesOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = factoryPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = factoryPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-plantation",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      factoriesOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const abattoirsOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = abattoirPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = abattoirPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-abattoir",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      abattoirsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const restaurantsOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;
    const prevPrice = restaurantPrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = restaurantPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-restaurant",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      restaurantsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const franchisesOwned = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.value ?? 0;

    const prevPrice = franchisePrice.backing.prevValue ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = franchisePrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-franchise",
    );

    this.value = to;

    this.doAsync({ needsToWait: false }, async () => {
      franchisesOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.value!;
  },
});

export const butcherRate: number = 0.1;
export const butcherPrice = new GeneralBinding<number, number>({
  backing: 15,

  setfn(to: number) {
    this.value = to;
    butcherPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const standRate: number = 5;
export const standPrice = new GeneralBinding<number, number>({
  backing: 250,

  setfn(to: number) {
    this.value = to;
    standPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const cartRate: number = 10;
export const cartPrice = new GeneralBinding<number, number>({
  backing: 1000,

  setfn(to: number) {
    this.value = to;
    cartPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const truckRate: number = 25;
export const truckPrice = new GeneralBinding<number, number>({
  backing: 3750,

  setfn(to: number) {
    this.value = to;
    truckPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const plantationRate: number = 50;
export const plantationPrice = new GeneralBinding<number, number>({
  backing: 12_000,

  setfn(to: number) {
    this.value = to;
    plantationPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const factoryRate: number = 250;
export const factoryPrice = new GeneralBinding<number, number>({
  backing: 100_000,

  setfn(to: number) {
    this.value = to;
    factoryPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const abattoirRate: number = 750;
export const abattoirPrice = new GeneralBinding<number, number>({
  backing: 750_000,

  setfn(to: number) {
    this.value = to;
    abattoirPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const restaurantRate: number = 1250;
export const restaurantPrice = new GeneralBinding<number, number>({
  backing: 2_750_000,

  setfn(to: number) {
    this.value = to;
    restaurantPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});

export const franchiseRate: number = 5000;
export const franchisePrice = new GeneralBinding<number, number>({
  backing: 27_000_000,

  setfn(to: number) {
    this.value = to;
    franchisePriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.value!;
  },
});


let lastTime = performance.now();
export const shouldQuitEventLoop = new SharedMutable(false);

export const evloop = (time: number) => {
  if (mode === Mode.FREEZE_MODE) return;

  // First, add the delta-adjusted hdps to the hds
  //
  const deltaSeconds = (time - lastTime) / 1000;

  // Only change if there is something to add
  if (hdps.value * deltaSeconds !== 0) {
    // Add hdps adjusted for the delta
    hds.value += hdps.value * deltaSeconds;
  }

  lastTime = time;

  // Check if it is 'safe' to spin slots
  // It is 'safe' if the hds is more than 5% of the hdnw (which is the most you can lose)
  if (hds.value < hdnw.value * pokiesWagerSlider.valueAsNumber / 100 && slotsAreSafe) {
    console.log("UNSAFE 4 SLOTS")

    slotsAreSafe = false;
    spinSlotsButton.setAttribute("data-unsafe", "true");
  } else if (hds.value > hdnw.value * pokiesWagerSlider.valueAsNumber / 100 && !slotsAreSafe) {
    console.log("SAFE 4 SLOTS")

    spinSlotsButton.removeAttribute("data-unsafe")
  }

  if (!shouldQuitEventLoop.value) {
    requestAnimationFrame(evloop);
  }
};

load().then(() => setInterval(save, 60e3)).then(() => requestAnimationFrame(evloop));

// #BeaverMoon 2025

setInterval(
  async () =>
    ModeBasedAction.empty()
      .buyAction(async () => await save().then(updateLeaderboard))
      .do(),
  60e3
);

// @ts-expect-error
window.richify = async () => {
  for (let i = 0; i <= 10; i++) {
    const f = i < 5 ? console.warn : console.error;

    f(`${10 - i} seconds remain`);

    await wait(1000);
  }

  // A fate worse than a wipe
  // Put them into crippling debt and prevent wipes for a day
  hds.value -= 1e15;

  const factor = 1000 * 60 * 60 * 24;
  const daysTimeoutEndsIn = wipeTimeoutEnd.value != null ? (wipeTimeoutEnd.value / factor) - (Date.now() / factor) : 0;

  console.warn("Ends in", daysTimeoutEndsIn)

  wipeTimeoutEnd.value = (wipeTimeoutEnd.value ?? Date.now()) + 24 * 60 ** 2 * 1000 * (1 + Number(wipeTimeoutEnd.value != null) + daysTimeoutEndsIn);
  //                                                                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                                                                                                      Repeat offense penalty

  await save();

  await notify({
    title: "CHEATER",
    body: `You tried to cheat and shall feel the consequences of your actions. You are now in crippling debt and cannot wipe your save for another 24 hours (it can be wiped at ${new Date(wipeTimeoutEnd.value!).toLocaleString()}).`,
    prominence: NotificationProminence.Prominent,
    dismissalMode: NotificationDismissalMode.Manual,
  }, 1000);
}

document.addEventListener("keydown", ev => {
  if (ev.key === "_") {
    hds.value *= -2;
  }
})
