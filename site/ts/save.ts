import {
  hds,
  hdps,
  butchersOwned,
  standsOwned,
  cartsOwned,
  trucksOwned,
  plantationsOwned,
  factoriesOwned,
  abattoirsOwned,
  butcherPrice,
  standPrice,
  cartPrice,
  truckPrice,
  plantationPrice,
  factoryPrice,
  abattoirPrice,
  nickname,
  restaurantsOwned,
  hdnw,
  franchisesOwned,
  restaurantPrice,
  franchisePrice,
  notify,
} from "./game";

import {
  makeWorkerReq,
  generateGet,
  AUTH_REDIRECT_URL,
  generateReport,
  generateIdent,
  generateRestore
} from "./worker/interfacing";

import { calcCost } from "./maths";
import { DBData, ServerSentWorkerData } from "../../shared/types";
import {
  isValidNickname,
  MAX_NICKNAME_LENGTH,
  PLACEHOLDER_NICKNAME,
  receiveNickname,
} from "./nickname";

import {
  restoreDialogElement,
  restoreDialogFormElement,
  restoreDialogInputElement
} from "./elements"
import { applySettings, DEFAULT_SETTINGS, HDCSettings, settings } from "./settings";
import { NaNNullCoerce } from "./utils";
import { startTransition } from "./transition";
import { enterBuyMode } from "./mode";

/**
 * Major save editions are incremented when a previous save edition with the
 * previous major edition cannot be converted automatically to this new edition.
 */
export type SaveEditionMajor = "0" | 2 | "3";

export type SaveEditionMinor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/**
 * There is no edition 1 because no code ever assigned that edition to a save.
 *
 * Edition 0 is the default edition (i.e. no edition is specified in the save)
 * and is the same legacy format as edition 2.
 *
 * Edition 2 will not be found in saves stored in the remote db;
 * no _production_ code ever assigned that edition to a save. It is the same
 * legacy format that edition 0 is.
 */
export type SaveEdition = SaveEditionMajor | `${SaveEditionMajor}.${SaveEditionMinor}`;

export const SAVE_EDITION: SaveEdition = "3";

/**
 * A list of save editions compatible with the current save edition (3).
 *
 * No previous save editions are compatible with edition 3.
 */
export const compatibleEditions: SaveEdition[] = [];

export interface HDCSaveData {
  /**
   * The edition of the save.
   * The latest edition is 3.
   */
  edition: SaveEdition;

  /**
   * The amount of Hot Dogs the user has (Hot Dog Count)
   */
  hdc: number;

  /**
   * The amount of Hot Dogs per second the user gets (Hot Dogs Per Second)
   */
  hdps: number;

  /**
   * The total worth of all assets owned by the user (Hot Dog Net Worth). This includes:
   * - Hot Dog count
   * - The summed cost of generators (e.g. Bun, Grill, Freezer)
   */
  hdnw: number;

  ownedButchers: number;
  ownedStands: number;
  ownedCarts: number;
  ownedTrucks: number;
  ownedPlantations: number;
  ownedFactories: number;
  ownedAbattoirs: number;
  ownedRestaurants: number;
  ownedFranchises: number;

  /**
   * The nickname chosen by the user.
   */
  nickname: string;

  /**
   * The settings selected by the user.
   */
  settings: HDCSettings;
}

export const DEFAULT_SAVE_DATA: HDCSaveData = {
  edition: SAVE_EDITION,
  hdc: 0,
  hdps: 0,
  hdnw: 0,
  ownedButchers: 0,
  ownedStands: 0,
  ownedCarts: 0,
  ownedTrucks: 0,
  ownedPlantations: 0,
  ownedFactories: 0,
  ownedAbattoirs: 0,
  ownedRestaurants: 0,
  ownedFranchises: 0,
  nickname: PLACEHOLDER_NICKNAME,
  settings: DEFAULT_SETTINGS,
};

