/**
 * Created by Administrator on 2014/5/6.
 */
var LevelTarget = cc.Class.extend({
    ctor: function () {
        this.scores = [500, 1500, 3e3];
        this.isScoreTarget = false
    }
});


Object.defineProperty(LevelTarget.prototype, "progress", {get: function () {
    return 0
}, enumerable: true, configurable: true});
Object.defineProperty(LevelTarget.prototype, "isCompleted", {get: function () {
    return this.progress >= 1 - 1e-10
}, enumerable: true, configurable: true});
LevelTarget.prototype.getExactType = function (e, t) {
    return-1
};
LevelTarget.prototype.getText = function () {
    return[]
};
LevelTarget.prototype.onLevelGenerated = function () {
};
LevelTarget.prototype.onMarkRemoved = function () {
};
LevelTarget.prototype.onBlockRemoved = function () {
};
LevelTarget.prototype.onObjectRemove = function (e) {
};
LevelTarget.prototype.getTargetText = function () {
    return""
};


/**
 * =============================================================================
 * @type {void|Function|*}
 */
var PushDownTarget = LevelTarget.extend({
    ctor: function (targetsToPush) {
        this._super();
        this.targetsToPush = 0;
        this.targetsPushed = 0;
        this.pushCakeIn = 0;
        this.pushLeft = 0;
        this.pushQueue = 0;
        this.targetsToPush = targetsToPush;
        this.setPushTime()
    }
});
PushDownTarget.prototype.setPushTime = function () {
    this.pushCakeIn = Match3Level.instance.currentMove + getInt(3);
    if (this.needToPush) {
        return
    }
    this.pushLeft = Math.random() < .02 && this.pushQueue + 2 <= this.targetsToPush ? 2 : 1;
    this.pushQueue += this.pushLeft;
    if (this.pushQueue > this.targetsToPush)this.pushLeft = -1
};
Object.defineProperty(PushDownTarget.prototype, "needToPush", {get: function () {
    return this.pushLeft > 0
}, enumerable: true, configurable: true});
Object.defineProperty(PushDownTarget.prototype, "progress", {get: function () {
    return this.targetsPushed / this.targetsToPush
}, enumerable: true, configurable: true});
PushDownTarget.prototype.onTargetPush = function () {
    ++this.targetsPushed;
    if (!this.isCompleted)this.setPushTime()
};
PushDownTarget.prototype.getTargetText = function () {
    return"x" + limit(this.targetsToPush - this.targetsPushed, 0, 1e10)
};
PushDownTarget.prototype.getExactType = function (e, t) {
    if (t == 0 && !this.isCompleted && this.needToPush && Match3Level.instance.currentMove >= this.pushCakeIn && Match3Level.instance.levelData.pushPositions.indexOf(e) != -1) {
        this.pushLeft--;
        if (this.needToPush)this.setPushTime();
        return Match3Level.instance.assetNumber
    }
    return-1
};
PushDownTarget.prototype.getText = function () {
    return["drop " + this.targetsToPush + " cakes", "to the bottom!", "cupcake"]
};


/**
 * =============================================================================
 * @type {void|Function|*}
 */
var ClearMarkTarget = LevelTarget.extend({
    ctor: function () {
        this._super();
        this.marksToRemove = 1;
        this.marksRemoved = 0
    }
});
Object.defineProperty(ClearMarkTarget.prototype, "progress", {get: function () {
    return this.marksRemoved / this.marksToRemove
}, enumerable: true, configurable: true});
ClearMarkTarget.prototype.getTargetText = function () {
    return"x" + limit(this.marksToRemove - this.marksRemoved, 0, 1e10)
};
ClearMarkTarget.prototype.onLevelGenerated = function () {
    this.marksToRemove = 0;
    for (var e = 0; e < Match3Level.instance.fieldWidth; ++e)for (var t = 0; t < Match3Level.instance.fieldHeight; ++t) {
        var n = Match3Level.instance.cells[e][t];
        if (n.isMarked)++this.marksToRemove
    }
};
ClearMarkTarget.prototype.getText = function () {
    return["remove all", "cookies!", "cookie"]
};
ClearMarkTarget.prototype.onMarkRemoved = function () {
    this.marksRemoved++
};


