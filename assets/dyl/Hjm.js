"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// cc.Class({
//     extends: cc.Component,

//     properties: {
//     },

//     __preload () {

// cc.log("hjm");
window.ai = {};

window._hjm = null;
window.hjm = null;
var tab = {};
var pngRes = {};
var getLab = function getLab(node) {
    // let lab = node.getComponent(cc.Label);
    var name = node.name;
    if (name[0] === "_") {
        tab[node.name] = node;
    } else {
        var stringArr = name.split("_");
        if (stringArr[0] === "hjm" && stringArr.length !== 1) {
            tab[stringArr[1]].lab = node.getComponent(cc.Label);
            tab[stringArr[1]].lab.string = String(tab[stringArr[1]].get());
        }
    }
    var arr = node.getChildren();
    for (var i = arr.length - 1; i >= 0; i--) {
        getLab(arr[i]);
    }
};

var removeLab = function removeLab() {
    for (var i in tab) {
        if (i[0] !== "_") {
            tab[i].lab = null;
        }
    }
};

var hjmInit = function hjmInit() {
    removeLab();
    var node = cc.director.getScene().getChildren()[0];
    getLab(node);
    // if (isNaN(Number(node.name))) {
    //     let tmp = Math.floor(Math.random() * 9987617);
    //     // cc.log("rand number is ", tmp);
    //     dyl.setRand(tmp);
    // }
    // else {
    //     dyl.rand.set(Number(node.name));
    // }
};

var loadEnd = function loadEnd() {
    for (var i in pngRes) {
        cc.loader.releaseRes(i, cc.SpriteFrame);
        // if (pngRes[i]) {
        //     cc.loader.releaseRes(i, cc.SpriteFrame);
        //     // delete pngRes[i];
        // } else {
        //     pngRes[i] = true;
        // }
    }
    pngRes = {};
};

window._hjm1 = new Proxy({}, {
    get: function get(target, id) {
        hjm = _hjm;
        hjmInit();
        return _hjm[id];
    },

    set: function set(target, id, value) {
        hjm = _hjm;
        hjmInit();
        _hjm[id] = value;
    }
});

cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function () {
    hjm = _hjm1;
    var tmp = Math.floor(Math.random() * 9987617);
    dyl.setRand(tmp);
});

cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
    // loadEnd();
});

