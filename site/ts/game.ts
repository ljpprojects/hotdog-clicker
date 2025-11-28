import { Binding } from "./Binding";
import {
  save,
  load,
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
  gamblingDialog,
  spinSlotsButton,
} from "./elements";

import { updateLeaderboard } from "./leaderboard";
import { SharedMutable } from "./SharedMutable";
import { updateWealthinessDisplay } from "./wealth";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { GAMBLING_NW_THRESHOLD } from "./pokies";
import { Mode, ModeBasedAction } from "./mode";

import "./sound";
import "./ui";
import { checkBuyables } from "./ui";

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
export const hdps = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      hdpsElement.textContent = formatter.value.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

/**
 * The total worth of the user's assets.
 * The way assets work is similar to how shares work;
 * when you buy a new asset each of those assets which you already owned increases
 * to the new price of that asset. This creates a unique strategy for dominating
 * the leaderboard.
 */
export const hdnw = new Binding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    this.setBacking(to);
    hdnwElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

let hdsIncTimeoutEnd = Date.now();
let slotsAreSafe = true;

/**
 * The amount of hot dogs the user has.
 */
export const hds = new Binding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    if (hdsIncTimeoutEnd > Date.now() && dispatcher === "btn-click") return;

    const prev = this.getBacking() ?? 0;
    this.setBacking(to);

    ModeBasedAction.empty()
      .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.setValue(
        Math.abs(hdnw.getValue() - (prev - to)),
        "hds-change"
      ))
      .do();

    hdsElement.textContent = formatter.value.format(to);

    checkBuyables();

    // Check if it is 'safe' to spin slots
    // It is 'safe' if the hds is more than 5% of the hdnw (which is the most you can lose)
    if (to < hdnw.value / 20 && slotsAreSafe) {
      console.log("UNSAFE 4 SLOTS")

      slotsAreSafe = false;
      spinSlotsButton.setAttribute("data-unsafe", "true");
    } else if (to > hdnw.value / 20 && !slotsAreSafe) {
      console.log("SAFE 4 SLOTS")

      spinSlotsButton.removeAttribute("data-unsafe")
    }

    if (dispatcher === "btn-click") hdsIncTimeoutEnd = Date.now() + 100;
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

// slaves?????????
export const butchersOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;

    const prevPrice = butcherPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = butcherPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-butcher",
    );

    this.setBacking(to);
    butchersOwnedElement.textContent = to.toFixed(0);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const standsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;

    const prevPrice = standPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = standPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-stand",
    );

    this.setBacking(to);
    standsOwnedElement.textContent = to.toFixed(0);
  },

  getfn(dispatcher): number {
    return this.getBacking()!;
  },
});

export const cartsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = cartPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = cartPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-cart",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      cartsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const trucksOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = truckPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = truckPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-truck",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      trucksOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const plantationsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = plantationPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = plantationPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-plantation",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      plantationsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const factoriesOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = factoryPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = factoryPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-plantation",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      factoriesOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const abattoirsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = abattoirPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = abattoirPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-abattoir",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      abattoirsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const restaurantsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const prevPrice = restaurantPrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = restaurantPrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-restaurant",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      restaurantsOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const franchisesOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;

    const prevPrice = franchisePrice.binderBacking.getPreviousBacking() ?? 0;
    const netWorthMadeUpOfAsset = prevPrice * curr;
    const newNetWorthMadeUpOfAsset = franchisePrice.value * to;

    hdnw.setValue(
      ModeBasedAction.empty<number>()
        .actionForAllBut([Mode.TRANSITION_MODE], () => hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset))
        .transitionAction(() => hdnw.getValue() + prevPrice)
        .do()!,
      "acquire-asset-franchise",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      franchisesOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const butcherRate: number = 0.1;
export const butcherPrice = new Binding<number, number>({
  backing: 15,

  setfn(to: number) {
    this.setBacking(to);
    butcherPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const standRate: number = 5;
export const standPrice = new Binding<number, number>({
  backing: 250,

  setfn(to: number) {
    this.setBacking(to);
    standPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const cartRate: number = 10;
export const cartPrice = new Binding<number, number>({
  backing: 1000,

  setfn(to: number) {
    this.setBacking(to);
    cartPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const truckRate: number = 25;
export const truckPrice = new Binding<number, number>({
  backing: 3750,

  setfn(to: number) {
    this.setBacking(to);
    truckPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const plantationRate: number = 50;
export const plantationPrice = new Binding<number, number>({
  backing: 12_000,

  setfn(to: number) {
    this.setBacking(to);
    plantationPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const factoryRate: number = 250;
export const factoryPrice = new Binding<number, number>({
  backing: 100_000,

  setfn(to: number) {
    this.setBacking(to);
    factoryPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const abattoirRate: number = 750;
export const abattoirPrice = new Binding<number, number>({
  backing: 750_000,

  setfn(to: number) {
    this.setBacking(to);
    abattoirPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const restaurantRate: number = 1250;
export const restaurantPrice = new Binding<number, number>({
  backing: 2_750_000,

  setfn(to: number) {
    this.setBacking(to);
    restaurantPriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const franchiseRate: number = 5000;
export const franchisePrice = new Binding<number, number>({
  backing: 27_000_000,

  setfn(to: number) {
    this.setBacking(to);
    franchisePriceElement.textContent = formatter.value.format(to);
  },

  getfn(): number {
    return this.getBacking()!;
  },
});


let canGamble = true;
let lastTime = performance.now();
export const shouldQuitEventLoop = new SharedMutable(false);

export const evloop = (time: number) => {
  // First, add the delta-adjusted hdps to the hds
  //
  const deltaSeconds = (time - lastTime) / 1000;

  // Only change if there is something to add
  if (hdps.value * deltaSeconds !== 0) {
    // Add hdps adjusted for the delta
    hds.value += hdps.value * deltaSeconds;
  }

  updateWealthinessDisplay();

  // Check if we should allow gambling (> 50 hdnw)
  if (hdnw.value >= GAMBLING_NW_THRESHOLD && !canGamble) {
    canGamble = true;

    openGamblingButton.removeAttribute("disabled")
    openGamblingButton.removeAttribute("data-unbuyable")
    openGamblingButton.title = "Gamble";

    notify({
      body: "You can gamble now.",
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 1000,
      pauseGame: false,
    })
  } else if (hdnw.value < GAMBLING_NW_THRESHOLD && canGamble) {
    canGamble = false;

    openGamblingButton.setAttribute("disabled", "true")
    openGamblingButton.setAttribute("data-unbuyable", "true")
    openGamblingButton.title = "Gamble (LOCKED)";

    // Kick the player out of the casino
    if (gamblingDialog.open) {
      gamblingDialog.close();

      notify({
        body: "You have been kicked out of the casino for being too poor.",
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
      })
    }
  }

  lastTime = time;

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
