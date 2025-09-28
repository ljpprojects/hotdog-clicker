import {
  hds,
  hdps,
  bunCount,
  dadCount,
  grillCount,
  farmCount,
  facCount,
  bankCount,
  freezerCount,
  bunCost,
  dadCost,
  grillCost,
  farmCost,
  facCost,
  bankCost,
  freezerCost,
  nickname,
  portalCount,
  hdnw,
  wormholeCount,
  portalCost,
  wormholeCost,
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
  restoreDialogContainerElement,
  restoreDialogElement,
  restoreDialogFormElement,
  restoreDialogInputElement
} from "./elements"
import { applySettings, DEFAULT_SETTINGS, HDCSettings, settings } from "./settings";
import { NaNNullCoerce } from "./utils";

export interface HDCSaveData {
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

export const DEFAULT_SAVE_DATA: HDCSaveData = {
  hdc: 0,
  hdps: 0,
  hdnw: 0,
  ownedBuns: 0,
  ownedDads: 0,
  ownedGrills: 0,
  ownedFarms: 0,
  ownedFactories: 0,
  ownedBanks: 0,
  ownedFreezers: 0,
  ownedPortals: 0,
  ownedWormholes: 0,
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
    hdc: hds.value,
    hdps: hdps.value,
    ownedBuns: bunCount.value,
    ownedDads: dadCount.value,
    ownedGrills: grillCount.value,
    ownedFarms: farmCount.value,
    ownedFactories: facCount.value,
    ownedBanks: bankCount.value,
    ownedFreezers: freezerCount.value,
    ownedPortals: portalCount.value,
    ownedWormholes: wormholeCount.value,
    nickname: (nickname.value || PLACEHOLDER_NICKNAME).slice(MAX_NICKNAME_LENGTH),
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

  return await makeWorkerReq(req);
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

    hds.value = NaNNullCoerce(saveData.hdc);
    hdps.value = NaNNullCoerce(saveData.hdps);

    bunCount.value = NaNNullCoerce(saveData.ownedBuns);
    bunCost.value = calcCost(bunCost.value, bunCount.value);

    dadCount.value = NaNNullCoerce(saveData.ownedDads);
    dadCost.value = calcCost(dadCost.value, dadCount.value);

    grillCount.value = NaNNullCoerce(saveData.ownedGrills);
    grillCost.value = calcCost(grillCost.value, grillCount.value);

    farmCount.value = NaNNullCoerce(saveData.ownedFarms);
    farmCost.value = calcCost(farmCost.value, farmCount.value);

    facCount.value = NaNNullCoerce(saveData.ownedFactories);
    facCost.value = calcCost(facCost.value, facCount.value);

    bankCount.value = NaNNullCoerce(saveData.ownedBanks);
    bankCost.value = calcCost(bankCost.value, bankCount.value);

    freezerCount.value = NaNNullCoerce(saveData.ownedFreezers);
    freezerCost.value = calcCost(freezerCost.value, freezerCount.value);

    portalCount.value = NaNNullCoerce(saveData.ownedPortals);
    portalCost.value = calcCost(portalCost.value, portalCount.value);

    wormholeCount.value = NaNNullCoerce(saveData.ownedWormholes);
    wormholeCost.value = calcCost(wormholeCost.value, wormholeCount.value);

    hdnw.value = NaNNullCoerce(saveData.hdnw);

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

  // Scroll to top
  window.scrollTo(0, 0)

  // Unhide dialog
  restoreDialogContainerElement.classList.remove("hide");
  restoreDialogElement.showModal();

  restoreDialogElement.onclose = () => {
    // Hide dialog
    restoreDialogContainerElement.classList.add("hide");

    // Remove listeners
    restoreDialogInputElement.onchange = null
    restoreDialogElement.onclose = null
  }

  // listen for input
  restoreDialogInputElement.onchange = async (e) => {
    e.preventDefault();

    const cleanup = () => {
      // Submit the form
      restoreDialogFormElement.dispatchEvent(
        new SubmitEvent("submit", {
          cancelable: false,
          submitter: restoreDialogInputElement
        })
      );

      // Hide dialog
      restoreDialogContainerElement.classList.add("hide");
      restoreDialogElement.close();

      // Remove listeners
      restoreDialogInputElement.onchange = null
      restoreDialogElement.onclose = null
    };

    const recvIdentifier = restoreDialogInputElement.value.trim();

    if (
      recvIdentifier.length !== 44 ||
      !identifierRegex.test(recvIdentifier)
    ) {
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

    cleanup();

    notify("Save restored successfully.")
  };
};

export const getIdentifierCode = async () => {
  const req = generateIdent()
  const { ident } = await makeWorkerReq(req)

  return notify(`Your identifier code is '${ident}'`)
}
