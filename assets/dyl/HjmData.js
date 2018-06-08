"use strict";

window.initHjmDataFun = function () {
	_hjm("level", 0);
	_hjm("level4", 0);
	_hjm("day", -1);
	_hjm("ansNum", 0);
};

if (window.isCryptoJS && window.initHjmFun && window.initDylFun) {
	cc.log("init hjmData");
	window.initDylFun(window.isCryptoJS);
	window.initHjmFun();
	window.initHjmDataFun();
}