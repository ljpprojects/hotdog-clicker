import { HDCNumberFormat } from ".";
import { decimalPrecisionBinding, gamblingEnabledBinding, ldbdPlacesBinding, numberFormatBinding, soundEnabledBinding } from "./bindings";
import { decimalPrecisionElementSet, gamblingEnabledValue, leaderboardPlacesElementSet, numberFormatValue, soundsEnabledValue } from "./elements";

gamblingEnabledValue.addEventListener("input", () => {
  gamblingEnabledBinding.value = gamblingEnabledValue.checked;
})

soundsEnabledValue.addEventListener("input", () => {
  soundEnabledBinding.value = soundsEnabledValue.checked;
})

decimalPrecisionElementSet.value.addEventListener("input", () => {
  decimalPrecisionBinding.value = decimalPrecisionElementSet.value.valueAsNumber
});

leaderboardPlacesElementSet.value.addEventListener("input", () => {
  ldbdPlacesBinding.value = leaderboardPlacesElementSet.value.valueAsNumber
});

numberFormatValue.addEventListener("input", () => {
  numberFormatBinding.value = numberFormatValue.value as HDCNumberFormat;
})
