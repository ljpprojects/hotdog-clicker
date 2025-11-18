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
