import { CachedAsset } from "./Asset";

export type GeneratorIconSet = {
  buyable: CachedAsset,
  unbuyable: CachedAsset,
}

export const butcherIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/butcher-b.svg"),
  unbuyable: new CachedAsset("/assets/butcher-u.svg"),
};

export const standIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/stand-b.svg"),
  unbuyable: new CachedAsset("/assets/stand-u.svg"),
};

export const cartIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/cart-b.svg"),
  unbuyable: new CachedAsset("/assets/cart-u.svg"),
};

export const truckIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/truck-b.svg"),
  unbuyable: new CachedAsset("/assets/truck-u.svg"),
};

export const plantationIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/plantation-b.svg"),
  unbuyable: new CachedAsset("/assets/plantation-u.svg"),
};

export const factoryIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/factory-b.svg"),
  unbuyable: new CachedAsset("/assets/factory-u.svg"),
};

export const abattoirIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/abattoir-b.svg"),
  unbuyable: new CachedAsset("/assets/abattoir-u.svg"),
};

export const restaurantIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/restaurant-b.svg"),
  unbuyable: new CachedAsset("/assets/restaurant-u.svg"),
};

export const franchiseIconSet: GeneratorIconSet = {
  buyable: new CachedAsset("/assets/franchise-b.svg"),
  unbuyable: new CachedAsset("/assets/franchise-u.svg"),
};
