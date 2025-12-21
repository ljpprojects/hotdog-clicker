// Our blackjack is so fun, we have infinite splitting (but you cannot double after splitting)
// Also the insurance button just runs and screams because it is almost always a bad choice

import { Binding, GeneralBinding } from "../Binding";
import { formatter, hdnw, hds } from "../game";
import { enterBuyMode, enterFreezeMode } from "../mode";
import { NotificationDismissalMode, NotificationProminence, notify } from "../notify";
import { GAMBLING_NW_THRESHOLD } from "../pokies";
import { save } from "../save";
import { wait } from "../utils";
import { blackjackCardSum, Card, CardRank, drawCard, drawCardRemoving, fullDeck } from "./card";
import { bjDealAgainButton, bjDealButton, bjDoubleButton, bjGameDialog, bjHitButton, bjSplitButton, bjSplitHandsContainer, bjStandButton, bjWagerDialog, bjWagerDisplay, bjWagerSlider, dealerHand, dealerSum, playerHand, playerSum } from "./elements";
import { blackjackGameAudio } from "./sound";

export enum BlackJackWinState {
  HouseWin,
  PlayerWin,
  Push,
  Undecided,
}

export type BlackJackState = {
  // Since only the rank of the cards matter, we only need to store that

  houseHand: GeneralBinding<Card[], Card[]>;
  playerHand: GeneralBinding<Card[], Card[]>;

  /**
   * This indicates whether or not the hand in play is a split-hand
   */
  handInPlayWasSplit: boolean,

  // This is true if the player has bust or stood
  playerCanPlay: boolean;

  winState: BlackJackWinState;

  deck: Card[];

  // The (absolute) wager
  wager: number;

  /**
   * Every split hand.
   */
  splitHands: GeneralBinding<Card[][], Card[][]>,
}

/**
 * Calculates who has one this blackjack game.
 *
 * @param state The current state of the blackjack game
 * @returns The new state of the blackjack game, with the win state calculated unless the player can still play.
 */
export const calculateWinState = (state: BlackJackState): BlackJackState => {
  // Check if the player has neither bust nor stood
  if (state.playerCanPlay) {
    return state
  }

  const
    playerCardsSum = blackjackCardSum(state.playerHand.value!.map(c => c[0])),
    houseCardsSum = blackjackCardSum(state.houseHand.value!.map(c => c[0]));

  // Check if the player has bust (loss)
  if (playerCardsSum > 21) {
    return {
      ...state,
      winState: BlackJackWinState.HouseWin,
    }
  }

  // Check if the house has bust (win)
  if (houseCardsSum > 21) {
    return {
      ...state,
      winState: BlackJackWinState.PlayerWin
    }
  }

  // Check if the sum of the player's and house's cards are equal (push)
  if (playerCardsSum === houseCardsSum) {
    return {
      ...state,
      winState: BlackJackWinState.Push,
    }
  }

  // Check if the player is closer to 21 than the dealer (win)
  if (21 - playerCardsSum < 21 - houseCardsSum) {
    return {
      ...state,
      winState: BlackJackWinState.PlayerWin
    }
  }

  // If we are here the dealer won
  return {
    ...state,
    winState: BlackJackWinState.HouseWin
  }
}

/**
 * Runs the dealer's algorithm on the state of the game.
 *
 * @param state The state of the current blackjack game
 * @returns The new state of the game, with the win state now calculated
 * @throws If the player can still play
 */
export const dealerAction = async (state: BlackJackState): Promise<BlackJackState> => {
  // If the player can still play, something is wrong
  if (state.playerCanPlay) {
    throw `Player still can play, therefore the dealer cannot perform actions.`
  }

  // If the player has bust, exit early
  if (blackjackCardSum(state.playerHand.value!.map(c => c[0])) > 21) {
    return calculateWinState(state);
  }

  // The dealer has a very simple algorithm
  // We just need to draw cards until the sum of our cards is >= 17

  let houseTotal = blackjackCardSum(state.houseHand.value!.map(c => c[0]));

  if (houseTotal < 17) {
    // Draw cards until the houseTotal >= 17
    while (houseTotal < 17) {
      await wait(500);

      // Select card from the deck, removing it in the process
      const card = drawCardRemoving(state.deck);

      // Add the card to the house's cards
      state.houseHand.value = [...state.houseHand.value!, card];

      // Recalculate the sum (ace rules mean we cannot just add it)
      houseTotal = blackjackCardSum(state.houseHand.value!.map(c => c[0]));

      await wait(500);
    }
  }

  // Calculate the win state
  return calculateWinState(state);
}

let currentDeck = structuredClone(fullDeck) as Card[];

