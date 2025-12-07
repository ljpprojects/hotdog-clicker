export type SettingElementSet = {
  display: HTMLSpanElement;
  value: HTMLInputElement;
};

export const decimalPrecisionElementSet: SettingElementSet = {
  display: document.querySelector<HTMLSpanElement>("#decimal-precision-display")!,
  value: document.querySelector("#decimal-precision")!,
}

export const leaderboardPlacesElementSet: SettingElementSet = {
  display: document.querySelector<HTMLSpanElement>("#ldbd-places-display")!,
  value: document.querySelector("#ldbd-places")!,
}

export const soundsEnabledValue: HTMLInputElement = document.querySelector("#sounds-enabled")!;
export const gamblingEnabledValue: HTMLInputElement = document.querySelector("#gambling-enabled")!;
export const numberFormatValue: HTMLInputElement = document.querySelector("#number-format")!;

export const settingsDialogElement: HTMLDialogElement = document.querySelector("#settings-menu")!;
export const settingsFormElement: HTMLFormElement = document.querySelector("#settings-menu > form")!;
export const settingsCancelElement: HTMLButtonElement = document.querySelector("#settings-cancel")!;
