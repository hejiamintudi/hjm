"use strict";

// var cc = {};

// dyl = dyl ? dyl : {};
// if (!window.dyl) {
//     window.dyl = {};
// }

// cc.Class({
//     extends: cc.Component,

//     properties: {
//     },

//     __preload () {
//         this.dylInit();
//         // let data = dyl.data.enData[name];
//         // this.node.hp = Number(data.hp);
//         // this.node.def = Number(data.def);
//         // this.node.atk = Number(data.atk);
//         // this.node.atkFun = data.atkFun;
//         // this.node.defFun = data.defFun;
//     },


function _toConsumableArray2(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }return arr2;
    } else {
        return Array.from(arr);
    }
}

var updateFunArr = [];

cc.director.on(cc.Director.EVENT_AFTER_UPDATE, function () {
    var dt = cc.director.getDeltaTime();
    // cc.log(dt, "end");
    for (var i = updateFunArr.length - 1; i >= 0; i--) {
        if (!updateFunArr[i](dt)) {
            updateFunArr[i] = updateFunArr[updateFunArr.length - 1];
            updateFunArr[i].id = i;
            updateFunArr.length--;
        }
    }
});

cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LAUNCH, function () {
    updateFunArr = [];
    // dyl.setRand((cc.random0To1() * 10000 + 23) >> 0);
    if (window.dyl) {
        window.dyl.setRand((cc.random0To1() * 10000 + 23) >> 0);
    }
});

