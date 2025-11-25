import { Binding } from "./Binding";
import { increase } from "./maths";
import {
  save,
  wipe,
  load,
  restoreSave,
  getAndShowIdentifierCode,
  DEFAULT_SAVE_DATA
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
  wipeButton,
  saveButton,
  butcherButtonElement,
  standButtonElement,
  cartButtonElement,
  truckButtonElement,
  plantationButtonElement,
  factoryButtonElement,
  abattoirButtonElement,
  restaurantButtonElement,
  franchiseButtonElement,
  changeNicknameButton,
  closeContextMenuButton,
  openMainMenuButton,
  restoreSaveButton,
  getIdentifierButton,
  openSettingsButton,
  hotdogButtonElement,
  butcherImageElement,
  standImageElement,
  cartImageElement,
  truckImageElement,
  plantationImageElement,
  factoryImageElement,
  abattoirImageElement,
  restaurantImageElement,
  franchiseImageElement,
  notificationPopupSet,
  mainMenuDialogElement,
  openGamblingButton,
  gamblingDialog,
  spinSlotsButton,
} from "./elements";

import { updateLeaderboard } from "./leaderboard";
import { nickname, PLACEHOLDER_NICKNAME, receiveNickname } from "./nickname";
import { SharedMutable } from "./SharedMutable";
import { changeSettings } from "./settings";
import { updateWealthinessDisplay } from "./wealth";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { GAMBLING_NW_THRESHOLD } from "./pokies";
import { mode, Mode, ModeBasedAction } from "./mode";
import { abattoirIconSet, butcherIconSet, cartIconSet, factoryIconSet, franchiseIconSet, plantationIconSet, restaurantIconSet, standIconSet, truckIconSet } from "./assets";

import "./sound";
import { beginLoading, endLoading } from "./ui";

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

const checkBuyables = () => {
  if (hds.value >= butcherPrice.value) {
    butcherButtonElement.removeAttribute("data-unbuyable");
    butcherImageElement.src = butcherIconSet.buyable.loadedUrl;
  } else {
    butcherButtonElement.setAttribute("data-unbuyable", "true");
    butcherImageElement.src = butcherIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= standPrice.value) {
    standButtonElement.removeAttribute("data-unbuyable");
    standImageElement.src = standIconSet.buyable.loadedUrl;
  } else {
    standButtonElement.setAttribute("data-unbuyable", "true");
    standImageElement.src = standIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= cartPrice.value) {
    cartButtonElement.removeAttribute("data-unbuyable");
    cartImageElement.src = cartIconSet.buyable.loadedUrl;
  } else {
    cartButtonElement.setAttribute("data-unbuyable", "true");
    cartImageElement.src = cartIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= truckPrice.value) {
    truckButtonElement.removeAttribute("data-unbuyable");
    truckImageElement.src = truckIconSet.buyable.loadedUrl;
  } else {
    truckButtonElement.setAttribute("data-unbuyable", "true");
    truckImageElement.src = truckIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= plantationPrice.value) {
    plantationButtonElement.removeAttribute("data-unbuyable");
    plantationImageElement.src = plantationIconSet.buyable.loadedUrl;
  } else {
    plantationButtonElement.setAttribute("data-unbuyable", "true");
    plantationImageElement.src = plantationIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= factoryPrice.value) {
    factoryButtonElement.removeAttribute("data-unbuyable");
    factoryImageElement.src = factoryIconSet.buyable.loadedUrl;
  } else {
    factoryButtonElement.setAttribute("data-unbuyable", "true");
    factoryImageElement.src = factoryIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= abattoirPrice.value) {
    abattoirButtonElement.removeAttribute("data-unbuyable");
    abattoirImageElement.src = abattoirIconSet.buyable.loadedUrl;
  } else {
    abattoirButtonElement.setAttribute("data-unbuyable", "true");
    abattoirImageElement.src = abattoirIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= restaurantPrice.value) {
    restaurantButtonElement.removeAttribute("data-unbuyable");
    restaurantImageElement.src = restaurantIconSet.buyable.loadedUrl;
  } else {
    restaurantButtonElement.setAttribute("data-unbuyable", "true");
    restaurantImageElement.src = restaurantIconSet.unbuyable.loadedUrl;
  }

  if (hds.value >= franchisePrice.value) {
    franchiseButtonElement.removeAttribute("data-unbuyable");
    franchiseImageElement.src = franchiseIconSet.buyable.loadedUrl;
  } else {
    franchiseButtonElement.setAttribute("data-unbuyable", "true");
    franchiseImageElement.src = franchiseIconSet.unbuyable.loadedUrl;
  }
};

hotdogButtonElement.addEventListener("click", (event) => {
  // Don't let people use .click
  if (!event.isTrusted) return;

  ModeBasedAction.empty()
    .actionFor([Mode.BUY_MODE, Mode.SELL_MODE], () => hds.setValue(hds.value + 1, "btn-click"))
    .do()
});

butcherButtonElement.addEventListener("click", () => {
  if (hds.value >= butcherPrice.value) {
    hds.value -= butcherPrice.value;
    butcherPrice.value = increase(butcherPrice.value, butchersOwned.value);
    butchersOwned.value++;
    hdps.value += butcherRate;
  }
});

