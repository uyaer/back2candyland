/**
 * Created by Administrator on 2014/5/6.
 */
var JumpText = GameObject.extend({
    ctor: function (str, type) {
        this._super();
        this.speed = cc.p(0, 0);
        this.targetPos = cc.p(0, 0);
        this.diff = cc.p(0, 0);
        this.isHiding = false;
        this.isFinished = false;
        this.isScore = false;
        this.isBonusCombo = false;
        this.isEnding = false;
        this.score = 0;
        this.isScore = type == 0;
        this.isBonusCombo = type == 1;
        this.isEnding = type == 3;
        if (this.isScore)this.score = parseInt(str);
        var lab = bitmapText(str, type == 0 ? RED_FONT : BLUE_FONT);
        lab.setScale(this.isScore ? .85 : this.isBonusCombo ? .6 : this.isEnding ? 1 : .7);
        lab.setAnchorPoint(cc.p(0.5, 1));
        this.sprite = lab;
        this.sprite.retain();
        this.text = str;
    }
});
JumpText.prototype.init = function (x, y, cell) {
    this.speed.x = this.speed.y = this.targetPos.x = this.targetPos.y = this.diff.x = this.diff.y = 0;
    this.isHiding = this.isFinished = false;
    this.sprite.setOpacity(255);
    this.level = Match3Level.instance;
    if (this.level) {
        this.level.hudLayer.addChild(this.sprite);
    }
    this.sprite.setPosition(cc.p(x, y));
    this.sprite.setVisible(true);
    this.isDestroyed = false;
    this.speedModulo = (this.isScore ? 11 : 15) * 60;
    this.speed.y = -this.speedModulo;
    var r = 0;
    if (this.isScore)r = cell && cell.x == 0 ? lerp(15, 30, Math.random()) : cell && cell.x == this.level.fieldWidth - 1 ? lerp(-30, -15, Math.random()) : lerp(-20, 20, Math.random()); else if (this.isBonusCombo) {
        var i = cell.y < 3 ? 110 : cell.y > this.level.fieldHeight - 3 ? 70 : Math.random() > .5 ? 110 : 70;
        r = lerp(-15, 15, Math.random()) + (cell.x < 3 ? i : cell.x > this.level.fieldWidth - 3 ? -i : Math.random() > .5 ? i : -i)
    } else r = 0;
    rotatePoint(this.speed, r);
    this.perCut = this.speedModulo / 15;
    setInterval(this.tweenSpeedModulo, 50, 15, this);
    this.targetPos.x = x;
    this.targetPos.y = y;
    return this
};
JumpText.prototype.tweenSpeedModulo = function () {
    this.speedModulo -= this.perCut;
};
JumpText.prototype.release = function () {
    this.sprite.setVisible(false);
    this.sprite.removeFromParent();
    this.isDestroyed = true
};
JumpText.prototype.update = function (dt) {
    var that = this;
    if (this.isFinished) {
        Match3Level.pool.returnText(this);
        return
    }
    if (!this.isHiding) {
        var spPos = this.sprite.getPosition();
        this.sprite.setPositionX(spPos.x + this.speed.x * dt);
        this.sprite.setPositionY(spPos.y + this.speed.y * dt);
        spPos = this.sprite.getPosition();
        this.diff.x = this.targetPos.x - spPos.x;
        this.diff.y = this.targetPos.y - spPos.y;
        var r = distanceBetweenPoints(0, 0, this.diff.x, this.diff.y);
        this.diff.x /= r;
        this.diff.y /= r;
        var i = .8 * 60 * 60;
        this.diff.x *= i;
        this.diff.y *= i;
        if (this.speedModulo > 0) {
            this.speed.x += this.diff.x * dt;
            this.speed.y += this.diff.y * dt;
            var r = distanceBetweenPoints(0, 0, this.speed.x, this.speed.y);
            if (r > this.speedModulo) {
                var s = this.speedModulo / r;
                this.speed.x *= s;
                this.speed.y *= s
            }
        } else this.speed.x = this.speed.y = 0;
        if (Math.abs(this.speedModulo) < 1e-5 && !this.isHiding) {
            this.isHiding = true;
            if (this.isScore) {
                this.sprite.runAction(cc.Sequence.create(
                    cc.Spawn.create(
                        cc.FadeTo.create(0.4, 0.2 * 255),
                        cc.MoveTo.create(0.4, this.level.hud.scoreText.convertToWorldSpace(cc.p(0,0)))
                    ),
                    cc.CallFunc.create(function () {
                        that.finishMovement();
                    })
                ));
            } else {
                this.sprite.runAction(cc.Sequence.create(
                    cc.FadeTo.create(0.4, 0.2 * 255),
                    cc.CallFunc.create(function () {
                        that.finishMovement();
                    })
                ));
            }
        }
    }
};
JumpText.prototype.finishMovement = function () {
    if (this.isFinished)return;
    if (this.isScore) {
        this.level.score += this.score
    }
    this.isFinished = true;
};
JumpText.prototype.destroy = function () {
    Match3Level.pool.returnText(this)
};