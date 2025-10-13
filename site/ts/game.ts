import { Binding } from "./Binding";
import { increase } from "./maths";
import {
  save,
  wipe,
  load,
  restoreSave,
  getIdentifierCode
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
  openContextMenuButton,
  restoreSaveButton,
  getIdentifierButton,
  notificationDialogContainerElement,
  notificationDialogElement,
  notificationDialogMessageElement,
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
} from "./elements";

import { handleLdbd } from "./leaderboard";
import { doJoke } from "./jokes";
import { PLACEHOLDER_NICKNAME, receiveNickname } from "./nickname";
import { SharedMutable } from "./SharedMutable";
import { changeSettings } from "./settings";

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
 * Displays a message to the user.
 * The returned promise resolves when the user closes the notification popup.
 * @param message The message to display
 */
export const notify = async (message: string): Promise<void> => {
  return new Promise(res => {
    // Change message
    notificationDialogMessageElement.textContent = message

    // Scroll to top
    window.scrollTo(0, 0)

    // Unhide dialog
    notificationDialogContainerElement.classList.remove("hide");
    notificationDialogElement.showModal();

    notificationDialogElement.onclose = () => {
      notificationDialogContainerElement.classList.add("hide");
      res()
    }
  })
}

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
 * THe nickname chosen by the user.
 * This is a SharedMutable so it can be modified in nickname.ts
 */
export const nickname = new SharedMutable(PLACEHOLDER_NICKNAME);

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

/**
 * The amount of hot dogs the user has.
 */
export const hds = new Binding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    if (hdsIncTimeoutEnd > Date.now()) return;

    const prev = this.getBacking() ?? 0;
    this.setBacking(to);

    // The difference in hds is how much to remove from our net worth
    hdnw.setValue(hdnw.getValue() - (prev - to), "hds-change");

    hdsElement.textContent = formatter.value.format(to);
    checkBuyables();

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

    const netWorthMadeUpOfAsset =
      (butcherPrice.binderBacking.getPreviousBacking() ?? 0) * curr;

    const newNetWorthMadeUpOfAsset = butcherPrice.value * to;

    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-butcher",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      butchersOwnedElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const standsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (standPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = standPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-stand",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      standsOwnedElement.textContent = String(to);
    });
  },

  getfn(dispatcher): number {
    return this.getBacking()!;
  },
});

