import { HDCNumberFormat } from ".";
import { GeneralBinding } from "../Binding";
import {
  decimalPrecisionElementSet,
  gamblingEnabledValue,
  leaderboardPlacesElementSet,
  numberFormatValue,
  soundsEnabledValue,
} from "./elements";

export type SettingBinding<T> = GeneralBinding<T, T>;

export const soundEnabledBinding: SettingBinding<boolean> = new GeneralBinding({
  backing: false, // massive performance hit if this is on for some reason

  setfn(enable, dispatcher?) {
    this.value = enable;

    // Update display
    soundsEnabledValue.checked = enable;
  },

  getfn(dispatcher?) {
    return this.value!;
  },
});

export const gamblingEnabledBinding: SettingBinding<boolean> =
  new GeneralBinding({
    backing: true,

    setfn(enable, dispatcher?) {
      this.value = enable;

      // Update display
      gamblingEnabledValue.checked = enable;
    },

    getfn(dispatcher?) {
      return this.value!;
    },
  });

export const numberFormatBinding: SettingBinding<HDCNumberFormat> =
  new GeneralBinding({
    backing: "standard" as HDCNumberFormat,

    setfn(format, dispatcher?) {
      this.value = format;

      // Update display
      numberFormatValue.value = format;
    },

    getfn(dispatcher?) {
      return this.value!;
    },
  });

export const decimalPrecisionBinding: SettingBinding<number> =
  new GeneralBinding({
    backing: 2,

    setfn(precision, dispatcher?) {
      if (precision < 0 || precision > 10) {
        return;
      }

      this.value = precision;

      // Update display
      decimalPrecisionElementSet.value.valueAsNumber =
        decimalPrecisionElementSet.value.valueAsNumber;
      decimalPrecisionElementSet.display.textContent =
        decimalPrecisionElementSet.value.valueAsNumber.toFixed(0);
    },

    getfn(dispatcher?) {
      return this.value!;
    },
  });

export const ldbdPlacesBinding: SettingBinding<number> = new GeneralBinding({
  backing: 15,

  setfn(places, dispatcher?) {
    if (places < 3 || places > 40) {
      return;
    }

    this.value = places;

    // Update display
    leaderboardPlacesElementSet.value.valueAsNumber =
      leaderboardPlacesElementSet.value.valueAsNumber;
    leaderboardPlacesElementSet.display.textContent =
      leaderboardPlacesElementSet.value.valueAsNumber.toFixed(0);
  },

  getfn(dispatcher?) {
    return this.value!;
  },
});
