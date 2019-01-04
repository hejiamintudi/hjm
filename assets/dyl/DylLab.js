cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/文字",
        inspector: 'packages://dyl-nowshow/DylNotshow.js',
    },
    properties: {
    },

    __preload: function () {
        this._data = {}; // name: nodeArr nodeArr.value

        this.initLab();
        this.node.say = (name, str)=>{
            let nodeArr = this._data[name];
            if (!nodeArr) {
                return cc.error("没有这种label的节点", name);
            }
            let labArr = [];
            for (let i = 0; i < nodeArr.length; i++) {
                let lab = nodeArr[i].getComponent(cc.Label);
                if (lab) {
                    lab.string = "";
                    labArr.push(lab);
                }
            }
            if (labArr.length === 0) {
                return cc.warn("say没有label相关的节点", name, str);
            }
            this._data[name].value = str;
            for (let i = 0; i < labArr.length; i++) {
                let id = ++labArr[i]._dylSayId;
                let len = str.length;
                let t = 0.1; // 加载一个字的时间
                let allTime = 0;
                let fun = (dt)=>{
                    if (id !== labArr[i]._dylSayId) {
                        return false;
                    }
                    allTime += dt;
                    let num = (allTime / t + 1) >> 0;
                    if (num >= len) {
                        num = len;
                    }
                    lab.string = str.slice(0, num);
                    return num < len;
                }
                dyl.update(fun);
            }


            // let node = this.node.getChildByName(name);
            // if (!node) {
            //     return cc.error("没有这个节点");
            // }
            // let lab = node.getComponent(cc.Label);
            // if (!lab) {
            //     return cc.error("没有label这个组件");
            // }
            // lab.string = "";
            // let id = ++this.node["__labIsSaying" + name];
            // this.node["__" + name] = str;
            // let len = str.length;
            // let t = 0.1; //加载一个字的时间
            // let allTime = 0;
            // let fun = (dt)=>{
            //     if (this.node["__labIsSaying" + name] !== id) {
            //         return false;
            //     }
            //     allTime += dt;
            //     let num = (allTime / t + 1) >> 0;
            //     if (num >= len) {
            //         num = len;
            //     }
            //     lab.string = str.slice(0, num);
            //     return num < len;
            // }
            // dyl.update(fun);
        }
    },

    addDataNode: function (name, node) {
        // if (this.node[name]) {
        //     return cc.warn("已经有这个节点, 再来放在_data会发生冲突");
        // }
        if (!this._data[name]) {
            this._data[name] = [node];
        }
        else {
            this._data[name].push(node);
        }
    },

    setProgressBar: function (node) {
        node._dylProgressBar = node.getComponent(cc.ProgressBar);
        node.set = function (value) {
            if (typeof value !== "number") {
                cc.warn("progressBar 的data类型只能是字符串或数字", value);
                return;
            }
            if (value > 1) {
                value = 1;
            }
            if (value < 0) {
                value = 0;
            }
            this._dylProgressBar.progress = value;
            return value;
        }
        this.addDataNode(node.name, node);
    },

    // 添加普通节点
    setSameNode: function (node) {
        this.addDataNode(node.name, node);
        this._data[node.name].value = node;
    },

    setLabel: function (node) {
        node._dylLabel = node.getComponent(cc.Label);
        node.set = function (value) {
            if ((typeof value !== "string") && (typeof value !== "number")) {
                cc.warn("label 的string 的data类型只能是字符串或数字", value);
                return;
            }
            let str = String(value);
            this._dylLabel.string = str;
            this._dylLabel._dylSayId++;
        }
        node.change = function (oldData, newData) {
            
        }
        node._dylLabel._dylSayId = 0;
        this.addDataNode(node.name, node);
    },

    setDylNode: function (node) {
        this.addDataNode(node.name, node);
    },

    setData: function (name, value) {
        // cc.log(name, value);
        let dataArr = this._data[name];
        Object.defineProperty(this.node, name, {
            get: function () {
                if (dataArr.value === undefined) {
                    return cc.error("没有这个数据", name);
                }
                return dataArr.value;
            },

            // 如果是 bool类型，那就代表是控制active
            // 如果是 function类型，那就是设置该属性的notify(oldValue, newValue)函数
            // 可以多个同时赋值，如果node的set函数返回值为更改值，如果返回 undefined 就是不改动
            set: function (data) {
                if (typeof data === "boolean") {
                    for (let i = 0; i < dataArr.length; i++) {
                        let node = dataArr[i];
                        node.active = data;
                    }
                    return;
                }
                else if (cc.js.getClassName(data) === "cc.Vec2") {
                    for (let i = 0; i < dataArr.length; i++) {
                        let node = dataArr[i];
                        node.setPosition(data);
                    }
                    return;
                }
                else if (cc.js.getClassName(data) === "cc.Color") {
                    for (let i = 0; i < dataArr.length; i++) {
                        let node = dataArr[i];
                        node.color = data;
                    }
                    return;
                }




                if (typeof data === "function") {
                    dataArr.notify = data;
                    return;
                }

                let oldData = dataArr.value;
                while (true) {
                    let isReset = false;
                    for (let i = 0; i < dataArr.length; i++) {
                        let node = dataArr[i];
                        if (!node.set) {
                            continue;
                        }
                        let newData = node.set(data);
                        if (newData !== undefined) { // data发生变化了
                            data = newData;
                            isReset = true;
                            break;
                        }
                    }
                    if (!isReset) {
                        break;
                    }
                }
                dataArr.value = data;
                if (oldData === undefined) { // 这算是第一次赋值
                    oldData = data;
                }
                else if (typeof oldData.getChildren === "function") {
                    oldData = data;
                }
                for (let i = 0; i < dataArr.length; i++) {
                    let node = dataArr[i];
                    if (typeof node.change === "function") {
                        node.change(oldData, data);
                    }
                }
                if (typeof dataArr.notify === "function") {
                    dataArr.notify(oldData, data);
                }
            }
        })
        if (value !== undefined) {
            this.node[name] = value;
        }  
    },

    initLab: function () {
        let arr = this.node.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            let node = arr[i];
            let name = node.name;
            if (name === "say") {
                return cc.error("say 是api的名字，不能用");
            }

            if (node.getComponent("DylBar")) {
                this.setDylNode(node);
            }
            else if (!node.getComponent(cc.Label) && !node.getComponent(cc.ProgressBar)) {
                // if (Array.isArray(this._data[name])) {
                //     return cc.warn("其他类型跟普通节点的命名一样了");
                // }
                // this.node[name] = node;
                this.setSameNode(node);
            }
            else if (node.getComponent(cc.ProgressBar)) {
                this.setProgressBar(node);

                // this.node["__bar" + name] = node.getComponent(cc.ProgressBar);
                // if (typeof this.node[name] !== "undefined") {
                //     this.node["__" + name] = this.node[name];
                // }
                // else {
                //     this.node["__" + name] = this.node["__bar" + name].progress;
                // }
                // Object.defineProperty(this.node, name, {
                //     get: function () {
                //         return this["__" + name];
                //     },
                //     set: function (data) {
                //         this["__" + name] = data;
                //         this["__bar" + name].progress = this["__" + name];
                //     }
                // })  
                // this.node[name] = this.node["__" + name];
                // continue;
            } 
            else if (node.getComponent(cc.Label)) {
                // cc.log("label");
                this.setLabel(node);
            }
            else {
                cc.error("我也不知道有什么错");
            }

        }
        for (let i in this._data) {
            this.setData(i, this.node[i]);
        }
    },
});
