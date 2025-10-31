import {
  nicknameDialogElement,
  nicknameDialogFormElement,
  nicknameDialogInputElement,
} from "./elements";
import { conatainsHtml } from "./html";

export const MAX_NICKNAME_LENGTH = 15;
export const PLACEHOLDER_NICKNAME = "<not given>";

export const isValidNickname = (nickname: string, allowExcessLength: boolean = true) => {
  const nonEmptyCondition = nickname.trim().length > 0;
  const lengthCondition = allowExcessLength || nickname.length <= MAX_NICKNAME_LENGTH;
  const notXssCondition = !conatainsHtml(nickname);

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
    nicknameDialogInputElement.onchange = (e) => {
      e.preventDefault();

      const cleanup = () => {
        // Hide the dialog
        nicknameDialogElement.classList.add("hide");
        nicknameDialogElement.close();

        // Remove listeners
        nicknameDialogInputElement.onchange = null
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

        res(recvNickname.slice(0, MAX_NICKNAME_LENGTH));
      } else {
        nicknameDialogInputElement.value = "";
      }
    };

    setTimeout(() => rej("Operation timed out."), 60e3)
  });
};
