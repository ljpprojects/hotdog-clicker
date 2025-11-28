export const hdpsElement = document.getElementById("hdps")!;
export const hdsElement = document.getElementById("hds")!;
export const hdnwElement = document.getElementById("hdnw")!;
export const wealthinessElement = document.getElementById("wealthiness")!;

export const hotdogButtonElement = document.getElementById("hotdog-button")!;

export const butchersOwnedElement = document.getElementById("butchers-owned")!;
export const standsOwnedElement = document.getElementById("stands-owned")!;
export const cartsOwnedElement = document.getElementById("carts-owned")!;
export const trucksOwnedElement = document.getElementById("trucks-owned")!;
export const plantationsOwnedElement = document.getElementById("plantations-owned")!;
export const factoriesOwnedElement = document.getElementById("factories-owned")!;
export const abattoirsOwnedElement = document.getElementById("abattoirs-owned")!;
export const restaurantsOwnedElement = document.getElementById("restaurants-owned")!;
export const franchisesOwnedElement = document.getElementById("franchises-owned")!;

export const butcherPriceElement = document.getElementById("butcher-price")!;
export const standPriceElement = document.getElementById("stand-price")!;
export const cartPriceElement = document.getElementById("cart-price")!;
export const truckPriceElement = document.getElementById("truck-price")!;
export const plantationPriceElement = document.getElementById("plantation-price")!;
export const factoryPriceElement = document.getElementById("factory-price")!;
export const abattoirPriceElement = document.getElementById("abattoir-price")!;
export const restaurantPriceElement = document.getElementById("restaurant-price")!;
export const franchisePriceElement = document.getElementById("franchise-price")!;

export const mainMenuDialogElement: HTMLDialogElement = document.querySelector("#main-menu")!;

export const wipeButton = document.getElementById("wipe")!;
export const saveButton = document.getElementById("save")!;
export const changeNicknameButton = document.getElementById("change-nickname-button")!;
export const restoreSaveButton = document.getElementById("restore-save")!;
export const getIdentifierButton = document.getElementById("get-identifier-button")!;
export const openSettingsButton = document.getElementById("open-settings")!;
export const openMainMenuButton = document.getElementById("open-main-menu")!;
export const openGamblingButton = document.getElementById("open-gambling-button")!;
export const closeMainMenuButton = document.getElementById("close-main-menu")!;
export const completeSaveTransitionButton = document.getElementById("complete-transition-button")!;

export const gamblingDialog: HTMLDialogElement = document.querySelector("#gambling-dialog")!;

export const butcherButtonElement = document.getElementById("butcher")!;
export const standButtonElement = document.getElementById("stand")!;
export const cartButtonElement = document.getElementById("cart")!;
export const truckButtonElement = document.getElementById("truck")!;
export const plantationButtonElement = document.getElementById("plantation")!;
export const factoryButtonElement = document.getElementById("factory")!;
export const abattoirButtonElement = document.getElementById("abattoir")!;
export const restaurantButtonElement = document.getElementById("restaurant")!;
export const franchiseButtonElement = document.getElementById("franchise")!;

export const butcherImageElement: HTMLImageElement = document.querySelector("#butcher > img")!;
export const standImageElement: HTMLImageElement = document.querySelector("#stand > img")!;
export const cartImageElement: HTMLImageElement = document.querySelector("#cart > img")!;
export const truckImageElement: HTMLImageElement = document.querySelector("#truck > img")!;
export const plantationImageElement: HTMLImageElement = document.querySelector("#plantation > img")!;
export const factoryImageElement: HTMLImageElement = document.querySelector("#factory > img")!;
export const abattoirImageElement: HTMLImageElement = document.querySelector("#abattoir > img")!;
export const restaurantImageElement: HTMLImageElement = document.querySelector("#restaurant > img")!;
export const franchiseImageElement: HTMLImageElement = document.querySelector("#franchise > img")!;

export const leaderboardElements = [
  document.getElementById("ldbd-pl-01")!,
  document.getElementById("ldbd-pl-02")!,
  document.getElementById("ldbd-pl-03")!,
  document.getElementById("ldbd-pl-04")!,
  document.getElementById("ldbd-pl-05")!,
  document.getElementById("ldbd-pl-06")!,
  document.getElementById("ldbd-pl-07")!,
  document.getElementById("ldbd-pl-08")!,
  document.getElementById("ldbd-pl-09")!,
  document.getElementById("ldbd-pl-10")!,
  document.getElementById("ldbd-pl-11")!,
  document.getElementById("ldbd-pl-12")!,
  document.getElementById("ldbd-pl-13")!,
  document.getElementById("ldbd-pl-14")!,
  document.getElementById("ldbd-pl-15")!,
];

export const youLeaderboardElement: HTMLLIElement = document.getElementById(
  "ldbd-you",
)! as HTMLLIElement;

export const nicknameDialogElement: HTMLDialogElement =
  document.querySelector("#change-nickname")!;

export const nicknameDialogFormElement: HTMLFormElement =
  document.querySelector("#change-nickname > form")!;

export const nicknameDialogInputElement: HTMLInputElement =
  document.querySelector("#change-nickname > form > input")!;


export const restoreDialogElement: HTMLDialogElement =
  document.querySelector("#restore-save-dialog")!;

export const restoreDialogFormElement: HTMLFormElement =
  document.querySelector("#restore-save-dialog > form")!;

export const restoreDialogInputElement: HTMLInputElement =
  document.querySelector("#restore-save-dialog > form > input")!;


// Notification elements
export type NotificationElementSet = {
  dialog: HTMLDialogElement,
  form: HTMLFormElement,
  title: HTMLElement | null,
  body: HTMLParagraphElement,
};

export const notificationProminentSet: NotificationElementSet = {
  dialog: document.querySelector("#notification-prominent")!,
  form: document.querySelector("#notification-prominent > form")!,
  title: document.querySelector("#notification-prominent-title")!,
  body: document.querySelector("#notification-prominent-body")!,
};

export const notificationPopupSet: NotificationElementSet = {
  dialog: document.querySelector("#notification-popup")!,
  form: document.querySelector("#notification-popup > form")!,
  title: document.querySelector("#notification-popup-title")!,
  body: document.querySelector("#notification-popup-body")!,
};

export const notificationBannerSet: NotificationElementSet = {
  dialog: document.querySelector("#notification-banner")!,
  form: document.querySelector("#notification-banner > form")!,
  title: null,
  body: document.querySelector("#notification-banner-body")!,
};

export const settingsDialogContainerElement = document.getElementById("settingsDialogContainer")!
export const settingsDialogElement: HTMLDialogElement = document.querySelector("#settingsDialog")!
export const settingsDialogFormElement: HTMLFormElement = document.querySelector("#settingsDialog > form")!
export const settingsDialogCancelButton: HTMLInputElement = document.querySelector("#settingsDialogCancel")!

export const settingsNumberFormatOptionElement: HTMLSelectElement = document.querySelector("#numberFormat")!

export const settingsNumberDigitsOptionElement: HTMLInputElement = document.querySelector("#numberDigits")!
export const settingsNumberDigitsDisplayElement: HTMLSpanElement = document.querySelector("#numberDigitsDisplay")!

export const settingsShowTaxPopupOptionElement: HTMLInputElement = document.querySelector("#showTaxPopup")!

export const slotBoxes: [HTMLSpanElement, HTMLSpanElement, HTMLSpanElement] = [
  document.querySelector("#slot-1")!,
  document.querySelector("#slot-2")!,
  document.querySelector("#slot-3")!,
];

export const spinSlotsButton: HTMLButtonElement = document.querySelector("#spin-slots")!;
