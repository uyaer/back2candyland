/**
 * Created by Administrator on 2014/5/13.
 */
var EndBonusIndicator = GameObject.extend({
    ctor: function (x, y, cell, i, bonusType) {
        this._super();
        this.delay = -1;
        this.cell = cell;
        this.bonusType = bonusType;
        var sp = createSpriteFromSpritesheet("bonus_new");
        sp.setPosition(cc.p(x, y));
        sp.setVisible(false);
        this.delay = i;
        this.sprite = sp;
        this.level.endBounsLayer.addChild(this.sprite);
    }
});
Object.defineProperty(EndBonusIndicator.prototype, "totalTime", {
    get: function () {
        return this.delay + EndBonusIndicator.MOVE_TIME
    },
    enumerable: true,
    configurable: true
});
EndBonusIndicator.prototype.update = function (dt) {
    var that = this;
    GameObject.prototype.update.call(this, dt);
    this.delay -= dt;
    if (this.delay <= 0 && !this.sprite.isVisible()) {
        SoundsManager.instance.playSound("bonus_show");
        this.sprite.setVisible(true);
        this.sprite.setOpacity(0.3 * 255);
        this.sprite.setScale(0.3);
        this.sprite.runAction(cc.Sequence.create(
            cc.Spawn.create(
                cc.FadeIn.create(EndBonusIndicator.MOVE_TIME),
                cc.ScaleTo.create(EndBonusIndicator.MOVE_TIME, 1),
                cc.MoveTo.create(EndBonusIndicator.MOVE_TIME, cc.p(this.cell.pos.x, this.cell.pos.y))
            ),
            cc.CallFunc.create(function () {
                that.hide();
            })
        ));
        this.level.movesLeft = Math.max(0, this.level.movesLeft - 1);
    }
};
EndBonusIndicator.prototype.hide = function () {
    if (this.cell && this.cell.object) {
        this.cell.object.setBonusType(this.bonusType);
        this.cell.setTempBlock(false, -1)
    }
    this.destroy();
};
EndBonusIndicator.prototype.destroy = function () {
    GameObject.prototype.destroy.call(this);
    this.cell = null
};
EndBonusIndicator.MOVE_TIME = .5;
