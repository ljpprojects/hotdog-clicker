import { Binding } from "../Binding";
import { blackjackCardSum, Card, CardRank, drawCard, drawCardRemoving } from "./card";

export enum BlackJackWinState {
  HouseWin,
  PlayerWin,
  Push,
  Undecided,
}

export type BlackJackState = {
  // Since only the rank of the cards matter, we only need to store that

  houseCards: Binding<CardRank[], CardRank[]>;
  playerCards: Binding<CardRank[], CardRank[]>;

  // This is true if the player has bust or stood
  playerCanPlay: boolean;

  winState: BlackJackWinState;

  deck: Card[];
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
    playerCardsSum = blackjackCardSum(state.playerCards.value!),
    houseCardsSum = blackjackCardSum(state.houseCards.value!);

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

  // If we are here something is wrong, so we throw an error
  throw `Unreachable code: no win state could be calculated for the blackjack game (state: ${JSON.stringify(state, null, 2)})`
}

/**
 * Runs the dealer's algorithm on the state of the game.
 *
 * @param state The state of the current blackjack game
 * @returns The new state of the game, with the win state now calculated
 * @throws If the player can still play
 */
export const dealerAction = (state: BlackJackState): BlackJackState => {
  // If the player can still play, something is wrong
  if (state.playerCanPlay) {
    throw `Player still can play; therefore the dealer cannot perform actions.`
  }

  // The dealer has a very simple algorithm
  // We just need to draw cards until the sum of our cards is >= 17

  let houseTotal = blackjackCardSum(state.houseCards.value!);

  if (houseTotal < 17) {
    // Draw cards until the houseTotal >= 17
    while (houseTotal < 17) {
      // Select card from the deck, removing it in the process
      const [cardRank, _] = drawCardRemoving(state.deck);

      // Add the card to the house's cards
      state.houseCards.value!.splice(state.houseCards.value!.length, 0, cardRank);

      // Recalculate the sum (ace rules mean we cannot just add it)
      houseTotal = blackjackCardSum(state.houseCards.value!);
    }
  }

  // Calculate the win state
  return calculateWinState(state);
}
