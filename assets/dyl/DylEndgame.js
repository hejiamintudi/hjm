cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/结束画面",
    },
    properties: {
        stateNodeArr: [cc.Node],
    },

    __preload: function () {
        this.node.add = (name)=>this.onClick(name);
        let arr = this.stateNodeArr;
        for (var i = arr.length - 1; i >= 0; i--) {
            this[arr[i].name] = arr[i];
            arr[i].active = false;
        }
    },

    onClick: function (name) {
        if (name) {
            this[name].active = true;
        }
        let node = this.node;
        node.stopAllActions();
        node.active = true;
        node.setScale(2);
        node.opacity = 0;
        // let cfun = cc.callFunc(fun);
        let fade = cc.fadeTo(0.3, 255);
        let scale = cc.scaleTo(0.3, 1);
        node.runAction(cc.spawn(fade, scale));
    },

});
