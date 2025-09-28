import {
  nicknameDialogContainerElement,
  nicknameDialogElement,
  nicknameDialogFormElement,
  nicknameDialogInputElement,
} from "./elements";

export const MAX_NICKNAME_LENGTH = 15;
export const PLACEHOLDER_NICKNAME = "<not given>";

export const isValidNickname = (nickname: string, allowExcessLength: boolean = true) => {
  return nickname.trim().length > 0 && (allowExcessLength || nickname.length <= MAX_NICKNAME_LENGTH);
};

export const receiveNickname = async (): Promise<string> => {
  // Scroll to top
  window.scrollTo(0, 0)

  // Unhide dialog
  nicknameDialogContainerElement.classList.remove("hide");
  nicknameDialogElement.showModal();

  return new Promise((res, rej) => {
    nicknameDialogElement.onclose = () => {
      // Hide dialog
      nicknameDialogContainerElement.classList.add("hide");

      // Remove listeners
      nicknameDialogInputElement.onchange = null
      nicknameDialogElement.onclose = null

      rej("Operation was cancelled.")
    }

    // listen for input
    nicknameDialogInputElement.onchange = (e) => {
      e.preventDefault();

      const cleanup = () => {
        // Submit the form
        const ev = new SubmitEvent("submit", {
          cancelable: false,
          submitter: nicknameDialogInputElement
        })

        nicknameDialogFormElement.dispatchEvent(ev);

        // Hide the dialog
        nicknameDialogContainerElement.classList.add("hide");
        nicknameDialogElement.close();

        // Remove listeners
        nicknameDialogInputElement.onchange = null
        nicknameDialogElement.onclose = null
      };

      const recvNickname = nicknameDialogInputElement.value;

      if (recvNickname.trim().length === 0) {
        cleanup();
        return rej("Nickname was empty.");
      }

      cleanup();

      res(recvNickname.slice(0, MAX_NICKNAME_LENGTH));
    };

    setTimeout(() => rej("Operation timed out."), 60e3)
  });
};
