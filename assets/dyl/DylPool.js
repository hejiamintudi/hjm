cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/对象池",
        inspector: 'packages://dyl-nowshow/DylNotshow.js',
    },
    properties: {
    },

    __preload: function () {
        this.initPool();
    },

    initPool: function () {
        let node = this.node.getChildren()[0];
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

        this.node.add = function () {
            // cc.log("addd");
            let node = null;
            if (delPool.length < 1) {
                node = cc.instantiate(pool[0]);
                node.parent = this;

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
                // cc.log("大于1");
                node = delPool[delPool.length - 1];
                delPool.length = delPool.length - 1;
                node.active = true;
            }
            node.__poolId = pool.length;
            pool.push(node);
            // cc.log("成功添加");
            return node;
        }
        this.node.pool = pool;
    },

});
