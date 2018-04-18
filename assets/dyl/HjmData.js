"use strict";

window.initHjmDataFun = function () {
	cc.log("initHjmDataFun");
	_hjm("level", 0);
	_hjm("coin", 50);
	_hjm("atk", "slingshot");
	_hjm("atkArr", ["slingshot"]);
	_hjm("atkShopArr", ["slingshot", "wizard-staff", "crossed-swords", "trefoil-shuriken", "thor-hammer", "dripping-knife"]);
	_hjm("def", "templar-shield");
	_hjm("defArr", ["templar-shield"]);
	_hjm("defShopArr", ["templar-shield", "black-hand-shield"]);

	_hjm("heroData", {
		hp: 2,
		atk: 2,
		def: 1
	});
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	window.initHjmDataFun();
}