standButtonElement.addEventListener("click", () => {
  if (hds.value >= standPrice.value) {
    hds.value -= standPrice.value;
    standPrice.value = increase(standPrice.value, standsOwned.value);
    standsOwned.value++;
    hdps.value += standRate;
  }
});

cartButtonElement.addEventListener("click", () => {
  if (hds.value >= cartPrice.value) {
    hds.value -= cartPrice.value;
    cartPrice.value = increase(cartPrice.value, cartsOwned.value);
    cartsOwned.value++;
    hdps.value += cartRate;
  }
});

truckButtonElement.addEventListener("click", () => {
  if (hds.value >= truckPrice.value) {
    hds.value -= truckPrice.value;
    truckPrice.value = increase(truckPrice.value, trucksOwned.value);
    trucksOwned.value++;
    hdps.value += truckRate;
  }
});

plantationButtonElement.addEventListener("click", () => {
  if (hds.value >= plantationPrice.value) {
    hds.value -= plantationPrice.value;
    plantationPrice.value = increase(plantationPrice.value, plantationsOwned.value);
    plantationsOwned.value++;
    hdps.value += plantationRate;
  }
});

factoryButtonElement.addEventListener("click", () => {
  if (hds.value >= factoryPrice.value) {
    hds.value -= factoryPrice.value;
    factoryPrice.value = increase(factoryPrice.value, factoriesOwned.value);
    factoriesOwned.value++;
    hdps.value += factoryRate;
  }
});

abattoirButtonElement.addEventListener("click", () => {
  if (hds.value >= abattoirPrice.value) {
    hds.value -= abattoirPrice.value;
    abattoirPrice.value = increase(abattoirPrice.value, abattoirsOwned.value);
    abattoirsOwned.value++;
    hdps.value += abattoirRate;
  }
});

restaurantButtonElement.addEventListener("click", () => {
  if (hds.value >= restaurantPrice.value) {
    hds.value -= restaurantPrice.value;
    restaurantPrice.value = increase(restaurantPrice.value, restaurantsOwned.value);
    restaurantsOwned.value++;
    hdps.value += restaurantRate;
  }
});

franchiseButtonElement.addEventListener("click", () => {
  if (hds.value >= franchisePrice.value) {
    hds.value -= franchisePrice.value;
    franchisePrice.value = increase(franchisePrice.value, franchisesOwned.value);
    franchisesOwned.value++;
    hdps.value += franchiseRate;
  }
});

let canGamble = true;
let lastTime = performance.now();
export const shouldQuitEventLoop = new SharedMutable(false);

export const evloop = (time: number) => {
  // First, add the delta-adjusted hdps to the hds

  // How much time has passed since the last time update was called (in s)?
  const deltaSeconds = (time - lastTime) / 1000;

  // Only change if there is something to add
  if (hdps.value * deltaSeconds !== 0) {
    // Add hdps adjusted for the delta time
    hds.value += hdps.value * deltaSeconds;
  }

  // Then, update the wealthiness display

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

const openMainMenu = () => {
  document.querySelector("main")?.classList.add("blur");
  document.querySelector("nav")?.classList.add("blur");
  document.querySelector("#leaderboard")?.classList.add("blur");
  mainMenuDialogElement.showModal();
}

export const closeMainMenu = () => {
  document.querySelector("main")?.classList.remove("blur");
  document.querySelector("nav")?.classList.remove("blur");
  document.querySelector("#leaderboard")?.classList.remove("blur");
  mainMenuDialogElement.close();
}

document.oncontextmenu = () => {
  openMainMenu()

  document.ondblclick = () => {
    closeMainMenu();

    document.ondblclick = null;
  };

  return false;
};

openMainMenuButton.addEventListener("click", document.oncontextmenu)
closeContextMenuButton.addEventListener("click", closeMainMenu)

window.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "hidden") {
    await save()
  }
})

saveButton.addEventListener(
  "click",
  async () => {
    beginLoading()

    await save().then(endLoading).then(
      async () =>
        await notify({
          body: "Saved successfully.",
          prominence: NotificationProminence.Banner,
          dismissalMode: NotificationDismissalMode.Automatic,
        })
    )
  }
);


wipeButton.addEventListener(
  "click",
  async () =>
    await wipe().then(
      async () =>
        await notify({
          body: "Save data has been wiped.",
          prominence: NotificationProminence.Banner,
          dismissalMode: NotificationDismissalMode.Automatic,
        }).then(async () => {
          await save(DEFAULT_SAVE_DATA);
          await load();

          window.location.reload()
        })
    )
);

restoreSaveButton.addEventListener("click", async () => {
  closeMainMenu()

  await restoreSave()
})

/*openSettingsButton.addEventListener("click", async () => {
  hideContextMenu()
  await changeSettings()
})*/

getIdentifierButton.addEventListener("click", async () => {
  closeMainMenu()
  const ident = await getAndShowIdentifierCode();

  // Hack to make the identifier code display monospace
  // This approach sucks because it is vulnerable to XSS
  // if someone manages to change their identifier on the backend (which should not be possible, but must be considered)
  notificationPopupSet.body.innerHTML = `Your identifier code is <code>${ident}</code>`
})
