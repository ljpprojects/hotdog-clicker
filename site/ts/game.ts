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

  type BindingBackerDoAsyncConfig = {
    needsToWait: boolean
  }

  abstract class BindingBacker<T> {
    backedBinding: Binding<any, T>

    private currentTask: Promise<void> = Promise.resolve()

    abstract getBacking(): T | null
    abstract setBacking(to: T): void

    constructor(backedBinding: Binding<any, T>) {
      this.backedBinding = backedBinding
    }

    /**
     * Will perform a task once the previously begun task is complete.
     * The returned promsie resolves once the task is finished.
     * @param task The task to perform.
     */
    async doAsync(cfg: BindingBackerDoAsyncConfig, task: (this: BindingBacker<T>) => Promise<void>): Promise<void> {
      if (cfg.needsToWait) {
        await this.currentTask
      }

      return new Promise((res, rej) => {
        this.currentTask = task.call(this).then(() => res()).catch(reason => rej(reason))
      })
    }
  }

  class Binding<V, B> {
    private readonly setfn: (this: BindingBacker<B>, to: V) => void
    private readonly getfn: (this: BindingBacker<B>) => V

    private backing: B | null

    private readonly binderBacking: BindingBacker<B> = new (class extends BindingBacker<B> {
      getBacking(): B | null {
        return this.backedBinding.backing
      }

      setBacking(to: B) {
        this.backedBinding.backing = to
      }

      constructor(backedBinding: Binding<any, B>) {
        super(backedBinding)
      }
    })(this)

    constructor(options: {
      backing?: B | null,
      setfn(this: BindingBacker<B>, to: V): void
      getfn(this: BindingBacker<B>): V
    }) {
      this.backing = options.backing ?? null
      this.getfn = options.getfn
      this.setfn = options.setfn
    }

    public getValue(): V {
      return (this.getfn).call(this.binderBacking)
    }

    public setValue(to: V) {
      (this.setfn).call(this.binderBacking, to)
    }

    get value(): V {
      return this.getValue()
    }

    set value(to: V) {
      this.setValue(to)
    }
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

  const formatter = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
  });

  const passiveClicksElement = document.getElementById("passive")!;
  const hdps = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { passiveClicksElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const clickCountElement = document.getElementById("clickCount")!;
  const hds = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => {
        clickCountElement.textContent = formatter.format(to)
        checkBuyables()
      })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const bunCountElement = document.getElementById("bunCount")!;
  const bunCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { bunCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const dadCountElement = document.getElementById("dadCount")!;
  const dadCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { dadCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const grillCountElement = document.getElementById("grillCount")!;
  const grillCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { grillCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const farmCountElement = document.getElementById("farmCount")!;
  const farmCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { farmCountElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const facCountElement = document.getElementById("facCount")!;
  const facCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { facCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const bankCountElement = document.getElementById("bankCount")!;
  const bankCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { bankCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const freezerCountElement = document.getElementById("freezerCount")!;
  const freezerCount = new Binding<number, number>({
    backing: 0,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { freezerCountElement.textContent = String(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const bunRate: number = 0.2;
  const bunPriceElement = document.getElementById("bunPrice")!;
  const bunCost = new Binding<number, number>({
    backing: 10,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { bunPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let dadRate: number = 1;
  const dadPriceElement = document.getElementById("dadPrice")!;
  const dadCost = new Binding<number, number>({
    backing: 100,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { dadPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let grillRate: number = 7.5;
  const grillPriceElement = document.getElementById("grillPrice")!;
  const grillCost = new Binding<number, number>({
    backing: 500,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => {
        grillPriceElement.textContent = formatter.format(to)

        this.doAsync({ needsToWait: false }, async () => { save() })
      })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let farmRate: number = 15;
  const farmPriceElement = document.getElementById("farmPrice")!;
  const farmCost = new Binding<number, number>({
    backing: 5_000,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { farmPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let facRate: number = 50;
  const facPriceElement = document.getElementById("facPrice")!;
  const facCost = new Binding<number, number>({
    backing: 50_000,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { facPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let bankRate: number = 150;
  const bankPriceElement = document.getElementById("bankPrice")!;
  const bankCost = new Binding<number, number>({
    backing: 250_000,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { bankPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  let freezerRate: number = 500;
  const freezerPriceElement = document.getElementById("freezerPrice")!;
  const freezerCost = new Binding<number, number>({
    backing: 1_000_000,

    setfn(to: number) {
      this.setBacking(to)

      this.doAsync({ needsToWait: false }, async () => { freezerPriceElement.textContent = formatter.format(to) })
    },

    getfn(): number {
      return this.getBacking()!
    }
  });

  const defaultSaveData: HDCSaveData = {
    hdc: hds.value,
    hdps: hdps.value,
    ownedBuns: 0,
    ownedDads: 0,
    ownedGrills: 0,
    ownedFarms: 0,
    ownedFactories: 0,
    ownedBanks: 0,
    ownedFreezers: 0,
  };

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

  const decodeSaveData = (data: string): HDCSaveData => {
    try {
      const raw = atob(data)
      const save = JSON.parse(raw) as HDCSaveData

      return save
    } catch (e) {
      console.error(e)

      return defaultSaveData
    }
  };

  const compileSave = (): HDCSaveData => {
    return {
      hdc: hds.value,
      hdps: hdps.value,
      ownedBuns: bunCount.value,
      ownedDads: dadCount.value,
      ownedGrills: grillCount.value,
      ownedFarms: farmCount.value,
      ownedFactories: facCount.value,
      ownedBanks: bankCount.value,
      ownedFreezers: freezerCount.value,
    }
  }

  const generateEncodedSave = (from?: HDCSaveData): string => {
    const saveData = from ?? compileSave();
    const json = JSON.stringify(saveData)
    const encoded = btoa(json)

    return encoded;
  };

  const save = () => {
    const saveData = generateEncodedSave();

    document.cookie = `saved=${saveData}; Max-Age=7776000; path=/;`;
  };

  const wipe = () => {
    document.cookie = `saved=${generateEncodedSave(defaultSaveData)}; Max-Age=7776000; path=/;`;
    window.location.reload();
  };

  saveBtn!!.onclick = save;
  wipeBtn!!.onclick = wipe;

  const load = () => {
    const saveData = decodeSaveData(
      document.cookie.split("=")[1] || generateEncodedSave(defaultSaveData),
    );

    hds.value = Number(saveData.hdc);
    hdps.value = Number(saveData.hdps);

    bunCount.value = saveData.ownedBuns;
    bunCost.value = calcCost(bunCost.value, bunCount.value);

    dadCount.value = saveData.ownedDads;
    dadCost.value = calcCost(dadCost.value, dadCount.value);

    grillCount.value = saveData.ownedGrills;
    grillCost.value = calcCost(grillCost.value, grillCount.value);

    farmCount.value = saveData.ownedFarms;
    farmCost.value = calcCost(farmCost.value, farmCount.value);

    facCount.value = saveData.ownedFactories;
    facCost.value = calcCost(facCost.value, facCount.value);

    bankCount.value = saveData.ownedBanks;
    bankCost.value = calcCost(bankCost.value, bankCount.value);

    freezerCount.value = saveData.ownedFreezers;
    freezerCost.value = calcCost(freezerCost.value, freezerCount.value);
  };

  const checkBuyables = () => {
    if (hds.value >= bunCost.value) {
      bunButton?.classList.add("buyable")
    } else {
      bunButton?.classList.remove("buyable")
    }

    if (hds.value >= dadCost.value) {
      dadButton?.classList.add("buyable")
    } else {
      dadButton?.classList.remove("buyable")
    }

    if (hds.value >= grillCost.value) {
      grillButton?.classList.add("buyable")
    } else {
      grillButton?.classList.remove("buyable")
    }

    if (hds.value >= farmCost.value) {
      farmButton?.classList.add("buyable")
    } else {
      farmButton?.classList.remove("buyable")
    }

    if (hds.value >= facCost.value) {
      facButton?.classList.add("buyable")
    } else {
      facButton?.classList.remove("buyable")
    }

    if (hds.value >= bankCost.value) {
      bankButton?.classList.add("buyable")
    } else {
      bankButton?.classList.remove("buyable")
    }

    if (hds.value >= freezerCost.value) {
      freezerButton?.classList.add("buyable")
    } else {
      freezerButton?.classList.remove("buyable")
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
    if (
      hds.value >= bunCost.value
    ) {
      hds.value -= bunCost.value;
      bunCost.value = increase(bunCost.value, bunCount.value);
      bunCount.value++;
      hdps.value += bunRate;
    }
  });

  dadButton?.addEventListener("click", () => {
    if (
      hds.value >= dadCost.value
    ) {
      hds.value -= dadCost.value;
      dadCost.value = increase(dadCost.value, dadCount.value);
      dadCount.value++;
      hdps.value += dadRate;
    }
  });

  grillButton?.addEventListener("click", () => {
    if (
      hds.value >= grillCost.value
    ) {
      hds.value -= grillCost.value;
      grillCost.value = increase(grillCost.value, grillCount.value);
      grillCount.value++;
      hdps.value += grillRate;
    }
  });

  farmButton?.addEventListener("click", () => {
    if (
      hds.value >= farmCost.value
    ) {
      hds.value -= farmCost.value;
      farmCost.value = increase(farmCost.value, farmCount.value);
      farmCount.value++;
      hdps.value += farmRate;
    }
  });

  facButton?.addEventListener("click", () => {
    if (
      hds.value >= facCost.value
    ) {
      hds.value -= facCost.value;
      facCost.value = increase(facCost.value, facCount.value);
      facCount.value++;
      hdps.value += facRate;
    }
  });

  bankButton?.addEventListener("click", () => {
    if (
      hds.value >= bankCost.value
    ) {
      hds.value -= bankCost.value;
      bankCost.value = increase(bankCost.value, bankCount.value);
      bankCount.value++;
      hdps.value += bankRate;
    }
  });

  freezerButton?.addEventListener("click", () => {
    if (
      hds.value >= freezerCost.value
    ) {
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
    }

    requestAnimationFrame(_update);
  })()

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

    window.onbeforeunload = save

    return false;
  };
}
