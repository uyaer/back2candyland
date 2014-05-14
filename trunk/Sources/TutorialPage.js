/**
 * Created by Administrator on 2014/5/6.
 */

var TutorialPage = GameObject.extend({
    ctor: function () {
        this._super();
        this.tapCells = [];
        this.isHiding = false;
        this.isShowing = false;
        this.showDelay = 0;
        this.hideDelay = 0;
        this.tutorial = Tutorial.instance
    }
});
TutorialPage.prototype.init = function (e) {
    this.sprite = e;
    this.sprite.retain();
    this.sprite.setCascadeOpacityEnabled(true);
};
TutorialPage.prototype.onDown = function (x, y) {
    if (this.checkHide(x, y)) {
        this.tutorial.nextPage();
        if (Match3Level.instance.isActive && !(this instanceof ReachScoreTutorial)) {
            Match3Level.instance.onMouseDown(x, y);
        }
    }
};
TutorialPage.prototype.allowTap = function (x, y) {
    if (this.sprite.getOpacity() < 255 * 0.5)return false;
    var len = this.tapCells.length;
    var pot = Match3Level.instance.stageToGrid(x, y);
    for (var i = 0; i < len; ++i) {
        var s = this.tapCells[i];
        if (s.x == pot.x && s.y == pot.y) {
            return true;
        }
    }
    return false
};
TutorialPage.prototype.checkHide = function (x, y) {
    return this.allowTap(x, y)
};
TutorialPage.prototype.hide = function () {
    var that = this;
    if (!this.isHiding) {
        this.isHiding = true;
        this.sprite.runAction(cc.Sequence.create(
            cc.DelayTime.create(that.hideDelay),
            cc.FadeOut.create(0.3),
            cc.CallFunc.create(function () {
                that.removeSprite();
            })
        ));
    }
};
TutorialPage.prototype.show = function () {
    this.isShowing = true;
    this.isHiding = false;
    var that = this;
    if (!this.sprite.getParent()) {
        App.menuRoot.addChild(this.sprite, menuZOrder + 10);
        this.sprite.setPositionY(App.VIEW_BOTTOM);
        this.sprite.setOpacity(0);
        this.sprite.runAction(cc.Sequence.create(
            cc.DelayTime.create(that.showDelay),
            cc.FadeIn.create(0.3)
        ));
    }
};
TutorialPage.prototype.removeSprite = function () {
    this.sprite.removeFromParent();
};


/**********
 * ==================================================================================
 */
var FirstGroupTapTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        if (App.episode <= 1)this.tapCells.push(cc.p(5, 1), cc.p(5, 2), cc.p(5, 3), cc.p(4, 2), cc.p(6, 2), cc.p(6, 3)); else this.tapCells.push(cc.p(2, 5), cc.p(3, 4), cc.p(3, 5), cc.p(4, 4), cc.p(4, 5), cc.p(4, 6), cc.p(5, 6));
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial1");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPositionY(-6);
        n.setOpacity(0.8 * 255);
        root.addChild(n);
        var tf = bitmapText("Tap to remove\n     jellies", RED_FONT);
        tf.setAnchorPoint(cc.p(0, 0.5));
        tf.setScale(0.9);
        tf.setPositionX(99 + 50 + (App.episode <= 1 ? 0 : -85));
        tf.setPositionY(340 - 10 + (App.episode <= 1 ? 0 : -120));
        root.addChild(tf);
        this.hideDelay = .15;
        this.showDelay = .5;
        this.init(root);
    }
});


/**
 * =======================================================================================
 */
var HighValueTapTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial2");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.8 * 255);
        root.addChild(n);
        var r = bitmapText("Some jellies give\nadditional points", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setScale(0.8);
        r.setPositionX(99 + (App.episode <= 1 ? 0 : 90));
        r.setPositionY(400 + (App.episode <= 1 ? 0 : 50));
        root.addChild(r);
        var r = bitmapText("Tap anywhere to continue", BLUE_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setScale(0.55);
        r.setPosition(cc.p(45, 60));
        root.addChild(r);
        this.hideDelay = 0;
        this.showDelay = 2.5;
        this.init(root);
    }
});
HighValueTapTutorial.prototype.allowTap = function (e, t) {
    return false
};
HighValueTapTutorial.prototype.checkHide = function (t, n) {
    return TutorialPage.prototype.checkHide.call(this, t, n) || this.sprite.getOpacity() > .9 * 255;
};


