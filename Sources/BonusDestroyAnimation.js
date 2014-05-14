/**
 * Created by Administrator on 2014/5/6.
 */
var CookieTweenSprite = GameObject.extend({
    ctor: function CookieTweenSprite(t, n, r) {
        var that = this;
        this._super();
        var sp = createSpriteFromSpritesheet(r == 0 ? "cookie" : "cookie honey");
        sp.x = t + Match3Level.TILE_SIZE / 2;
        sp.y = n + Match3Level.TILE_SIZE / 2;
        this.sprite = sp;
        this.level.underGemLayer.addChild(sp);
        if (r == 0) {
            sp.runAction(cc.ScaleTo.create(0.11, 1.3));
        }
        sp.runAction(cc.Sequence.create(
            cc.FadeOut.create(0.11),
            cc.CallFunc.create(function () {
                that.onComplete();
            })
        ));
    }
});

CookieTweenSprite.prototype.onComplete = function () {
    this.destroy();
};


/***********
 * =================================================================
 * @type {void|Function|*}
 */
var BonusDestroyAnimation = GameObject.extend({
    ctor: function (x, y, name, s) {
        this._super();
        this.progress = 0;
        this.cell = s;
        var sp = createSpriteFromSpritesheet(name);
        sp.setPosition(cc.p(x, y));
        this.level.gemLayer.addChild(sp);
        this.sprite = sp;
        var sp = createSpriteFromSpritesheet("star_glow");
        sp.setPosition(cc.p(x, y));
        sp.setScale(0.15);
        sp.setOpacity(0);
        this.level.underGemLayer.addChild(sp);
        this.glow = sp;

        var time = BonusDestroyAnimation.TIME * 1e3;
        var count = time / 50;
        this.cutProgressPer = 1 / count;
        setInterval(this.cutProgress, 50, count, this);
        setTimeout(this.setLight, time, this);
    }
});
BonusDestroyAnimation.prototype.cutProgress = function () {
    this.progress += this.cutProgressPer;
    this.progress = limit(this.progress, 0, 1);
};
BonusDestroyAnimation.prototype.setLight = function () {
    var that = this;
    this.sprite.setVisible(false);
    this.glow.setVisible(false);
    this.light = cc.Sprite.create();
    this.light.runAction(cc.Sequence.create(
        AnimManager.instance.getAnimate(ANIM_BONUS_BLINK),
        cc.CallFunc.create(function () {
            if (that.cell) {
                that.cell.tryPlayScoreAnimation();
            }
            that.destroy();
        })
    ));
    this.light.setPosition(this.sprite.getPosition());
    this.light.setScale(ANIM_SCALE * 1.5);
    this.level.blockLayer.addChild(this.light);
};
BonusDestroyAnimation.prototype.update = function (e) {
    if (this.sprite.isVisible()) {
        this.sprite.setScale(lerp(1, 1.2, this.progress));
        this.glow.setOpacity(255 * this.progress);
        this.glow.setScale(lerp(.15, .95, this.progress));
    }
};
BonusDestroyAnimation.prototype.destroy = function () {
    GameObject.prototype.destroy.call(this);
    this.glow.removeFromParent(true);
    this.glow = null;
    this.light.removeFromParent(true);
    this.light = null
};
BonusDestroyAnimation.TIME = .5;


/**
 * =============================== BonusLineSprite =============================
 * @type {void|Function|*}
 */
