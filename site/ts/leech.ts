/**
 * Leeching is a feature that allows a player to take some amount of another
 * player's net worth over 6 hours.
 *
 * The player wishing to take someone else's net worth (Leech) plays a minigame
 * to determine the multiplier of the base rate that is Leeched per second.
 *
 * The base rate is \frac{N}{\left(6\cdot60^{2}\right)1.3^{\log_{2}\left(N+1\right)}} and is in hds/s.
 *
 * The minigame should get harder the more you stand to gain by leeching. It
 * should also have some measure of performance (e.g. time survived) correlating
 * to the multiplier.
 *
 * The minigame will be one of these, depending on how much you stand to gain:
 *
 * EASY (under 1e3/s)
 *   You control a character which is bound to be on 1 of 3 lanes. Each lane is
 * vertically below the previous, so that the 3 lanes are stacked vertically.
 *
 * Lanes periodically become "deadly", where if you are on them during this time
 * the minigame ends. The deadliness of the lane should be indicated by its
 * colour (--dn-col). The length of time which a lane is "deadly" for (D) is
 * initially 2.5s. The interval between lanes becoming deadly (including
 * warning time, R) is initially 3s.
 *
 * Before a lane becomes "deadly" there is a warning period (W) which initially
 * lasts 2s. The warning stage should be indicated by the colour of the line
 * (--wn-col).
 *
 * -----------------------------------------------------------------------------
 * D will gradually decrease according to this function:
 *              1
 * D(t) = 2.5 - ─ √t
 *              3
 *
 * (in LaTeX: D\left(t\right)=2.5-\frac{1}{3}\sqrt{t})
 *
 * Where t is the total time survived in the minigame.
 *
 * Once f(x) = 0 the minigame shall be forced to end.
 *
 * -----------------------------------------------------------------------------
 * R will also gradually decrease over time.
 *
 * R(t) = 5 - ln(2t + e²)
 *
 * (in LaTeX: R\left(t\right)=3-\ln\left(2t+e^{2}\right)+2)
 *
 * -----------------------------------------------------------------------------
 * As will W:
 *
 *
 */
