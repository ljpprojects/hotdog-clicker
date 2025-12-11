import { randomUint16 } from "../rand";
import { deepFreeze, DeepReadonly } from "../utils";

export enum CardSuit {
  Spades = "S",
  Clubs = "C",
  Hearts = "H",
  Diamonds = "D",
}

export enum CardRank {
  Two = "2",
  Three = "3",
  Four = "4",
  Five = "5",
  Six = "6",
  Seven = "7",
  Eight = "8",
  Nine = "9",
  Ten = "10",
  Jack = "J",
  Queen = "Q",
  King = "K",
  Ace = "A",
}

export type Card = [CardRank, CardSuit]

export const blackjackCardSum = (cards: CardRank[]): number => {
  const cardValueTable: Record<CardRank, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 10,
    "Q": 10,
    "K": 10,
    "A": 11,
  };

  const sum = cards.reduce((acc, c) => {
    const val = cardValueTable[c];
    // Account for the ability of Ace cards to reduce to a value of 1 if 11 would make the player bust
    const adjustedVal = acc + val > 21 && val === 11 ? 1 : val;

    return acc + adjustedVal
  }, 0);

  return sum;
}

/// A full deck of cards with no joker
export const fullDeck: DeepReadonly<Card[]> = deepFreeze([
  // Spades cards

  [CardRank.Two, CardSuit.Spades],
  [CardRank.Three, CardSuit.Spades],
  [CardRank.Four, CardSuit.Spades],
  [CardRank.Five, CardSuit.Spades],
  [CardRank.Six, CardSuit.Spades],
  [CardRank.Seven, CardSuit.Spades],
  [CardRank.Eight, CardSuit.Spades],
  [CardRank.Nine, CardSuit.Spades],
  [CardRank.Ten, CardSuit.Spades],
  [CardRank.Jack, CardSuit.Spades],
  [CardRank.Queen, CardSuit.Spades],
  [CardRank.King, CardSuit.Spades],
  [CardRank.Ace, CardSuit.Spades],

  // Clubs cards

  [CardRank.Two, CardSuit.Clubs],
  [CardRank.Three, CardSuit.Clubs],
  [CardRank.Four, CardSuit.Clubs],
  [CardRank.Five, CardSuit.Clubs],
  [CardRank.Six, CardSuit.Clubs],
  [CardRank.Seven, CardSuit.Clubs],
  [CardRank.Eight, CardSuit.Clubs],
  [CardRank.Nine, CardSuit.Clubs],
  [CardRank.Ten, CardSuit.Clubs],
  [CardRank.Jack, CardSuit.Clubs],
  [CardRank.Queen, CardSuit.Clubs],
  [CardRank.King, CardSuit.Clubs],
  [CardRank.Ace, CardSuit.Clubs],

  // Hearts cards

  [CardRank.Two, CardSuit.Hearts],
  [CardRank.Three, CardSuit.Hearts],
  [CardRank.Four, CardSuit.Hearts],
  [CardRank.Five, CardSuit.Hearts],
  [CardRank.Six, CardSuit.Hearts],
  [CardRank.Seven, CardSuit.Hearts],
  [CardRank.Eight, CardSuit.Hearts],
  [CardRank.Nine, CardSuit.Hearts],
  [CardRank.Ten, CardSuit.Hearts],
  [CardRank.Jack, CardSuit.Hearts],
  [CardRank.Queen, CardSuit.Hearts],
  [CardRank.King, CardSuit.Hearts],
  [CardRank.Ace, CardSuit.Hearts],

  // Diamonds cards

  [CardRank.Two, CardSuit.Diamonds],
  [CardRank.Three, CardSuit.Diamonds],
  [CardRank.Four, CardSuit.Diamonds],
  [CardRank.Five, CardSuit.Diamonds],
  [CardRank.Six, CardSuit.Diamonds],
  [CardRank.Seven, CardSuit.Diamonds],
  [CardRank.Eight, CardSuit.Diamonds],
  [CardRank.Nine, CardSuit.Diamonds],
  [CardRank.Ten, CardSuit.Diamonds],
  [CardRank.Jack, CardSuit.Diamonds],
  [CardRank.Queen, CardSuit.Diamonds],
  [CardRank.King, CardSuit.Diamonds],
  [CardRank.Ace, CardSuit.Diamonds],
]);

/**
 * Draws a card, without removing it from a deck.
 */
export const drawCard = (): DeepReadonly<Card> => {
  const index = randomUint16() % fullDeck.length;

  return fullDeck[index];
}

/**
 * Draws a card, removing it from the deck (the given deck is mutated).
 */
export const drawCardRemoving = (deck: Card[]): Card => {
  const index = randomUint16() % deck.length;

  return deck.splice(index, 1)[0];
}
