import { hotdogButtonElement } from "./elements";
import { shouldQuitEventLoop } from "./game";
import { Mode, mode, setTransitionMode } from "./mode";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { DEFAULT_SAVE_DATA, HDCOldSaveData, load, loadFromSave } from "./save";

export let tempNewSave = DEFAULT_SAVE_DATA;

export const startTransition = async (oldSave: HDCOldSaveData) => {
  setTransitionMode();

  await notify({
    title: "Mode changed automatically.",
    body: "You are in transition mode. This is so you can manually migrate between game editions when it cannot be done automatically. Press SHIFT + ENTER to complete the transition.",
    prominence: NotificationProminence.Prominent,
    dismissalMode: NotificationDismissalMode.Manual,
  });

  // Just in case
  tempNewSave = DEFAULT_SAVE_DATA;

  // Transfer all of net worth to the temp save's hdc
  tempNewSave.hdc = oldSave.hdnw;

  // The net worth can be left at 0 so that once all the money is spent the net worth has not changed
  // If there are funds leftover, they will be counted when exiting transition mode

  // Keep the nickname & settings
  tempNewSave.nickname = oldSave.nickname;
  tempNewSave.settings = oldSave.settings;

  // Inhibit event loop from running more than once (it should check the mode anyway, though)
  shouldQuitEventLoop.value = true;

  // load the tempNewSave
  loadFromSave(tempNewSave)

  hotdogButtonElement.setAttribute("data-unbuyable", "true");
  hotdogButtonElement.setAttribute("disabled", "true");

  console.log("In transition mode")
};
