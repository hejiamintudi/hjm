cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/文字",
        inspector: 'packages://dyl-nowshow/DylNotshow.js',
    },
    properties: {
    },

    __preload: function () {
        this.initLab();
        this.node.say = (name, str)=>{
            let node = this.node.getChildByName(name);
            if (!node) {
                return cc.error("没有这个节点");
            }
            let lab = node.getComponent(cc.Label);
            if (!lab) {
                return cc.error("没有label这个组件");
            }
            lab.string = "";
            let id = ++this.node["__labIsSaying" + name];
            this.node["__" + name] = str;
            let len = str.length;
            let t = 0.2; //加载一个字的时间
            let allTime = 0;
            let fun = (dt)=>{
                if (this.node["__labIsSaying" + name] !== id) {
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
    },

    initLab: function () {
        let arr = this.node.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            let node = arr[i];
            let name = node.name;
            if (name === "say") {
                return cc.error("say 是api的名字，不能用");
            }
            if (!node.getComponent(cc.Label) && !node.getComponent(cc.ProgressBar)) {
                this.node[name] = node;
                continue;
            }
            else if(node.getComponent(cc.ProgressBar)) {
                this.node["__bar" + name] = node.getComponent(cc.ProgressBar);
                if (typeof this.node[name] !== "undefined") {
                    this.node["__" + name] = this.node[name];
                }
                else {
                    this.node["__" + name] = this.node["__bar" + name].progress;
                }
                Object.defineProperty(this.node, name, {
                    get: function () {
                        return this["__" + name];
                    },
                    set: function (data) {
                        this["__" + name] = data;
                        this["__bar" + name].progress = this["__" + name];
                    }
                })  
                this.node[name] = this.node["__" + name];
                continue;
            } 
            this.node["__labIsSaying" + name] = 0; //这是代表是否字符串是否在逐步显示中
            this.node["__lab" + name] = node.getComponent(cc.Label);
            if (typeof this.node[name] !== "undefined") {
                this.node["__" + name] = this.node[name];
            }
            else {
                this.node["__" + name] = this.node["__lab" + name].string;
            }
            Object.defineProperty(this.node, name, {
                get: function () {
                    return this["__" + name];
                },
                set: function (data) {
                    if (this["__labIsSaying" + name]) {//取消逐步显示
                        this["__labIsSaying" + name]++;
                    }; 
                    if (typeof data === "number" && this["__" + name] !== data) {
                        // cc.log(typeof this["__" + name], typeof data, this["__" + name], data);
                        let lab = this["__lab" + name].node;
                        lab.scaleChangeId = lab.scaleChangeId ? lab.scaleChangeId + 1 : 1;
                        lab.setScale(1.2);
                        setTimeout(()=>{
                            lab.scaleChangeId--;
                            if (!lab.scaleChangeId) {
                                if (cc.isValid(lab)) {
                                    lab.setScale(1);
                                }
                            }
                        }, 100);
                    }
                    this["__" + name] = data;
                    this["__lab" + name].string = String(this["__" + name]);
                }
            })  
            this.node[name] = this.node["__" + name];
        }
    },
});
