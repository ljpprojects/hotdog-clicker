// Not so boring now, is it, bitch?

import { Binding } from "./Binding";
import { gamblingDialog, openGamblingButton, slotBoxes, spinSlotsButton } from "./elements";
import { formatter, hdnw, hds } from "./game";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { wait, wrappingAdd } from "./utils";
import { closeMainMenu } from "./ui";

export const GAMBLING_NW_THRESHOLD = 250;

const slot1Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(to) {
    this.setBacking(to)

    slotBoxes[0].textContent = to.toPrecision(1);
  },
});

const slot2Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(to) {
    this.setBacking(to)

    slotBoxes[1].textContent = to.toPrecision(1);
  },
});

const slot3Binding = new Binding<number, number>({
  backing: 0,
  getfn() {
    return this.getBacking() ?? 0
  },
  setfn(to) {
    this.setBacking(to)

    slotBoxes[2].textContent = to.toPrecision(1);
  },
});

const SLOTS_COOLDOWN = 500;

spinSlotsButton.addEventListener("click", async () => {
  spinSlotsButton.setAttribute("disabled", "true");
  spinSlotsButton.setAttribute("data-unbuyable", "true");

  // Get 3 random digits
  const randomBytes = new Uint8Array(3);
  crypto.getRandomValues(randomBytes);

  // Extract digits, ensuring they are within 0-9 (using mod 10)
  const digit1 = randomBytes[0] % 10;
  const digit2 = randomBytes[1] % 10;
  const digit3 = randomBytes[2] % 10;

  // The (approximate) time to wait before showing results
  const TIME_TO_WAIT_MS = 1000;
  const LOOP_DELAY = 10;

  let endTime = performance.now() + TIME_TO_WAIT_MS;

  for (let i = 0; ; i++) {
    if (performance.now() - (endTime - LOOP_DELAY * i) > 0) {
      slot1Binding.value = digit1;
      slot2Binding.value = digit2;
      slot3Binding.value = digit3;

      break
    }

    slot1Binding.value = wrappingAdd(1, slot1Binding.value, 10);
    slot2Binding.value = wrappingAdd(1, slot2Binding.value, 10);
    slot3Binding.value = wrappingAdd(1, slot3Binding.value, 10);

    await wait(LOOP_DELAY);
  }

  const digits = [slot1Binding.value.toPrecision(1), slot2Binding.value.toPrecision(1), slot3Binding.value.toPrecision(1)];

  // Check fi we have 777
  if (digits.every(d => d === "7")) {
    // SUPER JACKPOT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // WE WINNNNNNN
    const amountWon = Math.max(hdnw.value, 10e9);
    hds.value += amountWon;

    await notify({
      title: "SUPER JACKPOT!!!!!!!!!",
      body: `You won the SUPER JACKPOT of ${formatter.value.format(amountWon)}`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Manual,
    }, 500)
  }
  // Check if all digits are the same
  else if (digits.every(d => d === slot1Binding.value.toPrecision(1))) {
    // JACKPOT

    // WE WINNNNNNN
    const amountWon = Math.max(hdnw.value / 2, 1e9);
    hds.value += amountWon;

    await notify({
      title: "JACKPOT!!!!",
      body: `You won the JACKPOT of ${formatter.value.format(amountWon)}`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Manual,
    }, 500)
  } else if (digits.some((d, i, a) => i < a.length - 1 && d === a[i + 1])) { // Check if we have two consecutive same digits
    // WE WIN

    const amountWon = hdnw.value / 10;
    hds.value += amountWon;

    await notify({
      title: "WINNER!!!!",
      body: `You win ${formatter.value.format(amountWon)}`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 3000,
    }, 500)
  } else if (new Set(digits).size !== digits.length) { // Check if we have two same digits
    // WE WIN

    const amountWon = hdnw.value / 100;
    hds.value += amountWon;

    await notify({
      title: "winner?",
      body: `You win ${formatter.value.format(amountWon)}`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 3000,
    }, 500)
  } else { // YOU LOSSSSSSSSSSSSSEEEEEE!!!!!!!!!!! 😭😭😭😭😭😭😭 imagine
    const amountLost = hdnw.value / 20;
    hds.value -= amountLost;

    await notify({
      title: "LOOOOOSSSSEEERRRR!",
      body: `lol you lost ${formatter.value.format(amountLost)}`,
      prominence: NotificationProminence.Banner,
      dismissalMode: NotificationDismissalMode.Automatic,
      dismissalTimeMs: 3000,
    }, 500)
  }

  setTimeout(() => {
    spinSlotsButton.removeAttribute("disabled");
    spinSlotsButton.removeAttribute("data-unbuyable");
    spinSlotsButton.focus();
  }, SLOTS_COOLDOWN)
})

openGamblingButton.addEventListener("click", () => {
  closeMainMenu();
  gamblingDialog.showModal();
})
