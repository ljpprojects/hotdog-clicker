import { Binding } from "./Binding";
import { increase } from "./math";
import {
  save,
  wipe,
  load,
  DEFAULT_SAVE_DATA,
  generateEncodedSave,
} from "./save";
import {
  passiveClicksElement,
  clickCountElement,
  netWorthElement,
  bunCountElement,
  dadCountElement,
  grillCountElement,
  farmCountElement,
  facCountElement,
  bankCountElement,
  freezerCountElement,
  portalCountElement,
  wormholeCountElement,
  bunPriceElement,
  dadPriceElement,
  grillPriceElement,
  farmPriceElement,
  facPriceElement,
  bankPriceElement,
  freezerPriceElement,
  portalPriceElement,
  wormholePriceElement,
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
  portalButton,
  wormholeButton,
  leaderboardElements,
  youLeaderboardElement,
} from "./elements";
import { leaderboard } from "./leaderboard";
import { doJoke } from "./jokes";

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

export let nickname = "<not given>";

export const setNickname = (n: string) => {
  nickname = n;
};

export const hdnw = new Binding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      netWorthElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

let hdsIncTimeoutEnd = Date.now();

export const hds = new Binding<number, number>({
  backing: 0,

  setfn(to: number, dispatcher?: string) {
    if (hdsIncTimeoutEnd > Date.now()) return;

    const prev = this.getBacking() ?? 0;
    this.setBacking(to);

    // The difference in hds is how much to remove from our net worth
    hdnw.setValue(hdnw.getValue() - (prev - to), "hds-change");

    this.doAsync({ needsToWait: false }, async () => {
      clickCountElement.textContent = formatter.format(to);
      checkBuyables();
    });

    if (dispatcher === "btn-click") hdsIncTimeoutEnd = Date.now() + 100;
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const bunCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (bunCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = bunCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-bun",
    );

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
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (dadCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = dadCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-dad",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      dadCountElement.textContent = String(to);
    });
  },

  getfn(dispatcher): number {
    return this.getBacking()!;
  },
});

export const grillCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (grillCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = grillCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-grill",
    );

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
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (farmCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = farmCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-farm",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      farmCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const facCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (facCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = facCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-fac",
    );

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
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (bankCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = bankCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-bank",
    );

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
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (freezerCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = freezerCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-freezer",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      freezerCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const portalCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (portalCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = portalCost.value * to;

    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-portal",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      portalCountElement.textContent = String(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const wormholeCount = new Binding<number, number>({
  backing: 0,

  setfn(to: number) {
    const curr = this.getBacking() ?? 0;
    const netWorthMadeUpOfAsset =
      (wormholeCost.binderBacking.getPreviousBacking() ?? 0) * curr;
    const newNetWorthMadeUpOfAsset = wormholeCost.value * to;
    hdnw.setValue(
      hdnw.getValue() - (netWorthMadeUpOfAsset - newNetWorthMadeUpOfAsset),
      "acquire-asset-wormhole",
    );

    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      wormholeCountElement.textContent = String(to);
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

export const portalRate: number = 1500;
export const portalCost = new Binding<number, number>({
  backing: 5_000_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      portalPriceElement.textContent = formatter.format(to);
    });
  },

  getfn(): number {
    return this.getBacking()!;
  },
});

export const wormholeRate: number = 10_000;
export const wormholeCost = new Binding<number, number>({
  backing: 75_000_000,

  setfn(to: number) {
    this.setBacking(to);

    this.doAsync({ needsToWait: false }, async () => {
      wormholePriceElement.textContent = formatter.format(to);
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

  if (hds.value >= portalCost.value) {
    portalButton?.classList.add("buyable");
  } else {
    portalButton?.classList.remove("buyable");
  }

  if (hds.value >= wormholeCost.value) {
    wormholeButton?.classList.add("buyable");
  } else {
    wormholeButton?.classList.remove("buyable");
  }
};

load().then(doJoke);

setInterval(save, 60e3);

hotdogButton?.addEventListener("click", (event) => {
  if (!event.isTrusted) return;

  if (clickCountElement != null) {
    hds.setValue(hds.value + 1, "btn-click");
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

portalButton?.addEventListener("click", () => {
  if (hds.value >= portalCost.value) {
    hds.value -= portalCost.value;
    portalCost.value = increase(portalCost.value, portalCount.value);
    portalCount.value++;
    hdps.value += portalRate;
  }
});

wormholeButton?.addEventListener("click", () => {
  if (hds.value >= wormholeCost.value) {
    hds.value -= wormholeCost.value;
    wormholeCost.value = increase(wormholeCost.value, wormholeCount.value);
    wormholeCount.value++;
    hdps.value += wormholeRate;
  }
});

(() => {
  let lastTime = performance.now();

  const _update = (time: number) => {
    const delta = time - lastTime;
    lastTime = time;

    const secondsElapsed = delta / 1000;

    if (hdps.value !== 0) {
      hds.value += hdps.value * secondsElapsed;
    }

    requestAnimationFrame(_update);
  };

  requestAnimationFrame(_update);
})();

const handleLdbd = async () => {
  const ldbd = await leaderboard();

  leaderboardElements
    .slice(ldbd.length)
    .forEach((e) => e.classList.add("hide"));
  leaderboardElements.slice(0, ldbd.length).forEach((e, i) => {
    e.classList.remove("hide");
    e.textContent = `${ldbd[i].nickname} — ${formatter.format(ldbd[i].net_worth)}`;
  });

  const youLdbd = ldbd[ldbd.length - 1];

  if (youLdbd.ldbd_rank <= 15) {
    youLeaderboardElement.classList.add("hide");
  } else {
    youLeaderboardElement.classList.remove("hide");
    youLeaderboardElement.value = youLdbd.ldbd_rank;
    youLeaderboardElement.textContent = `You (${youLdbd.nickname}) — ${formatter.format(youLdbd.net_worth)}`;
  }
};

handleLdbd();

setInterval(async () => console.log(await save()), 60e3);
setInterval(handleLdbd, 60e3);

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
