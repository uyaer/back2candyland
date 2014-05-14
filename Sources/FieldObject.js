/**
 * Created by Administrator on 2014/5/6.
 */
var FieldObject = GameObject.extend({
    ctor: function (color) {
        this._super();
        this.isMoving = true;
        this.SPEED = 200;
        this.lastTarget = cc.p(0, 0);
        this.currentTile = 6;
        this.bonusType = 0;
        this.isActive = false;
        this.isCustom = false;
        this.moveCornerCount = 0;
        this.timeSinceStop = 0;
        this.isMovedAfterCorner = false;
        this.rowMoveAfterConterCount = 0;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.animationPower = 1;
        this.animationSpeed = 1;
        this.stopSpeed = 0;
        this.nextIdleTime = 0;
        this.timeSinceAnim = 0;
        this.playBonusAnimationIn = -1;
        this.isHighValue = false;
        this.highValueIn = -1;
        this.frameTime = 1 / 30;
        this.pos = cc.p(0, 0);
        this.animPos = cc.p(0, 0);
        this.tween = new TweenData();
        this.prevNeighbours = [null, null, null, null];
        this.colorType = color;
        this.sprite = createSpriteFromSpritesheet(this.getFileName());
        this.sprite.retain();
    }
});


FieldObject.prototype.setNextIdleTime = function () {
    this.nextIdleTime = 1 + Math.random() * 78;
    this.timeSinceAnim = 0;
};
FieldObject.prototype.getFileName = function () {
    if (this.isPushable)return"cupcake";
    if (this.bonusType == 4)return"bonus_color";
    var name = FieldObject.assetNames[this.colorType] + FieldObject.bonusNames[this.bonusType>4?4:this.bonusType];
    if (!this.isBonus && this.isHighValue) name += "_bonus";
    return name;
};
FieldObject.prototype.setHighValue = function () {
    if (this.isBonus)return;
    this.isHighValue = true;
    changeFrame(this.sprite, this.getFileName());
    this.playJellyAnimation(1, 1);
};
FieldObject.prototype.setHighValueIn = function (e) {
    this.highValueIn = e;
};
Object.defineProperty(FieldObject.prototype, "isPushable", {get: function () {
    return this.colorType == 4;
}, enumerable: true, configurable: true});
FieldObject.prototype.init = function (cell, pos) {
    this.cell = cell;
    cell.object = this;
    this.isHighValue = false;
    this.level = Match3Level.instance;
    this.level.gemLayer.addChild(this.sprite);
    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.sprite.setPosition(pos);
    this.animPos.x = this.animPos.y = 0;
    this.isMoving = false;
    this.isWaitingForDestruction = false;
    this.isPlaying = false;
    this.currentFrame = 0;
    this.isMoving = false;
    this.sprite.setVisible(true);
    this.animationPower = 1;
    this.stopSpeed = 1;
    this.animationSpeed = 1;
    this.setNextIdleTime();
    this.playBonusAnimationIn = -1;
    this.bonusType = 0;
    var r = Math.abs(this.sprite.getPositionX() - cell.pos.x) + Math.abs(this.sprite.getPositionY() - cell.pos.y) < 1;
    changeFrame(this.sprite, this.getFileName());
    this.setFrame(-1, true, r);
    this.highValueIn = -1;
    if (!this.isActive) {
        FieldObject.activeCount++;
        this.isActive = true;
    }
    return this;
};
FieldObject.prototype.release = function () {
    if (this.isActive) {
        FieldObject.activeCount--;
        this.isActive = false;
    }
    this.sprite.stopAllActions();
    this.sprite.removeFromParent(false);
    this.highValueIn = -1;
    this.isMoving = false;
    this.isWaitingForDestruction = false;
    this.animPos.x = this.animPos.y = 0;
    this.isHighValue = false;
    this.isPlaying = false;
    this.currentFrame = 0;
    this.playBonusAnimationIn = -1;
    this.isMoving = false;
    this.animationPower = 1;
    this.stopSpeed = 1;
    this.animationSpeed = 1;
    this.bonusType = 0;
    return this;
};
Object.defineProperty(FieldObject.prototype, "isBonus", {get: function () {
    return this.bonusType != 0;
}, enumerable: true, configurable: true});
FieldObject.prototype.setBonusType = function (type) {
    if (this.bonusType != type) {
        this.isHighValue = false;
        this.bonusType = type;
        changeFrame(this.sprite, this.getFileName());
        this.playJellyAnimation(1, 1);
    }
};
FieldObject.prototype.onSpellExplosion = function (e) {
    this.sprite.setVisible(false);
};
FieldObject.prototype.moveTo = function (toX, toY, n, r, i) {
    n = n || false;
    r = r || 0;
    i = i || false;
    this.isMoving = true;
    var s = n ? .5 : 1;
    this.lastTarget.x = toX;
    this.lastTarget.y = toY;
    this.timeSinceStop = 0;
    if (!i && this.isMovedAfterCorner) {
        this.rowMoveAfterConterCount++;
        if (this.rowMoveAfterConterCount > 1) {
            this.rowMoveAfterConterCount = 0;
            this.isMovedAfterCorner = false
        }
    } else this.rowMoveAfterConterCount = 0;
    this.isMovedAfterCorner = false;
    var time = 300 * Math.pow(.6, limit(this.moveCornerCount, 0, 4));
    this.moveCornerCount++;
    var u = distanceBetweenPoints(toX, toY, this.pos.x, this.pos.y);
    if (u < 1)time = 10;
    if (i) {
        var pos = this.level.stageToGrid(this.sprite.getPositionX(), this.sprite.getPositionY());
        pos.x = Math.floor(pos.x);
        pos.y = Math.floor(pos.y);
        for (var i = pos.y - 1; i >= 0; --i) {
            if (this.validatePos(pos.x, i)) {
                var cell = this.level.cells[pos.x][i];
                if (cell && cell.object && !cell.object.isMoving) {
                    cell.object.isMovedAfterCorner = true;
                }
            }
        }
    }
    this.tween.init(this.pos.x, this.pos.y, toX, toY, time / 1e3, i);
    if (!this.isPushable && u > 10) {
        this.stopSpeed = .7 + Math.random() * .3;
        this.playAnimation(0, .6);
    }
};
FieldObject.prototype.setFrame = function (e, t, n) {
    t = t || true;
    n = n || true;
    var r = animationLen;
    var i = e < 0 || e >= r ? null : jellyAnimation[e];
    var s = e + 1 < 0 || e + 1 >= r ? null : jellyAnimation[e + 1];
    var o = i == null || i.length <= 0;
    var u = !o && s != null && s.length > 0;
    var a = this.currentFrame - e;
    var f = this.animationPower;
    if (o) {
        this.animPos.x = 0;
        this.animPos.y = 0;
        this.sprite.setScale(1);
        this.sprite.setSkewX(0);
        this.sprite.setSkewY(0);
    } else if (t) {
        var l = !u;
        this.animPos.x = (l ? i[0] * f : f * (i[0] + a * (s[0] - i[0])));
        this.animPos.y = (l ? i[1] * f : f * (i[1] + a * (s[1] - i[1])));
        this.sprite.setScaleX(1 * (l ? 1 + (i[2] - 1) * f : 1 + (i[2] + a * (s[2] - i[2]) - 1) * f));
        this.sprite.setScaleY(1 * (l ? 1 + (i[3] - 1) * f : 1 + (i[3] + a * (s[3] - i[3]) - 1) * f));
        this.sprite.setSkewX(l ? i[4] * f : f * (i[4] + a * (s[4] - i[4])));
        this.sprite.setSkewY(l ? i[5] * f : f * (i[5] + a * (s[5] - i[5])));
    }
    if (o) {
        this.isPlaying = false;
        this.currentFrame = 0
    }
};
FieldObject.prototype.playAnimation = function (currentFrame, power, speed) {
    power = power || 1;
    speed = speed || 1;
    this.animationPower = power;
    this.animationSpeed = speed;
    this.currentFrame = currentFrame;
    this.isPlaying = true;
};
FieldObject.prototype.playJellyAnimation = function (power, speed) {
    var n = getInt(3);
    this.playAnimation(n == 0 ? 11 : n == 1 ? 39 : 67, power, speed)
};
FieldObject.prototype.stopMove = function () {
    var that = this;
    this.isMoving = false;
    this.timeSinceStop = 0;
    if (!this.isPushable && this.isPlaying) {
        this.playJellyAnimation(this.stopSpeed, .75 + Math.random() * .5)
    }
    if (this.isPushable && this.cell.y == this.level.fieldHeight - 1) {
        this.level.objects.push(Match3Level.pool.getText("100", this.cell, 0));
        var endPos = this.level.gridToStage(this.cell.x, this.level.fieldHeight);
        this.cutPosTotal = cc.pSub(endPos, this.pos);
        this.cutPosPer = cc.p(this.cutPosTotal.x / 6, this.cutPosTotal.y / 6);
        setInterval(this._cutPos, 50, 6, this);
        setTimeout(this.pushDown, 300, this);
        SoundsManager.instance.playSound("cake_down");
    } else {
        SoundsManager.instance.playSound("stop_move");
    }
};
FieldObject.prototype._cutPos = function () {
    this.pos.x += this.cutPosPer.x;
    this.pos.y += this.cutPosPer.y;
}
/**
 * 如果是螃蟹的话，落下后返回对象池
 */
