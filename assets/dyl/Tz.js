var getNowTime = function () {
    let data = new Date();
    return [data.getSeconds(), data.getMilliseconds()];
};

window.tz = function (node, ...argArr) {
	let once = function (fn) {
		let result = null;
        return  function() { 
            if(fn) {
                result = fn.apply(this, arguments);
                fn = null;
            }
            else {
            	cc.warn("tz 这个结束的end函数已经运行过一次了");
            }
            return result;
        };
	}
	let isDebug = false;
	// isDebug = true;
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
			let count = actArr.length + 1; // 多加一个，防止数组为空，不执行
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
				if (typeof act === "number") {
					act = cc.delayTime(act);
				}
				else if (typeof act === "function") {
					// act = cc.callFunc(act);
					// 设置唯一函数，防止多次调用，也防止明明返回false，还要继续执行
					let actCallBack = once(countFun);
					if (!act(actCallBack)) {
						actCallBack();
					}
					continue;
				}
				let cfun = cc.callFunc(countFun);
				let seq = cc.sequence(act, cfun);
				if (!act.node.active) {
					cc.warn("这个节点 active 为 false", "sameArr");
				}
				act.node.runAction(seq);
			}
			countFun();
		}
		endFun = once(endFun);
	}
	let run = function () {
		cc.log("rr uuuuu nnnnnnn");
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
			if (typeof act === "function") {
				endFun = once(()=>{
					if (!act(tmpEndFun)) {
						tmpEndFun();
					}
				})	
				continue;
			}

			let cfun = cc.callFunc(function () {
				if (isDebug) {
					cc.log(typeof act.actName);
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
			endFun = once(endFun);
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
			// let fun = ()=>{
			// 	data();
			// }
			// act = cc.callFunc(fun);
			let fun = (end)=>data(end);
			act = fun;
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
			// cc.log("rrrrrrr uuuuu nnnnnnnn");
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
		// cc.log("aaaaaa nnnnnn ssssssss", argArr);
		if (argArr[i] === undefined) {
			continue;
		}
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
        			
        			//////////////////////////// (下面这个缓冲)
        			let ease = null;
        			let easeType = arr[arr.length - 1];
        			if (easeType === "add") {
        				arr.pop();
        				ease = cc.easeIn(2.0);
        			}
        			else if (easeType === "sub") {
        				arr.pop();
        				ease = cc.easeOut(2.0);
        			}
        			else if (easeType === "addSub") {
        				arr.pop();
        				ease = cc.easeInOut(2.0);
        			}
        			else if (easeType === "backAdd") {
        				arr.pop();
        				ease = cc.easeBackIn();
        			}
        			else if (easeType === "subBack") {
        				arr.pop();
        				ease = cc.easeBackOut();
        			}
        			else if (easeType === "backAddSubBack") {
        				arr.pop();
        				ease = cc.easeBackInOut();
        			}
        			/////////////////////////////////////////

        			act = cc[actName](...arr);
        			act.node = node;
        			act.actName = actName;

        			if (ease) {
        				act.easing(ease);
        			}
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