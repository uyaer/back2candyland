/**
 * Created by Administrator on 2014/5/6.
 */
function AnimationManager() {
    this.data = {};
    AnimationManager.instance = this;
}

AnimationManager.prototype.putAnimation = function (name, animObj, transform) {
    var animData = this.parseAnimation(animObj, transform);
    this.data[name] = animData;
    return animData;
};
AnimationManager.prototype.parseAnimation = function (animObj, transform) {
    var animData = new AnimationData(animObj.name, null);
    var r = 0;
    var layerLen = animObj.l.length == undefined ? 1 : animObj.l.length;
    for (var i = 0; i < layerLen; ++i) {
        var obj = layerLen == 1 ? animObj.l : animObj.l[i];
        var flashName = obj.flashName;
        var isMark = obj.isMark != undefined;
        var layerData = new LayerData(obj.name, flashName ? flashName : "", isMark);
        var dLen = obj.d.length == undefined ? 1 : obj.d.length;
        for (var j = 0; j < dLen; ++j) {
            var dObj = dLen == 1 ? obj.d : obj.d[j];
            var p = dObj.name;
            var d = p.split("/");
            var spName = d[d.length - 1];
            var m = parseFloat(dObj.anchorX);
            var g = parseFloat(dObj.anchorY);
            var y = new ClipLayerData(spName, cc.p(m, g > 0 ? 1 - g : 1 - g));
            layerData.addClipData(y)
        }
        for (var b = 0; b < transform; b++) {
            layerData.addFrame(FrameData.getEmptyData());
        }
        var frameLen = obj.f.length == undefined ? 1 : obj.f.length;
        for (var j = 0; j < frameLen; ++j) {
            var frameData = null;
            var frame = frameLen == 1 ? obj.f : obj.f[j];
            var visible = frame.v != undefined && frame.v != null ? frame.v : true;
            if (!visible) {
                frameData = FrameData.getEmptyData()
            } else {
                var alpha = visible ? frame.a != undefined ? parseFloat(frame.a) : 100 : 0;
                alpha /= 100;
                var rotation = visible ? parseFloat(frame.r) : 0;
                var x = visible ? parseFloat(frame.x) : 0;
                var y = visible ? parseFloat(frame.y) : 0;
                var scX = visible ? parseFloat(frame.scX) : 0;
                var scY = visible ? parseFloat(frame.scY) : 0;
                var skX = visible ? parseFloat(frame.skX) : 0;
                var skY = visible ? parseFloat(frame.skY) : 0;
                frameData = new FrameData(visible, alpha, rotation, x, y, scX, scY, skX, skY)
            }
            layerData.addFrame(frameData)
        }
        animData.addLayer(layerData);
        r = Math.max(r, j)
    }
    animData.makeTheSameAmountOfFramesInAllLayers();
    return animData
};
AnimationManager.prototype.getAnimation = function (name) {
    return this.data[name];
};


/**
 *  * ======================          数据VO        ===========
 * @param visible
 * @param alpha
 * @param rot
 * @param x
 * @param y
 * @param scX
 * @param scY
 * @param skX
 * @param xkY
 * @constructor
 */
function FrameData(visible, alpha, rot, x, y, scX, scY, skX, xkY) {
    if (typeof alpha === "undefined") {
        alpha = 100
    }
    if (typeof rot === "undefined") {
        rot = 0
    }
    if (typeof x === "undefined") {
        x = 0
    }
    if (typeof y === "undefined") {
        y = 0
    }
    if (typeof scX === "undefined") {
        scX = 1
    }
    if (typeof scY === "undefined") {
        scY = 1
    }
    if (typeof skX === "undefined") {
        skX = 0
    }
    if (typeof xkY === "undefined") {
        xkY = 0
    }
    this.visible = visible;
    this.alpha = alpha;
    this.rotation = rot;
    this.x = x;
    this.y = y;
    this.scaleX = scX;
    this.scaleY = scY;
    this.skewX = skX;
    this.skewY = xkY
}

