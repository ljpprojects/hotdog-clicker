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
} from "./game"

import {
  calcCost,
  increase
} from "./math"

export interface HDCSaveData {
  hdc: number;
  hdps: number;
  ownedBuns: number;
  ownedDads: number;
  ownedGrills: number;
  ownedFarms: number;
  ownedFactories: number;
  ownedBanks: number;
  ownedFreezers: number;
  ownedPortals: number;
  nickname: string;
}

export const DEFAULT_SAVE_DATA: HDCSaveData = {
  hdc: 0,
  hdps: 0,
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
    const raw = atob(data)
    const save = JSON.parse(raw) as HDCSaveData

    return save
  } catch (e) {
    console.error(e)

    return DEFAULT_SAVE_DATA
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
    ownedPortals: 0,
    nickname,
  }
}

export const generateEncodedSave = (from?: HDCSaveData): string => {
  const saveData = from ?? compileSave()
  const json = JSON.stringify(saveData)
  const encoded = btoa(json)

  return encoded;
};

export const save = () => {
  const saveData = generateEncodedSave();

  document.cookie = `saved=${saveData}; Max-Age=7776000; path=/;`;
};

export const wipe = () => {
  document.cookie = `saved=${generateEncodedSave(DEFAULT_SAVE_DATA)}; Max-Age=7776000; path=/;`;
  window.location.reload();
};

export const load = () => {
  const saveData = decodeSaveData(
    document.cookie.split("=")[1] || generateEncodedSave(DEFAULT_SAVE_DATA),
  );

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
};
