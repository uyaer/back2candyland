/**
 * Created by Administrator on 2014/5/8.
 */

function ObjectPool() {
    this.fieldObjects = new Array();
    this.destroyAnimations = [];
    this.scores = {};
    var count = 90;
    for (var i = 0; i < 5; ++i) {
        if (i == 4) count = 15;
        var arr = [];
        for (var j = 0; j < count; ++j) {
            arr.push(new FieldObject(i))
        }
        if (i <= 3) {
            var animArr = [];
            for (var j = 0; j < count; ++j) {
                animArr.push(new GemDestroyAnimation(i));
            }
            this.destroyAnimations.push(animArr);
        }
        this.fieldObjects.push(arr);
    }
    for (var t = 3; t < 20; ++t) {
        var jump1 = this.getText((t * CellObject.BASE_SCORE).toString(), null, 0, 0, 0);
        var jump2 = this.getText((t * CellObject.BASE_SCORE).toString(), null, 0, 0, 0);
        this.returnText(jump1);
        this.returnText(jump2)
    }
}
/**
 *
 * @param str
 * @param cell
 * @param type isScore == 0;
                 isBonusCombo = 1;
                 isEnding = 3;
 * @param x
 * @param y
 * @returns {*}
 */
ObjectPool.prototype.getText = function(str, cell, type, x, y) {
    if (typeof x === "undefined") {
        x = -1
    }
    if (typeof y === "undefined") {
        y = -1
    }
    var s = this.scores[str];
    if (!s) {
        s = [];
        this.scores[str] = s
    }
    var jump = s.length > 0 ? s.splice(0, 1)[0] : new JumpText(str, type);
    jump.init(x > 0 || !cell ? x: cell.pos.x, y > 0 || !cell ? y: cell.pos.y, cell);
    return jump;
};
ObjectPool.prototype.returnText = function(e) {
    var t = e.text;
    var n = this.scores[t];
    if (!n) {
        n = [];
        this.scores[t] = n
    }
    e.release();
    n.push(e)
};

ObjectPool.prototype.getObject = function (cell, pos, assetNumber, colorType) {
    if (colorType > Match3Level.instance.assetNumber) {
        colorType = -1;
    }
    while (true) {
        var i = colorType >= 0 ? colorType : getInt(Math.min(assetNumber, this.fieldObjects.length));
        if (this.fieldObjects[i].length > 0) {
            var obj = this.fieldObjects[i].splice(0, 1)[0];
            return obj.init(cell, pos);
        }
        colorType = -1;
    }
    return null
};
ObjectPool.prototype.returnObject = function (obj) {
    obj.release();
    this.fieldObjects[obj.colorType].push(obj);
};

ObjectPool.prototype.getDestroyAnimation = function (colorType, x, y, cell) {
    var destoryAnimEl = this.destroyAnimations[colorType].splice(0, 1)[0];
    destoryAnimEl.init(x, y, cell);
    return destoryAnimEl;
};
ObjectPool.prototype.returnGemDestroy = function (destoryAnim) {
    this.destroyAnimations[destoryAnim.color].push(destoryAnim);
    destoryAnim.release();
};