/**
 *============================================================================================================
 */
var LineTapTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        if (App.episode <= 1)this.tapCells.push(cc.p(3, 7), cc.p(4, 7), cc.p(5, 7), cc.p(6, 7), cc.p(7, 7)); else this.tapCells.push(cc.p(6, 2), cc.p(6, 3), cc.p(6, 4), cc.p(6, 5), cc.p(6, 6));
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial3");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.8 * 255);
        root.addChild(n);
        var r = bitmapText("   remove line\nto create bonus", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setPositionX(130 + (App.episode <= 1 ? 0 : 55));
        r.setPositionY(340 + 50 + (App.episode <= 1 ? 0 : 85));
        r.setScale(0.85);
        root.addChild(r);
        this.hideDelay = .15;
        this.showDelay = 2;
        this.init(root);
    }
});


/**
 * =====================================================================================
 * @type {void|Function|*}
 */
var BonusTapTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        if (App.episode <= 1)this.tapCells.push(cc.p(0, 3), cc.p(1, 3), cc.p(2, 3), cc.p(0, 2)); else this.tapCells.push(cc.p(0, 3), cc.p(0, 4), cc.p(0, 4), cc.p(1, 3));
        var t = cc.Sprite.create();
        var n = createBitmap("tutorial4");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.8 * 255);
        t.addChild(n);
        var r = bitmapText("activate bonus", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setPosition(cc.p(35 + (App.episode <= 1 ? 0 : 45), 330));
        r.setScale(0.7);
        t.addChild(r);
        this.hideDelay = .15;
        this.showDelay = 1.5;
        this.init(t)
    }
});


/**
 * =====================================================================================
 * @type {void|Function|*}
 */
var BonusInfoTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial5");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.85 * 255);
        root.addChild(n);
        var r = bitmapText("line length determines\n       bonus power", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setScale(0.85);
        r.setPosition(cc.p(5, App.GAME_H - 60));
        root.addChild(r);
        var offX = 0;
        var offY = 0;
        for (var i = 0; i < 3; ++i) {
            var scale = .85;
            var posY = App.GAME_H - 250 - i * 90 * scale;
            for (var j = 0; j < 4 + i; ++j) {
                var sp = createSpriteFromSpritesheet("orange");
                sp.setScale(scale);
                sp.setPosition(cc.p(100 + (j + (2 - i)) * 60 * scale + offX, posY + offY));
                root.addChild(sp)
            }
            var tf = bitmapText("-", BLUE_FONT);
            tf.setPosition(cc.p(420 + offX, posY + offY + 25));
            root.addChild(tf);
            for (var j = 0; j < (i == 0 ? 2 : 1); ++j) {
                var sp = createSpriteFromSpritesheet(i == 0 ? j == 0 ? "orange_horizontal" : "orange_vertical" : i == 1 ? "orange_bomb" : "bonus_color");
                sp.setScale(1);
                sp.setPosition(cc.p(500 + j * 65 + offX, posY + offY));
                root.addChild(sp)
            }
        }
        var tf = bitmapText("Tap anywhere to continue", BLUE_FONT);
        tf.setAnchorPoint(cc.p(0, 0.5));
        tf.setScale(0.55);
        tf.setPosition(cc.p(45, 60));
        root.addChild(tf);
        this.hideDelay = 0;
        this.showDelay = .5;
        this.init(root)
    }
});
BonusInfoTutorial.prototype.allowTap = function (e, t) {
    return false
};
BonusInfoTutorial.prototype.checkHide = function (t, n) {
    return TutorialPage.prototype.checkHide.call(this, t, n) || this.sprite.getOpacity() > .9 * 255;
};


/**
 * =====================================================================================================
 * @type {void|Function|*}
 */
var ReachScoreTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial6");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.8 * 255);
        root.addChild(n);
        var r = LevelManager.instance.data[0].customData;
        var tf = bitmapText("    Continue and\ncollect " + r + " points!", RED_FONT);
        tf.setAnchorPoint(cc.p(0, 0.5));
        tf.setScale(0.92);
        tf.setPosition(cc.p(50, App.GAME_H - 170));
        root.addChild(tf);
        var tf = bitmapText(LevelManager.instance.data[0].movesLeft - 3 + " moves left!", RED_FONT);
        tf.setAnchorPoint(cc.p(0, 0.5));
        tf.setPosition(cc.p(100, App.GAME_H - 336));
        root.addChild(tf);
        var tf = bitmapText("Tap anywhere to continue", BLUE_FONT);
        tf.setAnchorPoint(cc.p(0, 0.5));
        tf.setScale(0.55);
        tf.setPosition(cc.p(45, App.GAME_H - 660));
        root.addChild(tf);
        this.hideDelay = 0;
        this.showDelay = 2.8;
        this.init(root)
    }
});
ReachScoreTutorial.prototype.allowTap = function (e, t) {
    return false
};
ReachScoreTutorial.prototype.checkHide = function (t, n) {
    return TutorialPage.prototype.checkHide.call(this, t, n) || this.sprite.getOpacity() > .9 * 255;
};


/*****
 * ====================================================================================
 * @type {void|Function|*}
 */
var BonusComboTapTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        if (App.episode <= 1)this.tapCells.push(cc.p(1, 4), cc.p(1, 5), cc.p(1, 6), cc.p(2, 5), cc.p(2, 6), cc.p(2, 7), cc.p(3, 4), cc.p(3, 5), cc.p(3, 7), cc.p(3, 8), cc.p(3, 9), cc.p(4, 7), cc.p(4, 8)); else this.tapCells.push(cc.p(2, 6), cc.p(2, 7), cc.p(3, 7), cc.p(3, 8), cc.p(4, 5), cc.p(4, 6), cc.p(4, 8), cc.p(4, 9), cc.p(5, 5), cc.p(5, 7), cc.p(5, 8), cc.p(6, 5), cc.p(6, 6), cc.p(6, 7));
        var t = cc.Sprite.create();
        var n = createBitmap("tutorial7");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.8 * 255);
        t.addChild(n);
        var r = bitmapText("  Combine bonuses\nto enchance them!", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setPositionX(210 + (App.episode <= 1 ? 0 : -90));
        r.setPositionY(340 + 67 + (App.episode <= 1 ? 0 : -110));
        r.setScale(0.7);
        t.addChild(r);
        this.hideDelay = .15;
        this.showDelay = .5;
        this.init(t)
    }
});


/**
 * ===========================================================================================
 * @type {void|Function|*}
 */
var ComboInfoTutorial = TutorialPage.extend({
    ctor: function () {
        this._super();
        var root = cc.Sprite.create();
        var n = createBitmap("tutorial5");
        n.setAnchorPoint(cc.p(0, 0));
        n.setScale(4);
        n.setPosition(cc.p(0, -6));
        n.setOpacity(0.85 * 255);
        root.addChild(n);
        var r = bitmapText(" Combine bonuses\nto enchance them!", RED_FONT);
        r.setAnchorPoint(cc.p(0, 0.5));
        r.setScale(0.95);
        r.setPosition(cc.p(40, App.GAME_H-130));
        root.addChild(r);
        var i = -40;
        var s = 0;
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < i + 4; ++j) {
                var a = Math.random() < .25;
                var f = getInt(3);
                var sp = createSpriteFromSpritesheet(a ? f == 0 ? "blue_horizontal" : f == 1 ? "blue_vertical" : "blue_bomb" : "blue");
                sp.setPosition(cc.p(140 + j * 60, 250 + i * 60))
                root.addChild(sp)
            }
        }
        var tapTF = bitmapText("Tap anywhere to continue", BLUE_FONT);
        tapTF.setAnchorPoint(cc.p(0, 0.5));
        tapTF.setScale(0.55);
        tapTF.setPosition(cc.p(45, 60));
        root.addChild(tapTF);
        this.hideDelay = 0;
        this.showDelay = 2.5;
        this.init(root)
    }
});
ComboInfoTutorial.prototype.allowTap = function (e, t) {
    return false
};
ComboInfoTutorial.prototype.checkHide = function (t, n) {
    return TutorialPage.prototype.checkHide.call(this, t, n) || this.sprite.getOpacity() > .9 * 255;
};