FieldObject.prototype.pushDown = function () {
    this.cell.object = null;
    this.level.target.onTargetPush();
    Match3Level.pool.returnObject(this)
};
FieldObject.prototype.update = function (dt) {
    if (!this.isMoving) {
        this.timeSinceStop += dt;
        if (this.timeSinceStop >= .5)this.moveCornerCount = 0
    }
    if (this.sprite) {
        if (this.isPlaying) {
            var t = dt * this.animationSpeed;
            while (t > 0 && ~~this.currentFrame != 9 && this.isPlaying) {
                this.currentFrame += t >= this.frameTime ? 1 : t / this.frameTime;
                t -= this.frameTime;
                this.setFrame(~~this.currentFrame, t <= this.frameTime)
            }
        } else {
            this.timeSinceAnim += dt;
            if (this.timeSinceAnim >= this.nextIdleTime) {
                this.setNextIdleTime()
            }
        }
        if (this.isMoving) {
            this.tween.update(dt, this);
        }
        if (this.playBonusAnimationIn >= 0) {
            this.playBonusAnimationIn -= dt;
            if (this.isBonus && this.playBonusAnimationIn < 0) {
                this.playBonusAnimation();
            }
        }
        if (this.highValueIn >= 0) {
            this.highValueIn -= dt;
            if (this.highValueIn < 0)this.setHighValue()
        }
        this.sprite.setPositionX(this.pos.x + this.animPos.x);
        this.sprite.setPositionY(this.pos.y + this.animPos.y);
    }
};
FieldObject.prototype.playBonusAnimation = function () {
    if (this.bonusType == 4) {
        this.level.objects.push(new SinglePlayObject(this.sprite.getPositionX(), this.sprite.getPositionY(), "color_bonus", 37, this.level.gemDestroyLayer, 67, 61, ANIM_SCALE));
    } else {
        this.level.objects.push(new BonusDestroyAnimation(this.sprite.getPositionX(), this.sprite.getPositionY(), this.getFileName(), this.cell))
    }
    this.sprite.setVisible(false);
};
FieldObject.prototype.validatePos = function (e, t) {
    return e >= 0 && t >= 0 && e < Match3Level.instance.fieldWidth && t < Match3Level.instance.fieldHeight
};
FieldObject.TILE_SIZE = 35;
FieldObject.destroyCount = 0;
FieldObject.GEM_SCALE = 1;
FieldObject.GEM_KILL_DELAY = .07;
FieldObject.assetNames = ["blue", "green", "purple", "orange"];
FieldObject.bonusNames = ["", "_horizontal", "_vertical", "_bomb", "_bomb"];
FieldObject.activeCount = 0;
