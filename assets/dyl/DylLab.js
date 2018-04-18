cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/文字",
    },
    properties: {
    },

    __preload: function () {
        this.initLab();
    },

    initLab: function () {
        let arr = this.node.getChildren();
        for (var i = arr.length - 1; i >= 0; i--) {
            let node = arr[i];
            let name = node.name;
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
