import { settingsDialogContainerElement, settingsDialogElement, settingsNumberDigitsDisplayElement, settingsNumberDigitsOptionElement, settingsNumberFormatOptionElement } from "./elements";
import { bankCost, bunCost, bunCount, dadCost, facCost, farmCost, formatter, freezerCost, grillCost, hdnw, hdps, hds, portalCost, wormholeCost } from "./game";
import { handleLdbd } from "./leaderboard";

export type HDCNumberFormatSettingType = "Normal" | "Compact" | "Scientific"

export type HDCMappedNumberFormatSettingType = "standard" | 'compact' | "scientific"

export type HDCDigitCountSettingType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type HDCSettings = {
  numberOfDigits: HDCDigitCountSettingType,
  numberFormat: HDCNumberFormatSettingType
}

export const DEFAULT_SETTINGS = Object.freeze({
  numberOfDigits: 2,
  numberFormat: "Normal"
} as HDCSettings)

export let settings = Object.freeze({
  numberOfDigits: 2,
  numberFormat: "Normal"
} as HDCSettings)

export const applySettings = (settings: HDCSettings) => {
  // Apply settings
  const { numberOfDigits, numberFormat } = settings;

  const mappedNumberFormat = ({
    "Normal": "standard",
    "Compact": "compact",
    "Scientific": "scientific"
  } satisfies Record<HDCNumberFormatSettingType, HDCMappedNumberFormatSettingType>)[numberFormat]! as HDCMappedNumberFormatSettingType

  // Check if anything has even changed at all
  if (
    formatter.value.resolvedOptions().minimumFractionDigits === numberOfDigits &&
    formatter.value.resolvedOptions().maximumFractionDigits === numberOfDigits &&
    formatter.value.resolvedOptions().notation === mappedNumberFormat
  ) {
    return
  }

  const newOptions = formatter.value.resolvedOptions()

  settings = Object.freeze({
    numberOfDigits,
    numberFormat: numberFormat
  } satisfies HDCSettings)

  // Check for changes to the amount of digits to display
  if (
    formatter.value.resolvedOptions().minimumFractionDigits !== numberOfDigits ||
    formatter.value.resolvedOptions().maximumFractionDigits !== numberOfDigits
  ) {
    newOptions.minimumFractionDigits = numberOfDigits
    newOptions.maximumFractionDigits = numberOfDigits
  }

  if (
    formatter.value.resolvedOptions().notation !== mappedNumberFormat
  ) {
    newOptions.notation = mappedNumberFormat as ("standard" | "compact" | "scientific")
  }

  formatter.value = new Intl.NumberFormat(navigator.language, newOptions)

  // Trigger reformatting of every display
  hds.runSet()
  hdps.runSet()
  hdnw.runSet()
  bunCost.runSet()
  dadCost.runSet()
  grillCost.runSet()
  farmCost.runSet()
  facCost.runSet()
  bankCost.runSet()
  freezerCost.runSet()
  portalCost.runSet()
  wormholeCost.runSet()
  handleLdbd()

  // Set new values in UI for settings menu
  settingsNumberDigitsOptionElement.valueAsNumber = settings.numberOfDigits
  settingsNumberDigitsDisplayElement.textContent = settings.numberOfDigits.toString()
  settingsNumberFormatOptionElement.value = settings.numberFormat
}

export const changeSettings = async (): Promise<HDCSettings> => {
  return new Promise(res => {
    // Unhide dialog
    settingsDialogContainerElement.classList.remove("hide");
    settingsDialogElement.showModal();

    // Add listener to change display value of 'Number of digits' option
    settingsNumberDigitsOptionElement.oninput = () => {
      settingsNumberDigitsDisplayElement.textContent = settingsNumberDigitsOptionElement.value
    }

    settingsDialogElement.onclose = () => {
      const newSettings = {
        numberOfDigits: settingsNumberDigitsOptionElement.valueAsNumber as HDCDigitCountSettingType,
        numberFormat: settingsNumberFormatOptionElement.value as HDCNumberFormatSettingType
      }

      applySettings(newSettings)
      settings = newSettings

      // Remove listeners
      settingsNumberDigitsOptionElement.oninput = null
      settingsDialogElement.onclose = null

      settingsDialogContainerElement.classList.add("hide");
      res(newSettings)
    }
  })
}