var BonusLineSprite = GameObject.extend({
    ctor: function (bonusType, offx, offy) {
        this._super();
        var that = this;
        this.sprites = [];
        this.speeds = [];
        this.type = bonusType;
        var len;
        var rotArr;
        var posArr;
        switch (bonusType) {
            case kHorizontalLine://1
                len = 2;
                rotArr = [90, -90];
                posArr = [cc.p(0, 0), cc.p(0, 0)];
                break;
            case kVerticalLine: //2
                len = 2;
                rotArr = [0, 180];
                posArr = [cc.p(0, 0), cc.p(0, 0)];
                break;
            case kCrossBonus: //5
                len = 4;
                rotArr = [90, -90, 0, 180];
                posArr = [cc.p(0, 0), cc.p(0, 0), cc.p(0, 0), cc.p(0, 0)];
                break;
            case kThickCrossBonus: //6
                len = 12;
                rotArr = [0, 0, 0, 90, 90, 90, 180, 180, 180, -90, -90, -90];
                posArr = [cc.p(-1, -1), cc.p(0, -1), cc.p(1, -1), cc.p(1, -1), cc.p(1, 0), cc.p(1, 1), cc.p(-1, 1), cc.p(0, 1), cc.p(1, 1), cc.p(-1, -1), cc.p(-1, 0), cc.p(-1, 1)];
                break
        }
        var u = Match3Level.TILE_SIZE / FieldObject.GEM_KILL_DELAY;
        for (var i = 0; i < len; ++i) {
            var sp = createSpriteFromSpritesheet("explosion_line");
            sp.setPositionX(offx + posArr[i].x * Match3Level.TILE_SIZE);
            sp.setPositionY(offy + posArr[i].y * Match3Level.TILE_SIZE);
            this.sprites.push(sp);
            this.level.bonusLayer.addChild(sp);
            sp.setAnchorPoint(cc.p(25 / 53, 65 / 179));
            sp.setRotation(rotArr[i]);
            var spPos = sp.getPosition();
            var speed = cc.p(rotArr[i] == 90 ? u : rotArr[i] == -90 ? -u : 0, rotArr[i] == 0 ? u : rotArr[i] == 180 ? -u : 0);
            this.speeds.push(speed);

        }
        this.level.objects.push(this);
    }
});
BonusLineSprite.prototype.update = function (dt) {
    var activCount = 0;
    var len = this.sprites.length;
    for (var i = 0; i < len; ++i) {
        var sp = this.sprites[i];
        if (sp.isVisible()) {
            activCount++;
            var spPos = sp.getPosition();
            sp.setPositionX(spPos.x + this.speeds[i].x * dt);
            sp.setPositionY(spPos.y + this.speeds[i].y * dt);
            spPos = sp.getPosition();
            var rect = cc.rect(-100, -100, App.WIN_W + 200, App.WIN_H + 200);
            if (!cc.rectContainsPoint(rect, spPos)) {
                sp.setVisible(false);
            }
        }
    }
    if (activCount == 0) {
        this.destroy();
    }
};
BonusLineSprite.prototype.destroy = function () {
    if (this.isDestroyed || !this.sprites)return;
    GameObject.prototype.destroy.call(this);
    var len = this.sprites.length;
    for (var i = 0; i < len; ++i) {
        this.sprites[i].removeFromParent();
    }
    this.sprites = null;
    this.speeds = null
};


/**
 * =====================================   BonusBombSprite  ========================================
 * @type {void|Function|*}
 */
var BonusBombSprite = GameObject.extend({
    ctor: function (type, x, y) { //type == 3 || 7
        this._super();
        this.progress = 0;
        this.maxScale = 0;
        var stime = type == kBombBonus ? 2.5 : 4;
        this.maxScale = 1.75 * stime * FieldObject.TILE_SIZE / 65;

        this.sprite = createSpriteFromSpritesheet("explosion_bomb");
        this.sprite.setPosition(cc.p(x, y));
        this.level.bonusLayer.addChild(this.sprite);
        this.level.objects.push(this);

        var time = 1.6 * stime * 1e3 * FieldObject.GEM_KILL_DELAY;
        var count = time / 50;
        this.cutProgressPer = 1 / count;
        setInterval(this.cutProgress, 50, count, this);
        setTimeout(this.destroy, time, this);
    }
});
BonusBombSprite.prototype.cutProgress = function () {
    this.progress += this.cutProgressPer;
    this.progress = limit(this.progress, 0, 1);
};
BonusBombSprite.prototype.update = function (dt) {
    this.sprite.setScale(lerp(.1, this.maxScale, this.progress));
    this.sprite.setOpacity(255 * (this.progress < .6 ? lerp(.3, 1, this.progress / .6) : lerp(1, 0, (this.progress - .6) / .4)));
};