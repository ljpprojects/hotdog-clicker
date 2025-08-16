import { Binding } from "./Binding";
import { increase } from "./math";
import { save, wipe, load } from "./save";
import {
  passiveClicksElement,
  clickCountElement,
  bunCountElement,
  dadCountElement,
  grillCountElement,
  farmCountElement,
  facCountElement,
  bankCountElement,
  freezerCountElement,
  bunPriceElement,
  dadPriceElement,
  grillPriceElement,
  farmPriceElement,
  facPriceElement,
  bankPriceElement,
  freezerPriceElement,
  wipeBtn,
  saveBtn,
  hotdogButton,
  bunButton,
  dadButton,
  grillButton,
  farmButton,
  facButton,
  bankButton,
  freezerButton,
} from "./elements";

import { initialise } from "./worker/interfacing";

initialise()

export const formatter = new Intl.NumberFormat(navigator.language, {
  minimumFractionDigits: 2,
});

export const hdps = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      passiveClicksElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const nickname = prompt("Enter a nickname to use.") ?? "<not given>";

export const hds = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      clickCountElement.textContent = formatter.format(to);
      checkBuyables();
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const bunCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      bunCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const dadCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      dadCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const grillCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      grillCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const farmCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      farmCountElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const facCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      facCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const bankCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      bankCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const freezerCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      freezerCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const bunRate: number = 0.2;
export const bunCost = new Binding<number, number>({
  backing: 10,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      bunPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const dadRate: number = 1;
export const dadCost = new Binding<number, number>({
  backing: 100,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      dadPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const grillRate: number = 7.5;
export const grillCost = new Binding<number, number>({
  backing: 500,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      grillPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const farmRate: number = 15;
export const farmCost = new Binding<number, number>({
  backing: 5_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      farmPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const facRate: number = 50;
export const facCost = new Binding<number, number>({
  backing: 50_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      facPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const bankRate: number = 150;
export const bankCost = new Binding<number, number>({
  backing: 250_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      bankPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const freezerRate: number = 500;
export const freezerCost = new Binding<number, number>({
  backing: 1_000_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      freezerPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

saveBtn!!.onclick = save;
wipeBtn!!.onclick = wipe;

const checkBuyables = () => {
  if (hds.value >= bunCost.value) {
    bunButton?.classList.add("buyable");
  } else {
    bunButton?.classList.remove("buyable");
  }

  if (hds.value >= dadCost.value) {
    dadButton?.classList.add("buyable");
  } else {
    dadButton?.classList.remove("buyable");
  }

  if (hds.value >= grillCost.value) {
    grillButton?.classList.add("buyable");
  } else {
    grillButton?.classList.remove("buyable");
  }

  if (hds.value >= farmCost.value) {
    farmButton?.classList.add("buyable");
  } else {
    farmButton?.classList.remove("buyable");
  }

  if (hds.value >= facCost.value) {
    facButton?.classList.add("buyable");
  } else {
    facButton?.classList.remove("buyable");
  }

  if (hds.value >= bankCost.value) {
    bankButton?.classList.add("buyable");
  } else {
    bankButton?.classList.remove("buyable");
  }

  if (hds.value >= freezerCost.value) {
    freezerButton?.classList.add("buyable");
  } else {
    freezerButton?.classList.remove("buyable");
  }
};

load();

setInterval(save, 10000);

hotdogButton?.addEventListener("click", () => {
  if (clickCountElement != null) {
    hds.value++;
  } else {
    alert("Hotdog Clicker has encountered a fatal error.");
  }
});

bunButton?.addEventListener("click", () => {
  if (hds.value >= bunCost.value) {
    hds.value -= bunCost.value;
    bunCost.value = increase(bunCost.value, bunCount.value);
    bunCount.value++;
    hdps.value += bunRate;
  }
});

dadButton?.addEventListener("click", () => {
  if (hds.value >= dadCost.value) {
    hds.value -= dadCost.value;
    dadCost.value = increase(dadCost.value, dadCount.value);
    dadCount.value++;
    hdps.value += dadRate;
  }
});

grillButton?.addEventListener("click", () => {
  if (hds.value >= grillCost.value) {
    hds.value -= grillCost.value;
    grillCost.value = increase(grillCost.value, grillCount.value);
    grillCount.value++;
    hdps.value += grillRate;
  }
});

farmButton?.addEventListener("click", () => {
  if (hds.value >= farmCost.value) {
    hds.value -= farmCost.value;
    farmCost.value = increase(farmCost.value, farmCount.value);
    farmCount.value++;
    hdps.value += farmRate;
  }
});

facButton?.addEventListener("click", () => {
  if (hds.value >= facCost.value) {
    hds.value -= facCost.value;
    facCost.value = increase(facCost.value, facCount.value);
    facCount.value++;
    hdps.value += facRate;
  }
});

bankButton?.addEventListener("click", () => {
  if (hds.value >= bankCost.value) {
    hds.value -= bankCost.value;
    bankCost.value = increase(bankCost.value, bankCount.value);
    bankCount.value++;
    hdps.value += bankRate;
  }
});

freezerButton?.addEventListener("click", () => {
  if (hds.value >= freezerCost.value) {
    hds.value -= freezerCost.value;
    freezerCost.value = increase(freezerCost.value, freezerCount.value);
    freezerCount.value++;
    hdps.value += freezerRate;
  }
});

(() => {
  let lastTime = performance.now();

  const _update = (time: number) => {
    const delta = time - lastTime;
    lastTime = time;

    const secondsElapsed = delta / 1000;

    hds.value += hdps.value * secondsElapsed;

    requestAnimationFrame(_update);
  };

  requestAnimationFrame(_update);
})();

setInterval(save, 15e3);

document.oncontextmenu = () => {
  document.querySelector("main")?.classList.add("blur");
  document.querySelector("nav")?.classList.add("blur");
  document.getElementById("context")?.setAttribute("class", "display");

  window.onscroll = () => {
    return false;
  };

  document.addEventListener("dblclick", () => {
    document.querySelector("main")?.classList.remove("blur");
    document.querySelector("nav")?.classList.remove("blur");
    document.getElementById("context")?.setAttribute("class", "hide");
    window.onscroll = function () { };
  });

  window.onbeforeunload = save;

  return false;
};
