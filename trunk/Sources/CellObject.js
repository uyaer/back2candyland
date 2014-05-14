/**
 * Created by Administrator on 2014/5/6.
 */
var CellObject = GameObject.extend({
    ctor: function (row, col) {
        this._super();
        this._isBlock = false;
        this.isTempBlock = false;
        this.tempBlockTime = -1;
        this.breakCountLeft = 0;
        this.marksLeft = 0;
        this.mark = null;
        this.block = null;
        this.blockTop = null;
        this.colorBlock = -1;
        this.isClearedByClickOrColor = false;
        this.scoreToAdd = -1;
        this.breakMatchId = -1;
        this.changeTypeIn = -1;
        this.typeToChange = -1;
        this.clearIn = -1;
        this.removeBlockIn = -1;
        this.timeSinceBlockRemove = 100;
        this.lastBlockSet = -1;
        this.timeSinceLastTypeChange = 0;
        this.x = row;
        this.y = col;
        this.pos = Match3Level.instance.gridToStage(row, col);
        var tileSize = this.level.tileSize;
        this.rect = cc.rect(this.pos.x - tileSize / 2, this.pos.y - tileSize / 2, tileSize, tileSize);
    }
});

Object.defineProperty(CellObject.prototype, "isChangingType", {get: function () {
    return this.changeTypeIn >= 0;
}, enumerable: true, configurable: true});
CellObject.prototype.prepareToChangeType = function (changeTypeIn, typeToChange) {
    typeToChange = typeToChange || -1;
    while (typeToChange < 0) {
        typeToChange = getInt(this.level.assetNumber);
    }
    this.changeTypeIn = changeTypeIn;
    this.typeToChange = typeToChange;
};
CellObject.prototype.setMark = function (marksLeft) {
    if (arguments.length < 1) {
        marksLeft = 1;
    }
    var oldMarksLeft = this.marksLeft;
    this.marksLeft = marksLeft;
    if (oldMarksLeft > 0 && marksLeft < oldMarksLeft && this.mark && marksLeft >= 0) {
        this.level.objects.push(new CookieTweenSprite(this.mark.x, this.mark.y, marksLeft));
    }
    if (this.marksLeft <= 0) {
        Match3Level.instance.marks.removeChild(this.mark);
        this.mark = null;
        this.level.target.onMarkRemoved();
        return;
    }
    var name = marksLeft == 1 ? "cookie" : "cookie_honey";
    var sp = this.mark ? this.mark : createSpriteFromSpritesheet(name);
    sp.setPosition(Match3Level.instance.gridToStage(this.x, this.y));
    if (sp.getParent() == null) {
        Match3Level.instance.marks.addChild(sp);
    }
    this.mark = sp
};
CellObject.prototype.reset = function () {
    this.blockTop = null;
    if (this.block) {
        this.block.removeFromParent();
        this.block = null;
    }
    if (this.mark) {
        this.mark.removeFromParent();
        this.mark = null;
    }
    if (this.object) {
        Match3Level.pool.returnObject(this.object);
        this.object = null
    }
    this._isBlock = false;
    this.isTempBlock = false;
    this.tempBlockTime = -1;
    this.breakCountLeft = 0;
    this.marksLeft = 0;
    this.colorBlock = -1;
    this.isClearedByClickOrColor = false;
    this.breakMatchId = -1;
    this.clearIn = -1;
    this.removeBlockIn = -1;
    this.timeSinceBlockRemove = 100;
    this.lastBlockSet = -1;
    this.scoreToAdd = -1;
};
Object.defineProperty(CellObject.prototype, "isMarked", {get: function () {
    return this.marksLeft > 0
}, enumerable: true, configurable: true});
Object.defineProperty(CellObject.prototype, "isColorBlocked", {get: function () {
    return this.colorBlock >= 0
}, enumerable: true, configurable: true});
CellObject.prototype.setBlock = function (breakCountLeft, flag) {
    breakCountLeft = breakCountLeft || 0;
    flag = flag || false;
    this.lastBlockSet = breakCountLeft;
    this.breakCountLeft = flag ? 0 : breakCountLeft;
    this._isBlock = true;
    this.colorBlock = flag ? getInt(this.level.assetNumber) : -1;
    if (flag) {
        this.setObject(Match3Level.pool.getObject(this, this.level.gridToStage(this.x, this.y), this.level.assetNumber, this.colorBlock));
        this.object.isMoving = false
    }
    var sp = createSpriteFromSpritesheet(flag ? "wall_color" : breakCountLeft == 0 ? "chocolate_nuts" : breakCountLeft == 1 ? "chocolate_white" : "chocolate_black");
    sp.setPosition(this.level.gridToStage(this.x, this.y));
    this.level.blockLayer.addChild(sp);
    this.block = sp;
};
CellObject.prototype.changeObjectType = function (colorType) {
    if (colorType != this.getType()) {
        var t = this.object.isBonus;
        var n = this.object.bonusType;
        this.timeSinceLastTypeChange = 0;
        Match3Level.pool.returnObject(this.object);
        var r = this.level.gridToStage(this.x, this.y);
        this.setObject(Match3Level.pool.getObject(this, r, 3, colorType));
        this.object.playJellyAnimation(1, 1);
        if (t)this.object.setBonusType(n)
    }
};
CellObject.prototype.removeBlock = function () {
    if (!this.isColorBlocked && (!this.isBreakable || this.breakMatchId == Match3Level.instance.currentMove))return;
    var e = this.block != null;
    this.breakMatchId = Match3Level.instance.currentMove;
    this.breakCountLeft--;
    this.timeSinceBlockRemove = 0;
    var t = this.isColorBlocked;
    if (this.isColorBlocked) {
        this.colorBlock = -1;
        this.setTempBlock(true, .15);
        this.blockTop.removeFromParent();
        this.blockTop = null
    }
    if (this.level.isActive) {
        SoundsManager.instance.playSound(t ? "color_crash" : "choco_crash");
    }
    if (this.breakCountLeft <= 0) {
        if (t) {
            this.level.objects.push(new SinglePlayObject(this.block.getPositionX(), this.block.getPositionY(), "color_wall", 18, this.level.blockDestroyLayer, 53, 53, ANIM_SCALE));
        } else if (this.lastBlockSet == 2) {
            this.level.objects.push(new SinglePlayObject(this.block.getPositionX(), this.block.getPositionY(), "chocolate_destroy", 15, this.level.blockDestroyLayer, 53, 65, ANIM_SCALE));
        } else {
            this.level.objects.push(new SinglePlayObject(this.block.getPositionX(), this.block.getPositionY(), "chocolate_white_destr", 18, this.level.blockDestroyLayer, 57, 58, ANIM_SCALE));
        }
        this._isBlock = false;
        this.block.removeFromParent();
        this.block = null
    } else if (this.breakCountLeft == 1) {
        changeFrame(this.block, "chocolate_black2")
    }
    if (e && this.block == null)this.level.target.onBlockRemoved()
};
CellObject.prototype.setTempBlock = function (isTempBlock, tempBlockTime) {
    tempBlockTime = tempBlockTime || -1;
    this.isTempBlock = isTempBlock;
    this.tempBlockTime = tempBlockTime
};
CellObject.prototype.isBlock = function () {
    return this._isBlock || this.isTempBlock
};
Object.defineProperty(CellObject.prototype, "isBreakable", {get: function () {
    return this._isBlock && this.breakCountLeft > 0
}, enumerable: true, configurable: true});
CellObject.prototype.setObject = function (obj) {
    this.object = obj;
    if (this.object)this.object.cell = this
};
CellObject.prototype.getSprite = function () {
    return this.object ? this.object.sprite : null
};
CellObject.prototype.getType = function () {
    return this.object == null ? -1 : this.object.colorType
};
CellObject.prototype.getBonusType = function () {
    return this.object == null ? 0 : this.object.bonusType
};
CellObject.prototype.clearCell = function (isClearedByClickOrColor) {
    if (typeof isClearedByClickOrColor === "undefined") {
        isClearedByClickOrColor = true;
    }
    var flag = false;
    if (this.object && (!this.object.isPushable || !this.level.isActive) && !this.isColorBlocked) {
        if (this.level.isActive) {
            if (!(this.object.bonusType >= 1 && this.object.bonusType <= 4)) {
                Match3Level.pool.getDestroyAnimation(this.object.colorType, this.object.sprite.getPositionX(), this.object.sprite.getPositionY(), this);
            }
            if (this.object.bonusType == kColorBonus) {
                this.tryPlayScoreAnimation();
            }
            if (this.object.isBonus) {
                var bonusType = this.object.bonusType;
                if (bonusType == kHorizontalLine || bonusType == kVerticalLine || bonusType == kCrossBonus || bonusType == kThickCrossBonus) { //1,2,5,6
                    SoundsManager.instance.playSound("bonus_line");
                    new BonusLineSprite(bonusType, this.object.sprite.getPositionX(), this.object.sprite.getPositionY())
                } else if (bonusType == kBombBonus || bonusType == kLargeBombBonus) { //3,7
                    new BonusBombSprite(bonusType, this.object.sprite.getPositionX(), this.object.sprite.getPositionY());
                    SoundsManager.instance.playSound("bonus_bomb");
                } else if (bonusType == kColorBonus) { //4
                    SoundsManager.instance.playSound("bonus_color");
                }
                LevelManager.instance.bonuses++
            }
        }
        this.level.target.onObjectRemove(this.object);
        Match3Level.pool.returnObject(this.object);
        this.object = null;
        flag = true
    }
    if (this.marksLeft > 0 && flag) {
        this.setMark(this.marksLeft - 1);
        SoundsManager.instance.playSound("cookie_crash")
    }
    this.isClearedByClickOrColor = false;
    var r = this.isBreakable;
    if (this.isBreakable || this.isColorBlocked) {
        this.removeBlock()
    }
    if (isClearedByClickOrColor && !r) {
        for (var i = 0; i < 4; ++i) {
            var s = this.x + (i == 0 ? 1 : i == 1 ? -1 : 0);
            var o = this.y + (i == 2 ? 1 : i == 3 ? -1 : 0);
            if (s >= 0 && o >= 0 && s < this.level.fieldWidth && o < this.level.fieldHeight) {
                var u = this.level.cells[s][o];
                if (u && u.isBreakable && (!u.isColorBlocked || u.colorBlock == this.getType())) {
                    u.removeBlockIn = .01;
                    var a = Math.max(this.tempBlockTime, u.tempBlockTime);
                    if (a <= 0)a = FieldObject.GEM_KILL_DELAY * 1.1;
                    if (a >= 0)u.setTempBlock(true, a)
                }
            }
        }
    }
};
Object.defineProperty(CellObject.prototype, "blockWasRemovedRecently", {get: function () {
    return this.timeSinceBlockRemove < .5
}, enumerable: true, configurable: true});
CellObject.prototype.onSpellExplosion = function (e) {
    if (typeof e === "undefined") {
        e = -1
    }
    if (this.object && !this.object.isMoving) {
        this.object.onSpellExplosion(e)
    }
};
CellObject.prototype.isStable = function () {
    return this.object == null || !this.object.isMoving
};
CellObject.prototype.tryPlayScoreAnimation = function () {
    if (this.scoreToAdd > 0) {
        var e = this.level.isEnded;
        if (e)this.scoreToAdd = 10 * Math.round(this.scoreToAdd * 1.25 / 10);
        this.level.objects.push(Match3Level.pool.getText(this.scoreToAdd.toString(), this, 0));
        this.scoreToAdd = -1;
        this.bonusComboCount = -1;
    }
};
CellObject.prototype.prepareToClear = function (delay, bonus, n, r) {
    if (typeof delay === "undefined") {
        delay = -1;
    }
    if (typeof bonus === "undefined") {
        bonus = 0;
    }
    if (typeof n === "undefined") {
        n = -1;
    }
    if (typeof r === "undefined") {
        r = false;
    }
    var isNoBonus = bonus == kBonusNone;
    var isColorBonus = bonus == kColorBonus;
    this.isClearedByClickOrColor = this.isClearedByClickOrColor || isNoBonus || isColorBonus;
    if (this.isWaitingForClear && delay >= this.clearIn) {
        return;
    }
    this.clearIn = .01 + delay;
    if (this.object && (this.object.isBonus || r)) {
        var time = this.object.bonusType <= 3 || r ? BonusDestroyAnimation.TIME : this.object.bonusType == 4 ? 20 / 30 : -1;
        if (time > 0) {
            this.object.playBonusAnimationIn = this.clearIn > time ? this.clearIn - time - .01 : -1
        }
    }
};
Object.defineProperty(CellObject.prototype, "isWaitingForClear", {get: function () {
    return this.clearIn > 0
}, enumerable: true, configurable: true});
CellObject.prototype.update = function (dt) {
    if (this.isTempBlock) {
        this.tempBlockTime -= dt;
        if (this.tempBlockTime < 0) {
            this.setTempBlock(false);
            this.isTempBlock = false
        }
    }
    if (this.clearIn > 0) {
        this.clearIn -= dt;
        if (this.clearIn <= 0) {
            this.clearCell(this.isClearedByClickOrColor);
        }
    }
    if (!this._isBlock || this.breakCountLeft <= 0)this.timeSinceBlockRemove += dt;
    if (this.removeBlockIn > 0) {
        this.removeBlockIn -= dt;
        if (this.removeBlockIn <= 0 && this.isBreakable)this.removeBlock()
    }
    this.timeSinceLastTypeChange += dt;
    if (this.object && this.object.isActive) {
        this.object.update(dt);
    }
    if (this.changeTypeIn > 0) {
        this.changeTypeIn -= dt;
        if (this.changeTypeIn <= 0 && this.object) {
            this.changeObjectType(this.typeToChange)
        }
    }
};
CellObject.prototype.destroy = function () {
    this.clearCell(false);
    this.mark = null;
    this.blockTop = null;
    this.block = null;
    GameObject.prototype.destroy.call(this)
};
CellObject.BASE_SCORE = 10;
CellObject.BONUS_CELL_SCORE_FACTOR = 5;
CellObject.BONUS_SCORE_FACTOR = 2;
CellObject.BONUS_COLOR_SCORE_FACTOR = 4;
CellObject.CACHE_NONE = 0;
CellObject.CACHE_CLEAR = 1;
CellObject.CACHE_DRAW = 2;
