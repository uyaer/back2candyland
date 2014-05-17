/**
 * Created by Administrator on 2014/5/6.
 */
var GemDestroyAnimation = GameObject.extend({
    ctor: function (color) {
        this._super();
        this.totalFrames = 0;
        this.playedScore = false;
        this.color = color;
        this.totalFrames = GemDestroyAnimation.animLen[color];
        this.fileName = FieldObject.assetNames[this.color];
        this.sprite = cc.Sprite.createWithSpriteFrameName("chocolate_destroy0015.png");
        this.sprite.retain();
        var reg = GemDestroyAnimation.regPoints[this.color];
        var size = GemDestroyAnimation.animSizes[this.color];
//        this.sprite.setAnchorPoint(cc.p(reg.x / size.x, reg.y / size.y));
        this.sprite.setScale(1.5);
    }
});


GemDestroyAnimation.prototype.destroy = function () {
    if (!this.isDestroyed) {
        Match3Level.pool.returnGemDestroy(this)
    }
};
GemDestroyAnimation.prototype.update = function (dt) {
};
GemDestroyAnimation.prototype.init = function (x, y, cell) {
    this.cell = cell;
    this.level = Match3Level.instance;
    this.level.gemDestroyLayer.addChild(this.sprite);
    this.sprite.setPosition(cc.p(x, y));
    this.level.objects.push(this);
    this.isDestroyed = false;
    this.playedScore = false;
    if (Match3Level.instance && this.color < Match3Level.instance.assetNumber) {
        SoundsManager.instance.playSound("remove" + (getInt(4) + 1))
    }
    //cocos实现播放效果
    var that = this;
    this.sprite.runAction(cc.Sequence.create(
        AnimManager.instance.getAnimate(that.fileName),
        cc.CallFunc.create(function () {
            Match3Level.pool.returnGemDestroy(that);
        })
    ));
    setTimeout(function () {
        this.cell.tryPlayScoreAnimation();
        this.playedScore = true;
    }, 250, this);
};
GemDestroyAnimation.prototype.release = function () {
    this.sprite.stopAllActions();
    this.sprite.removeFromParent();
    this.isDestroyed = true;
};
GemDestroyAnimation.animLen = [16, 13, 16, 17];
GemDestroyAnimation.animSizes = [cc.p(98, 135), cc.p(133, 96), cc.p(110, 114), cc.p(83, 118)];
GemDestroyAnimation.regPoints = [cc.p(54, 74), cc.p(66, 62), cc.p(52, 60), cc.p(42, 38)];