export const cartsOwned = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (cartPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = cartPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (truckPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = truckPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (plantationPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = plantationPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (factoryPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = factoryPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (abattoirPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = abattoirPrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (restaurantPrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = restaurantPrice.value * to;

    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    const netWorthMadeUpOfAsset =
      (franchisePrice.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = franchisePrice.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
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
    butcherImageElement.src = "/assets/butcher-b.svg"
  } else {
    butcherButtonElement.setAttribute("data-unbuyable", "true");
    butcherImageElement.src = "/assets/butcher-u.svg"
  }

  if (hds.value >= standPrice.value) {
    standButtonElement.removeAttribute("data-unbuyable");
    standImageElement.src = "/assets/stand-b.svg"
  } else {
    standButtonElement.setAttribute("data-unbuyable", "true");
    standImageElement.src = "/assets/stand-u.svg"
  }

  if (hds.value >= cartPrice.value) {
    cartButtonElement.removeAttribute("data-unbuyable");
    cartImageElement.src = "/assets/cart-b.svg"
  } else {
    cartButtonElement.setAttribute("data-unbuyable", "true");
    cartImageElement.src = "/assets/cart-u.svg"
  }

  if (hds.value >= truckPrice.value) {
    truckButtonElement.removeAttribute("data-unbuyable");
    truckImageElement.src = "/assets/truck-b.svg"
  } else {
    truckButtonElement.setAttribute("data-unbuyable", "true");
    truckImageElement.src = "/assets/truck-u.svg"
  }

  if (hds.value >= plantationPrice.value) {
    plantationButtonElement.removeAttribute("data-unbuyable");
    plantationImageElement.src = "/assets/plantation-b.svg"
  } else {
    plantationButtonElement.setAttribute("data-unbuyable", "true");
    plantationImageElement.src = "/assets/plantation-u.svg"
  }

  if (hds.value >= factoryPrice.value) {
    factoryButtonElement.removeAttribute("data-unbuyable");
    factoryImageElement.src = "/assets/factory-b.svg"
  } else {
    factoryButtonElement.setAttribute("data-unbuyable", "true");
    factoryImageElement.src = "/assets/factory-u.svg"
  }

  if (hds.value >= abattoirPrice.value) {
    abattoirButtonElement.removeAttribute("data-unbuyable");
    abattoirImageElement.src = "/assets/abattoir-b.svg"
  } else {
    abattoirButtonElement.setAttribute("data-unbuyable", "true");
    abattoirImageElement.src = "/assets/abattoir-u.svg"
  }

  if (hds.value >= restaurantPrice.value) {
    restaurantButtonElement.removeAttribute("data-unbuyable");
    restaurantImageElement.src = "/assets/restaurant-b.svg"
  } else {
    restaurantButtonElement.setAttribute("data-unbuyable", "true");
    restaurantImageElement.src = "/assets/restaurant-u.svg"
  }

  if (hds.value >= franchisePrice.value) {
    franchiseButtonElement.removeAttribute("data-unbuyable");
    franchiseImageElement.src = "/assets/franchise-b.svg"
  } else {
    franchiseButtonElement.setAttribute("data-unbuyable", "true");
    franchiseImageElement.src = "/assets/franchise-u.svg"
  }
};

load().then(doJoke);

setInterval(save, 60e3);

hotdogButtonElement.addEventListener("click", (event) => {
  // Don't let people use .click
  if (!event.isTrusted) return;

  hds.setValue(hds.value + 1, "btn-click");
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

(() => {
  let lastTime = performance.now();

  const update = (time: number) => {
    lastTime = time;

    // How much time has passed since the last time update was called (in s)?
    const deltaSeconds = (time - lastTime) / 1000;

    // Only change the element if there is something to add
    if (hdps.value * deltaSeconds !== 0) {
      // Add hdps adjusted for the delta time
      hds.value += hdps.value * deltaSeconds;
    }

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
})();

(async () => await handleLdbd().then(() => {
  setInterval(async () => await save().then(handleLdbd), 60e3);
}))();

const showContextMenu = () => {
  document.querySelector("main")?.classList.add("blur");
  document.querySelector("nav")?.classList.add("blur");
  document.querySelector("#leaderboard")?.classList.add("blur");
  document.getElementById("context")?.setAttribute("class", "display");
}

const hideContextMenu = () => {
  document.querySelector("main")?.classList.remove("blur");
  document.querySelector("nav")?.classList.remove("blur");
  document.querySelector("#leaderboard")?.classList.remove("blur");
  document.getElementById("context")?.setAttribute("class", "hide");
}

document.oncontextmenu = () => {
  showContextMenu()

  document.addEventListener("dblclick", hideContextMenu);

  return false;
};

openContextMenuButton.addEventListener("click", document.oncontextmenu)
closeContextMenuButton.addEventListener("click", hideContextMenu)

window.addEventListener("visibilitychange", async () => {
  if (document.visibilityState === "hidden") {
    await save()
  }
})

saveButton.addEventListener("click", async () => {
  hideContextMenu()

  await save().then(async () => await notify("Saved successfully."))
});

wipeButton.addEventListener("click", wipe)

changeNicknameButton.addEventListener("click", async () => {
  hideContextMenu()

  nickname.value = await receiveNickname()
  await save().then(handleLdbd)
})

restoreSaveButton.addEventListener("click", async () => {
  hideContextMenu()

  await restoreSave()
})

getIdentifierButton.addEventListener("click", async () => {
  hideContextMenu()

  await getIdentifierCode()
})

openSettingsButton.addEventListener("click", async () => {
  hideContextMenu()
  await changeSettings()
})
