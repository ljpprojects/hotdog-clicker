{
  interface HDCSaveData {
    hdc: number;
    hdps: number;
    ownedBuns: number;
    ownedDads: number;
    ownedGrills: number;
    ownedFarms: number;
    ownedFactories: number;
    ownedBanks: number;
    ownedFreezers: number;
  }

  const increment: number = 1.3;

  const increase = (price: number, count: number): number => {
    return price * increment + count / increment;
  };

  const calcCost = (startPrice: number, count: number) => {
    let acc = startPrice;

    for (let i = 0; i < count; i++) {
      acc = increase(acc, i);
    }

    return acc;
  };

  const wipeBtn = document.getElementById("wipe");
  const saveBtn = document.getElementById("save");
  const loadBtn = document.getElementById("load");

  const file = document.querySelector("#file") as HTMLInputElement;

  const formatter = new Intl.NumberFormat("en-au", {
    minimumFractionDigits: 2,
  });

  let passiveClicks: number = 0;
  let clickCount: number = 0;
  let bunCount: number = 0;
  let dadCount: number = 0;
  let grillCount: number = 0;
  let farmCount: number = 0;
  let facCount: number = 0;
  let bankCount: number = 0;
  let freezerCount: number = 0;

  let bunCost: number = 10;
  let bunRate: number = 0.2;

  let dadCost: number = 100;
  let dadRate: number = 2;

  let grillCost: number = 500;
  let grillRate: number = 10;

  let farmCost: number = 5000;
  let farmRate: number = 50;

  let facCost: number = 50000;
  let facRate: number = 500;

  let bankCost: number = 250000;
  let bankRate: number = 2500;

  let freezerCost: number = 1000000;
  let freezerRate: number = 15000;

  const defaultSaveData = `0/0:0:0:0:0:0:0:0`;

  const passiveClicksElement: HTMLElement | null =
    document.getElementById("passive");
  const clickCountElement: HTMLElement | null =
    document.getElementById("clickCount");

  const grillCountElement: HTMLElement | null =
    document.getElementById("grillCount");
  const bunCountElement: HTMLElement | null =
    document.getElementById("bunCount");
  const dadCountElement: HTMLElement | null =
    document.getElementById("dadCount");
  const farmCountElement: HTMLElement | null =
    document.getElementById("farmCount");
  const facCountElement: HTMLElement | null =
    document.getElementById("dogFacCount");
  const bankCountElement: HTMLElement | null =
    document.getElementById("dogBankCount");
  const freezerCountElement: HTMLElement | null =
    document.getElementById("freezerCount");

  const hotdogButton: HTMLElement | null =
    document.getElementById("hotdogButton");
  const bunButton: HTMLElement | null = document.getElementById("bunButton");
  const dadButton: HTMLElement | null = document.getElementById("dadButton");
  const grillButton: HTMLElement | null =
    document.getElementById("grillButton");
  const farmButton: HTMLElement | null = document.getElementById("farmButton");
  const facButton: HTMLElement | null = document.getElementById("dogFacButton");
  const bankButton: HTMLElement | null =
    document.getElementById("dogBankButton");
  const freezerButton: HTMLElement | null =
    document.getElementById("freezerButton");

  const bunPriceElement: HTMLElement | null =
    document.getElementById("bunPrice");
  const dadPriceElement: HTMLElement | null =
    document.getElementById("dadPrice");
  const grillPriceElement: HTMLElement | null =
    document.getElementById("grillPrice");
  const farmPriceElement: HTMLElement | null =
    document.getElementById("farmPrice");
  const facPriceElement: HTMLElement | null =
    document.getElementById("facPrice");
  const bankPriceElement: HTMLElement | null =
    document.getElementById("bankPrice");
  const freezerPriceElement: HTMLElement | null =
    document.getElementById("freezerPrice");

  const decodeSaveData = (data: string): HDCSaveData => {
    const sections = data.split(":");

    const [hdc, hdps] = sections[0].split("/").map((n) => Number(n));
    const [
      ownedBuns,
      ownedDads,
      ownedGrills,
      ownedFarms,
      ownedFactories,
      ownedBanks,
      ownedFreezers,
    ] = sections.slice(1).map((n) => Number(n));

    return {
      hdc,
      hdps,
      ownedBuns,
      ownedDads,
      ownedGrills,
      ownedFarms,
      ownedFactories,
      ownedBanks,
      ownedFreezers,
    };
  };

  const generateSaveData = (): string => {
    let builder = "";

    builder += `${clickCount.toFixed(2)}/${passiveClicks.toFixed(2)}:`;
    builder += `${bunCount}:${dadCount}:`;
    builder += `${grillCount}:${farmCount}:`;
    builder += `${facCount}:${bankCount}:`;
    builder += `${freezerCount}`;

    return builder;
  };

  const generateBinarySave = (): Uint8Array => {
    const textData = generateSaveData();
    const arr = new Uint8Array(3 + 16 + textData.length);

    return arr;
  };

  const save = () => {
    const saveData = generateSaveData();

    console.log(saveData);

    document.cookie = `saved=${saveData}; Max-Age=7776000; path=/;`;
  };

  const wipe = () => {
    document.cookie = `saved=${defaultSaveData}; Max-Age=7776000; path=/;`;
    window.location.reload();
  };

  saveBtn!!.onclick = save;
  wipeBtn!!.onclick = wipe;

  const update = (): void => {
    checkBuyables();

    clickCountElement != null
      ? (clickCountElement.innerText = formatter.format(
        Number(clickCount.toFixed(2)),
      ))
      : null;
    passiveClicksElement != null
      ? (passiveClicksElement.innerText = formatter.format(
        Number(passiveClicks.toFixed(2)),
      ))
      : null;

    bunCountElement != null
      ? (bunCountElement.innerText = formatter.format(bunCount))
      : null;
    bunPriceElement != null
      ? (bunPriceElement.innerText = formatter.format(bunCost))
      : null;

    dadCountElement != null
      ? (dadCountElement.innerText = formatter.format(dadCount))
      : null;
    dadPriceElement != null
      ? (dadPriceElement.innerText = formatter.format(dadCost))
      : null;

    grillCountElement != null
      ? (grillCountElement.innerText = formatter.format(grillCount))
      : null;
    grillPriceElement != null
      ? (grillPriceElement.innerText = formatter.format(grillCost))
      : null;

    farmCountElement != null
      ? (farmCountElement.innerText = formatter.format(farmCount))
      : null;
    farmPriceElement != null
      ? (farmPriceElement.innerText = formatter.format(farmCost))
      : null;

    facCountElement != null
      ? (facCountElement.innerText = formatter.format(facCount))
      : null;
    facPriceElement != null
      ? (facPriceElement.innerText = formatter.format(facCost))
      : null;

    bankCountElement != null
      ? (bankCountElement.innerText = formatter.format(bankCount))
      : null;
    bankPriceElement != null
      ? (bankPriceElement.innerText = formatter.format(bankCost))
      : null;

    freezerCountElement != null
      ? (freezerCountElement.innerText = formatter.format(freezerCount))
      : null;
    freezerPriceElement != null
      ? (freezerPriceElement.innerText = formatter.format(freezerCost))
      : null;
  };

  const load = () => {
    const saveData = decodeSaveData(
      document.cookie.split("=")[1] || defaultSaveData,
    );

    clickCount = Number(saveData.hdc);
    passiveClicks = Number(saveData.hdps);

    bunCount = saveData.ownedBuns;
    bunCost = calcCost(bunCost, bunCount);

    dadCount = saveData.ownedDads;
    dadCost = calcCost(dadCost, dadCount);

    grillCount = saveData.ownedGrills;
    grillCost = calcCost(grillCost, grillCount);

    farmCount = saveData.ownedFarms;
    farmCost = calcCost(farmCost, farmCount);

    facCount = saveData.ownedFactories;
    facCost = calcCost(facCost, facCount);

    bankCount = saveData.ownedBanks;
    bankCost = calcCost(bankCost, bankCount);

    freezerCount = saveData.ownedFreezers;
    freezerCost = calcCost(freezerCost, freezerCount);

    update();
  };

  const checkBuyables = () => {
    if (clickCount >= bunCost) {
      bunButton?.classList.add("buyable")
    } else {
      bunButton?.classList.remove("buyable")
    }

    if (clickCount >= dadCost) {
      dadButton?.classList.add("buyable")
    } else {
      dadButton?.classList.remove("buyable")
    }

    if (clickCount >= grillCost) {
      grillButton?.classList.add("buyable")
    } else {
      grillButton?.classList.remove("buyable")
    }

    if (clickCount >= farmCost) {
      farmButton?.classList.add("buyable")
    } else {
      farmButton?.classList.remove("buyable")
    }

    if (clickCount >= facCost) {
      facButton?.classList.add("buyable")
    } else {
      facButton?.classList.remove("buyable")
    }

    if (clickCount >= bankCost) {
      bankButton?.classList.add("buyable")
    } else {
      bankButton?.classList.remove("buyable")
    }

    if (clickCount >= freezerCost) {
      freezerButton?.classList.add("buyable")
    } else {
      freezerButton?.classList.remove("buyable")
    }
  };

  load();

  setInterval(save, 1000);

  hotdogButton?.addEventListener("click", () => {
    if (clickCountElement != null) {
      clickCount++;
      update();
    } else {
      alert("Hotdog Clicker has encountered a fatal error.");
    }
  });

  bunButton?.addEventListener("click", () => {
    if (
      clickCount >= bunCost &&
      bunPriceElement != null &&
      clickCountElement != null &&
      bunCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= bunCost;
      bunCost = increase(bunCost, bunCount);
      bunCount++;
      passiveClicks += bunRate;
      update();
    }
  });

  dadButton?.addEventListener("click", () => {
    if (
      clickCount >= dadCost &&
      dadPriceElement != null &&
      clickCountElement != null &&
      dadCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= dadCost;
      dadCost = increase(dadCost, dadCount);
      dadCount++;
      passiveClicks += dadRate;
      update();
    }
  });

  grillButton?.addEventListener("click", () => {
    if (
      clickCount >= grillCost &&
      grillPriceElement != null &&
      clickCountElement != null &&
      grillCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= grillCost;
      grillCost = increase(grillCost, grillCount);
      grillCount++;
      passiveClicks += grillRate;
      update();
    }
  });

  farmButton?.addEventListener("click", () => {
    if (
      clickCount >= farmCost &&
      farmPriceElement != null &&
      clickCountElement != null &&
      farmCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= farmCost;
      farmCost = increase(farmCost, farmCount);
      farmCount++;
      passiveClicks += farmRate;
      update();
    }
  });

  facButton?.addEventListener("click", () => {
    if (
      clickCount >= facCost &&
      facPriceElement != null &&
      clickCountElement != null &&
      facCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= facCost;
      facCost = increase(facCost, facCount);
      facCount++;
      passiveClicks += facRate;
      update();
    }
  });

  bankButton?.addEventListener("click", () => {
    if (
      clickCount >= bankCost &&
      bankPriceElement != null &&
      clickCountElement != null &&
      bankCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= bankCost;
      bankCost = increase(bankCost, bankCount);
      bankCount++;
      passiveClicks += bankRate;
      update();
    }
  });

  freezerButton?.addEventListener("click", () => {
    if (
      clickCount >= freezerCost &&
      freezerPriceElement != null &&
      freezerCountElement != null &&
      clickCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= freezerCost;
      freezerCost = increase(freezerCost, freezerCount);
      freezerCount++;
      passiveClicks += freezerRate;
      update();
    }
  });

  // Upgrades

  const mustardCost = 5000;
  const tSauceCost = 1000;
  const crispCost = 5000;

  const tSauceButton = document.getElementById("tSauceButton");
  const mustardButton = document.getElementById("mustardButton");
  const crispButton = document.getElementById("crispButton");

  tSauceButton?.addEventListener("click", () => {
    if (
      clickCount >= tSauceCost &&
      clickCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= tSauceCost;
      tSauceButton.style.display = "none";
      passiveClicks += 25;
      update();
    }
  });

  mustardButton?.addEventListener("click", () => {
    if (
      clickCount >= mustardCost &&
      clickCountElement != null &&
      passiveClicksElement != null
    ) {
      clickCount -= mustardCost;
      clickCountElement.textContent = clickCount.toFixed(2);
      mustardButton.style.display = "none";
      passiveClicks += 50;
      update();
    }
  });

  crispButton?.addEventListener("click", () => {
    if (clickCount >= crispCost && clickCountElement != null) {
      clickCount -= crispCost;
      crispButton.style.display = "none";
      bunRate *= 2;
      update();
    }
  });

  setInterval(() => {
    if (clickCountElement != null) {
      clickCount += passiveClicks / 100;
      update();
    }
  }, 10);

  document.oncontextmenu = () => {
    document.getElementById("main")?.setAttribute("class", "blur display");
    document.getElementById("context")?.setAttribute("class", "display");

    window.onscroll = () => {
      return false;
    };

    document.addEventListener("dblclick", () => {
      document.getElementById("main")?.setAttribute("class", "display");
      document.getElementById("context")?.setAttribute("class", "hide");
      window.onscroll = function () { };
    });

    return false;
  };
}
