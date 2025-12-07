import { HDCNumberFormat } from ".";
import { Binding } from "../Binding"
import { decimalPrecisionElementSet, gamblingEnabledValue, leaderboardPlacesElementSet, numberFormatValue, soundsEnabledValue } from "./elements";

export type SettingBinding<T> = Binding<T, T>;

export const soundEnabledBinding: SettingBinding<boolean> = new Binding({
  backing: true,

  setfn(enable, dispatcher?) {
    this.setBacking(enable);

    // Update display
    soundsEnabledValue.checked = enable;
  },

  getfn(dispatcher?) {
    return this.getBacking()!
  }
})

export const gamblingEnabledBinding: SettingBinding<boolean> = new Binding({
  backing: true,

  setfn(enable, dispatcher?) {
    this.setBacking(enable);

    // Update display
    gamblingEnabledValue.checked = enable;
  },

  getfn(dispatcher?) {
    return this.getBacking()!
  }
})

export const numberFormatBinding: SettingBinding<HDCNumberFormat> = new Binding({
  backing: "standard" as HDCNumberFormat,

  setfn(format, dispatcher?) {
    this.setBacking(format);

    // Update display
    numberFormatValue.value = format;
  },

  getfn(dispatcher?) {
    return this.getBacking()!
  }
})

export const decimalPrecisionBinding: SettingBinding<number> = new Binding({
  backing: 2,

  setfn(precision, dispatcher?) {
    if (precision < 0 || precision > 10) {
      return
    }

    this.setBacking(precision);

    // Update display
    decimalPrecisionElementSet.value.valueAsNumber = decimalPrecisionElementSet.value.valueAsNumber;
    decimalPrecisionElementSet.display.textContent = decimalPrecisionElementSet.value.valueAsNumber.toFixed(0);
  },

  getfn(dispatcher?) {
    return this.getBacking()!
  }
})

export const ldbdPlacesBinding: SettingBinding<number> = new Binding({
  backing: 15,

  setfn(places, dispatcher?) {
    if (places < 3 || places > 40) {
      return
    }

    this.setBacking(places);

    // Update display
    leaderboardPlacesElementSet.value.valueAsNumber = leaderboardPlacesElementSet.value.valueAsNumber;
    leaderboardPlacesElementSet.display.textContent = leaderboardPlacesElementSet.value.valueAsNumber.toFixed(0);
  },

  getfn(dispatcher?) {
    return this.getBacking()!
  }
})
