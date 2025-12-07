import { Binding } from '../Binding';
import { abattoirPrice, butcherPrice, cartPrice, factoryPrice, formatter, franchisePrice, hdnw, hdps, hds, plantationPrice, restaurantPrice, standPrice, truckPrice } from '../game';
import { updateLeaderboard } from '../leaderboard';
import { deepEqual, deepFreeze, DeepReadonly } from '../utils';
import { decimalPrecisionBinding, gamblingEnabledBinding, ldbdPlacesBinding, numberFormatBinding, soundEnabledBinding } from './bindings';
import { numberFormatValue, settingsCancelElement, settingsDialogElement, settingsFormElement } from './elements';
import './ui';

export type HDCNumberFormat = "standard" | "compact" | "scientific"

export type HDCSettings = {
  decimalPrecision: number;
  numberFormat: HDCNumberFormat;
  maxLdbdPlaces: number;
  enableGambling: boolean;
  enableSounds: boolean;
}

export const DEFAULT_SETTINGS: DeepReadonly<HDCSettings> = Object.freeze({
  decimalPrecision: 2,
  numberFormat: "standard",
  maxLdbdPlaces: 15,
  enableGambling: false,
  enableSounds: true,
} as HDCSettings);

export const settings: Binding<DeepReadonly<HDCSettings>, HDCSettings> = new Binding({
  backing: structuredClone(DEFAULT_SETTINGS),

  setfn(newSettings, dispatcher?: string) {
    // Apply settings

    // Exit early if there are no changes
    if (deepEqual(this.getBacking()!, newSettings)) {
      console.warn("Exiting early, no changes.")

      return;
    }

    const newFormatterOptions = formatter.value.resolvedOptions();

    const {
      enableGambling,
      enableSounds,
      numberFormat,
      decimalPrecision,
      maxLdbdPlaces
    } = newSettings;

    this.setBacking(newSettings);

    // Check for changes to the amount of digits to display
    if (
      formatter.value.resolvedOptions().minimumFractionDigits !== decimalPrecision ||
      formatter.value.resolvedOptions().maximumFractionDigits !== decimalPrecision
    ) {
      newFormatterOptions.minimumFractionDigits = decimalPrecision;
      newFormatterOptions.maximumFractionDigits = decimalPrecision;
    }

    if (
      formatter.value.resolvedOptions().notation !== numberFormat
    ) {
      newFormatterOptions.notation = numberFormat;
      console.log(numberFormat)
    }

    formatter.value = new Intl.NumberFormat(navigator.language, newFormatterOptions);

    // Trigger reformatting of every display
    hds.runSet();
    hdps.runSet();
    hdnw.runSet();
    butcherPrice.runSet();
    standPrice.runSet();
    cartPrice.runSet();
    truckPrice.runSet();
    plantationPrice.runSet();
    factoryPrice.runSet();
    abattoirPrice.runSet();
    restaurantPrice.runSet();
    franchisePrice.runSet();
    updateLeaderboard();

    decimalPrecisionBinding.value = decimalPrecision;
    numberFormatBinding.value = numberFormat;
    gamblingEnabledBinding.value = enableGambling;
    soundEnabledBinding.value = enableSounds;
    ldbdPlacesBinding.value = maxLdbdPlaces;
  },

  getfn(dispatcher?: string) {
    const _settings = this.getBacking()!;
    const copy = structuredClone(_settings);

    return deepFreeze(copy);
  }
});

export const changeSettings = async (): Promise<HDCSettings> => {
  return new Promise((res, rej) => {
    // Scroll to top
    window.scrollTo(0, 0)

    // Unhide dialog
    settingsDialogElement.classList.remove("hide");
    settingsDialogElement.showModal();

    // Add listener for cancel
    settingsCancelElement.onclick = () => {
      // Hide dialog
      settingsDialogElement.classList.add("hide");
      settingsDialogElement.close()

      rej("Operation cancelled by user.")
    }

    settingsFormElement.onsubmit = () => {
      const newSettings: HDCSettings = {
        decimalPrecision: decimalPrecisionBinding.value,
        enableGambling: gamblingEnabledBinding.value,
        enableSounds: soundEnabledBinding.value,
        numberFormat: numberFormatBinding.value,
        maxLdbdPlaces: ldbdPlacesBinding.value,
      }

      settings.value = newSettings

      console.log(newSettings)

      res(newSettings)
    }
  })
}

export const coerceSettings = (o: { [name: string]: any } | undefined): HDCSettings => ({
  decimalPrecision: o?.decimalPrecision ?? o?.numberOfDigits ?? DEFAULT_SETTINGS.decimalPrecision,
  numberFormat: ({ "Normal": "standard", "Compact": "compact", "Scientific": "scientific" })[o?.numberFormat as string] ?? o?.numberFormat ?? DEFAULT_SETTINGS.numberFormat,
  enableSounds: o?.enableSounds ?? DEFAULT_SETTINGS.enableSounds,
  enableGambling: o?.enableGambling ?? DEFAULT_SETTINGS.enableGambling,
  maxLdbdPlaces: o?.maxLdbdPlaces ?? DEFAULT_SETTINGS.maxLdbdPlaces
})
