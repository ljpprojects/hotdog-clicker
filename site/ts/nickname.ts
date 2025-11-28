import { ServerSentWorkerData } from "../../shared/types";
import {
  changeNicknameButton,
  nicknameDialogElement,
  nicknameDialogFormElement,
  nicknameDialogInputElement,
} from "./elements";
import { closeMainMenu } from "./ui";
import { conatainsHtmlTags } from "./html";
import { updateLeaderboard } from "./leaderboard";
import { NotificationDismissalMode, NotificationProminence, notify } from "./notify";
import { save } from "./save";

export const MAX_NICKNAME_LENGTH = 15;
export const PLACEHOLDER_NICKNAME = "<not given>";

/**
 * The nickname chosen by the user.
 */
export let nickname = PLACEHOLDER_NICKNAME;

export const isValidNickname = (nickname: string, allowExcessLength: boolean = true) => {
  const nonEmptyCondition = nickname.trim().length > 0;
  const lengthCondition = allowExcessLength || nickname.length <= MAX_NICKNAME_LENGTH;
  const notXssCondition = !conatainsHtmlTags(nickname);

  return nonEmptyCondition && lengthCondition && notXssCondition;
};

export const receiveNickname = async (rejectOnInvalid: boolean = false): Promise<string> => {
  // Scroll to top
  window.scrollTo(0, 0)

  // Unhide dialog
  nicknameDialogElement.classList.remove("hide");
  nicknameDialogElement.showModal();

  return new Promise((res, rej) => {
    nicknameDialogElement.onclose = () => {
      // Hide dialog
      nicknameDialogElement.classList.add("hide");

      // Remove listeners
      nicknameDialogInputElement.onchange = null
      nicknameDialogInputElement.oninput = null;
      nicknameDialogElement.onclose = null

      rej("Operation was cancelled.")
    }

    // listen for changes to input and add/remove data-unbuyable based on validity of the nickname
    nicknameDialogInputElement.oninput = (e) => {
      e.preventDefault();

      const recvNickname = nicknameDialogInputElement.value;

      const setInvalidState = (isInvalid: boolean) => {
        if (isInvalid) {
          console.log("Invalid nickname")
          nicknameDialogInputElement.setAttribute("data-unbuyable", "true");
        } else {
          nicknameDialogInputElement.removeAttribute("data-unbuyable");
        }
      }

      setInvalidState(!isValidNickname(recvNickname));
    }

    // listen for input submission
    nicknameDialogFormElement.onsubmit = (e) => {
      e.preventDefault();

      const cleanup = () => {
        // Hide the dialog
        nicknameDialogElement.classList.add("hide");
        nicknameDialogElement.close();

        // Remove listeners
        nicknameDialogInputElement.oninput = null
        nicknameDialogFormElement.onsubmit = null
        nicknameDialogElement.onclose = null
      };

      const recvNickname = nicknameDialogInputElement.value;
      const isInvalid = nicknameDialogInputElement.classList.contains("data-unbuyable") || !isValidNickname(recvNickname);

      // If the nickname is invalid, we cannot let the user submit it
      if (isInvalid && rejectOnInvalid) {
        cleanup();

        return rej("rejectOnInvalid was set to true and the given nickname was invalid.")
      } else if (!isInvalid) {
        // Submit the form
        const ev = new SubmitEvent("submit", {
          cancelable: false,
          submitter: nicknameDialogInputElement
        })

        nicknameDialogFormElement.dispatchEvent(ev);

        cleanup();

        updateLeaderboard().then(() => res(recvNickname));
      } else {
        nicknameDialogInputElement.value = "";
      }
    };

    setTimeout(() => rej("Operation timed out."), 60e3)
  });
};

changeNicknameButton.addEventListener("click", async () => {
  closeMainMenu()
  nickname = await receiveNickname();
})

export const selectNickname = async (res: ServerSentWorkerData) => {
  nickname =
    res.results![0].nickname &&
      isValidNickname(res.results![0].nickname)
      ? res.results![0].nickname
      : await notify({
        body: "Your data has not been saved. " +
          "Your nickname is invalid or you have not chosen one. " +
          "You will be asked to choose a new one once this notification is acknowledged.",
        title: "Your nickname is invalid.",
        prominence: NotificationProminence.Prominent,
        dismissalMode: NotificationDismissalMode.Manual,
      }).then(async () => nickname = await receiveNickname());
}

export const setNickname = async (to?: string) => {
  nickname = to ?? await receiveNickname()

  if (to == null) {
    await save()
  }
}
