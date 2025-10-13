/**
 * A mode the game can be in.
 * The mode dictates what happens when the user performs actions.
 *
 * For example, if a user buys an asset in BUY_MODE, it will behave as expected;
 * it will deduct the available funds by the price of that asset, increase the net work
 * by the appropriate amount and changes will be saved.
 *
 * If a user buys an asset in TRANSITION_MODE, it will save it to a temporary
 * save of the new edition for transitioning from a save of an old edition when
 * the old save cannot be automatically adapted, or it would be impractical.
 * Once the transition is finished, the save is overwritten by the temporary save.
 *
 * If a user 'buys' an asset in SELL_MODE, it will actually be sold. Their net worth
 * will be decreased by the appropriate amount and the cost of that asset will
 * be refunded.
 */
export enum Mode {
  /**
   * In TRANSITION_MODE, purchased assets are saved to a temporary save of the
   * new edition (coming from a save of an old edition). Once TRANSITION_MODE is
   * exited, the save is overwritten by the temporary save.
   *
   * TRANSITION_MODE can only be entered _before_ a save is loaded.
   *
   * In TRANSITION_MODE, the following is inhibited:
   *   - Requests to the backend
   *   - Modifying the persistent save
   *   - Reading the persistent save
   *   - Leaderboard updates
   *   - Wealth accumulation
   *   - Updates called as a requestAnimationFrame callback
   *   - Jokes (i.e. taxes)
   *   - Entering any mode other than FREEZE_MODE
   *   - Changing settings
   */
  TRANSITION_MODE,

  /**
   * In BUY_MODE, purchased assets are saved to the persistent save.
   *
   * Nothing is inhibited in this mode.
   */
  BUY_MODE,

  /**
   * In SELL_MODE, the action of purchasing an asset is replaced with the action
   * of selling an asset.
   *
   * This mode will not freeze gameplay, and therefore only the following is
   * inhibited in it:
   *   - Leaderboard updates
   *   - Asset price increases
   *   - Changing settings
   *   - Entering the main menu
   */
  SELL_MODE,

  /**
   * In FREEZE_MODE, the game is frozen, and the persistent save is assumed to not exist.
   *
   * The following is inhibited in FREEZE_MODE:
   *   - UI Updates
   *   - Wealth accumulation
   *   - Wealth decumulation
   *   - Jokes
   *   - Changing settings
   *   - Entering menus
   *   - Updates called as a requestAnimationFrame callback
   *   - Updating Bindings
   *   - Updating SharedMutables
   *   - Reading the persistent save
   *   -
   */
  FREEZE_MODE,
}

export let mode: Mode;

export const enterBuyMode = () => {
  mode = Mode.BUY_MODE;
}
