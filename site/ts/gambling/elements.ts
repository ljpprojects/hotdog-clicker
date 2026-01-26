export const dealerHand = document.getElementById("bj-dealer-hand")!;
export const playerHand = document.getElementById("bj-player-hand")!;

export const dealerSum = document.getElementById("bj-house-sum")!;
export const playerSum = document.getElementById("bj-player-sum")!;

export const bjHitButton: HTMLButtonElement =
  document.querySelector("#bj-hit-button")!;
export const bjDoubleButton: HTMLButtonElement =
  document.querySelector("#bj-double-button")!;
export const bjSplitButton = document.getElementById("bj-split-button")!;
export const bjStandButton = document.getElementById("bj-stand-button")!;

export const bjWagerDisplay = document.getElementById("bj-wager-display")!;
export const bjWagerSlider: HTMLInputElement =
  document.querySelector("#bj-wager-slider")!;

export const bjDealButton = document.getElementById("bj-deal")!;

export const bjWagerDialog: HTMLDialogElement =
  document.querySelector("#bj-wager-menu")!;
export const bjGameDialog: HTMLDialogElement =
  document.querySelector("#blackjack-menu")!;

export const bjDealAgainButton = document.getElementById("bj-deal-again")!;

export const bjSplitHandsContainer =
  document.getElementById("bj-split-hand-sums")!;

export const kenoWagerDisplay = document.getElementById("keno-wager-display")!;
export const kenoWagerSlider: HTMLInputElement =
  document.querySelector("#keno-wager-slider")!;

export const kenoGridNumbers: HTMLElement[] = (() => {
  const es = [];
  for (let i = 1; i <= 70; i++) {
    es.push(document.getElementById(`keno-number-${i}`)!);
  }
  return es;
})();

export const kenoPaytableElement: HTMLTableElement =
  document.querySelector("#keno-paytable")!;

export const kenoPaytableBodyElement: HTMLTableSectionElement =
  document.querySelector("#keno-paytable > tbody")!;