/**
 *  * =============================================================================
 * @type {void|Function|*}
 */
var BlockClearTarget = LevelTarget.extend({
    ctor: function BlockClearTarget() {
        this._super();
        this.blocksToRemove = 1;
        this.blocksRemoved = 0
    }
});
BlockClearTarget.prototype.getTargetText = function () {
    return"x" + limit(this.blocksToRemove - this.blocksRemoved, 0, 1e10)
};
BlockClearTarget.prototype.getText = function () {
    var e = Match3Level.instance.levelData;
    var t = e.hasBlackChoco && e.hasWhiteChoco ? "chocolate_ico" : e.hasWhiteChoco ? "chocolate_white" : "chocolate_black";
    return["remove all", "obstacles!", t]
};
Object.defineProperty(BlockClearTarget.prototype, "progress", {get: function () {
    return this.blocksRemoved / this.blocksToRemove
}, enumerable: true, configurable: true});
BlockClearTarget.prototype.onLevelGenerated = function () {
    this.blocksToRemove = 0;
    for (var e = 0; e < Match3Level.instance.fieldWidth; ++e) {
        for (var t = 0; t < Match3Level.instance.fieldHeight; ++t) {
            var cell = Match3Level.instance.cells[e][t];
            if (cell.isBreakable || cell.isColorBlocked) {
                ++this.blocksToRemove
            }
        }
    }
};
BlockClearTarget.prototype.onBlockRemoved = function () {
    this.blocksRemoved++
};


/**
 *  * =============================================================================
 * @type {void|Function|*}
 */
var ColorTarget = LevelTarget.extend({
    ctor: function (colorsToRemove, colorType) {
        this._super();
        this.colorsToRemove = 0;
        this.colorsRemoved = 0;
        this.colorType = 0;
        this.colorsToRemove = colorsToRemove;
        this.colorType = colorType
    }
});
ColorTarget.prototype.getTargetText = function () {
    return"x" + limit(this.colorsToRemove - this.colorsRemoved, 0, 1e10)
};
ColorTarget.prototype.getText = function () {
    return["remove " + this.colorsToRemove + " " + FieldObject.assetNames[this.colorType], "jellies!", FieldObject.assetNames[this.colorType]]
};
Object.defineProperty(ColorTarget.prototype, "progress", {get: function () {
    return this.colorsRemoved / this.colorsToRemove
}, enumerable: true, configurable: true});
ColorTarget.prototype.onObjectRemove = function (e) {
    if (e.colorType == this.colorType)this.colorsRemoved++
};


/**
 *  * =============================================================================
 * @type {void|Function|*}
 */
var ScoreTarget = LevelTarget.extend({
    ctor: function (targetScore) {
        this._super();
        this.targetScore = 0;
        this.targetScore = targetScore;
        this.isScoreTarget = true
    }
});
ScoreTarget.prototype.getTargetText = function () {
    var e = Math.floor(100 * limit(Match3Level.instance.score / this.targetScore, 0, 1));
    return e + "%"
};
ScoreTarget.prototype.getText = function () {
    return["collect " + this.targetScore, "points!", "star"]
};
Object.defineProperty(ScoreTarget.prototype, "progress", {get: function () {
    return Match3Level.instance.score / this.targetScore
}, enumerable: true, configurable: true});


/**
 *  * =============================================================================
 * @type {void|Function|*}
 */
var InfiniteTarget = LevelTarget.extend({
    ctor: function () {

    }
});
InfiniteTarget.prototype.getTargetText = function () {
    return"xxx%"
};
InfiniteTarget.prototype.getText = function () {
    return["reach xxx", "points!", "star"]
};
Object.defineProperty(InfiniteTarget.prototype, "progress", {get: function () {
    return 0
}, enumerable: true, configurable: true});
