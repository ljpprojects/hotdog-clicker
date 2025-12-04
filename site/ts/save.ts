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
  restaurantsOwned,
  hdnw,
  franchisesOwned,
  restaurantPrice,
  franchisePrice,
} from "./game";

import {
  makeWorkerReq,
  generateGet,
  generateReport,
  generateIdent,
  generateRestore
} from "./worker/interfacing";

import { calcCost } from "./maths";
import { DBData, ServerSentWorkerData } from "../../shared/types";
import {
  isValidNickname,
  MAX_NICKNAME_LENGTH,
  selectNickname,
  nickname,
  PLACEHOLDER_NICKNAME,
  setNickname,
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
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";

/**
 * Major save editions are incremented when a previous save edition with the
 * previous major edition cannot be converted automatically to this new edition.
 *
 * The 0 edition is the unknown edition.
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

export interface HDCGeneralSave {
  edition: number | SaveEdition;
}

export interface HDCOldSaveData extends HDCGeneralSave {
  /**
   * The edition of the save.
   * The edition of the HDCOldSaveData is 2.
   */
  edition: number;

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

  /**
   * The amount of "Bun" generators owned by the user.
   */
  ownedBuns: number;

  /**
   * The amount of "Dad" generators owned by the user.
   */
  ownedDads: number;

  /**
   * The amount of "Grill" generators owned by the user.
   */
  ownedGrills: number;

  /**
   * The amount of "Farm" generators owned by the user.
   */
  ownedFarms: number;

  /**
   * The amount of "Factory" generators owned by the user.
   */
  ownedFactories: number;

  /**
   * The amount of "Bank" generators owned by the user.
   */
  ownedBanks: number;

  /**
   * The amount of "Freezer" generators owned by the user.
   */
  ownedFreezers: number;

  /**
   * The amount of "Portal" generators owned by the user.
   */
  ownedPortals: number;

  /**
   * The amount of "Wormhole" generators owned by the user.
   */
  ownedWormholes: number;

  /**
   * The nickname chosen by the user.
   */
  nickname: string;

  /**
   * The settings selected by the user.
   */
  settings: HDCSettings;
}

export interface HDCSaveData extends HDCGeneralSave {
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

export const decodeSaveData = function _a<T extends HDCGeneralSave>(data: string): T | HDCSaveData {
  try {
    const raw = Uint8Array.fromBase64(data);
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(raw);

    console.log(text)

    const save = JSON.parse(text) as T;

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
    nickname: (nickname || PLACEHOLDER_NICKNAME).slice(MAX_NICKNAME_LENGTH),
    hdnw: hdnw.value,
    settings,
  };
};

export const generateEncodedSave = (from?: HDCSaveData): string => {
  const saveData = from ?? compileSave();
  const json = JSON.stringify(saveData);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(json).toBase64();

  return encoded;
};

export const save = async (from?: HDCSaveData): Promise<ServerSentWorkerData> => {
  const saveData = generateEncodedSave(from);
  const req = generateReport(saveData, nickname, (from ?? compileSave()).hdnw);

  return await makeWorkerReq(req);
};

export const wipe = async (): Promise<ServerSentWorkerData> => {
  const saveData = generateEncodedSave(DEFAULT_SAVE_DATA);
  const req = generateReport(
    saveData,
    DEFAULT_SAVE_DATA.nickname,
    DEFAULT_SAVE_DATA.hdnw,
  );

  return await makeWorkerReq(req);
};

export const loadFromSave = (saveData: HDCSaveData) => {
  hds.value = NaNNullCoerce(saveData.hdc, 0);
  hdps.value = NaNNullCoerce(saveData.hdps, 0);

  butchersOwned.value = NaNNullCoerce(saveData.ownedButchers, 0);
  butcherPrice.value = calcCost(butcherPrice.initialBacking!, butchersOwned.value);

  standsOwned.value = NaNNullCoerce(saveData.ownedStands, 0);
  standPrice.value = calcCost(standPrice.initialBacking!, standsOwned.value);

  cartsOwned.value = NaNNullCoerce(saveData.ownedCarts, 0);
  cartPrice.value = calcCost(cartPrice.initialBacking!, cartsOwned.value);

  trucksOwned.value = NaNNullCoerce(saveData.ownedTrucks, 0);
  truckPrice.value = calcCost(truckPrice.initialBacking!, trucksOwned.value);

  plantationsOwned.value = NaNNullCoerce(saveData.ownedPlantations, 0);
  plantationPrice.value = calcCost(plantationPrice.initialBacking!, plantationsOwned.value);

  factoriesOwned.value = NaNNullCoerce(saveData.ownedFactories, 0);
  factoryPrice.value = calcCost(factoryPrice.initialBacking!, factoriesOwned.value);

  abattoirsOwned.value = NaNNullCoerce(saveData.ownedAbattoirs, 0);
  abattoirPrice.value = calcCost(abattoirPrice.initialBacking!, abattoirsOwned.value);

  restaurantsOwned.value = NaNNullCoerce(saveData.ownedRestaurants, 0);
  restaurantPrice.value = calcCost(restaurantPrice.initialBacking!, restaurantsOwned.value);

  franchisesOwned.value = NaNNullCoerce(saveData.ownedFranchises, 0);
  franchisePrice.value = calcCost(franchisePrice.initialBacking!, franchisesOwned.value);

  hdnw.value = NaNNullCoerce(saveData.hdnw, 0);

  // Load settings
  applySettings(saveData.settings)
}

export const load = async (fromReq?: ServerSentWorkerData) => {
  let res = fromReq ?? await makeWorkerReq(generateGet());

  if (!res.success) {
    switch (res.error?.abbrev) {
      case "EAUTH":
        await fetch("/auth");
        res = await makeWorkerReq(generateGet());

        break;
    }
  }

  // Check if we already have a save
  if (res.results && res.results[0]) {
    const generalSaveData = decodeSaveData((res.results as DBData[])[0].encoded_save);
    const edition = NaNNullCoerce(generalSaveData.edition, "0");

    // Check if the save is the newest edition or at least compatible with the newest edition
    // If it isn't, begin a transition
    if (edition !== SAVE_EDITION && !compatibleEditions.includes(edition.toString() as SaveEdition)) {
      await startTransition(generalSaveData as HDCOldSaveData);

      return;
    }

    setNickname(res.results![0].nickname)

    const saveData = generalSaveData as HDCSaveData;

    enterBuyMode();

    loadFromSave(saveData)
  } else {
    // If we do not have a save we need to create one

    // Set our nickname
    setNickname();

    enterBuyMode();

    // And create a save
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
      restoreDialogInputElement.value = "";

      return;
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

    notify({
      body: "Save restored successfully.",
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
    })
  };
};

export const getAndShowIdentifierCode = async (): Promise<string> => {
  return new Promise(async res => {
    const req = generateIdent()
    const { ident } = await makeWorkerReq(req)

    res(ident!)

    await notify({
      title: "",
      body: `Your identifier code is '${ident}'`,
      prominence: NotificationProminence.Popup,
      dismissalMode: NotificationDismissalMode.Manual,
    })
  })
}
