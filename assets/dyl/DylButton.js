var SceneEnum = cc.Enum({
    Null: 0,
    NextScene: 1,
    NextLevel: 2,
    Restart: 3,
    ExitGame: 4,
    Popup: 5,
    Popdown: 6,
})
cc.Class({
    extends: cc.Component,
    editor: {
        menu: "dyl/按钮",
        executeInEditMode: true,
    },
    properties: {
        audio: {
            default: null,
            url: cc.AudioClip,
        },
        touchFun: {
            default: null,
            type: cc.Component.EventHandler,
        },

        clearArr: [cc.String],

        sceneType: {
            default: SceneEnum.Null,
            type: cc.Enum(SceneEnum),
            notify() {
                this._refresh();
            }
        },
        nextScene: {
            default: "",
            visible: false
        },
        // popNode: {
        //     default: null,
        //     type: cc.Node,
        //     visible: false,
        // },
        popEvent: {
            default: null,
            type: cc.Component.EventHandler,
            visible: false
        },


        _flag: false,
        _lastStr: "",
        _inputStr: "",
        _patch: "",
        nodeName: {
            default: "",
            type: cc.String,
            notify () {
                if (this._flag) {
                    this._flag = false;
                    // return ;
                }
                this.updateNodeData();
                this.changeStr();
            }
        }
    },

    _refresh: function () {
        if (CC_EDITOR) {
            cc.Class.Attr.setClassAttr(this, 'nextScene', 'visible', (this.sceneType === SceneEnum.NextScene));
            cc.Class.Attr.setClassAttr(this, 'nodeName', 'visible', ((this.sceneType === SceneEnum.Popup) ||(this.sceneType === SceneEnum.Popdown)));
            cc.Class.Attr.setClassAttr(this, 'popEvent', 'visible', ((this.sceneType === SceneEnum.Popup) ||(this.sceneType === SceneEnum.Popdown)));
        }
    },

    onEnable: function () {
        if (CC_EDITOR) {
            this._refresh();
            if (!this.audio && dyl.___audio) {
                this.audio = dyl.___audio;
            }
            else if (this.audio && !dyl.___audio) {
                dyl.___audio = this.audio;
            }
        }
        else {
            this.myInit();
        }
    },

    myInit: function () {
        let self = this;
        let _color = this.node.color;
        let _scale = this.node.getScale();
        this.node.on('touchstart', function ( event ) {
            // self.node.color = cc.color(125, 125, 125);
            self.node.setScale(1.2 * _scale);
        });  
        this.node.on('touchend', function ( event ) {
            // self.node.color = _color;
            self.node.setScale(_scale);
            self.onClick();
        });  
        this.node.on('touchcancel', function ( event ) {
            // self.node.color = _color;
            self.node.setScale(_scale);
        }); 
    },

    onClick: function () {
        if (this.audio) {
            cc.audioEngine.play(this.audio, false, 1);
        }
        if (this.touchFun && (this.touchFun.handler !== '')) {
            this.touchFun.emit();
        }

        for (var i = this.clearArr.length - 1; i >= 0; i--) {
            let name = this.clearArr[i];
            dyl.save(name, null);
        }

        if (this.sceneType === SceneEnum.NextScene) {
            return cc.director.loadScene(this.nextScene);
        }
        else if (this.sceneType === SceneEnum.NextLevel) {
            let name = cc.director.getScene().name;
            let num = name.replace(/[^0-9]/ig,""); 
            let arr = name.split(num);
            if (arr.length === 1) {
                return cc.error("这个关卡命名有问题，不是只有一个数字");
            }
            num = Number(num) + 1;
            let nextName = arr[0] + String(num) + arr[1];
            return cc.director.loadScene(nextName);
        }
        else if (this.sceneType === SceneEnum.ExitGame) {
            if (cc.sys.isMobile){
               return cc.director.end();
            }
            else if (cc.sys.isBrowser) {
                window.opener=null;
                window.open('','_self');
                window.close();
                return;
            }
            else if (cc.sys.isNative) {

            }
        }
        else if (this.sceneType === SceneEnum.Restart) {
            return cc.director.loadScene(cc.director.getScene().name);
        }
        else if (this.sceneType === SceneEnum.Popup) {
            // let node = this.popNode;
            if (this.nodeName === "") {
                return cc.warn("按钮弹窗节点为空");
            }
            let nodeName = "_" + this.nodeName.replace(" ", "");
            let node = hjm[nodeName];
            node.stopAllActions();
            node.active = true;
            node.setScale(2);
            node.opacity = 0;
            let fun = ()=>{
                if (this.popEvent && (this.popEvent.handler !== '')) {
                    this.popEvent.emit();
                }
            }
            let cfun = cc.callFunc(fun);
            let fade = cc.fadeTo(0.3, 255);
            let scale = cc.scaleTo(0.3, 1);
            node.runAction(cc.sequence(cfun, cc.spawn(fade, scale)));
        }
        else if (this.sceneType === SceneEnum.Popdown) {
            let node = this.popNode;
            node.stopAllActions();
            node.active = true;
            node.setScale(1);
            node.opacity = 255;
            let fun = ()=>{
                if (this.popEvent && (this.popEvent.handler !== '')) {
                    this.popEvent.emit();
                }
                node.active = false;
            }
            let cfun = cc.callFunc(fun);
            let fade = cc.fadeTo(0.3, 0);
            let scale = cc.scaleTo(0.3, 2);
            node.runAction(cc.sequence(cc.spawn(fade, scale), cfun));
        }
    },

//下面button弹窗的节点字符串

    nextStr: function () {
        if (this._inputStr === "") {
            return this.setNodeName("");
        }
        let now = this._inputStr + this._patch;
        let arr = this.getNodeNameArr;
        let ans = "";
        let nowId = 0;
        for (let i = arr.length - 1; i >= 0; i--) {
            let tmpArr = arr[i].split(this._inputStr);
            if (tmpArr.length > 1 && tmpArr[0] === "") {
                if (arr[i] === now) {
                    nowId = i;
                    break;
                }
            }
        }
        for (let i = 0; i < arr.length; i++) {
            let j = (i + nowId + 1) % arr.length;
            let tmpArr = arr[j].split(this._inputStr);
            if (tmpArr.length > 1 && tmpArr[0] === "") {
                ans = arr[j];
                break;
            }
        }
        this._patch = ans.slice(this._inputStr.length);
        let str = this._inputStr + " " + this._patch;
        this._lastStr = str;
        this.setNodeName(str);
    },

    changeStr: function () {
        let last = this._lastStr;
        let now = this.nodeName;
        if (now.length > last.length) {
            // cc.log(typeof now, now);
            let add = now.slice(last.length);
            if (add === " ") {
                return this.nextStr();
            }
            let input = this._inputStr + add;
            // let patch = this.getPatch(input);
            // if (!patch) {
            //     // this.nodeName = this._lastStr;
            //     this.setNodeName(this._lastStr);
            //     return;
            // }
            // input = this._inputStr.slice(0, this._inputStr.length - delNum);
            let patch = false;
            while (true) {
                patch = this.getPatch(input);
                if (typeof patch === "string") {
                    break;
                }
                input = input.slice(0, input.length - 1);
            }
            this._inputStr = input;
            this._patch = patch;
            let str = input + " " + patch;
            if (str === " ") {
                str = "";
            }
            this._lastStr = str;
            this.setNodeName(str);
        }
        else if (now.length < last.length) {
            let delNum = last.length - now.length;
            let input = this._inputStr;
            if (delNum >= input.length) {
                this._inputStr = "";
                this._lastStr = "";
                this.setNodeName("");
                return;
            }
            let patch = false;
            input = this._inputStr.slice(0, this._inputStr.length - delNum);
            while (true) {
                patch = this.getPatch(input);
                if (typeof patch === "string") {
                    break;
                }
                input = input.slice(0, input.length - 1);
            }
            // if (!patch) {
            //     // this.nodeName = this._lastStr;
            //     this.setNodeName(this._lastStr);
            //     return;
            // }
            // cc.log("3");
            this._inputStr = input;
            this._patch = patch;
            let str = input + " " + patch;
            if (str === " ") {
                str = "";
            }
            this._lastStr = str;
            this.setNodeName(str);
        }
    },

    setNodeName: function (str) {
        this._flag = true;
        this.nodeName = str;
        this._flag = false;
    },

    getPatch: function (input) {
        let arr = this.getNodeNameArr;
        if (input === "") {
            return "";
        }
        for (let i = 0; i < arr.length; i++) {
            let str = arr[i];
            let tmpArr = str.split(input);
            if (tmpArr.length > 1 && tmpArr[0] === "") {
                let ans = str.slice(input.length);
                // cc.log("ans", ans, typeof ans);
                return ans;
            }
        }
        return false;
    },  

    updateNodeData: function () {
        let arr = [];
        let fun = function (node) {
            if (node.name[0] === "_") {
                arr.push(node.name.slice(1));
            }
            let nodeArr = node.getChildren();
            for (var i = nodeArr.length - 1; i >= 0; i--) {
                fun(nodeArr[i]);
            }
        }
        if (CC_EDITOR) {
            var node = cc.director.getScene().getChildren()[0];
            fun(node);
        }
        this.getNodeNameArr = arr;
    },

});
