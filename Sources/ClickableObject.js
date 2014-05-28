var ClickableObject = GameObject.extend({
    ctor: function (t) {
        if (typeof t === "undefined") {
            t = null
        }
        this._super();
        this.shape = -1;
        this.radius = 0;
        this.shift = cc.p(0, 0);
        this.rect = cc.rect(0, 0, 1, 1);
        this.lastClickTime = -1;
        if (t) this.sprite = t
    }
});
ClickableObject.prototype.setCircle = function (radius, x, y) {
    if (typeof x === "undefined") {
        x = 0
    }
    if (typeof y === "undefined") {
        y = 0
    }
    this.shape = ClickableObject.CIRCLE_SHAPE;
    this.radius = radius;
    this.shift.x = x;
    this.shift.y = y
};
ClickableObject.prototype.setRect = function (e, n, r, i) {
    this.shape = ClickableObject.RECT_SHAPE;
    this.rect = cc.rect(e, n, r, i)
};
ClickableObject.prototype.setCCRect = function (rect) {
    this.shape = ClickableObject.RECT_SHAPE;
    this.rect = rect;
};
ClickableObject.prototype.checkClick = function (x, y) {
    if (this.sprite && this.shape >= 0 && this.sprite.isVisible() && this.sprite.getParent() && this.sprite.getParent().isVisible()) {
        var pos = this.sprite.convertToWorldSpaceAR(cc.p(0,0));
        if(this.sprite.getChildren().length>0){
            pos = this.sprite.getChildren()[0].convertToWorldSpaceAR(cc.p(0, 0));
        }
        switch (this.shape) {
            case ClickableObject.CIRCLE_SHAPE:
                return distanceBetweenPoints(pos.x + this.shift.x, pos.y + this.shift.y, x, y) <= this.radius;
            case ClickableObject.RECT_SHAPE:
                var sp = this.sprite;
                if(this.sprite.getChildren().length>0){
                    sp = this.sprite.getChildren()[0];
                }
                var anc = sp.getAnchorPoint();
                pos = sp.convertToWorldSpaceAR(cc.p(-anc.x * this.rect.width, -anc.y * this.rect.height));
                this.rect.x = pos.x;
                this.rect.y = pos.y;
                return cc.rectContainsPoint(this.rect, cc.p(x, y));
        }
    }
    return false;
};
ClickableObject.prototype.onClick = function () {
    if (this.callback && this.sprite.isVisible()) {
        var e = Date.now();
        if (Math.abs(e - this.lastClickTime) > .3) {
            this.lastClickTime = e;
            this.callback();
        }
    }
};
ClickableObject.prototype.updateRectScale = function () {
    var rect = this.sprite.getBoundingBox();
    var size = this.sprite.getContentSize();
    if (this.sprite instanceof  cc.Node) {
        size = cc.size(65, 65);
        var pos = this.sprite.getChildren()[0].convertToWorldSpace(cc.p(0, 0));
        rect.x = pos.x + 14;
        rect.y = pos.y + 11;
    }
    this.setRect(rect.x, rect.y, size.width, size.height);
};
ClickableObject.CIRCLE_SHAPE = 0;
ClickableObject.RECT_SHAPE = 1;


/**
 * ===========================================================================================
 * @type {void|Function|*}
 */
var MoreGamesButton = ClickableObject.extend({
    ctor: function (parent, x, y, scale) {
        this._super();
        var that = this;
        this.initScale = scale;
        var sp = createSpriteFromSpritesheet("more");
        if (sp) {
            sp.setScale(scale);
            sp.setPosition(cc.p(x, y));
            parent.addChild(sp);
            this.sprite = sp;
            this.callback = function () {
                return that.onLogoClick()
            }
        }
    }
});
MoreGamesButton.prototype.onLogoClick = function () {
    if (!this.sprite) return;
    var that = this;
    this.sprite.runAction(cc.Sequence.create(
        cc.Spawn.create(cc.ScaleTo.create(0.2, 1.2 * that.initScale), cc.FadeIn.create(0.2)),
        cc.ScaleTo.create(0.2, that.initScale),
        cc.CallFunc.create(function(){
            App.openURL();
        })
    ));
};
MoreGamesButton.prototype.checkClick = function (x, y) {
    if (this.sprite) {
        var rect = this.sprite.getBoundingBox();
        var pos = cc.p(rect.x, rect.y);
        var i = this.initScale * rect.width;
        var s = this.initScale * rect.height;
        return x >= pos.x && x <= pos.x + i && y >= pos.y && y <= pos.y + s
    }
    return false
};


/***
 * =================================================================================
 * @type {void|Function|*}
 */
var ButtonObject = ClickableObject.extend({
    ctor: function (type, callback, parent, x, y) {
        this._super();
        if (type && callback && parent) {
            this.init(type, callback, parent, x, y);
        }
    }
});
ButtonObject.prototype.init = function (type, callback, parent, x, y) {
    if (typeof x === "undefined") {
        x = 0
    }
    if (typeof y === "undefined") {
        y = 0
    }

    this.playAnimIn = -1;
    this.callback = callback;
    var sp = getButtonAnimation(type);
    this.anim = sp;
    sp.stop();
    sp.setPosition(cc.p(x, y));
    parent.addChild(sp, 100);
    this.sprite = sp;
    var size = sp.getContentSize();
    if (sp instanceof  cc.Node) {
        size = sp.getChildren()[0].getContentSize();
    }
    var rect = sp.convertToWorldSpaceAR(cc.p(0, 0));
    this.setRect(x, y, size.width, size.height);
}
ButtonObject.prototype.update = function (t) {
    ClickableObject.prototype.update.call(this, t);
    if (this.playAnimIn > 0) {
        this.playAnimIn -= t;
        if (this.playAnimIn <= 0) this.playAnim()
    }
    this.anim.update(t)
};
ButtonObject.prototype.playAnim = function () {
    var e = 30 * lerp(1.3, 1.6, Math.random());
    this.anim.setFrameDelay(1 / e);
    this.playAnimIn = -1;
    this.anim.gotoAndPlay(0)
};
ButtonObject.prototype.onClick = function () {
    ClickableObject.prototype.onClick.call(this);
    SoundsManager.instance.playSound("button");
    this.playAnim()
};
ButtonObject.prototype.onShow = function () {
    this.playAnimIn = lerp(1 / 60, 6 / 60, Math.random())
};
ButtonObject.prototype.onHide = function () {
};


/**
 * ==============================================================================
 * @type {void|Function|*}
 */
var SoundButton = ButtonObject.extend({
    ctor: function (t, n, r, i) {
        this._super();
        var that = this;
        var callback = function (e) {
            that.changeState(e)
        };
        this.isMusic = t;
        this.init(t ? 2 : 0, callback, n, r, i);
    }
});
SoundButton.prototype.changeState = function (e) {
    var t = !(this.isMusic ? SoundsManager.instance.isBG : SoundsManager.instance.isAudio);
    this.anim.setPartSkin("Layer 1", this.isMusic ? t ? 2 : 3 : t ? 0 : 1);
    this.isMusic ? SoundsManager.instance.setHasBgMusic(t) : SoundsManager.instance.setHasAudioEff(t)
};
SoundButton.prototype.onShow = function () {
    ButtonObject.prototype.onShow.call(this);
    var t = this.isMusic ? SoundsManager.instance.isBG : SoundsManager.instance.isAudio;
    this.anim.setPartSkin("Layer 1", this.isMusic ? t ? 2 : 3 : t ? 0 : 1)
};
