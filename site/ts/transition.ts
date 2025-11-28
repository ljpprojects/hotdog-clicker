import { completeSaveTransitionButton, hotdogButtonElement } from "./elements";
import { evloop, hdnw, hds, shouldQuitEventLoop } from "./game";
import { enterBuyMode, Mode, setMode, setTransitionMode } from "./mode";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { compileSave, DEFAULT_SAVE_DATA, HDCOldSaveData, loadFromSave, save } from "./save";
import { closeMainMenu } from "./ui";

export const startTransition = async (oldSave: HDCOldSaveData) => {
  setTransitionMode();

  await notify({
    title: "Mode changed automatically.",
    body: "You are in transition mode. This is so you can manually migrate between game editions when it cannot be done automatically. Press SHIFT + ENTER to complete the transition, or press 'Finish Save Transition' in the main menu.",
    prominence: NotificationProminence.Prominent,
    dismissalMode: NotificationDismissalMode.Manual,
  });

  const tempNewSave = DEFAULT_SAVE_DATA;

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

  completeSaveTransitionButton.classList.remove("hide")
};

const exitTransitionMode = async () => {
  // Go into FREEZE_MODE (to make requests to the backend)
  setMode(Mode.FREEZE_MODE);

  // Add any remaining hds to the hdnw
  hdnw.value += hds.value;
  hds.value = 0;

  // Create encoded save
  const newSave = compileSave()

  // Save
  await save(newSave)

  // Enter the buying mode & restart the event loop
  enterBuyMode()

  await notify({
    body: "Your save has been transitioned to the newest version.",
    prominence: NotificationProminence.Banner,
    dismissalMode: NotificationDismissalMode.Automatic,
    dismissalTimeMs: 7,
  })

  requestAnimationFrame(evloop)
}

// Add an event listener to exit the transition mode
document.addEventListener("keydown", async e => {
  if (e.code === "Enter" && e.shiftKey) {
    await exitTransitionMode()
  }
});

completeSaveTransitionButton.onclick = async () => {
  await exitTransitionMode()
  closeMainMenu()

  completeSaveTransitionButton.onclick = null;
  completeSaveTransitionButton.setAttribute("data-unbuyable", "true");
  completeSaveTransitionButton.setAttribute("disabled", "true");
  completeSaveTransitionButton.classList.add("hide")
}
