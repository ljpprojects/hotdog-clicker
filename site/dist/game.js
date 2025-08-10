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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.freezerCost = exports.freezerRate = exports.bankCost = exports.bankRate = exports.facCost = exports.facRate = exports.farmCost = exports.farmRate = exports.grillCost = exports.grillRate = exports.dadCost = exports.dadRate = exports.bunCost = exports.bunRate = exports.freezerCount = exports.bankCount = exports.facCount = exports.farmCount = exports.grillCount = exports.dadCount = exports.bunCount = exports.hds = exports.nickname = exports.hdps = exports.formatter = void 0;
var Binding_1 = require("./Binding");
var math_1 = require("./math");
var save_1 = require("./save");
var elements_1 = require("./elements");
exports.formatter = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
});
exports.hdps = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.passiveClicksElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.nickname = (_a = prompt("Enter a nickname to use.")) !== null && _a !== void 0 ? _a : "<not given>";
exports.hds = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                elements_1.clickCountElement.textContent = exports.formatter.format(to);
                checkBuyables();
                return [2 /*return*/];
            });
        }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.bunCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.bunCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.dadCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.dadCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.grillCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.grillCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.farmCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.farmCountElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.facCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.facCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.bankCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.bankCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.freezerCount = new Binding_1.Binding({
    backing: 0,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.freezerCountElement.textContent = String(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.bunRate = 0.2;
exports.bunCost = new Binding_1.Binding({
    backing: 10,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.bunPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.dadRate = 1;
exports.dadCost = new Binding_1.Binding({
    backing: 100,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.dadPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.grillRate = 7.5;
exports.grillCost = new Binding_1.Binding({
    backing: 500,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                elements_1.grillPriceElement.textContent = exports.formatter.format(to);
                return [2 /*return*/];
            });
        }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.farmRate = 15;
exports.farmCost = new Binding_1.Binding({
    backing: 5000,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.farmPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.facRate = 50;
exports.facCost = new Binding_1.Binding({
    backing: 50000,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.facPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.bankRate = 150;
exports.bankCost = new Binding_1.Binding({
    backing: 250000,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.bankPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
exports.freezerRate = 500;
exports.freezerCost = new Binding_1.Binding({
    backing: 1000000,
    setfn: function (to) {
        var _this = this;
        this.setBacking(to);
        this.doAsync({ needsToWait: false }, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            elements_1.freezerPriceElement.textContent = exports.formatter.format(to);
            return [2 /*return*/];
        }); }); });
    },
    getfn: function () {
        return this.getBacking();
    }
});
elements_1.saveBtn.onclick = save_1.save;
elements_1.wipeBtn.onclick = save_1.wipe;
var checkBuyables = function () {
    if (exports.hds.value >= exports.bunCost.value) {
        elements_1.bunButton === null || elements_1.bunButton === void 0 ? void 0 : elements_1.bunButton.classList.add("buyable");
    }
    else {
        elements_1.bunButton === null || elements_1.bunButton === void 0 ? void 0 : elements_1.bunButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.dadCost.value) {
        elements_1.dadButton === null || elements_1.dadButton === void 0 ? void 0 : elements_1.dadButton.classList.add("buyable");
    }
    else {
        elements_1.dadButton === null || elements_1.dadButton === void 0 ? void 0 : elements_1.dadButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.grillCost.value) {
        elements_1.grillButton === null || elements_1.grillButton === void 0 ? void 0 : elements_1.grillButton.classList.add("buyable");
    }
    else {
        elements_1.grillButton === null || elements_1.grillButton === void 0 ? void 0 : elements_1.grillButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.farmCost.value) {
        elements_1.farmButton === null || elements_1.farmButton === void 0 ? void 0 : elements_1.farmButton.classList.add("buyable");
    }
    else {
        elements_1.farmButton === null || elements_1.farmButton === void 0 ? void 0 : elements_1.farmButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.facCost.value) {
        elements_1.facButton === null || elements_1.facButton === void 0 ? void 0 : elements_1.facButton.classList.add("buyable");
    }
    else {
        elements_1.facButton === null || elements_1.facButton === void 0 ? void 0 : elements_1.facButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.bankCost.value) {
        elements_1.bankButton === null || elements_1.bankButton === void 0 ? void 0 : elements_1.bankButton.classList.add("buyable");
    }
    else {
        elements_1.bankButton === null || elements_1.bankButton === void 0 ? void 0 : elements_1.bankButton.classList.remove("buyable");
    }
    if (exports.hds.value >= exports.freezerCost.value) {
        elements_1.freezerButton === null || elements_1.freezerButton === void 0 ? void 0 : elements_1.freezerButton.classList.add("buyable");
    }
    else {
        elements_1.freezerButton === null || elements_1.freezerButton === void 0 ? void 0 : elements_1.freezerButton.classList.remove("buyable");
    }
};
(0, save_1.load)();
setInterval(save_1.save, 10000);
elements_1.hotdogButton === null || elements_1.hotdogButton === void 0 ? void 0 : elements_1.hotdogButton.addEventListener("click", function () {
    if (elements_1.clickCountElement != null) {
        exports.hds.value++;
    }
    else {
        alert("Hotdog Clicker has encountered a fatal error.");
    }
});
elements_1.bunButton === null || elements_1.bunButton === void 0 ? void 0 : elements_1.bunButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.bunCost.value) {
        exports.hds.value -= exports.bunCost.value;
        exports.bunCost.value = (0, math_1.increase)(exports.bunCost.value, exports.bunCount.value);
        exports.bunCount.value++;
        exports.hdps.value += exports.bunRate;
    }
});
elements_1.dadButton === null || elements_1.dadButton === void 0 ? void 0 : elements_1.dadButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.dadCost.value) {
        exports.hds.value -= exports.dadCost.value;
        exports.dadCost.value = (0, math_1.increase)(exports.dadCost.value, exports.dadCount.value);
        exports.dadCount.value++;
        exports.hdps.value += exports.dadRate;
    }
});
elements_1.grillButton === null || elements_1.grillButton === void 0 ? void 0 : elements_1.grillButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.grillCost.value) {
        exports.hds.value -= exports.grillCost.value;
        exports.grillCost.value = (0, math_1.increase)(exports.grillCost.value, exports.grillCount.value);
        exports.grillCount.value++;
        exports.hdps.value += exports.grillRate;
    }
});
elements_1.farmButton === null || elements_1.farmButton === void 0 ? void 0 : elements_1.farmButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.farmCost.value) {
        exports.hds.value -= exports.farmCost.value;
        exports.farmCost.value = (0, math_1.increase)(exports.farmCost.value, exports.farmCount.value);
        exports.farmCount.value++;
        exports.hdps.value += exports.farmRate;
    }
});
elements_1.facButton === null || elements_1.facButton === void 0 ? void 0 : elements_1.facButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.facCost.value) {
        exports.hds.value -= exports.facCost.value;
        exports.facCost.value = (0, math_1.increase)(exports.facCost.value, exports.facCount.value);
        exports.facCount.value++;
        exports.hdps.value += exports.facRate;
    }
});
elements_1.bankButton === null || elements_1.bankButton === void 0 ? void 0 : elements_1.bankButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.bankCost.value) {
        exports.hds.value -= exports.bankCost.value;
        exports.bankCost.value = (0, math_1.increase)(exports.bankCost.value, exports.bankCount.value);
        exports.bankCount.value++;
        exports.hdps.value += exports.bankRate;
    }
});
elements_1.freezerButton === null || elements_1.freezerButton === void 0 ? void 0 : elements_1.freezerButton.addEventListener("click", function () {
    if (exports.hds.value >= exports.freezerCost.value) {
        exports.hds.value -= exports.freezerCost.value;
        exports.freezerCost.value = (0, math_1.increase)(exports.freezerCost.value, exports.freezerCount.value);
        exports.freezerCount.value++;
        exports.hdps.value += exports.freezerRate;
    }
});
(function () {
    var lastTime = performance.now();
    var _update = function (time) {
        var delta = time - lastTime;
        lastTime = time;
        var secondsElapsed = delta / 1000;
        exports.hds.value += exports.hdps.value * secondsElapsed;
        requestAnimationFrame(_update);
    };
    requestAnimationFrame(_update);
})();
setInterval(save_1.save, 15e3);
document.oncontextmenu = function () {
    var _a, _b, _c;
    (_a = document.querySelector("main")) === null || _a === void 0 ? void 0 : _a.classList.add("blur");
    (_b = document.querySelector("nav")) === null || _b === void 0 ? void 0 : _b.classList.add("blur");
    (_c = document.getElementById("context")) === null || _c === void 0 ? void 0 : _c.setAttribute("class", "display");
    window.onscroll = function () {
        return false;
    };
    document.addEventListener("dblclick", function () {
        var _a, _b, _c;
        (_a = document.querySelector("main")) === null || _a === void 0 ? void 0 : _a.classList.remove("blur");
        (_b = document.querySelector("nav")) === null || _b === void 0 ? void 0 : _b.classList.remove("blur");
        (_c = document.getElementById("context")) === null || _c === void 0 ? void 0 : _c.setAttribute("class", "hide");
        window.onscroll = function () { };
    });
    window.onbeforeunload = save_1.save;
    return false;
};
