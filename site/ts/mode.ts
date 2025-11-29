import { evloop, shouldQuitEventLoop } from "./game";
import { updateLeaderboard } from "./leaderboard";

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
 *   - Wealth accumulation (via the hot dog button)
 *   - Updates called as a requestAnimationFrame callback (i.e. the event loop)
 *   - Jokes (i.e. taxes)
 *   - Entering any mode other than FREEZE_MODE
 *   - Changing settings
 *
 * In BUY_MODE, purchased assets are saved to the persistent save.
 *
 * This behaves the same as the normal game before modes were implemented.
 *
 * Nothing is inhibited in this mode.
 *
 * In SELL_MODE, the action of purchasing an asset is replaced with the action
 * of selling an asset.
 *
 * This mode will not freeze gameplay, and therefore only the following is
 * inhibited in it:
 *   - Asset price increases
 *   - Wealth decumulation
 *
 * In FREEZE_MODE, the game is frozen, and the persistent save is assumed to not exist.
 *
 * The following is inhibited in FREEZE_MODE:
 *   - UI Updates
 *   - Wealth accumulation
 *   - Wealth decumulation
 *   - Jokes
 *   - Changing settings
 *   - Entering menus
 *   - Updates called as a requestAnimationFrame callback (i.e. the event loop)
 *   - Updating Bindings
 *   - Updating SharedMutables
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
   *   - Wealth accumulation (via the hot dog button)
   *   - Updates called as a requestAnimationFrame callback (i.e. the event loop)
   *   - Jokes (i.e. taxes)
   *   - Entering any mode other than FREEZE_MODE
   *   - Changing settings
   */
  TRANSITION_MODE,

  /**
   * In BUY_MODE, purchased assets are saved to the persistent save.
   *
   * This behaves the same as the normal game before modes were implemented.
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
   *   - Asset price increases
   *   - Wealth decumulation
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
   *   - Updates called as a requestAnimationFrame callback (i.e. the event loop)
   *   - Updating Bindings
   *   - Updating SharedMutables
   */
  FREEZE_MODE,
}

/**
 * The mode the game is currently in.
 * This defaults to the "Freeze" mode.
 */
export let mode: Mode = Mode.FREEZE_MODE;

export const setTransitionMode = () => {
  mode = Mode.TRANSITION_MODE;
};

export const setMode = (to: Mode) => {
  mode = to;
};

export const enterBuyMode = () => {
  mode = Mode.BUY_MODE;

  // Start the event loop
  shouldQuitEventLoop.value = false;
  requestAnimationFrame(evloop)

  updateLeaderboard()
}

export const enterFreezeMode = () => {
  mode = Mode.FREEZE_MODE;

  // Quit the event loop
  shouldQuitEventLoop.value = true;
}

export const ALL_MODES = [Mode.BUY_MODE, Mode.SELL_MODE, Mode.FREEZE_MODE, Mode.TRANSITION_MODE];

export class ModeBasedAction<T> {
  private actionsMap: Record<Mode, (() => T) | null> = {
    0: null,
    1: null,
    2: null,
    3: null,
  };

  constructor() { }

  public static empty<T>(): ModeBasedAction<T> {
    return new ModeBasedAction<T>();
  }

  public transitionAction(f: () => T): ModeBasedAction<T> {
    this.actionsMap[Mode.TRANSITION_MODE] = f;

    return this;
  }

  public buyAction(f: () => T): ModeBasedAction<T> {
    this.actionsMap[Mode.BUY_MODE] = f;

    return this;
  }

  public sellAction(f: () => T): ModeBasedAction<T> {
    this.actionsMap[Mode.SELL_MODE] = f;

    return this;
  }

  public freezeAction(f: () => T): ModeBasedAction<T> {
    this.actionsMap[Mode.FREEZE_MODE] = f;

    return this;
  }

  public actionFor(modes: Mode[], action: () => T): ModeBasedAction<T> {
    for (const mode of modes) {
      this.actionsMap[mode] = action
    }

    return this
  }

  public actionForAllBut(modes: Mode[], action: () => T): ModeBasedAction<T> {
    for (const m of ALL_MODES.filter(m => !modes.includes(m))) {
      this.actionsMap[m] = action
    }

    return this
  }

  public do(): T | null {
    let action = this.actionsMap[mode];

    if (action != null) {
      return action();
    }

    return null
  }
};
