import { settingsDialogCancelButton, settingsDialogContainerElement, settingsDialogElement, settingsNumberDigitsDisplayElement, settingsNumberDigitsOptionElement, settingsNumberFormatOptionElement, settingsShowTaxPopupOptionElement } from "./elements";
import { bankCost, bunCost, bunCount, dadCost, facCost, farmCost, formatter, freezerCost, grillCost, hdnw, hdps, hds, portalCost, wormholeCost } from "./game";
import { handleLdbd } from "./leaderboard";

export type HDCNumberFormatSettingType = "Normal" | "Compact" | "Scientific"

export type HDCMappedNumberFormatSettingType = "standard" | 'compact' | "scientific"

export type HDCDigitCountSettingType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export type HDCSettings = {
  numberOfDigits: HDCDigitCountSettingType,
  numberFormat: HDCNumberFormatSettingType,
  showTaxPopup: boolean,
}

export const DEFAULT_SETTINGS = Object.freeze({
  numberOfDigits: 2,
  numberFormat: "Normal",
  showTaxPopup: true,
} as HDCSettings)

export let settings = Object.freeze({
  numberOfDigits: 2,
  numberFormat: "Normal"
} as HDCSettings)

export const applySettings = (newSettings: HDCSettings) => {
  // Apply settings
  const { numberOfDigits, numberFormat, showTaxPopup } = newSettings;

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

  settings = Object.freeze(structuredClone(newSettings))

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
  settingsNumberDigitsOptionElement.valueAsNumber = newSettings.numberOfDigits
  settingsNumberDigitsDisplayElement.textContent = newSettings.numberOfDigits.toString()
  settingsNumberFormatOptionElement.value = newSettings.numberFormat
  settingsShowTaxPopupOptionElement.checked = newSettings.showTaxPopup
}

export const changeSettings = async (): Promise<HDCSettings> => {
  const oldSettings = structuredClone(settings)

  return new Promise(res => {
    // Unhide dialog
    settingsDialogContainerElement.classList.remove("hide");
    settingsDialogElement.showModal();

    // Add listener to change display value of 'Number of digits' option
    settingsNumberDigitsOptionElement.oninput = () => {
      settingsNumberDigitsDisplayElement.textContent = settingsNumberDigitsOptionElement.value
    }

    // Add listener for cancel
    settingsDialogCancelButton.onclick = () => {
      // Remove listeners
      settingsNumberDigitsOptionElement.oninput = null
      settingsDialogElement.onclose = null

      // Hide dialog
      settingsDialogContainerElement.classList.add("hide");
      settingsDialogElement.close()

      // Make sure no settings are changed from their original state
      applySettings(oldSettings)
      settings = Object.freeze(oldSettings)

      res(oldSettings)
    }

    settingsDialogElement.onclose = () => {
      const newSettings = {
        numberOfDigits: settingsNumberDigitsOptionElement.valueAsNumber as HDCDigitCountSettingType,
        numberFormat: settingsNumberFormatOptionElement.value as HDCNumberFormatSettingType,
        showTaxPopup: settingsShowTaxPopupOptionElement.checked,
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
