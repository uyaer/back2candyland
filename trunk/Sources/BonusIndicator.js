/**
 * Created by Administrator on 2014/5/8.
 */

var BonusIndicator = GameObject.extend({
    ctor: function (cell1, cell2, cell, bonusType) {
        this._super();
        this.borders = [];
        this.isMovingToTarget = false;
        this.isHiding = false;
        this.horizontal = false;
        this.target = cell;
        this.bonusType = bonusType;
        var o = Match3Level.instance.gridToStage(cell1.x, cell1.y);
        var u = Match3Level.instance.gridToStage(cell2.x, cell2.y);
        var root = cc.Node.create();
        this.horizontal = cell1.y == cell2.y;
        for (var i = 0; i < 2; ++i) {
            var sp = createSpriteFromSpritesheet("bonus_line_side");
            sp.setAnchorPoint(cc.p(1, 0.5));
            var p = i == 0 ? o : u;
            var d = i == 0 ? cell1 : cell2;
            sp.setPosition(p);
            sp.setRotation(cell1.y == cell2.y ? i == 0 && cell1.x < cell2.x || i == 1 && cell2.x < cell1.x ? 0 : 180 : i == 0 && cell1.y < cell2.y || i == 1 && cell2.y < cell1.y ? 90 : -90);
            root.addChild(sp);
            this.borders.push(sp);
            sp.runAction(cc.MoveTo.create(0.25, cc.p((o.x + u.x) / 2, (o.y + u.y) / 2)));
        }
        sp = createSpriteFromSpritesheet("bonus_line_center");
        var rect = sp.getBoundingBox();
        var v = (distanceBetweenPoints(o.x, o.y, u.x, u.y) + .3) / (rect.width - 2.9);
        sp.setScaleX(v);
        root.addChild(sp, 0);
        sp.setPosition(cc.p((o.x + u.x) / 2, (o.y + u.y) / 2));
        var that = this;
        sp.runAction(cc.Sequence.create(
            cc.ScaleTo.create(0.25, 0.01, 1),
            cc.CallFunc.create(function () {
                that.moveToTarget();
            })
        ));
        sp.setRotation(cell1.y == cell2.y ? 0 : 90);
        this.borders.push(sp);
        sp = createSpriteFromSpritesheet("bonus_new");
        root.addChild(sp);
        sp.setPosition(cc.p((o.x + u.x) / 2, (o.y + u.y) / 2));
        sp.setScaleX(0.3);
        sp.setOpacity(0.3 * 255);
        this.borders.push(sp);
        sp.runAction(cc.FadeIn.create(0.25));
        sp.runAction(cc.ScaleTo.create(0.25, 1, 1));
        this.sprite = root;
        this.level.bonusIndicatorLayer.addChild(this.sprite);
        cell.setTempBlock(true, .1);
        SoundsManager.instance.playSound("bonus_show");
    }

});
BonusIndicator.prototype.moveToTarget = function () {
    var that = this;
    this.borders[0].setVisible(false);
    this.borders[1].setVisible(false);
    this.isMovingToTarget = true;
    var pos = Match3Level.instance.gridToStage(this.target.x, this.target.y);
    var rect = this.borders[3].getBoundingBox();
    pos.x -= rect.x + rect.width / 2;
    pos.y -= rect.y + rect.height / 2;
    this.sprite.runAction(cc.Sequence.create(
        cc.MoveTo.create(0.5, pos),
        cc.CallFunc.create(function () {
            that.hide();
        })
    ));
    this.isHiding = true
};
BonusIndicator.prototype.hide = function () {
    var that = this;
    if (this.isDestroyed)return;
    if (this.target && this.target.object) {
        this.target.object.setBonusType(this.bonusType);
        this.target.setTempBlock(false, -1);
        SoundsManager.instance.playSound("bonus_set")
    }
    this.borders[3].runAction(cc.Sequence.create(
        cc.Spawn.create(cc.FadeOut.create(0.8), cc.ScaleTo.create(0.8, 0.01)),
        cc.CallFunc.create(function () {
            that.destroy();
        })
    ));
};
BonusIndicator.prototype.updateTarget = function (e) {
    this.target = e;
    this.sprite.stopAllActions();
    this.borders[3].stopAllActions();
    this.moveToTarget()
};
BonusIndicator.prototype.checkTargetObject = function () {
    if (this.isMovingToTarget && (!this.target.object || this.target.object.isMoving || this.target.isWaitingForClear)) {
        this.target = null;
        this.level.spawnBonus(this.bonusType, null, null, this)
    }
};
BonusIndicator.prototype.update = function (e) {
    if (!this.isMovingToTarget && false) {
        var spPos = this.borders[2].getPosition();
        var n = spPos.getScaleX() * 25 - 2;
        for (var r = 0; r < 2; ++r) {
            var bor = this.borders[r];
            bor.setPositionX(spPos.x + (this.horizontal ? (r == 1 ? 1 : -1) * n / 2 : 0));
            bor.setPositionY(spPos.y + (!this.horizontal ? (r == 1 ? 1 : -1) * n / 2 : 0));
        }
    }
    this.checkTargetObject();
    if (!this.isDestroyed)this.target.setTempBlock(true, .1)
};
BonusIndicator.prototype.destroy = function () {
    if (this.isDestroyed)return;
    this.borders[3].stopAllActions();
    this.isMovingToTarget = true;
    for (var i = 0; i < this.borders.length; ++i) {
        this.borders[i].removeFromParent();
    }
    this.borders = null;
    GameObject.prototype.destroy.call(this);
};
