/**
 * Created by Administrator on 2014/4/7.
 */

/**
 * 设置 setTimeout hack
 * @param callback
 * @param delay
 */
var mySetTimeout = function (callback, delay, target) {
    if (arguments.length < 3) {
        trace("the arguments length less 3....");
        trace(delay, callback);
        throw "err!";
        return;
    }
    var node = cc.Director.getInstance().getRunningScene();
    node.scheduleOnce(function () {
        callback.call(target);
    }, delay / 1000);
}
var setTimeout = setTimeout || mySetTimeout;

var mySetInterval = function (callback, delay, repeat, target) {
    if (arguments.length < 4) {
        trace("the arguments length less 4....");
        trace(callback);
        throw "err!";
        return;
    }
    if (!target.schedule) {
        cc.Director.getInstance().getScheduler().scheduleCallbackForTarget(target, callback, delay / 1000, repeat, delay / 1000, false);
//        var node = cc.Director.getInstance().getRunningScene();
//        node.schedule(function () {
//            callback.call(target);
//        }, delay / 1000, repeat, delay / 1000);
    } else {
        target.schedule(callback, delay / 1000, repeat, delay / 1000);
    }
}
var setInterval = setInterval || mySetInterval;

/**
 * 强转 int
 * @param str
 * @returns {number}
 */
function int(str) {
    return parseInt(str);
}

/**
 * 返回整数区间
 * @param min
 * @param max
 * @returns {number}
 */
function randomInt(min, max) {
    return int(Math.random() * (max - min) + min);
}
/**
 * 产生0-(num-1)的数，一般作用于数组中随机找出一个下标
 * @param num
 * @returns {number}
 */
function getInt(num) {
    return Math.floor(Math.random() * 100000) % num
}
/**
 * 让num 产生处于[min, max]之间
 * @param num
 * @param min
 * @param max
 * @returns {number}
 */
function limit(num, min, max) {
    if (num < min)num = min;
    if (num > max)num = max;
    return num;
}
/**
 * 是否在某个区间
 * @param num
 * @param min
 * @param max
 * @returns {boolean}
 */
function isIn(num, min, max) {
    return num >= min && min <= max;
}
function isIntEqual(num1, num2) {
    return Math.round(num1) == Math.round(num2);
}

function trace(msg) {
    return;
    if (arguments.length > 1) {
        var log = "";
        for (var i = 0; i < arguments.length; i++) {
            log += arguments[i] + ",";
        }
        cc.log(log);
    } else {
        cc.log(msg);
    }
}

function number2String(num, digit) {
    var str = num + "";
    var count = digit - str.length;
    var result = "";
    for (var i = 0; i < count; i++) {
        result += "0";
    }
    return result + str;
}

function hexC3B(hexNum) {
    var r = hexNum >> 16 & 0x0000FF;
    var g = hexNum >> 8 & 0x0000FF;
    var b = hexNum & 0x0000FF;
    return cc.c3b(r, g, b);
}

/**
 * 格式为RGB,默认alpha为255
 * @param hexNum
 * @returns {Number|Number|Number|Number}
 */
function hexC4B(hexNum) {
    var a = 255;
    var r = hexNum >> 16 & 0x0000FF;
    var g = hexNum >> 8 & 0x0000FF;
    var b = hexNum & 0x0000FF;
    return cc.c4b(r, g, b, a);
}


function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function makeAnimation(name, endFrame, fps, loop, startFrame) {
    fps = fps || 30;
    loop = loop || 1;
    startFrame = startFrame || 1;
    var cache = cc.SpriteFrameCache.getInstance();
    var anim = cc.Animation.create();
    anim.setDelayPerUnit(1 / fps);
    anim.setLoops(loop);
    for (var i = startFrame; i <= endFrame; i++) {
        var uri = name + number2String(i, 4) + ".png";
        var frame = cache.getSpriteFrame(uri);
        anim.addSpriteFrame(frame);
    }
    return anim;
}

function changeFrame(sp, name) {
    var frame = cc.SpriteFrameCache.getInstance().getSpriteFrame(name + ".png");
    if (frame) {
        sp.setDisplayFrame(frame);
    } else {
        throw "err:" + name;
    }
}

function bitmapText(str, fnt) {
    var tf = cc.LabelBMFont.create(str.toLowerCase(), fnt);
    return tf;
}

function createSpriteFromSpritesheet(name) {
    var sp = cc.Sprite.createWithSpriteFrameName(name + ".png");
    return sp;
}

function createBitmap(name) {
    var uri = textureCacheKey[name];
    if (!uri) {
        uri = "myassets/preloader/" + name + ".png";
    }
    return cc.Sprite.create(uri);
}

function getInt(e) {
    return Math.floor(Math.random() * 1e5) % e
}
function distanceBetweenPoints(e, t, n, r) {
    return Math.sqrt((e - n) * (e - n) + (t - r) * (t - r))
}
function limit(e, t, n) {
    if (e < t)e = t;
    if (e > n)e = n;
    return e
}
function lerp(e, t, n) {
    return e + n * (t - e)
}
function lerpAngle(e, t, n) {
    var r = Math.abs(t - e);
    if (r > 180) {
        if (t > e)e += 360; else t += 360
    }
    var i = e + (t - e) * n;
    return normalizeAngle(i)
}
function normalizeAngle(e, t, n) {
    if (typeof t === "undefined") {
        t = 0
    }
    if (typeof n === "undefined") {
        n = 360
    }
    while (e > n)e -= 360;
    while (e < t)e += 360;
    return e
}
function sign(e) {
    return e > 0 ? 1 : -1
}
function rotatePoint(e, t) {
    t *= Math.PI / 180;
    var n = Math.sin(t);
    var r = Math.cos(t);
    var i = e.x * r - e.y * n;
    var s = e.x * n + e.y * r;
    e.x = i;
    e.y = s
}
function getButtonAnimation(type) {
    var t = new AnimatedNode(AnimationManager.instance.getAnimation("buttons_anim"), 1 / 30, new SingleFlameSelector(type));
    t.addAction(t.totalFrames - 1, 0);
    return t
}