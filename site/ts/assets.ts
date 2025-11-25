import { PreloadedAsset } from "./Asset";

export type GeneratorIconSet = {
  buyable: PreloadedAsset,
  unbuyable: PreloadedAsset,
}

export const butcherIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/butcher-b.svg"),
  unbuyable: new PreloadedAsset("/assets/butcher-u.svg"),
};

export const standIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/stand-b.svg"),
  unbuyable: new PreloadedAsset("/assets/stand-u.svg"),
};

export const cartIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/cart-b.svg"),
  unbuyable: new PreloadedAsset("/assets/cart-u.svg"),
};

export const truckIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/truck-b.svg"),
  unbuyable: new PreloadedAsset("/assets/truck-u.svg"),
};

export const plantationIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/plantation-b.svg"),
  unbuyable: new PreloadedAsset("/assets/plantation-u.svg"),
};

export const factoryIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/factory-b.svg"),
  unbuyable: new PreloadedAsset("/assets/factory-u.svg"),
};

export const abattoirIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/abattoir-b.svg"),
  unbuyable: new PreloadedAsset("/assets/abattoir-u.svg"),
};

export const restaurantIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/restaurant-b.svg"),
  unbuyable: new PreloadedAsset("/assets/restaurant-u.svg"),
};

export const franchiseIconSet: GeneratorIconSet = {
  buyable: new PreloadedAsset("/assets/franchise-b.svg"),
  unbuyable: new PreloadedAsset("/assets/franchise-u.svg"),
};