export const decodeSaveData = (data: string): HDCSaveData => {
  try {
    const raw = Uint8Array.fromBase64(data);
    const decoder = new TextDecoder('utf-8');
    const save = JSON.parse(decoder.decode(raw)) as HDCSaveData;

    return save;
  } catch (e) {
    console.error(e);

    return DEFAULT_SAVE_DATA;
  }
};

export const compileSave = (): HDCSaveData => {
  return {
    edition: SAVE_EDITION,
    hdc: hds.value,
    hdps: hdps.value,
    ownedButchers: butchersOwned.value,
    ownedStands: standsOwned.value,
    ownedCarts: cartsOwned.value,
    ownedTrucks: trucksOwned.value,
    ownedPlantations: plantationsOwned.value,
    ownedFactories: factoriesOwned.value,
    ownedAbattoirs: abattoirsOwned.value,
    ownedRestaurants: restaurantsOwned.value,
    ownedFranchises: franchisesOwned.value,
    nickname: (nickname.value || PLACEHOLDER_NICKNAME).slice(MAX_NICKNAME_LENGTH),
    hdnw: hdnw.value,
    settings,
  };
};

export const generateEncodedSave = (from?: HDCSaveData): string => {
  if (from) {
    console.log("INFO: Using given save")
  }

  const saveData = from ?? compileSave();
  const json = JSON.stringify(saveData);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(json).toBase64();

  return encoded;
};

export const save = async (): Promise<ServerSentWorkerData> => {
  const saveData = generateEncodedSave();
  const req = generateReport(saveData, nickname.value, compileSave().hdnw);

  return await makeWorkerReq(req);
};

export const wipe = async (): Promise<ServerSentWorkerData> => {
  const saveData = generateEncodedSave(DEFAULT_SAVE_DATA);
  const req = generateReport(
    saveData,
    DEFAULT_SAVE_DATA.nickname,
    DEFAULT_SAVE_DATA.hdnw,
  );

  return await makeWorkerReq(req).then(r => {
    console.log("WIPED")
    return r;
  });
};

export const load = async (fromReq?: ServerSentWorkerData) => {
  const res = fromReq ?? await makeWorkerReq(generateGet());

  if (!res.success) {
    switch (res.error?.abbrev) {
      case "EAUTH":
        window.location.href = AUTH_REDIRECT_URL;

        break;
    }
  }

  // Check if we already have a save
  if (res.results && res.results[0]) {
    const saveData = decodeSaveData((res.results as DBData[])[0].encoded_save);
    const edition = NaNNullCoerce(saveData.edition, "0");

    // Check if the save is the newest edition or at least compatible with the newest edition
    // If it isn't, begin a transition
    if (edition != SAVE_EDITION && !compatibleEditions.includes(edition)) {
      startTransition();
    }

    enterBuyMode();

    hds.value = NaNNullCoerce(saveData.hdc, 0);
    hdps.value = NaNNullCoerce(saveData.hdps, 0);

    butchersOwned.value = NaNNullCoerce(saveData.ownedButchers, 0);
    butcherPrice.value = calcCost(butcherPrice.value, butchersOwned.value);

    standsOwned.value = NaNNullCoerce(saveData.ownedStands, 0);
    standPrice.value = calcCost(standPrice.value, standsOwned.value);

    cartsOwned.value = NaNNullCoerce(saveData.ownedCarts, 0);
    cartPrice.value = calcCost(cartPrice.value, cartsOwned.value);

    trucksOwned.value = NaNNullCoerce(saveData.ownedTrucks, 0);
    truckPrice.value = calcCost(truckPrice.value, trucksOwned.value);

    plantationsOwned.value = NaNNullCoerce(saveData.ownedPlantations, 0);
    plantationPrice.value = calcCost(plantationPrice.value, plantationsOwned.value);

    factoriesOwned.value = NaNNullCoerce(saveData.ownedFactories, 0);
    factoryPrice.value = calcCost(factoryPrice.value, factoriesOwned.value);

    abattoirsOwned.value = NaNNullCoerce(saveData.ownedAbattoirs, 0);
    abattoirPrice.value = calcCost(abattoirPrice.value, abattoirsOwned.value);

    restaurantsOwned.value = NaNNullCoerce(saveData.ownedRestaurants, 0);
    restaurantPrice.value = calcCost(restaurantPrice.value, restaurantsOwned.value);

    franchisesOwned.value = NaNNullCoerce(saveData.ownedFranchises, 0);
    franchisePrice.value = calcCost(franchisePrice.value, franchisesOwned.value);

    hdnw.value = NaNNullCoerce(saveData.hdnw, 0);

    nickname.value =
      res.results[0].nickname &&
        isValidNickname(res.results[0].nickname)
        ? res.results[0].nickname
        : await notify(
          "Do not reload or leave the page; your data has not been saved. " +
          "Your nickname is either blank or exceeding the maximum length. " +
          "You will be asked to choose a new one once this notification is acknowledged."
        ).then(async () => nickname.value = await receiveNickname());

    // Load settings
    applySettings(saveData.settings)

    await save();
  } else {
    // If we do not have a save we need to create one

    // Get a nickname and create our save
    nickname.value = await receiveNickname()
    await save();
  }
};

