"use strict";
{
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
    const loadBtn = document.getElementById("load");
    const file = document.querySelector("#file");
    const formatter = new Intl.NumberFormat("en-au", {
        minimumFractionDigits: 2,
    });
    let passiveClicks = 0;
    let clickCount = 0;
    let bunCount = 0;
    let dadCount = 0;
    let grillCount = 0;
    let farmCount = 0;
    let facCount = 0;
    let bankCount = 0;
    let freezerCount = 0;
    let bunCost = 10;
    let bunRate = 0.2;
    let dadCost = 100;
    let dadRate = 2;
    let grillCost = 500;
    let grillRate = 10;
    let farmCost = 5000;
    let farmRate = 50;
    let facCost = 50000;
    let facRate = 500;
    let bankCost = 250000;
    let bankRate = 2500;
    let freezerCost = 1000000;
    let freezerRate = 15000;
    const defaultSaveData = `0/0:0:0:0:0:0:0:0`;
    const passiveClicksElement = document.getElementById("passive");
    const clickCountElement = document.getElementById("clickCount");
    const grillCountElement = document.getElementById("grillCount");
    const bunCountElement = document.getElementById("bunCount");
    const dadCountElement = document.getElementById("dadCount");
    const farmCountElement = document.getElementById("farmCount");
    const facCountElement = document.getElementById("dogFacCount");
    const bankCountElement = document.getElementById("dogBankCount");
    const freezerCountElement = document.getElementById("freezerCount");
    const hotdogButton = document.getElementById("hotdogButton");
    const bunButton = document.getElementById("bunButton");
    const dadButton = document.getElementById("dadButton");
    const grillButton = document.getElementById("grillButton");
    const farmButton = document.getElementById("farmButton");
    const facButton = document.getElementById("dogFacButton");
    const bankButton = document.getElementById("dogBankButton");
    const freezerButton = document.getElementById("freezerButton");
    const bunPriceElement = document.getElementById("bunPrice");
    const dadPriceElement = document.getElementById("dadPrice");
    const grillPriceElement = document.getElementById("grillPrice");
    const farmPriceElement = document.getElementById("farmPrice");
    const facPriceElement = document.getElementById("facPrice");
    const bankPriceElement = document.getElementById("bankPrice");
    const freezerPriceElement = document.getElementById("freezerPrice");
    const decodeSaveData = (data) => {
        const sections = data.split(":");
        const [hdc, hdps] = sections[0].split("/").map((n) => Number(n));
        const [ownedBuns, ownedDads, ownedGrills, ownedFarms, ownedFactories, ownedBanks, ownedFreezers,] = sections.slice(1).map((n) => Number(n));
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
    const generateSaveData = () => {
        let builder = "";
        builder += `${clickCount.toFixed(2)}/${passiveClicks.toFixed(2)}:`;
        builder += `${bunCount}:${dadCount}:`;
        builder += `${grillCount}:${farmCount}:`;
        builder += `${facCount}:${bankCount}:`;
        builder += `${freezerCount}`;
        return builder;
    };
    const generateBinarySave = () => {
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
    saveBtn.onclick = save;
    wipeBtn.onclick = wipe;
    const update = () => {
        checkBuyables();
        clickCountElement != null
            ? (clickCountElement.innerText = formatter.format(Number(clickCount.toFixed(2))))
            : null;
        passiveClicksElement != null
            ? (passiveClicksElement.innerText = formatter.format(Number(passiveClicks.toFixed(2))))
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
        const saveData = decodeSaveData(document.cookie.split("=")[1] || defaultSaveData);
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
            bunButton === null || bunButton === void 0 ? void 0 : bunButton.classList.add("buyable");
        }
        else {
            bunButton === null || bunButton === void 0 ? void 0 : bunButton.classList.remove("buyable");
        }
        if (clickCount >= dadCost) {
            dadButton === null || dadButton === void 0 ? void 0 : dadButton.classList.add("buyable");
        }
        else {
            dadButton === null || dadButton === void 0 ? void 0 : dadButton.classList.remove("buyable");
        }
        if (clickCount >= grillCost) {
            grillButton === null || grillButton === void 0 ? void 0 : grillButton.classList.add("buyable");
        }
        else {
            grillButton === null || grillButton === void 0 ? void 0 : grillButton.classList.remove("buyable");
        }
        if (clickCount >= farmCost) {
            farmButton === null || farmButton === void 0 ? void 0 : farmButton.classList.add("buyable");
        }
        else {
            farmButton === null || farmButton === void 0 ? void 0 : farmButton.classList.remove("buyable");
        }
        if (clickCount >= facCost) {
            facButton === null || facButton === void 0 ? void 0 : facButton.classList.add("buyable");
        }
        else {
            facButton === null || facButton === void 0 ? void 0 : facButton.classList.remove("buyable");
        }
        if (clickCount >= bankCost) {
            bankButton === null || bankButton === void 0 ? void 0 : bankButton.classList.add("buyable");
        }
        else {
            bankButton === null || bankButton === void 0 ? void 0 : bankButton.classList.remove("buyable");
        }
        if (clickCount >= freezerCost) {
            freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.classList.add("buyable");
        }
        else {
            freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.classList.remove("buyable");
        }
    };
    load();
    setInterval(save, 1000);
    hotdogButton === null || hotdogButton === void 0 ? void 0 : hotdogButton.addEventListener("click", () => {
        if (clickCountElement != null) {
            clickCount++;
            update();
        }
        else {
            alert("Hotdog Clicker has encountered a fatal error.");
        }
    });
    bunButton === null || bunButton === void 0 ? void 0 : bunButton.addEventListener("click", () => {
        if (clickCount >= bunCost &&
            bunPriceElement != null &&
            clickCountElement != null &&
            bunCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= bunCost;
            bunCost = increase(bunCost, bunCount);
            bunCount++;
            passiveClicks += bunRate;
            update();
        }
    });
    dadButton === null || dadButton === void 0 ? void 0 : dadButton.addEventListener("click", () => {
        if (clickCount >= dadCost &&
            dadPriceElement != null &&
            clickCountElement != null &&
            dadCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= dadCost;
            dadCost = increase(dadCost, dadCount);
            dadCount++;
            passiveClicks += dadRate;
            update();
        }
    });
    grillButton === null || grillButton === void 0 ? void 0 : grillButton.addEventListener("click", () => {
        if (clickCount >= grillCost &&
            grillPriceElement != null &&
            clickCountElement != null &&
            grillCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= grillCost;
            grillCost = increase(grillCost, grillCount);
            grillCount++;
            passiveClicks += grillRate;
            update();
        }
    });
    farmButton === null || farmButton === void 0 ? void 0 : farmButton.addEventListener("click", () => {
        if (clickCount >= farmCost &&
            farmPriceElement != null &&
            clickCountElement != null &&
            farmCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= farmCost;
            farmCost = increase(farmCost, farmCount);
            farmCount++;
            passiveClicks += farmRate;
            update();
        }
    });
    facButton === null || facButton === void 0 ? void 0 : facButton.addEventListener("click", () => {
        if (clickCount >= facCost &&
            facPriceElement != null &&
            clickCountElement != null &&
            facCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= facCost;
            facCost = increase(facCost, facCount);
            facCount++;
            passiveClicks += facRate;
            update();
        }
    });
    bankButton === null || bankButton === void 0 ? void 0 : bankButton.addEventListener("click", () => {
        if (clickCount >= bankCost &&
            bankPriceElement != null &&
            clickCountElement != null &&
            bankCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= bankCost;
            bankCost = increase(bankCost, bankCount);
            bankCount++;
            passiveClicks += bankRate;
            update();
        }
    });
    freezerButton === null || freezerButton === void 0 ? void 0 : freezerButton.addEventListener("click", () => {
        if (clickCount >= freezerCost &&
            freezerPriceElement != null &&
            freezerCountElement != null &&
            clickCountElement != null &&
            passiveClicksElement != null) {
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
    tSauceButton === null || tSauceButton === void 0 ? void 0 : tSauceButton.addEventListener("click", () => {
        if (clickCount >= tSauceCost &&
            clickCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= tSauceCost;
            tSauceButton.style.display = "none";
            passiveClicks += 25;
            update();
        }
    });
    mustardButton === null || mustardButton === void 0 ? void 0 : mustardButton.addEventListener("click", () => {
        if (clickCount >= mustardCost &&
            clickCountElement != null &&
            passiveClicksElement != null) {
            clickCount -= mustardCost;
            clickCountElement.textContent = clickCount.toFixed(2);
            mustardButton.style.display = "none";
            passiveClicks += 50;
            update();
        }
    });
    crispButton === null || crispButton === void 0 ? void 0 : crispButton.addEventListener("click", () => {
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
        var _a, _b;
        (_a = document.getElementById("main")) === null || _a === void 0 ? void 0 : _a.setAttribute("class", "blur display");
        (_b = document.getElementById("context")) === null || _b === void 0 ? void 0 : _b.setAttribute("class", "display");
        window.onscroll = () => {
            return false;
        };
        document.addEventListener("dblclick", () => {
            var _a, _b;
            (_a = document.getElementById("main")) === null || _a === void 0 ? void 0 : _a.setAttribute("class", "display");
            (_b = document.getElementById("context")) === null || _b === void 0 ? void 0 : _b.setAttribute("class", "hide");
            window.onscroll = function () { };
        });
        return false;
    };
}
