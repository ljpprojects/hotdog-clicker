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
  setNickname,
  portalCount,
} from "./game";

import {
  makeWorkerReq,
  generateGet,
  AUTH_REDIRECT_URL,
  generateReport,
  generateClaim,
} from "./worker/interfacing";

import { calcCost } from "./math";

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
   * The projected net worth of the user in 1 hour, assuming no new generators are acquired.
   */
  phdnw1: number;

  /**
   * The projected net worth of the user in 24 hours, assuming no new generators are acquired.
   */
  phdnw24: number;

  /**
   * The projected net worth of the user in 72 hours, assuming no new generators are acquired.
   */
  phdnw72: number;

  /**
   * The projected net worth of the user in 168 hours (1 week), assuming no new generators are acquired.
   */
  phdnw168: number;

  /**
   * The projected net worth of the user in 730 hours (The average amount of hours in a month rounded down), assuming no new generators are acquired.
   */
  phdnw730: number;

  /**
   * The projected net worth of the user in 2192 hours (The average amount of hours in 3 months rounded up), assuming no new generators are acquired.
   */
  phdnw2192: number;

  /**
   * The projected net worth of the user in 4383 hours (The average amount of hours in 6 months), assuming no new generators are acquired.
   */
  phdnw4383: number;

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
   * The nickname chosen by the user.
   */
  nickname: string;
}

export const DEFAULT_SAVE_DATA: HDCSaveData = {
  hdc: 0,
  hdps: 0,
  hdnw: 0,
  phdnw1: 0,
  phdnw24: 0,
  phdnw72: 0,
  phdnw168: 0,
  phdnw730: 0,
  phdnw2192: 0,
  phdnw4383: 0,
  ownedBuns: 0,
  ownedDads: 0,
  ownedGrills: 0,
  ownedFarms: 0,
  ownedFactories: 0,
  ownedBanks: 0,
  ownedFreezers: 0,
  ownedPortals: 0,
  nickname: "<not given>",
};

export const decodeSaveData = (data: string): HDCSaveData => {
  try {
    const raw = atob(data);
    const save = JSON.parse(raw) as HDCSaveData;

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
    nickname: nickname || "<not given>",

    // TODO: Net worth

    hdnw: 0,
    phdnw1: 0,
    phdnw24: 0,
    phdnw72: 0,
    phdnw168: 0,
    phdnw730: 0,
    phdnw2192: 0,
    phdnw4383: 0,
  };
};

export const generateEncodedSave = (from?: HDCSaveData): string => {
  const saveData = from ?? compileSave();
  const json = JSON.stringify(saveData);
  const encoded = btoa(json);

  return encoded;
};

export const save = async () => {
  const saveData = generateEncodedSave();
  const req = generateReport(saveData, nickname, compileSave().hdnw);

  const res = await makeWorkerReq(req);

  console.log(res);
};

export const wipe = () => {
  document.cookie = `saved=${generateEncodedSave(DEFAULT_SAVE_DATA)}; Max-Age=7776000; path=/;`;
  window.location.reload();
};

export const load = async () => {
  const res = await makeWorkerReq(generateGet());

  if (!res.success) {
    switch (res.error?.abbrev) {
      case "EAUTH":
        window.location.href = AUTH_REDIRECT_URL;

        break;
      case "ECLMR":
        console.warn("Claim must be made.")

        await makeWorkerReq(generateClaim());
        window.location.reload();

        break;
    }
  }

  // Check if we already have a save
  if (res.results && res.results[0]) {
    const saveData = decodeSaveData(res.results[0].encoded_save);

    hds.value = Number(saveData.hdc);
    hdps.value = Number(saveData.hdps);

    bunCount.value = saveData.ownedBuns;
    bunCost.value = calcCost(bunCost.value, bunCount.value);

    dadCount.value = saveData.ownedDads;
    dadCost.value = calcCost(dadCost.value, dadCount.value);

    grillCount.value = saveData.ownedGrills;
    grillCost.value = calcCost(grillCost.value, grillCount.value);

    farmCount.value = saveData.ownedFarms;
    farmCost.value = calcCost(farmCost.value, farmCount.value);

    facCount.value = saveData.ownedFactories;
    facCost.value = calcCost(facCost.value, facCount.value);

    bankCount.value = saveData.ownedBanks;
    bankCost.value = calcCost(bankCost.value, bankCount.value);

    freezerCount.value = saveData.ownedFreezers;
    freezerCost.value = calcCost(freezerCost.value, freezerCount.value);

    setNickname(
      res.results[0].nickname &&
        res.results[0].nickname.trim() !== "<not given>"
        ? res.results[0].nickname
        : (prompt("Enter a nickname (for the leaderboard)") ?? "<not given>"),
    );

    save();
  } // If we do not have a save we do not have to do anything
};
