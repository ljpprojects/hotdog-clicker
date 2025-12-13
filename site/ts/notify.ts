import { notificationBannerSet, NotificationElementSet, notificationPopupSet, notificationProminentSet } from "./elements"
import { wait } from "./utils";

export enum NotificationProminence {
  Prominent,
  Popup,
  Banner
}

export enum NotificationDismissalMode {
  Automatic,
  Manual
}

export const AUTOMATIC_DISMISSAL_TIMEOUT_MS = 7500;

export type HDCNotification = {
  title?: string,
  body: string,
  prominence: NotificationProminence,
  dismissalMode: NotificationDismissalMode,
  dismissalTimeMs?: number,
  pauseGame?: boolean,
}

export const notify = async (notification: HDCNotification, delayMs: number = 0): Promise<void> => {
  if (delayMs > 0) {
    await wait(delayMs);
  }

  // Get the appropriate element set of the notification based on its prominence
  const prominenceToSetMap: Record<NotificationProminence, NotificationElementSet> = {
    0: notificationProminentSet,
    1: notificationPopupSet,
    2: notificationBannerSet,
  };

  const { dialog: dialogElement, form: formElement, title: titleElement, body: bodyElement } = prominenceToSetMap[notification.prominence];
  const { title, body, dismissalMode } = notification;

  return new Promise(async res => {
    if (titleElement != null && title != null) {
      titleElement.textContent = title;
    }

    bodyElement.textContent = body;

    if (notification.pauseGame ?? true) {
      dialogElement.showModal();
    } else {
      dialogElement.show();
    }

    let tId: number = -1;

    formElement.addEventListener("submit", () => {
      clearTimeout(tId);
      res();
    });

    if (dismissalMode === NotificationDismissalMode.Automatic) {
      tId = setTimeout(() => {
        formElement.submit();
      }, notification.dismissalTimeMs ?? AUTOMATIC_DISMISSAL_TIMEOUT_MS) as unknown as number;
    }
  })
}
