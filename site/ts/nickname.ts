import {
  nicknameDialogContainerElement,
  nicknameDialogElement,
  nicknameDialogInputElement,
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
    // listen for input
    const nicknameOnsubmit: (
      this: HTMLInputElement,
      ev: SubmitEvent,
    ) => void = (e) => {
      e.preventDefault();

      const cleanup = () => {
        // Remove listener
        nicknameDialogInputElement.removeEventListener(
          "submit",
          nicknameOnsubmit,
        );

        // Hide dialog
        nicknameDialogContainerElement.classList.add("hide");
      };

      const recvNickname = nicknameDialogInputElement.value;

      if (recvNickname.trim().length === 0) {
        cleanup();
        return rej("Nickname was empty.");
      }

      cleanup();

      res(recvNickname.slice(MAX_NICKNAME_LENGTH));
    };

    const t = nicknameDialogInputElement.addEventListener(
      "submit",
      nicknameOnsubmit,
    );
  });
};
