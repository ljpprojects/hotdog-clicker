export const INCREMENT: number = 1.3;

export const increase = (price: number, count: number): number => {
  return price * INCREMENT + count / INCREMENT;
};

export const calcCost = (startPrice: number, count: number) => {
  let acc = startPrice;

  for (let i = 0; i < count; i++) {
    acc = increase(acc, i);
  }



  return acc;
};
