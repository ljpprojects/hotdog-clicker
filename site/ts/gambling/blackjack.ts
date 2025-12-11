import { Binding, GeneralBinding } from "../Binding";
import { formatter, hdnw, hds } from "../game";
import { enterBuyMode, enterFreezeMode } from "../mode";
import { NotificationDismissalMode, NotificationProminence, notify } from "../notify";
import { GAMBLING_NW_THRESHOLD } from "../pokies";
import { save } from "../save";
import { wait } from "../utils";
import { blackjackCardSum, Card, CardRank, drawCard, drawCardRemoving, fullDeck } from "./card";
import { bjDealAgainButton, bjDealButton, bjGameDialog, bjHitButton, bjStandButton, bjWagerDialog, bjWagerDisplay, bjWagerSlider, dealerHand, dealerSum, playerHand, playerSum } from "./elements";

export enum BlackJackWinState {
  HouseWin,
  PlayerWin,
  Push,
  Undecided,
}

export type BlackJackState = {
  // Since only the rank of the cards matter, we only need to store that

  houseCards: GeneralBinding<Card[], Card[]>;
  playerCards: GeneralBinding<Card[], Card[]>;

  // This is true if the player has bust or stood
  playerCanPlay: boolean;

  winState: BlackJackWinState;

  deck: Card[];

  // The (absolute) wager
  wager: number;
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
    playerCardsSum = blackjackCardSum(state.playerCards.value!.map(c => c[0])),
    houseCardsSum = blackjackCardSum(state.houseCards.value!.map(c => c[0]));

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
    throw `Player still can play; therefore the dealer cannot perform actions.`
  }

  // The dealer has a very simple algorithm
  // We just need to draw cards until the sum of our cards is >= 17

  let houseTotal = blackjackCardSum(state.houseCards.value!.map(c => c[0]));

  if (houseTotal < 17) {
    // Draw cards until the houseTotal >= 17
    while (houseTotal < 17) {
      await wait(500);

      // Select card from the deck, removing it in the process
      const card = drawCardRemoving(state.deck);

      // Add the card to the house's cards
      state.houseCards.value = [...state.houseCards.value!, card];

      // Recalculate the sum (ace rules mean we cannot just add it)
      houseTotal = blackjackCardSum(state.houseCards.value!.map(c => c[0]));

      await wait(500);
    }
  }

  // Calculate the win state
  return calculateWinState(state);
}

let currentDeck = structuredClone(fullDeck) as Card[];

const stand = async () => {
  // Disable the hit button
  bjHitButton.disabled = true;

  // Hide both buttons
  bjHitButton.classList.add("hide");
  bjStandButton.classList.add("hide");

  // Reveal the dealer's second card
  blackjackState.houseCards.runSet("bj-stand");

  blackjackState.playerCanPlay = false;

  // Run dealer algorithm
  blackjackState = await dealerAction(blackjackState);

  const { HouseWin, PlayerWin, Push } = BlackJackWinState;

  switch (blackjackState.winState) {
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
      const formatterConfig: Intl.ResolvedNumberFormatOptions = {
        ...formatter.value.resolvedOptions(),
        notation: "compact",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      };

      hds.value += winnings;

      const compactFormatter = new Intl.NumberFormat(navigator.languages, formatterConfig);

      notify({
        body: `You win 1.5x (${compactFormatter.format(winnings)})!`,
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

  // Enter buy mode
  enterBuyMode();

  // Show deal again button
  bjDealAgainButton.classList.remove("hide");

  await save();
}

export let blackjackState: BlackJackState = {
  deck: currentDeck,
  playerCanPlay: true,
  winState: BlackJackWinState.Undecided,
  wager: 0,
  houseCards: new GeneralBinding<Card[], Card[]>({
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
  playerCards: new GeneralBinding<Card[], Card[]>({
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
      }
    },

    getfn(dispatcher?) {
      return this.value! as unknown as Card[];
    }
  }),
}

bjHitButton.addEventListener("click", () => {
  // Select a card
  const card = drawCardRemoving(blackjackState.deck);

  blackjackState.playerCards.value = [...blackjackState.playerCards.value, card];
});

bjStandButton.addEventListener("click", stand);

setTimeout(() => {
  blackjackState.playerCards.value = blackjackState.playerCards.value;
  blackjackState.houseCards.value = blackjackState.houseCards.value;
}, 500)

export const updateBlackjackWagerDisplay = () => {
  // Calculate maximum amount of hdnw we can gamble without going under GAMBLING_NW_THRESHOLD
  const maxPercent = (hdnw.value - GAMBLING_NW_THRESHOLD) / hdnw.value * 100;

  bjWagerSlider.max = `${maxPercent}`;
  bjWagerSlider.valueAsNumber %= maxPercent;

  const formatterConfig: Intl.ResolvedNumberFormatOptions = {
    ...formatter.value.resolvedOptions(),
    notation: "compact",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  };

  const compactFormatter = new Intl.NumberFormat(navigator.languages, formatterConfig);

  const absolute = bjWagerSlider.valueAsNumber / 100 * hdnw.value;
  bjWagerDisplay.textContent = `${bjWagerSlider.valueAsNumber}% (${compactFormatter.format(absolute)})`
}

bjWagerSlider.oninput = updateBlackjackWagerDisplay

bjDealButton.addEventListener("click", () => {
  // Hide the wager dialog
  bjWagerDialog.close();

  // Set the wager in the state
  blackjackState.wager = bjWagerSlider.valueAsNumber / 100 * hdnw.value

  // Freeze the game
  enterFreezeMode();

  // Subtract the wager from the hds
  hds.value -= blackjackState.wager;

  // Hide deal again button
  bjDealAgainButton.classList.add("hide");

  // Unhide hit & stand buttons
  bjHitButton.classList.remove("hide");
  bjStandButton.classList.remove("hide");

  // Enable the hit button
  bjHitButton.disabled = false;

  // Show the game dialog
  bjGameDialog.showModal();
})

export const wagerBlackjack = () => {
  // Hide the game dialog
  bjGameDialog.close();

  currentDeck = structuredClone(fullDeck) as Card[];

  // Reset the state
  blackjackState.playerCanPlay = true;
  blackjackState.winState = BlackJackWinState.Undecided;
  blackjackState.deck = currentDeck;
  blackjackState.houseCards.value = [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)];
  blackjackState.playerCards.value = [drawCardRemoving(currentDeck), drawCardRemoving(currentDeck)];

  // Show the wager dialog
  bjWagerDialog.showModal();
};

bjDealAgainButton.addEventListener("click", wagerBlackjack)