const calculatePayout = () => {
  const { HouseWin, PlayerWin, Push, Undecided } = BlackJackWinState;

  switch (blackjackState.winState) {
    case Undecided:
      throw "Cannot call calculatePayout with an undecided win state."
    case HouseWin:
      notify({
        body: `You lost`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 3000,
      }, 250);

      break;
    case PlayerWin:
      const winnings = blackjackState.wager * 1.5;

      hds.value += winnings;
      notify({
        body: `You win 1.5x (+${formatter.value.format(winnings - blackjackState.wager)})!`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 5000,
      }, 250);

      break;
    case Push:
      notify({
        body: `Push`,
        prominence: NotificationProminence.Banner,
        dismissalMode: NotificationDismissalMode.Automatic,
        dismissalTimeMs: 2000,
      }, 250);

      hds.value += blackjackState.wager;

      break;
  };
}

export let blackjackState: BlackJackState = {
  deck: currentDeck,
  playerCanPlay: true,
  winState: BlackJackWinState.Undecided,
  wager: 0,
  handInPlayWasSplit: false,
  houseHand: new GeneralBinding<Card[], Card[]>({
    backing: [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)],
    setfn(to, dispatcher?) {
      this.value = to;

      // Remove existing child elements
      dealerHand.innerHTML = "";

      let sum = blackjackCardSum(to.map(c => c[0]));

      // Add cards to UI

      for (const [card, i] of to.map((c, i) => [c, i] as [Card, number])) {
        const img = document.createElement("img");
        img.src = `/assets/cards/${card[0]}${card[1]}.svg`;

        if (blackjackState.playerCanPlay && i === 1 && dispatcher !== "bj-stand") {
          img.src = `/assets/cards/BK.svg`;

          sum -= blackjackCardSum([card[0]]);
        }

        dealerHand.appendChild(img)
      }

      dealerSum.textContent = `${sum}`;
    },

    getfn(dispatcher?) {
      return this.value! as unknown as Card[];
    }
  }),
  playerHand: new GeneralBinding<Card[], Card[]>({
    backing: [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)],
    async setfn(to, dispatcher?) {
      this.value = to;

      // Remove existing child elements
      playerHand.innerHTML = "";

      const sum = blackjackCardSum(to.map(c => c[0]));
      playerSum.textContent = `${sum}`;

      // Add cards to UI

      for (const card of to) {
        const img = document.createElement("img");

        img.src = `/assets/cards/${card[0]}${card[1]}.svg`;

        playerHand.appendChild(img)
      }

      // Check if the player has bust (insta-lose)
      if (sum > 21) {
        await wait(500);

        // Auto stand
        stand()

        return
      }

      // If we can split (i.e. two dealt cards are of the same rank) unhide the button
      if (blackjackState.playerCanPlay && to.length === 2 && to[0][0] === to[1][0]) {
        bjSplitButton.classList.remove("hide");
      } else {
        bjSplitButton.classList.add("hide");
      }
    },

    getfn(dispatcher?) {
      return this.value! as Card[];
    }
  }),
  splitHands: new GeneralBinding<Card[][], Card[][]>({
    backing: [],

    setfn(to, _dispatcher?) {
      this.value = to;

      // Remove existing child elements
      bjSplitHandsContainer.innerHTML = "";

      // Add cards to UI

      for (const hand of to) {
        const sum = blackjackCardSum(hand.map(c => c[0]));

        const sumIndicator = document.createElement("p");
        sumIndicator.textContent = `${sum}`;

        bjSplitHandsContainer.appendChild(sumIndicator);
      }

      if (to.length === 0) {
        const indicator = document.createElement("p");
        indicator.textContent = "No split hands";

        bjSplitHandsContainer.appendChild(indicator);
      }
    },

    getfn(_dispatcher?) {
      return this.value! as Card[][];
    }
  })
}

const hit = () => {
  // Select a card
  const card = drawCardRemoving(blackjackState.deck);

  // Since hitting adds another card to the hand, splitting must be disabled
  bjSplitButton.classList.add("hide");

  blackjackState.playerHand.value = [...blackjackState.playerHand.value, card];
};

const stand = async () => {
  console.log("Split hands length", blackjackState.splitHands.value.length)

  // Check if we have any split hands to play
  if (blackjackState.splitHands.value.length > 0) {
    blackjackState.playerCanPlay = false;

    // Calculate the win state for this hand
    // If the hand we are playing is not a split hand, run the dealer algorithm
    if (!blackjackState.handInPlayWasSplit) {
      blackjackState = await dealerAction(blackjackState);
    } else {
      blackjackState = calculateWinState(blackjackState);
    }

    calculatePayout();

    const splitHands = blackjackState.splitHands.value;

    // Take the first hand
    const nextHand = splitHands.splice(0, 1)[0];
    blackjackState.splitHands.value = splitHands;

    // Put that hand into play
    blackjackState.handInPlayWasSplit = true;
    blackjackState.playerHand.value = nextHand;

    // Hide deal again button
    bjDealAgainButton.classList.add("hide");

    // Unhide buttons
    bjHitButton.classList.remove("hide");
    bjDoubleButton.classList.remove("hide");
    bjStandButton.classList.remove("hide");

    // Enable the hit & double button
    bjHitButton.disabled = false;
    bjDoubleButton.disabled = false;

    // Hope for the best?

    console.log("Next hand", nextHand)

    blackjackState.playerCanPlay = true;

    return
  }

  // Disable the hit & double button
  bjHitButton.disabled = true;
  bjDoubleButton.disabled = true;

  // Hide all buttons
  bjHitButton.classList.add("hide");
  bjDoubleButton.classList.add("hide");
  bjStandButton.classList.add("hide");

  // Reveal the dealer's second card
  blackjackState.houseHand.runSet("bj-stand");

  blackjackState.playerCanPlay = false;

  // If this is a split hand do NOT run the dealer algorithm
  if (blackjackState.handInPlayWasSplit) {
    // Just compute win state
    blackjackState = calculateWinState(blackjackState);
  } else {
    // Run dealer algorithm
    blackjackState = await dealerAction(blackjackState);
  }

  calculatePayout();

  // Enter buy mode
  enterBuyMode();

  // Show deal again button
  bjDealAgainButton.classList.remove("hide");

  blackjackGameAudio.pause()
  blackjackGameAudio.currentTime = 0;

  await save();
}