window.initDylFun = function (cryptoJS) {
    cc.log("initDylFun", cryptoJS);
    window.dyl = window.dyl || {};
    window.dyl.__debug = {};
    Object.defineProperty(dyl, "debug", {
        get: function get() {
            return this.__debug["default"];
        },
        set: function set(str) {
            var arr = str.split(" ");
            this.__debug[arr[0]] = arr[arr.length - 1];
            this.__debug["default"] = arr[arr.length - 1];
            cc.log("scene name = ", cc.director.getScene().name);
            cc.director.loadScene(cc.director.getScene().name);
        }
    });

    dyl.getSize = function (node) {
        node = node.node ? node.node : node;
        var size = node.getContentSize();
        var w = size.width;
        var h = size.height;

        return cc.p(w, h);
    };

    dyl.addMap = function (w, h, fun) {
        var map = [];
        for (var y = 0; y < h; y++) {
            // map[y] = [];
            var arr = [];
            for (var x = 0; x < w; x++) {
                // map[y][x] = fun ? fun(cc.p(x, y)) : null;
                // cc.log(x, y, map[y][x]);
                var val = fun ? fun(cc.p(x, y)) : null;
                arr.push(val);
            }

            // map[y].push(arr);
            map.push(arr);
        }
        map.w = w;
        map.h = h;
        map.get = function (p, name) {
            if (!p) {
                return false;
            }
            if (p.x < 0 || p.y < 0 || p.x >= this.w || p.y >= this.h) {
                return false;
            }
            if (!name) {
                return this[p.y][p.x];
            }
            if (this[p.y][p.x]) {
                return this[p.y][p.x][name];
            }
            return this[p.y][p.x];
        };
        map.set = function (p, value) {
            if (!p) {
                return false;
            }
            if (value && value.__classname__ === "cc.Vec2") { //交换位置
                let value1 = this.get(p);
                let value2 = this.get(value);
                if (value1 === false || value2 === false) {
                    return cc.warn("有无效的位置");
                }
                this.set(p,     value2);
                this.set(value, value1);
                return true;
            }
            if (p.x < 0 || p.y < 0 || p.x >= this.w || p.y >= this.h) {
                // cc.log(p, this.w, this.h);
                cc.warn("p不在地图上");
                return false;
            }
            var ans = map[p.y][p.x];
            map[p.y][p.x] = value;
            return ans;
        };
        map.find = function (value) {
            var ansArr = [];
            if (typeof value === "function") {
                var fun = value;
                for (var y = 0; y < this.h; y++) {
                    for (var x = 0; x < this.w; x++) {
                        if (this[y][x] && fun(this[y][x])) {
                            ansArr.push(cc.p(x, y));
                        }
                    }
                }
            }
            else {
                for (var y = 0; y < this.h; y++) {
                    for (var x = 0; x < this.w; x++) {
                        if (this[y][x] === value) {
                            ansArr.push(cc.p(x, y));
                        }
                    }
                }
            }
            if (!ansArr.length) {
                return null;
            }
            return ansArr;
        };
        map.run = function (fun) {
            if (typeof fun !== "function") {
                var tmpSelf = this;
                var value = fun;
                fun = function(p) {
                    if (tmpSelf[p.y][p.x] === value) {
                        return p;
                    }
                }
            }
            var arr = [];
            for (var y = 0; y < this.h; y++) {
                for (var x = 0; x < this.w; x++) {
                    var p = fun(cc.p(x, y));
                    // (p || p === 0) && arr.push(p);
                    if (p !== undefined) {
                        arr.push(p);
                    }
                }
            }
            return arr;
        };
        return map;
    };

    dyl.addMapLayer = function (w, h, d) {
        var x = (1 - w) * d / 2;
        var y = (1 - h) * d / 2;
        var ori = cc.p(x, y);
        // cc.log("ori", ori.x, ori.y, w, h, d);
        var fun = function fun(p) {
            //创建函数
            var v = ori.add(p.mul(d));
            // cc.log(v.x, v.y);
            return v;
        };
        var map = this.addMap(w, h, fun);
        map.ori = ori.sub(cc.p(d / 2, d / 2)); //最左下角
        //map.w = w;
        //map.h = h;
        map.d = d;
        var checkIn = function checkIn(p) {
            var maxX = map.w * map.d / 2;
            var maxY = map.h * map.d / 2;

            return p.x >= -maxX && p.y >= -maxY && p.x < maxX && p.y < maxY;
        };
        map.find = function (p) {
            if (!checkIn(p)) {
                return false;
            }
            p = cc.p(p.x, p.y);
            p.subSelf(this.ori);
            p.mulSelf(1 / d);
            p.x = Math.floor(p.x);
            p.y = Math.floor(p.y);
            return p;
        };
        map.set = function (nodeMap) {
            var self = this;
            this.run(function(p) {
                var x = p.x;
                var y = p.y;
                if (nodeMap[y][x]) {
                    nodeMap[y][x].setPosition(self[y][x]);
                }
            })
        };
        return map;
    };

    var __randNum = (cc.random0To1() * 10000 + 23) >> 0;
    dyl.setRand = function (num) {
        cc.log("seed", num);
        __randNum = num;
    };
    dyl.rand = function (num) {
        // cc.random0To1();
        if (typeof this.__randNum !== "number") {
            this.__randNum = 1;
        }
        var maxNum = 9987617;
        __randNum = (59341 * __randNum + 6541) % maxNum;
        var randNum = __randNum / maxNum;
        if (num) {
            return Math.floor(randNum * num);
        }
        return randNum;
    };

    // dyl.rand.set = function (num) {
    //     __randNum = num;
    // };


    var __encryptFun = function __encryptFun(word) {
        word = String(word);
        var key = cryptoJS.enc.Utf8.parse("woaihejiamin");
        var iv = cryptoJS.enc.Utf8.parse("nihaijidewoma");
        var encrypted = cryptoJS.AES.encrypt(word, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        return cryptoJS.enc.Base64.stringify(encrypted.ciphertext);
    };

    var __decryptFun = function __decryptFun(word) {
        var key = cryptoJS.enc.Utf8.parse("woaihejiamin");
        var iv = cryptoJS.enc.Utf8.parse("nihaijidewoma");
        var decrypt = cryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: cryptoJS.mode.CBC,
            padding: cryptoJS.pad.Pkcs7
        });
        var uncrypted = decrypt.toString(cryptoJS.enc.Utf8).toString();
        var uncryptedNum = parseInt(uncrypted);
        if (uncryptedNum == 0 || uncryptedNum) {
            uncrypted = uncryptedNum;
        }
        return uncrypted;
    };

    dyl.save = function (name, data) {
        if (data === 0 || data) {
            if (name[0] === "_") {
                var str = JSON.stringify(data);
                cc.sys.localStorage.setItem(name, __encryptFun(str));
            } else {
                cc.sys.localStorage.setItem(name, __encryptFun(data));
            }
        } else {
            //删除数据
            cc.sys.localStorage.removeItem(name);
        }
    };
    dyl.read = function (name) {
        //checkIn(p,isT) tposToPos(tp) getTpos(p) getPos(p, isT)
        if (name[0] === "_") {
            var data = cc.sys.localStorage.getItem(name);
            if (!data) {
                return data;
            }
            var str = __decryptFun(data);
            return JSON.parse(str);
        }
        var data1 = cc.sys.localStorage.getItem(name);
        if (!data1) {
            return data1;
        }
        return __decryptFun(data1);
    };
    dyl.key = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function (isOn) {
                return data.dir(isOn, cc.p(0, 1));
            };
            data.s = function (isOn) {
                return data.dir(isOn, cc.p(0, -1));
            };
            data.a = function (isOn) {
                return data.dir(isOn, cc.p(-1, 0));
            };
            data.d = function (isOn) {
                return data.dir(isOn, cc.p(1, 0));
            };

            data.up = function (isOn) {
                return data.dir(isOn, cc.p(0, 1));
            };
            data.down = function (isOn) {
                return data.dir(isOn, cc.p(0, -1));
            };
            data.left = function (isOn) {
                return data.dir(isOn, cc.p(-1, 0));
            };
            data.right = function (isOn) {
                return data.dir(isOn, cc.p(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            data[i](true);
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        data[i](false);
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.keyOn = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function () {
                return data.dir(cc.p(0, 1));
            };
            data.s = function () {
                return data.dir(cc.p(0, -1));
            };
            data.a = function () {
                return data.dir(cc.p(-1, 0));
            };
            data.d = function () {
                return data.dir(cc.p(1, 0));
            };

            data.up = function () {
                return data.dir(cc.p(0, 1));
            };
            data.down = function () {
                return data.dir(cc.p(0, -1));
            };
            data.left = function () {
                return data.dir(cc.p(-1, 0));
            };
            data.right = function () {
                return data.dir(cc.p(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            data[i]();
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        // data[i](false);
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.keyUp = function (data) {
        var keyOnData = {};
        var keyUpData = {};
        if (data.dir) {
            data.w = function () {
                return data.dir(cc.p(0, 1));
            };
            data.s = function () {
                return data.dir(cc.p(0, -1));
            };
            data.a = function () {
                return data.dir(cc.p(-1, 0));
            };
            data.d = function () {
                return data.dir(cc.p(1, 0));
            };

            data.up = function () {
                return data.dir(cc.p(0, 1));
            };
            data.down = function () {
                return data.dir(cc.p(0, -1));
            };
            data.left = function () {
                return data.dir(cc.p(-1, 0));
            };
            data.right = function () {
                return data.dir(cc.p(1, 0));
            };
        }
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        if (keyOnData[i] === keyUpData[i]) {
                            // data[i]();
                            keyOnData[i] = !keyOnData[i];
                        }
                        return;
                    }
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function onKeyReleased(keyCode, event) {
                for (var i in data) {
                    if (keyCode === cc.KEY[i]) {
                        data[i]();
                        keyUpData[i] = keyOnData[i];
                        return;
                    }
                }
            }
        }, cc.director.getScene().getChildren()[0]);
    };

    dyl.addDirArr = function (p) {
        // 499 5479 
        // p = p ? p : cc.p(0, 0);
        var x = p ? p.x : 0;
        var y = p ? p.y : 0;
        var arr = [cc.p(x, y + 1), cc.p(x, y - 1), cc.p(x + 1, y), cc.p(x - 1, y)];
        arr.sort(function () {
            return 0.5 - dyl.rand();
        });
        return arr;
    };

    // dyl.run = function () {
    //     var self = this;
    //     // this.node.run = function () {
    //     var root = function root() {};
    //     var node0 = arguments[0];
    //     var endId = 0;
    //     if (node0.parent && node0.getChildren) {
    //         if (!node0.active) {
    //             cc.warn("dyl.run node的active不是true");
    //         }
    //         endId = 0;
    //     } else {
    //         node0 = cc.director.getScene().getChildren()[0];
    //         endId = -1;
    //     }
    //     var createFun = function createFun(act, endFun) {
    //         // let fun = endFun;
    //         var fun = function fun() {
    //             act();
    //             endFun();
    //         };
    //         return fun;
    //     };
    //     var createLogFun = function createLogFun(act, endFun) {
    //         // let fun = endFun;
    //         var fun = function fun() {
    //             // self.node.js[act]();
    //             cc.log(act);
    //             endFun();
    //         };
    //         return fun;
    //     };
    //     var createArr = function createArr(act, endFun) {
    //         var fun = function fun() {
    //             // let counter = dyl.counter(endFun);
    //             var arr = act;
    //             arr.push(function () {
    //                 return null;
    //             });
    //             var counterNum = arr.length;
    //             var delFun = function delFun() {
    //                 counterNum--;
    //                 if (counterNum <= 0) {
    //                     endFun();
    //                 }
    //             };
    //             for (var i = 0; i < arr.length; i++) {
    //                 create(arr[i], function () {
    //                     // counter.del();
    //                     delFun();
    //                 })();
    //             }
    //         };
    //         return fun;
    //     };
    //     var createOther = function createOther(act, endFun) {
    //         // cc.log("createOther", act.node);
    //         var fun = function fun() {
    //             var node = act.node;
    //             if (node.node) {
    //                 node = node.node;
    //                 if (!node.active) {
    //                     cc.warn("dylPre run createOther node active is", node.active);
    //                 }
    //             }
    //             if (act.add && act.add > 0) {
    //                 act.easing(cc.easeIn(act.add));
    //             } else if (act.add && act.add < 0) {
    //                 var inout = cc.easeInOut(-act.add);
    //                 // cc.log("iiiiii", -act.add, inout);
    //                 act.easing(cc.easeInOut(-act.add));
    //             }
    //             var cfun = cc.callFunc(function () {
    //                 endFun();
    //             });
    //             var seq = cc.sequence(act, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var createMove = function createMove(act, endFun) {
    //         var fun = function fun() {
    //             var node = node0;
    //             if (node.node) {
    //                 node = node.node;
    //             }
    //             if (act.add && act.add > 0) {
    //                 act.easing(cc.easeIn(act.add));
    //             } else if (act.add && act.add < 0) {
    //                 var inout = cc.easeInOut(-act.add);
    //                 // cc.log("iiiiii", -act.add, inout);
    //                 act.easing(cc.easeInOut(-act.add));
    //             }
    //             var cfun = cc.callFunc(endFun);
    //             var seq = cc.sequence(act, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var createDelay = function createDelay(act, endFun) {
    //         var fun = function fun() {
    //             var node = node0;
    //             if (node.node) {
    //                 node = node.node;
    //             }
    //             var delay = cc.delayTime(act);
    //             var cfun = cc.callFunc(endFun);
    //             var seq = cc.sequence(delay, cfun);
    //             node.runAction(seq);
    //         };
    //         return fun;
    //     };
    //     var create = function create(act, endFun) {
    //         // cc.log(act, act.node);
    //         if (typeof act === "function") {
    //             return createFun(act, endFun);
    //         } else if (typeof act === "number") {
    //             return createDelay(act, endFun);
    //         }  else if (Array.isArray(act)) {
    //             return createArr(act, endFun);
    //         } else if (act.node) {
    //             return createOther(act, endFun);
    //         } else if (typeof act === "string") {
    //             return createLogFun(act, endFun);
    //         } else {
    //             return createMove(act, endFun);
    //         }
            
    //     };
    //     for (var i = arguments.length - 1; i > endId; i--) {
    //         // cc.log("arg", i);
    //         var act = arguments[i];
    //         root = create(act, root);
    //     }
    //     // cc.log("root", root);
    //     root();
    // };

    dyl.data = function (key, node) {
        var arr = key.split(".");
        var data = dyl._data[arr[0]][arr[1]];
        if (!data) {
            return cc.error("没有这个数据", key);
        }
        // cc.log("data", data, node);
        for (var i in data) {
            if (i !== "_data") {
                // cc.log(i, data[i]);
                node[i] = data[i];
            }
        }
        return data._data;
    };

    dyl.process = function (js, arr) {
        // var isLog = Math.floor(cc.random0To1() * 100) + 4;
        // var isLog = false;
        var isLog = true;

        var tab = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        var counterId = 0;
        var counterArr = [];
        var nextArr = arr;
        var counter = null;

        var runChild = function runChild() {
            var i = 0;
            var childCounter = function childCounter() {
                var data = counterArr[i++];
                if (isLog) {
                    cc.log(isLog, "childCounter", data);
                }
                if (!data) {
                    counterArr.length = 0;
                    return counter();
                }
                var childJs = data.childJs,
                    name = data.name,
                    arrr = data.arrr;

                // childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
                if (typeof name === "function") {
                    name.apply(undefined, [childCounter].concat(_toConsumableArray2(arrr)));
                } else if (typeof name === "string") {
                    childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
                } else {
                    cc.warn("dyl process 子进程的函数参数出错了，不是函数，也不是字符串");
                }
            };
            childCounter();
        };

        var run = function run(branch) {
            //行动
            if (counterArr.length > 0) {
                return runChild();
            }
            var name = nextArr[counterId++];
            if (isLog) {
                cc.log(isLog, "counter", name);
            }
            if (!name) {
                //结束了
                return;
            }
            if (typeof name === "string") {
                if (branch) {
                    return cc.error("正常的运行，应该没有分支才对，是不是哪里逻辑出问题了")
                }
                //代表函数
                if (!js[name]) { //如果没有那就跳到下一个函数，有时候用来分支而已，未必是函数
                    return counter();
                }
                return js[name](counter);
            }
            else if (typeof name === "function") {
                if (branch) {
                    return cc.error("正常的运行，应该没有分支才对，是不是哪里逻辑出问题了")
                }
                return name(counter);
            }

            //下面是数组，代表分支
            if (!branch) {
                return cc.error("数组是分支，这里应该有一个表示分支的参数")
            }
            for (var i = counterId - 1; i < nextArr.length; i++) {
                var arr = nextArr[i];
                if (!Array.isArray(arr)) {
                    return cc.error("dyl.process 这里是分支内容，后面的参数应该都是数组，这里参数不对");
                }
                if (arr[0] === branch) {
                    nextArr = arr;
                    counterId = 0;
                    return counter();
                }
            }
            // ///下面是子对象了
            // for (var i in name) {
            //     var next = js[i](counter);
            //     nextArr = name[i][next];
            //     if (!nextArr) {
            //         //找不到了，就是相当于结束流程
            //         return;
            //     }
            //     counterId = 0;
            //     counter();
            // }
        };

        var addChild = function addChild(childJs, name, arrr) {
            counterArr.push({
                childJs: childJs,
                name: name,
                arrr: arrr
            });
        };

        counter = function counter(childJs, name) {
            if (!childJs) {
                run();
            } 
            else if (typeof childJs === "string") {
                run(childJs);
            }
            else {
                for (var _len = arguments.length, arrr = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                    arrr[_key - 2] = arguments[_key];
                }

                addChild(childJs, name, arrr);
            }
        };
        for (var i in tab) {
            counter[i] = tab[i];
        }

        counter();
    };

    // dyl.process = function (js, arr) {
    //     // var isLog = Math.floor(cc.random0To1() * 100) + 4;
    //     var isLog = false;

    //     var tab = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    //     var counterId = 0;
    //     var counterArr = [];
    //     var nextArr = arr;
    //     var counter = null;

    //     var runChild = function runChild() {
    //         var i = 0;
    //         var childCounter = function childCounter() {
    //             var data = counterArr[i++];
    //             if (isLog) {
    //                 cc.log(isLog, "childCounter", data);
    //             }
    //             if (!data) {
    //                 counterArr.length = 0;
    //                 return counter();
    //             }
    //             var childJs = data.childJs,
    //                 name = data.name,
    //                 arrr = data.arrr;

    //             // childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
    //             if (typeof name === "function") {
    //                 name.apply(undefined, [childCounter].concat(_toConsumableArray2(arrr)));
    //             } else if (typeof name === "string") {
    //                 childJs[name].apply(childJs, [childCounter].concat(_toConsumableArray(arrr)));
    //             } else {
    //                 cc.warn("dyl process 子进程的函数参数出错了，不是函数，也不是字符串");
    //             }
    //         };
    //         childCounter();
    //     };

    //     var run = function run() {
    //         //行动
    //         if (counterArr.length > 0) {
    //             return runChild();
    //         }
    //         var name = nextArr[counterId++];
    //         if (isLog) {
    //             cc.log(isLog, "counter", name);
    //         }
    //         if (!name) {
    //             //结束了
    //             return;
    //         }
    //         if (typeof name === "string") {
    //             //代表函数
    //             return js[name](counter);
    //         }
    //         else if (typeof name === "function") {
    //             return name(counter);
    //         }

    //         ///下面是子对象了
    //         for (var i in name) {
    //             var next = js[i](counter);
    //             nextArr = name[i][next];
    //             if (!nextArr) {
    //                 //找不到了，就是相当于结束流程
    //                 return;
    //             }
    //             counterId = 0;
    //             counter();
    //         }
    //     };

    //     var addChild = function addChild(childJs, name, arrr) {
    //         counterArr.push({
    //             childJs: childJs,
    //             name: name,
    //             arrr: arrr
    //         });
    //     };

    //     counter = function counter(childJs, name) {
    //         if (!childJs) {
    //             run();
    //         } else {
    //             for (var _len = arguments.length, arrr = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    //                 arrr[_key - 2] = arguments[_key];
    //             }

    //             addChild(childJs, name, arrr);
    //         }
    //     };
    //     for (var i in tab) {
    //         counter[i] = tab[i];
    //     }

    //     counter();
    // };

    dyl.update = function (fun) {
        fun.id = updateFunArr.length;
        updateFunArr.push(fun);
        var delFun = function () {
            var id = fun.id;
            updateFunArr[id] = updateFunArr[updateFunArr.length - 1];
            updateFunArr[id].id = id;
            updateFunArr.length--;
        }
        return delFun;
    };

    dyl.button = function (js) {
        var setButton = function (name, node) {
            var _scale = node.getScale();
            node.on('touchstart', function ( event ) {
                node.setScale(0.92 * _scale);
            });  
            node.on('touchend', function ( event ) {
                node.setScale(_scale);
                js[name]();
            });  
            node.on('touchcancel', function ( event ) {
                node.setScale(_scale);
            }); 
        };
        var arr = js.node.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            var name = arr[i].name;
            if (typeof js[name] === "function") {
                setButton(name, arr[i]);
            }
        }
    };

    dyl.load = function (...arg) { //动态加载节点，参数方式 path arr fun ：path fun ：arr fun
        var getPath = function (str) {
            str = str.split(' ').join('/');
            str = str.split('.').join('/');
            str = str.split('_').join('/');
            str = str.split('-').join('/');
            str = str.split(',').join('/');
            return str;
        }
        if (arg.length === 2 && typeof arg[0] === "string" && typeof arg[1] === "function") {
            var path = getPath(arg[0]);
            cc.loader.loadRes(path, function (err, prefab) {
                if (err) {
                    cc.error(err);
                }
                arg[1](cc.instantiate(prefab));
            });
            return;
        }
        var pathArr = null;
        var fun = null;
        if (arg.length === 2 && Array.isArray(arg[0]) && typeof arg[1] === "function") {
            fun = arg[1];
            pathArr = arg[0];
        }
        else if (arg.length === 3 && typeof arg[0] === "string" && Array.isArray(arg[1]) && typeof arg[2] === "function"){
            fun = arg[2];
            pathArr = arg[1];
            for (var i = pathArr.length - 1; i >= 0; i--) {
                pathArr[i] = arg[0] + "/" + pathArr[i];
            }
        }
        else {
            return cc.error("dyl.load 参数有错");
        }
        var nodeArr = [];
        var num = pathArr.length;
        var loadFun = function (i) {
            var path = getPath(pathArr[i]);
            var id = i;
            cc.loader.loadRes(path, function (err, prefab) {
                if (err) {
                    cc.error(err);
                }
                nodeArr[id] = cc.instantiate(prefab);
                cc.log(id, nodeArr[id]);
                if (!(--num)) {
                    arg[2](nodeArr);
                }
            });
        }
        for (var i = pathArr.length - 1; i >= 0; i--) {
            loadFun(i);
        }
    };  

//100 * 100  的物体 dyl.shake(2, 5, 5, hjm._tz);
    dyl.shake = function (time, w, h, node) {
        var x = dyl.rand() * 50 + 30;
        var y = dyl.rand() * 50 + 30;
        cc.log(x, y);
        var t = 0;
        var fun = function (dt) {
            node.setPosition(w * Math.sin(x * t), h * Math.sin(y * t))
            t += dt;
            if (t >= time) {
                node.setPosition(0, 0);
                return false;
            }
            return true;
        }
        dyl.update(fun);
    };

//这是操作缓冲类，主要处理那种，上一个动作还没有做完，就出现下一个输入的情况。这时候可以把这个输入保存，等做完动作再运行
    dyl.buffer = function (actFun, time) {
        // if (typeof actFun !== "function") {
        //     return cc.error("dyl.buffer 参数有错");
        // }
        if (!time) {
            time = 0;
        }
        time = 1000 * time;
        //data 有三种状态 "ing": 正在运行中并且没有新动作加入 null：空闲中 其他：保存的动作
        var buffer = { data: null };
        var id = 0; //这个是唯一标记，防止重复执行的
        buffer.add = function (data) {
            if (!this.data) { //空闲中，可以直接执行，不用保存动作
                this.data = "ing";
                return actFun(data);
            }
            this.data = data;
            var i = ++id;
            setTimeout(function () {
                if (i !== id) {
                    return;
                }
                buffer.data = null;
            }, time);
        }

        buffer.del = function (str) {
            ++id;
            // cc.log("del", str);
            if (this.data === "ing") {
                this.data = null;
            }
            else if (this.data) {
                var tmpData = this.data;
                this.data = "ing";
                actFun(tmpData);
            }
        }

        return buffer;
    };

    // dyl.act = function (node, type, ...arr) {
    //     var resetArg = function (str) { //把变量统一变回对象
    //         if (arr.length < 2) {
    //             return arr[0];
    //         }
    //         return cc[str](...arr);
    //     }
    //     var t1 = 0.1;
    //     var t2 = 0.2;
    //     var act1 = null;
    //     var act2 = null;
    //     if (type === "moveTo") {
    //         var ori = node.getPosition();
    //         act1 = cc.moveTo(t1, resetArg("p"));
    //         act2 = cc.moveTo(t2, ori);
    //     }
    //     else if (type === "fadeTo") {
    //         var ori = node.opacity;
    //         act1 = cc.fadeTo(t1, arr[0]);
    //         act2 = cc.fadeTo(t2, ori);
    //     }
    //     else if (type === "tintTo") {
    //         var ori = node.color;
    //         act1 = cc.tintTo(t1, resetArg("color"));
    //         act2 = cc.tintTo(t2, ori);
    //     }
    //     else if (type === "scaleTo") {
    //         var oriX = node.scaleX;
    //         var oriY = node.scaleY;
    //         act1 = cc.scaleTo(t1, ...arr);
    //         act2 = cc.scaleTo(t2, oriX, oriY);
    //     }
    //     else {
    //         cc.error("dyl.act 这种动作特效，还没有定义", type);
    //     }
    //     var seq = cc.sequence(act1, act2);
    //     node.runAction(seq);
    // };
};

if (window.initHjmDataFun && window.initHjmFun && window.iscryptoJS) {
    window.initDylFun(window.isCryptoJS);
    window.initHjmFun();
    window.initHjmDataFun();
}

// });