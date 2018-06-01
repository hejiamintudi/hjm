var getNowTime = function () {
    let data = new Date();
    return [data.getSeconds(), data.getMilliseconds()];
};

window.tz = function (node, ...argArr) {
	let isDebug = true;
	let defaultNode = null;
	if (typeof node === "object" && node.getChildren) {
		defaultNode = node;
	}
	else {
		defaultNode = cc.director.getScene().getChildren()[0];
		argArr = [node, ...argArr];
	}

	let mainSeq = [];
	let sameArr = null;

	let proxy = null;
	let endFun = function () {
	};
	let createActArrFun = function (actArr) {
		let callBack = endFun;
		endFun = function () {
			let count = actArr.length;
			let countFun = function () {
				if (!(--count)) {
					if (isDebug) {
						cc.log("sameArr");
					}
					callBack();
				}
			}
			for (let i = actArr.length - 1; i >= 0; i--) {
				let act = actArr[i];
				let cfun = cc.callFunc(countFun);
				let seq = cc.sequence(act, cfun);
				if (!act.node.active) {
					cc.warn("这个节点 active 为 false", "sameArr");
				}
				act.node.runAction(seq);
			}
		}
	}
	let run = function () {
		if (sameArr) {
			return cc.error("同时运行的动作，没有结束");
		}
		for (let i = mainSeq.length - 1; i >= 0; i--) {
			let act = mainSeq[i];
			if (Array.isArray(act)) {
				createActArrFun(act);
				continue;
			}
			let tmpEndFun = endFun;
			let cfun = cc.callFunc(function () {
				if (isDebug) {
					cc.log(act.actName);
				}
				tmpEndFun();
			});
			let seq = cc.sequence(act, cfun);
			endFun = function () {
				if (!act.node.active) {
					cc.warn("这个节点 active 为 false", act.actName);
				}
				act.node.runAction(seq);
			}
		}
		endFun();
	}
	let createSampleAct = function (data) {
		let act = null;
		if (typeof data === "string") { //转换为函数，丢给函数处理
			let str = data;
			data = function () {
				cc.log(str);
			}
		}
		if (typeof data === "function") {
			act = cc.callFunc(data);
		}
		else if (typeof data === "number") {
			act = cc.delayTime(data);
		}
		else {
			cc.error("参数有问题,这里不接受其他参数");
		}
		act.node = defaultNode;
		act.actName = data;
		return act;
	}
	let ansFun = function (data) {
		if (data === undefined) {
			return run(); //开始运行了
		}
		let act = createSampleAct(data);
		if (sameArr) { 
			sameArr.push(act);
		}
		else {
			mainSeq.push(act);
		}
		return proxy;
	}

	for (let i = 0; i < argArr.length; i++) {
		ansFun(argArr[i]);
	}

	proxy = new Proxy(ansFun, {
        get: function get(target, id) {
        	let isChangeArr = false;
			if (id[0] === "_") {
				isChangeArr = true;
			}
        	let actName = id.split("_").pop();
        	// cc.log("id", actName, id);
        	let fun = function (node, ...arr) {
        		let act = null;
        		if (actName === "") {
        			// if (!arr.length) { //这是_()的情况，这一般是用来终结同时运行数组的
        			// 	arr = [0];
        			// }
        			if (node === undefined)  {
        				node = 0;
        			}
        			act = createSampleAct(node, ...arr);
        			act.actName = node;
        		}
        		else {
        			if (typeof node !== "object" || (!node.getChildren)) {
        				arr = [node, ...arr];
        				node = defaultNode;
        			}
        			
        			//////////////////////////// (下面这个缓冲暂时不做)
        			if (typeof arr[arr.length - 1] === "string") {
        				let hc = arr.pop();
        			}
        			/////////////////////////////////////////

        			act = cc[actName](...arr);
        			act.node = node;
        			act.actName = actName;
        		}
        		if (isChangeArr) {
        			if (sameArr) { // 这里准备结束同时运行数组
        				sameArr.push(act);
        				mainSeq.push(sameArr);
        				sameArr = null;
        			}
        			else {
        				sameArr = [act];
        			}
        		}
        		else {
        			if (sameArr) {
        				sameArr.push(act);
        			}
        			else {
        				mainSeq.push(act);
        			}
        		}
        		return proxy;
        	}
            return fun;
        },
    });

    return proxy;
}