import {
  nicknameDialogContainerElement,
  nicknameDialogFormElement,
  nicknameDialogInputElement,

  restoreDialogContainerElement,
  restoreDialogFormElement,
  restoreDialogInputElement,
} from "./elements";

export const MAX_NICKNAME_LENGTH = 15;
export const PLACEHOLDER_NICKNAME = "<not given>";

export const isValidNickname = (nickname: string) => {
  console.log(
    nickname,
    nickname.trim(),
    nickname.trim.length,
    nickname.slice(0, MAX_NICKNAME_LENGTH),
  );

  return nickname.trim().length > 0;
};

export const receiveNickname = async (): Promise<string> => {
  // Unhide dialog
  nicknameDialogContainerElement.classList.remove("hide");

  return new Promise((res, rej) => {
    console.log("PROM")

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

        // Hide dialog
        nicknameDialogContainerElement.classList.add("hide");

        // Remove listener
        nicknameDialogInputElement.onchange = null
      };

      const recvNickname = nicknameDialogInputElement.value;

      if (recvNickname.trim().length === 0) {
        cleanup();
        return rej("Nickname was empty.");
      }

      cleanup();

      res(recvNickname.slice(0, MAX_NICKNAME_LENGTH));
    };

    setTimeout(() => rej("timeout"), 60e3)
  });
};