FrameData.prototype.clone = function () {
    return new FrameData(this.visible, this.alpha, this.rotation, this.x, this.y, this.scaleX, this.scaleY)
};
FrameData.prototype.applyTransform = function (sp) {
    sp.setVisible(this.visible);
    if (!this.visible)return;
    sp.setOpacity(255 * this.alpha);
    sp.setRotation(this.rotation);
    sp.setPosition(cc.p(this.x, -this.y));
    sp.setScaleX(this.scaleX);
    sp.setScaleY(this.scaleY);
    sp.setSkewX(this.skewX);
    sp.setSkewY(this.skewY);
};
FrameData.getEmptyData = function () {
    if (!FrameData.empty)FrameData.empty = new FrameData(false, 0, 0, 0, 0, 0, 0);
    return FrameData.empty
};


/**
 * ======================          数据VO        ===========
 * @param name
 * @param transform
 * @constructor
 */
function AnimationData(name, transform) {
    this.layerNameMap = {};
    this.layers = new Array();
    this.animationDatas = new Array();
    this.name = name;
    this.transform = transform;
    this.isAdd = false;
    this.forceFrameDelay = -1;
    this.isOverlay = false
}

AnimationData.prototype.setAdd = function () {
    this.isAdd = true;
    return this
};
AnimationData.prototype.setScale = function (e, t) {
};
AnimationData.prototype.shift = function (e, t) {
    return this
};
AnimationData.prototype.addLayer = function (e) {
    var t = this.layers.length;
    this.layerNameMap[e.flashName] = t;
    this.layers.push(e)
};
AnimationData.prototype.addData = function (e) {
    this.animationDatas.push(e)
};
AnimationData.prototype.getLayerByFlashName = function (e) {
    return this.layerNameMap[e]
};
AnimationData.prototype.connectLayers = function (e) {
    return this
};
AnimationData.prototype.makeTheSameAmountOfFramesInAllLayers = function () {
    var maxFrame = 0;
    for (var i = 0; i < this.layers.length; ++i) {
        maxFrame = Math.max(maxFrame, this.layers[i].frames.length);
    }
    for (i = 0; i < this.layers.length; ++i) {
        var layer = this.layers[i];
        while (layer.frames.length < maxFrame) {
            layer.addFrame(FrameData.getEmptyData())
        }
    }
};
AnimationData.prototype.cloneLayer = function (e, t) {
    var n = this.getLayerByFlashName(e);
    var r = this.getLayerByFlashName(t);
    this.layers[r].frames = this.layers[n].frames
};


/**
 * ========================  数据VO ===============================
 * @param spName
 * @param anchor
 * @constructor
 */
function ClipLayerData(spName, anchor) {
    this.name = spName.split(".")[0];
    this.anchor = anchor;
}


/**
 * ========================  数据VO ===============================
 * @param name
 * @param flashName
 * @param isMark
 * @constructor
 */
function LayerData(name, flashName, isMark) {
    this.isMark = isMark;
    this.frames = new Array();
    this.name = name;
    this.flashName = flashName;
    this.clipDatas = new Array();
}

LayerData.prototype.addFrame = function (e) {
    this.frames.push(e)
};
LayerData.prototype.addClipData = function (e) {
    this.clipDatas.push(e)
};
LayerData.prototype.getClipData = function (e) {
    return this.name == "none" ? null : e < this.clipDatas.length ? this.clipDatas[e] : this.clipDatas[this.clipDatas.length - 1]
};
LayerData.prototype.clone = function () {
    var t = new LayerData(this.name, this.flashName, false);
    for (var n = 0; n < this.clipDatas.length; n++)t.addClipData(new ClipLayerData(this.clipDatas[n].name, this.clipDatas[n].anchor));
    for (n = 0; n < this.frames.length; n++)t.addFrame(frames[n].clone());
    return t
};