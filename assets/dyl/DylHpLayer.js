cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/飙血",
    },

    __preload: function () {
        this.initHpLayer();
    },

    initHpLayer: function () {
        let thisNode = this.node;
        let node = this.node.getChildren()[0];
        // node.__lab = node.getComponent(cc.Label);
        node.__lab = node.getChildren()[0].getComponent(cc.Label);
        node.active = false;

        let pool = [];
        let delPool = [];

        delPool.push(node);
        node.del = function () {
            this.active = false;
            delPool.push(this);
            let id = this.__poolId;
            pool[id] = pool[pool.length - 1];
            pool[id].__poolId = id;
            pool.length = pool.length - 1;
            this.__poolId = null;
        }

        let add = function () {
            let node = null;
            if (delPool.length < 1) {
                // cc.log("delPool < 1");
                node = cc.instantiate(pool[0]);
                node.parent = thisNode;
                node.__lab = node.getChildren()[0].getComponent(cc.Label);

                node.del = function () {
                    this.active = false;
                    delPool.push(this);
                    let id = this.__poolId;
                    pool[id] = pool[pool.length - 1];
                    pool[id].__poolId = id;
                    pool.length = pool.length - 1;
                    this.__poolId = null;
                }
            }
            else {
                // cc.log("delPool > 0");
                node = delPool[delPool.length - 1];
                delPool.length = delPool.length - 1;
                node.active = true;
            }
            node.__poolId = pool.length;
            pool.push(node);
            // cc.log("delPool", node);
            return node;
        };

        this.node.add = function (p, num) {
            let color = null;
            num = Math.floor(num);
            // if (num > 0) {
            //     color = cc.color(0, 255, 0);
            // }
            // else if (num === 0) {
            //     color = cc.color(255, 255, 255);
            // }
            // else {
            //     color = cc.color(255, 0, 0);
            // }
            let node = add();
            node.setScale(0);
            node.stopAllActions();
            // node.color = color;
            node.setPosition(p);
            node.__lab.string = String(num);
            // let moveBy = cc.moveBy(0.6, cc.p(0, 200));
            let scale1 = cc.scaleTo(0.1, 1.15);
            let scale2 = cc.scaleTo(0.3, 1);
            // let scale3 = cc.scaleTo(0.2, 1);
            let cfun = cc.callFunc(()=>{
                node.del();
            })
            let seq = cc.sequence(scale1, scale2, cfun);
            node.runAction(seq);
        };
    },
});
