import {
  nicknameDialogContainerElement,
  nicknameDialogElement,
  nicknameDialogFormElement,
  nicknameDialogInputElement,

  notificationDialogContainerElement,
  notificationDialogElement,
  notificationDialogMessageElement,

  restoreDialogContainerElement,
  restoreDialogElement,
  restoreDialogFormElement,
  restoreDialogInputElement,
} from "./elements";
import { load, save } from "./save";
import { generateIdent, generateRestore, makeWorkerReq } from "./worker/interfacing";

export const MAX_NICKNAME_LENGTH = 15;
export const PLACEHOLDER_NICKNAME = "<not given>";

/**
 * Displays a message to the user.
 * The returned promise resolves when the user closes the notification popup.
 * @param message The message to display
 */
export const notify = async (message: string): Promise<void> => {
  return new Promise(res => {
    // Change message
    notificationDialogMessageElement.textContent = message

    // Unhide dialog
    notificationDialogContainerElement.classList.remove("hide");
    notificationDialogElement.showModal();

    notificationDialogElement.onclose = () => {
      notificationDialogContainerElement.classList.add("hide");
      res()
    }
  })
}

export const isValidNickname = (nickname: string, allowExcessLength: boolean = true) => {
  return nickname.trim().length > 0 && (allowExcessLength || nickname.length < MAX_NICKNAME_LENGTH);
};

export const receiveNickname = async (): Promise<string> => {
  // Unhide dialog
  nicknameDialogContainerElement.classList.remove("hide");
  nicknameDialogElement.showModal();

  return new Promise((res, rej) => {
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
        nicknameDialogElement.close();

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

export const restoreSave = async () => {
  const identifierRegex = /^[a-zA-Z0-9+\/]{43}=$/;

  // Unhide dialog
  restoreDialogContainerElement.classList.remove("hide");
  restoreDialogElement.showModal();

  // listen for input
  restoreDialogInputElement.onchange = async (e) => {
    e.preventDefault();

    const cleanup = () => {
      // Submit the form
      restoreDialogFormElement.dispatchEvent(
        new SubmitEvent("submit", {
          cancelable: false,
          submitter: restoreDialogInputElement
        })
      );

      // Hide dialog
      restoreDialogContainerElement.classList.add("hide");
      restoreDialogElement.close();

      // Remove listener
      restoreDialogInputElement.onchange = null
    };

    const recvIdentifier = restoreDialogInputElement.value.trim();

    if (
      recvIdentifier.length !== 44 ||
      !identifierRegex.test(recvIdentifier)
    ) {
      notify(`Invalid identifier; ${recvIdentifier.length !== 44 ? `invalid length ${recvIdentifier.length}` : "invalid identifier"}`)

      // Invalid identifier; end here.
      return cleanup();
    }

    // Make sure there is a save to copy data into
    await save()

    // Generate the restore request
    const req = generateRestore(recvIdentifier)

    // Make the request
    const res = await makeWorkerReq(req)

    console.log(res)

    // Load the save from the returned data of the request
    load(res)

    cleanup();

    notify("Save restored successfully.")
  };
};

export const getIdentifierCode = async () => {
  const req = generateIdent()
  const { ident } = await makeWorkerReq(req)

  return notify(`Your identifier code is '${ident}'`)
}