window.initHjmFun = function () {
    // cc.log("initHjmFun");
    // let fun = cc.director.runSceneImmediate;
    // cc.director._l_o_a_d_S_c_e_n_e_ = fun;


    // cc.director.runSceneImmediate = function (...arr) {
    //     this._l_o_a_d_S_c_e_n_e_(arr[0], arr[1], function () {
    //         if (arr[2]) {
    //             arr[2]();
    //         }
    //         removeLab();
    //         var node = cc.director.getScene().getChildren()[0];
    //         getLab(node);
    //         if (isNaN(Number(node.name))) {
    //             let tmp = Math.floor(Math.random() * 9987617);
    //             cc.log("rand number is ", tmp);
    //             dyl.rand.set(tmp);
    //         }
    //         else {
    //             dyl.rand.set(Number(node.name));
    //         }
    //     });
    // };

    var createFun = function createFun(name, defaultValue) {
        if (defaultValue && (typeof defaultValue === "undefined" ? "undefined" : _typeof(defaultValue)) === "object") {
            var data = dyl.read("_" + name);
            if (!data) {
                data = defaultValue;
            }
            var newProxy = new Proxy(data, {
                set: function set(target, id, value) {
                    target[id] = value;
                    dyl.save("_" + name, target);
                    return true;
                },
                get: function get(target, id) {
                    return target[id];
                }
            });
            var _set = function _set(value) {
                return cc.error("hjm 无法直接改变原有保存的变量");
                // data = value;
                // dyl.save("_" + name);
            };
            var _get = function _get() {
                return newProxy;
            };
            tab[name] = {
                set: _set,
                get: _get
            };
            return;
        } else if (typeof defaultValue === "string") {
            var str = dyl.read(name);
            if (typeof str !== "string") {
                str = defaultValue;
            }
            var _set2 = function _set2(value) {
                dyl.save(name, value);
                str = value;
            };
            var _get2 = function _get2() {
                return str;
            };
            tab[name] = {
                set: _set2,
                get: _get2
            };
            return;
        }

        var num = dyl.read(name);
        if (typeof num !== "number") {
            num = defaultValue;
        } else {
            num = Number(num);
        }
        var tmpArr = [Math.random() + 0.1, -Math.random() - 0.1, Math.random() + 0.1, Math.random() + 0.1, -Math.random() - 0.1];
        var id = 0;
        var data1 = null;
        var data2 = null;
        var data3 = null;
        var rand1 = 0.1;
        var rand2 = 0.1;
        var set = function set(value) {
            id++;
            // tab[id].num = value;
            //     dyl.save(id, value);
            //     if (tab[id].lab) {
            //         tab[id].lab.string = String(value);
            //     }
            rand1 = Math.random() + 0.1;
            rand2 = Math.random() + 0.1;
            data1 = value + rand1 * 13 + rand2 * 1000;
            // data2 = value * 3.1 * rand1 + 1573 * rand2;
            // data3 = value * 7.3 * rand2 + 1629 * rand3;
            var i = id % 5;
            data2 = value * tmpArr[i] * rand1 * 13.3 + 31.7;
            i = 4 - (id + 2) % 5;
            data3 = value * tmpArr[i] * rand2 * 51.1 + 91.3;
            dyl.save(name, value);
            if (tab[name].lab) {
                tab[name].lab.string = String(value);
            }
        };
        var get = function get() {
            var num1 = data1 - (rand1 * 13 + rand2 * 1000);
            var i = id % 5;
            var num2 = (data2 - 31.7) / (tmpArr[i] * rand1 * 13.3);
            i = 4 - (id + 2) % 5;
            var num3 = (data3 - 91.3) / (tmpArr[i] * rand2 * 51.1);
            if (Math.abs(num1 - num2) > 0.001) {
                return cc.error("数据1出现异常");
            }
            if (Math.abs(num1 - num3) > 0.001) {
                return cc.error("数据2出现异常");
            }
            return Math.round(num1);
        };
        tab[name] = {
            get: get,
            set: set,
            lab: null
        };
        set(num);
    };

    _hjm = new Proxy(createFun, {
        get: function get(target, id) {
            if (id[0] === "_") {
                if (!tab[id]) {
                    cc.warn("没有", id, "这个节点");
                }
                return tab[id];
            }
            // return tab[id].num;
            // cc.log("id", id);
            return tab[id].get();
        },

        set: function set(target, id, value) {
            var type = typeof value === "undefined" ? "undefined" : _typeof(value);
            if (type === "number" || type === "string") {
                // tab[id].num = value;
                // dyl.save(id, value);
                // if (tab[id].lab) {
                //     tab[id].lab.string = String(value);
                // }
                tab[id].set(value);
            } else {
                var node = value;
                // cc.log(type, id, node);
                // var mylog = function (logstr) {
                //     if (id === "polarBear") {
                //         cc.log(logstr);
                //     }
                // }
                pngRes[node.name + "/" + id] = true;
                // if (pngRes[node.name + "/" + id]) {
                //     mylog(2222222);
                //     pngRes[node.name + "/" + id] = false; //这代表是当前场景用到上个场景的图片,不能被删除
                //     mylog(333333);
                // } else {
                //     mylog(4444);
                //     pngRes[node.name + "/" + id] = true; //这代表只是上个场景要用到，当前场景不要了
                //     mylog(55555);
                // }
                // mylog(666666);
                cc.loader.loadRes(node.name + "/" + id, cc.SpriteFrame, function (err, spr) {
                    if (!cc.isValid(node)) {
                        return true;
                    }
                    // cc.log("err", err);
                    var sprite = node.getComponent(cc.Sprite);
                    sprite.spriteFrame = spr;
                });
            }
            return true;
        }
    });
};

if (window.initHjmDataFun && window.isCryptoJS && window.initDylFun) {
    cc.log("init hjm");
    window.initDylFun(window.isCryptoJS);
    window.initHjmFun();
    window.initHjmDataFun();
}

// },
// });