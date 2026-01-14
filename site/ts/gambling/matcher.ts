// Basic card game (Matcher) where this is what happens:
//
// Players contribute a blind bet (usually 10% of the initial balance) to the
// pool (the user chooses an amount of their net worth and every other player
// has that too, so the max total payout is 5:1, not including the intial bet).
//
// Everyone gets four cards from the deck (their hand).
//
// Four cards are laid out in the middle of the table (match hand).
//
// Everyone takes the left two of their four cards from their hand and
//  conceals them from everyone else. The third remains face-down.
//
// The next card (from the right) from the match hand is revealed (the start of
// the round).
//
// Players go around in a circle from the player clockwise choosing to either:
//   Pass: continue to the next person
//   Raise:
//     Raise by N (some amount of the player's balance) and go around the table
//     clockwise, where each player can choose to Match and contribute N to the
//     pool or Bail and forfeit their previous bets and stop playing. If N
//     exceeds the player's balance they will need to go all in or Bail. Once
//     all other players have Matched or Bailed continue to the next round. The
//     person to initiate the Raise cannot Raise again the next round.
//
// If all but one of the remaining players are all in then skip immediately
// to the end. If not, once everyone has either Passed or Raised the second
// round begins.
//
// Each player now can take their third card and the middle card of the match
// hand is revealed. The same Pass-Raise routine as round one is performed.
// Continue this until every player's cards are revealed to them.
//
// Once every player's hand is revealed to them, the end has been reached. The
// final card in the match hand is revealed and whichever player's hand's sum is
// closest to that of the match hand wins all the money in the pool. If two
// players tie then whoever has the most matching suits in common with the match
// hand should win. If there is still a tie, whoever has the most matching
// cards of rank with the match hand wins. If somehow there is still a tie,
// split the money in the pool evenly with each winner.
//
// THE CARD VALUES ARE AS BELOW (SUIT DOES NOT MATTER)
//
// Ace: The first ace is worth 11 and all subsequent ones 1
// 2 - 10: Worth the rank
// Jack, Queen, and King: 10
//
// See matcher-bot/README.md for the bot
