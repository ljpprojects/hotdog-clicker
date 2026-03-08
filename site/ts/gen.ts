/**
 * The genocide route is progressed by increasing your genocide score (G).
 * Your genocide score serves no other purpose than to derive your genocide
 * level (L).
 *
 * One μG = 1000mG.
 * One mG = 1000G.
 *
 * | Genocide Score | Level         |
 * | -------------- | ------------- |
 * | 0G             | -1 (pacifist) |
 * | 0G - 250mG     | 0   (neutral) |
 * | 250mG - 600mG  | 1             |
 * | 600mG - 1G     | 2             |
 * | 1G    - 2.6G   | 3             |
 * | 2.6G  - 7G     | 4             |
 * | 7G    - 750      | 5             |
 * | 750            | 6             |
 *
 * At L-1 all income is boosted by 200%.
 *
 * At L0, the game functions as normal.
 *
 * At L1, ALL income is cut by 20%.
 * For L2, it is cut by 40%.
 * For L3 it is cut by 60%, and so on.
 *
 * At L6, a reset is forced. The game is permanently stuck in freeze mode and a
 * fullscreen dialogue with the single option to "LIQUIDATE" and a red dagger
 * icon.
 *
 * Each asset has a genocide value, and this is primarily how you earn G. Each
 * asset also has a 'genocide bleed' (GB, G/n/s) which is a passive increase in
 * your genocide score. The values are as follows:
 *
 * | Asset       | Genocide value | Genocide Bleed |
 * | ----------- | -------------- | -------------- |
 * | Butcher     | 1mG            |       10μG/n/s |
 * | Stand       | 1mG            |       10μG/n/s |
 * | Cart        | 5mG            |       25μG/n/s |
 * | Food Truck  | 9mG            |       25μG/n/s |
 * | Plantation  | 50mG           |       50μG/n/s |
 * | Factory     | 100mG          |       75μG/n/s |
 * | Abattoir    | 500mG          |      150μG/n/s |
 * | Restauarant | 750mG          |      150μG/n/s |
 * | Franchise   | 1G             |      200μG/n/s |
 */

import { GeneralBinding, ImmutableBinding } from "./Binding";

export const butcherGs = 0.1;
export const standGs = 0.1;
export const cartGs = 0.15;
export const foodTruckGs = 0.2;
export const plantationGs = 0.5;
export const factoryGs = 1;
export const abattoirGs = 1.5;
export const restauarantGs = 2;
export const franchiseGs = 4;

export const butcherGBleed = 0.001;
export const standGBleed = 0.01;
export const cartGBleed = 0.05;
export const foodTruckGBleed = 0.1;
export const plantationGBleed = 0.25;
export const factoryGBleed = 0.75;
export const abattoirGBleed = 1;
export const restauarantGBleed = 1.5;
export const franchiseGBleed = 2;

export enum GenocideLevel {
  Pacifist = -1,
  Neutral,
  One,
  Two,
  Three,
  Four,
  Five,
  LIQUIDATE,
}

export const genocideLevel = new ImmutableBinding<GenocideLevel>({
  getfn(_dispatcher?) {
    const G = genocideScore.value;

    if (G === 0) {
      return GenocideLevel.Pacifist;
    } else if (G > 0 && G < 5) {
      return GenocideLevel.Neutral;
    } else if (G >= 5 && G < 20) {
      return GenocideLevel.One;
    } else if (G >= 20 && G < 50) {
      return GenocideLevel.Two;
    } else if (G >= 50 && G < 90) {
      return GenocideLevel.Three;
    } else if (G >= 90 && G < 250) {
      return GenocideLevel.Four;
    } else if (G >= 250 && G < 750) {
      return GenocideLevel.Five;
    } else if (G >= 750) {
      return GenocideLevel.LIQUIDATE;
    }
  },
});

export const genocideScore = new GeneralBinding<number, number>({
  backing: 0,

  setfn(to, _dispatcher?) {
    this.value = to;

    // Based on the level
  },

  getfn(_dispatcher?) {
    return this.value!;
  },
});
