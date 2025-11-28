import { Card } from "./card";

export enum BlackJackWinState {
  HouseWin,
  PlayerWin,
  Push,
}

export type BlackJackState = {
  houseCards: Card[];
  houseTotal: number;

  playerCards: Card[];
  playerTotal: number;

  winState: BlackJackWinState;
}

/**
 * Runs the dealer's algorithm on the state of the game.
 *
 * @param state The state of the current BlackJack game
 * @returns The new state of the game
 */
/*export const dealerAction = (state: BlackJackState): BlackJackState => {

}
*/
