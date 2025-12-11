import { abattoirIconSet, butcherIconSet, cartIconSet, factoryIconSet, franchiseIconSet, plantationIconSet, restaurantIconSet, standIconSet, truckIconSet } from "./assets";
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
  closeMainMenuButton,
  openMainMenuButton,
  restoreSaveButton,
  getIdentifierButton,
  changeSettingsButton,
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
  playBlackjackButton,
} from "./elements"; import { wagerBlackjack } from "./gambling/blackjack";
import { abattoirPrice, abattoirRate, abattoirsOwned, butcherPrice, butcherRate, butchersOwned, cartPrice, cartRate, cartsOwned, factoriesOwned, factoryPrice, factoryRate, franchisePrice, franchiseRate, franchisesOwned, hdps, hds, plantationPrice, plantationRate, plantationsOwned, restaurantPrice, restaurantRate, restaurantsOwned, standPrice, standRate, standsOwned, truckPrice, truckRate, trucksOwned } from "./game";
import { increase } from "./maths";
import { Mode, ModeBasedAction } from "./mode";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { DEFAULT_SAVE_DATA, getAndShowIdentifierCode, load, restoreSave, save, wipe } from "./save";
import { changeSettings } from "./settings";

export const beginLoading = () => {
  document.body.setAttribute("data-progress", "true")
}

export const endLoading = () => {
  document.body.removeAttribute("data-progress");
}

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
closeMainMenuButton.addEventListener("click", closeMainMenu)

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

changeSettingsButton.addEventListener("click", async () => {
  closeMainMenu()
  await changeSettings()
})

getIdentifierButton.addEventListener("click", async () => {
  closeMainMenu()
  await getAndShowIdentifierCode();
})

playBlackjackButton.addEventListener("click", () => {
  closeMainMenu();
  wagerBlackjack();
})

export const checkBuyables = () => {
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
