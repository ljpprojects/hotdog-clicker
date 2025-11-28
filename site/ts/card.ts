export enum CardSuit {
  Spades,
  Clubs,
  Hearts,
  Diamonds,
}

export enum CardNumber {
  One = 1,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace
}

export type Card = [CardNumber, CardSuit]
