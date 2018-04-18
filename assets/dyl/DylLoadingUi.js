cc.Class({
    extends: cc.Component,

    properties: {
        d: 150,
        cd: 2,
        h: 400,
    },

    onLoad: function () {
        let top = this.node.getChildByName("arr");
        let nodeArr = top.getChildren();
        let oriX = -(nodeArr.length - 1) * 0.5 * this.d;
        for (var i = nodeArr.length - 1; i >= 0; i--) {
            nodeArr[i].x = i * this.d + oriX;
        }
        this.nodeArr = nodeArr;
        // cc.log(this.nodeArr);
        this.r = 0;

        this.initTouch();
    },

    initTouch: function () {
        this.node.on("touchstart", ()=>{
            // if (this.node.endFun) {
            //     this.node.endFun();
            // }
            this.node.destroy();
            dyl.__isLoading = false;
        });
    },

    update: function (dt) {
        this.r = this.r + (dt / this.cd);
        for (var i = this.nodeArr.length - 1; i >= 0; i--) {
            let node = this.nodeArr[i];
            let r = this.r + i * (8 / this.nodeArr.length);
            this.nodeArr[i].y = Math.sin(r) * this.h;
        }
        if (dyl.addAd()) {
            this.node.active = false;
            this.node.destroy();
            // dyl.__adFun();
            dyl.__isLoading = false;
        }
    },
});
