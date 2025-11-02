import { hotdogButtonElement } from "./elements";
import { hds } from "./game";

export const htmlTagRegex = /<[^>]+>/gm;

export const conatainsHtmlTags = (str: string) => htmlTagRegex.test(str);

document.addEventListener('DOMContentLoaded', () => {
  const buttons: HTMLElement[] = [...document.querySelectorAll('[role="button"]'), ...document.querySelectorAll('button'), ...document.querySelectorAll('[data-button]')] as HTMLElement[];

  buttons.forEach((btn) => {
    if (!btn.hasAttribute('tabindex')) {
      btn.setAttribute('tabindex', '0');
    }

    btn.addEventListener('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();

        // Check if this is the hotdog button
        if (btn.id === hotdogButtonElement.id) {
          // Since we cannot use .click on the hotdog button, directly add to hds
          hds.setValue(hds.value + 1, "btn-click");
        } else {
          btn.click(); // Just click
        }
      }
    });
  });
});
