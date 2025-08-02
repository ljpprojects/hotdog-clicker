"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
{
    class BindingBacker {
        constructor(backedBinding) {
            this.currentTask = Promise.resolve();
            this.backedBinding = backedBinding;
        }
        /**
         * Will perform a task once the previously begun task is complete.
         * The returned promsie resolves once the task is finished.
         * @param task The task to perform.
         */
        doAsync(cfg, task) {
            return __awaiter(this, void 0, void 0, function* () {
                if (cfg.needsToWait) {
                    yield this.currentTask;
                }
                return new Promise((res, rej) => {
                    this.currentTask = task.call(this).then(() => res()).catch(reason => rej(reason));
                });
            });
        }
    }
    class Binding {
        constructor(options) {
            var _a;
            this.binderBacking = new (class extends BindingBacker {
                getBacking() {
                    return this.backedBinding.backing;
                }
                setBacking(to) {
                    this.backedBinding.backing = to;
                }
                constructor(backedBinding) {
                    super(backedBinding);
                }
            })(this);
            this.backing = (_a = options.backing) !== null && _a !== void 0 ? _a : null;
            this.getfn = options.getfn;
            this.setfn = options.setfn;
        }
        getValue() {
            return (this.getfn).call(this.binderBacking);
        }
        setValue(to) {
            (this.setfn).call(this.binderBacking, to);
        }
        get value() {
            return this.getValue();
        }
        set value(to) {
            this.setValue(to);
        }
    }
    const increment = 1.3;
    const increase = (price, count) => {
        return price * increment + count / increment;
    };
    const calcCost = (startPrice, count) => {
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
    const passiveClicksElement = document.getElementById("passive");
    const hdps = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { passiveClicksElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const clickCountElement = document.getElementById("clickCount");
    const hds = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () {
                clickCountElement.textContent = formatter.format(to);
                checkBuyables();
            }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const bunCountElement = document.getElementById("bunCount");
    const bunCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { bunCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const dadCountElement = document.getElementById("dadCount");
    const dadCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { dadCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const grillCountElement = document.getElementById("grillCount");
    const grillCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { grillCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const farmCountElement = document.getElementById("farmCount");
    const farmCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { farmCountElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const facCountElement = document.getElementById("facCount");
    const facCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { facCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const bankCountElement = document.getElementById("bankCount");
    const bankCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { bankCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const freezerCountElement = document.getElementById("freezerCount");
    const freezerCount = new Binding({
        backing: 0,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { freezerCountElement.textContent = String(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const bunRate = 0.2;
    const bunPriceElement = document.getElementById("bunPrice");
    const bunCost = new Binding({
        backing: 10,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { bunPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let dadRate = 1;
    const dadPriceElement = document.getElementById("dadPrice");
    const dadCost = new Binding({
        backing: 100,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { dadPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let grillRate = 7.5;
    const grillPriceElement = document.getElementById("grillPrice");
    const grillCost = new Binding({
        backing: 500,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () {
                grillPriceElement.textContent = formatter.format(to);
            }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let farmRate = 15;
    const farmPriceElement = document.getElementById("farmPrice");
    const farmCost = new Binding({
        backing: 5000,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { farmPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let facRate = 50;
    const facPriceElement = document.getElementById("facPrice");
    const facCost = new Binding({
        backing: 50000,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { facPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let bankRate = 150;
    const bankPriceElement = document.getElementById("bankPrice");
    const bankCost = new Binding({
        backing: 250000,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { bankPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    let freezerRate = 500;
    const freezerPriceElement = document.getElementById("freezerPrice");
    const freezerCost = new Binding({
        backing: 1000000,
        setfn(to) {
            this.setBacking(to);
            this.doAsync({ needsToWait: false }, () => __awaiter(this, void 0, void 0, function* () { freezerPriceElement.textContent = formatter.format(to); }));
        },
        getfn() {
            return this.getBacking();
        }
    });
    const defaultSaveData = {
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
    const hotdogButton = document.getElementById("hotdogButton");
    const bunButton = document.getElementById("bunButton");
    const dadButton = document.getElementById("dadButton");
    const grillButton = document.getElementById("grillButton");
    const farmButton = document.getElementById("farmButton");
    const facButton = document.getElementById("dogFacButton");
    const bankButton = document.getElementById("dogBankButton");
    const freezerButton = document.getElementById("freezerButton");
    const decodeSaveData = (data) => {
        try {
            const raw = atob(data);
            const save = JSON.parse(raw);
            return save;
        }
        catch (e) {
            console.error(e);
            return defaultSaveData;
        }
    };
    const compileSave = () => {
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
        };
    };
    const generateEncodedSave = (from) => {
        const saveData = from !== null && from !== void 0 ? from : compileSave();
        const json = JSON.stringify(saveData);
        const encoded = btoa(json);
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
    saveBtn.onclick = save;
    wipeBtn.onclick = wipe;
    const load = () => {
        const saveData = decodeSaveData(document.cookie.split("=")[1] || generateEncodedSave(defaultSaveData));
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
            bunButton === null || bunButton === void 0 ? void 0 : bunButton.classList.add("buyable");
        }
        else {
            bunButton === null || bunButton === void 0 ? void 0 : bunButton.classList.remove("buyable");
        }
        if (hds.value >= dadCost.value) {
            dadButton === null || dadButton === void 0 ? void 0 : dadButton.classList.add("buyable");
        }
        else {
            dadButton === null || dadButton === void 0 ? void 0 : dadButton.classList.remove("buyable");
        }
        if (hds.value >= grillCost.value) {
            grillButton === null || grillButton === void 0 ? void 0 : grillButton.classList.add("buyable");
        }
        else {
            grillButton === null || grillButton === void 0 ? void 0 : grillButton.classList.remove("buyable");
        }
        if (hds.value >= farmCost.value) {
            farmButton === null || farmButton === void 0 ? void 0 : farmButton.classList.add("buyable");
        }
        else {
            farmButton === null || farmButton === void 0 ? void 0 : farmButton.classList.remove("buyable");
        }
        if (hds.value >= facCost.value) {
            facButton === null || facButton === void 0 ? void 0 : facButton.classList.add("buyable");
        }
        else {
            facButton === null || facButton === void 0 ? void 0 : facButton.classList.remove("buyable");
        }
        if (hds.value >= bankCost.value) {
            bankButton === null || bankButton === void 0 ? void 0 : bankButton.classList.add("buyable");
        }
        else {
            bankButton === null || bankButton === void 0 ? void 0 : bankButton.classList.remove("buyable");
        }
        if (hds.value >= freezerCost.value) {
            freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.classList.add("buyable");
        }
        else {
            freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.classList.remove("buyable");
        }
    };
    load();
    setInterval(save, 10000);
    hotdogButton === null || hotdogButton === void 0 ? void 0 : hotdogButton.addEventListener("click", () => {
        if (clickCountElement != null) {
            hds.value++;
        }
        else {
            alert("Hotdog Clicker has encountered a fatal error.");
        }
    });
    bunButton === null || bunButton === void 0 ? void 0 : bunButton.addEventListener("click", () => {
        if (hds.value >= bunCost.value) {
            hds.value -= bunCost.value;
            bunCost.value = increase(bunCost.value, bunCount.value);
            bunCount.value++;
            hdps.value += bunRate;
        }
    });
    dadButton === null || dadButton === void 0 ? void 0 : dadButton.addEventListener("click", () => {
        if (hds.value >= dadCost.value) {
            hds.value -= dadCost.value;
            dadCost.value = increase(dadCost.value, dadCount.value);
            dadCount.value++;
            hdps.value += dadRate;
        }
    });
    grillButton === null || grillButton === void 0 ? void 0 : grillButton.addEventListener("click", () => {
        if (hds.value >= grillCost.value) {
            hds.value -= grillCost.value;
            grillCost.value = increase(grillCost.value, grillCount.value);
            grillCount.value++;
            hdps.value += grillRate;
        }
    });
    farmButton === null || farmButton === void 0 ? void 0 : farmButton.addEventListener("click", () => {
        if (hds.value >= farmCost.value) {
            hds.value -= farmCost.value;
            farmCost.value = increase(farmCost.value, farmCount.value);
            farmCount.value++;
            hdps.value += farmRate;
        }
    });
    facButton === null || facButton === void 0 ? void 0 : facButton.addEventListener("click", () => {
        if (hds.value >= facCost.value) {
            hds.value -= facCost.value;
            facCost.value = increase(facCost.value, facCount.value);
            facCount.value++;
            hdps.value += facRate;
        }
    });
    bankButton === null || bankButton === void 0 ? void 0 : bankButton.addEventListener("click", () => {
        if (hds.value >= bankCost.value) {
            hds.value -= bankCost.value;
            bankCost.value = increase(bankCost.value, bankCount.value);
            bankCount.value++;
            hdps.value += bankRate;
        }
    });
    freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.addEventListener("click", () => {
        if (hds.value >= freezerCost.value) {
            hds.value -= freezerCost.value;
            freezerCost.value = increase(freezerCost.value, freezerCount.value);
            freezerCount.value++;
            hdps.value += freezerRate;
        }
    });
    (() => {
        let lastTime = performance.now();
        const _update = (time) => {
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
        var _a, _b, _c;
        (_a = document.querySelector("main")) === null || _a === void 0 ? void 0 : _a.classList.add("blur");
        (_b = document.querySelector("nav")) === null || _b === void 0 ? void 0 : _b.classList.add("blur");
        (_c = document.getElementById("context")) === null || _c === void 0 ? void 0 : _c.setAttribute("class", "display");
        window.onscroll = () => {
            return false;
        };
        document.addEventListener("dblclick", () => {
            var _a, _b, _c;
            (_a = document.querySelector("main")) === null || _a === void 0 ? void 0 : _a.classList.remove("blur");
            (_b = document.querySelector("nav")) === null || _b === void 0 ? void 0 : _b.classList.remove("blur");
            (_c = document.getElementById("context")) === null || _c === void 0 ? void 0 : _c.setAttribute("class", "hide");
            window.onscroll = function () { };
        });
        window.onbeforeunload = save;
        return false;
    };
}