export const restoreSave = async () => {
  const identifierRegex = /^[a-zA-Z0-9+\/]{43}=$/;

  const isValidIdentifier = (str: string) => str.length === 44 && identifierRegex.test(str);

  // Scroll to top
  window.scrollTo(0, 0)

  // Unhide dialog
  restoreDialogElement.classList.remove("hide");
  restoreDialogElement.showModal();

  restoreDialogElement.onclose = () => {
    // Hide dialog
    restoreDialogElement.classList.add("hide");

    // Remove listeners
    restoreDialogInputElement.onchange = null
    restoreDialogInputElement.oninput = null;
    restoreDialogElement.onclose = null
  }

  // listen for changes to input and add/remove data-unbuyable based on validity of the nickname
  restoreDialogInputElement.oninput = (e) => {
    e.preventDefault();

    const recvIdentifier = restoreDialogInputElement.value;

    const setInvalidState = (isInvalid: boolean) => {
      if (isInvalid) {
        restoreDialogInputElement.setAttribute("data-unbuyable", "true");
      } else {
        restoreDialogInputElement.removeAttribute("data-unbuyable");
      }
    }

    setInvalidState(!isValidIdentifier(recvIdentifier));
  }

  // listen for input
  restoreDialogInputElement.onchange = async (e) => {
    e.preventDefault();

    const cleanup = () => {
      // Hide dialog
      restoreDialogElement.classList.add("hide");
      restoreDialogElement.close();

      // Remove listeners
      restoreDialogInputElement.onchange = null
      restoreDialogElement.onclose = null
    };

    const recvIdentifier = restoreDialogInputElement.value.trim();

    if (!isValidIdentifier(recvIdentifier)) {
      notify(`Invalid identifier; ${recvIdentifier.length !== 44 ? `invalid length ${recvIdentifier.length}` : "invalid identifier"}`)

      // Invalid identifier; end here.
      return cleanup();
    }

    // Make sure there is a save to copy data into
    await save()

    // Generate the restore request
    const req = generateRestore(recvIdentifier)

    // Make the request
    const res = await makeWorkerReq(req)

    // Load the save from the returned data of the request
    load(res)

    // Submit the form
    restoreDialogFormElement.dispatchEvent(
      new SubmitEvent("submit", {
        cancelable: false,
        submitter: restoreDialogInputElement
      })
    );

    cleanup();

    notify("Save restored successfully.")
  };
};

export const getIdentifierCode = async () => {
  const req = generateIdent()
  const { ident } = await makeWorkerReq(req)

  return notify(`Your identifier code is '${ident}'`)
}