const double = async () => {
  // Double wager

  hds.value -= blackjackState.wager;
  await save();
  blackjackState.wager *= 2;

  hit();

  // If we can still play, stand
  if (blackjackState.playerCanPlay) {
    stand();
  }
}

const split = async () => {
  const playerHand = blackjackState.playerHand.value;

  // Make sure there are only two cards in the hand
  if (playerHand.length > 2) {
    throw "Hand is too long; cannot split."
  }

  // Make sure the cards are indeed of the same rank
  if (playerHand[0][0] !== playerHand[1][0]) {
    throw "Cards in hand are not of the same rank; cannot split."
  }

  // Make sure the player can still play
  if (!blackjackState.playerCanPlay) {
    throw "Player can no longer action; cannot split."
  }

  // Deduct wager for the split hand

  hds.value -= blackjackState.wager;
  await save();

  blackjackState.playerHand.value = [playerHand[0], drawCardRemoving(blackjackState.deck)];

  // Create the split hand
  const splitHand: Card[] = [playerHand[1], drawCardRemoving(blackjackState.deck)];

  // Add the split hand
  blackjackState.splitHands.value = [...blackjackState.splitHands.value, splitHand];

  console.log("Split hands", blackjackState.splitHands.value)
}

bjHitButton.addEventListener("click", hit);
bjDoubleButton.addEventListener("click", double);
bjSplitButton.addEventListener("click", split);
bjStandButton.addEventListener("click", stand);

setTimeout(() => {
  blackjackState.playerHand.runSet();
  blackjackState.houseHand.runSet();
}, 500)

export const updateBlackjackWagerDisplay = () => {
  // Calculate maximum amount of hdnw we can gamble without going under GAMBLING_NW_THRESHOLD
  const maxPercent = (hdnw.value - GAMBLING_NW_THRESHOLD) / hdnw.value * 100;

  bjWagerSlider.max = `${maxPercent}`;
  bjWagerSlider.valueAsNumber %= maxPercent;

  const absolute = bjWagerSlider.valueAsNumber / 100 * hdnw.value;
  bjWagerDisplay.textContent = `${bjWagerSlider.valueAsNumber}% (${formatter.value.format(absolute)})`
}

bjWagerSlider.oninput = updateBlackjackWagerDisplay

bjDealButton.addEventListener("click", async () => {
  // Hide the wager dialog
  bjWagerDialog.close();

  // Set the wager in the state
  blackjackState.wager = bjWagerSlider.valueAsNumber / 100 * hdnw.value

  // Freeze the game
  enterFreezeMode();

  // Subtract the wager from the hds
  hds.value -= blackjackState.wager;

  // Save to prevent people from just reloading if their hand is bad
  await save();

  // Hide deal again button
  bjDealAgainButton.classList.add("hide");

  // Unhide buttons
  bjHitButton.classList.remove("hide");
  bjDoubleButton.classList.remove("hide");
  bjStandButton.classList.remove("hide");

  // Enable the hit & double button
  bjHitButton.disabled = false;
  bjDoubleButton.disabled = false;

  // Show the game dialog
  bjGameDialog.showModal();

  document.body.setAttribute("data-veil", "true");
})

export const wagerBlackjack = () => {
  document.body.removeAttribute("data-veil");

  // Hide the game dialog
  bjGameDialog.close();

  currentDeck = structuredClone(fullDeck) as Card[];

  // Reset the state
  blackjackState.playerCanPlay = true;
  blackjackState.handInPlayWasSplit = false;
  blackjackState.winState = BlackJackWinState.Undecided;
  blackjackState.deck = currentDeck;
  blackjackState.houseHand.value = [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)];
  blackjackState.playerHand.value = [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)];

  // Show the wager dialog
  bjWagerDialog.showModal();
};

bjDealAgainButton.addEventListener("click", wagerBlackjack)

bjGameDialog.addEventListener("beforetoggle", () => {
  if (!bjGameDialog.open) {
    blackjackGameAudio.play()
  } else {
    blackjackGameAudio.pause()
    blackjackGameAudio.currentTime = 0;
  }
})
