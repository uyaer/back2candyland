/**
 * Created by Administrator on 2014/5/6.
 */
var PauseLikeMenu = Menu.extend({
    ctor: function () {
        this._super();
        this.showDelay = 0;
        this.targetPos = App.WIN_H * 0.42;
        var root = cc.Node.create();
        this.sprite = root;
        this.sprite.retain();
        var menuNode = cc.Node.create();
        var gray = createSpriteFromSpritesheet("gray");
        var i = gray.getBoundingBox();
        gray.setAnchorPoint(cc.p(0, 0));
        gray.setScaleX((100 + App.WIN_W) / i.width);
        gray.setScaleY((80 + App.WIN_H) / i.height);
        gray.setPosition(cc.p(-50, -root.getPositionY() - 40));
        this.grayBack = gray;
        root.addChild(gray);
        var s = createBitmap("menu_back");
        s.setAnchorPoint(cc.p(0, 0));
        menuNode.addChild(s);
        this.backSprite = s;
        root.addChild(menuNode);
        this.baseSprite = menuNode;
        this.moreGames = new MoreGamesButton(root, 90, limit(App.WIN_H * 0.15, 145, 280), 1);
    }
});
PauseLikeMenu.prototype.show = function () {
    Menu.prototype.show.call(this);
    this.baseSprite.stopAllActions();
    this.grayBack.stopAllActions();
    this.grayBack.setOpacity(0);
    this.baseSprite.setPositionY(App.WIN_H);
    this.grayBack.runAction(cc.Sequence.create(
        cc.DelayTime.create(this.showDelay),
        cc.FadeIn.create(0.26)
    ));
    this.baseSprite.runAction(cc.Sequence.create(
        cc.DelayTime.create(this.showDelay),
        cc.EaseElasticOut.create(cc.MoveTo.create(1.3, cc.p(this.baseSprite.getPositionX(), this.targetPos)))
    ));
    if (this.clickables.indexOf(this.moreGames) == -1)this.clickables.push(this.moreGames);
    if (this.moreGames.sprite)this.moreGames.sprite.setVisible(true);
};
PauseLikeMenu.prototype.hide = function () {
    var that = this;
    if (this.needToHideInstantly()) {
        Menu.prototype.hide.call(this);
        return
    }
    this.baseSprite.stopAllActions();
    this.grayBack.stopAllActions();
    this.grayBack.setOpacity(255);
    this.baseSprite.setPositionY(App.GAME_H - 350);
    this.grayBack.runAction(cc.FadeOut.create(0.75));
    this.baseSprite.runAction(cc.Sequence.create(
        cc.EaseBackIn.create(cc.MoveTo.create(0.55, cc.p(this.backSprite.getPositionX(), App.WIN_H + 300))),
        cc.CallFunc.create(function () {
            Menu.prototype.hide.call(that)
        })
    ));
    if (this.moreGames.sprite)this.moreGames.sprite.setVisible(false);
};
PauseLikeMenu.prototype.needToHideInstantly = function () {
    return MenuManager.instance.transition.menuToShow == null && MenuManager.instance.transition.isActive
};


/**
 * ======================================================================================================
 */
var TargetMenu = PauseLikeMenu.extend({
    ctor: function () {
        this._super();
        this.targetTexts = [];
        this.targetSprites = [];
        this.showDelay = 0.15;
        var root = this.sprite;
        var sp;
        var tf = bitmapText("OBJECTIVE", BLUE_FONT);
        tf.setPosition(cc.p(App.GAME_W / 2, 235));
        this.baseSprite.addChild(tf);
        var tapTF = bitmapText("tap to continue...", RED_FONT);
        tapTF.setScale(0.65);
        tapTF.setPositionX(App.GAME_W / 2);
        tapTF.setPositionY(limit(App.WIN_H * 0.25, 220, 350));
        root.addChild(tapTF);
        this.continueText = tapTF;
        for (var i = 2; i >= 0; --i) {
            sp = createSpriteFromSpritesheet("cookie");
            sp.setPositionY(80 + i * 30);
            sp.setRotation(i * -30);
            this.baseSprite.addChild(sp, i);
            this.targetSprites.push(sp)
        }
        for (var i = 0; i < 2; ++i) {
            var tf = bitmapText(" ", RED_FONT);
            tf.setScale(0.9);
            this.baseSprite.addChild(tf);
            this.targetTexts.push(tf)
        }
    }
});
TargetMenu.prototype.show = function () {
    PauseLikeMenu.prototype.show.call(this);
    var txtData = Match3Level.instance.target.getText();
    var n = -1;
    for (var i = 0; i < this.targetTexts.length; ++i) {
        var tf = this.targetTexts[i];
        tf.setString(txtData[i]);
        tf.setPositionX(App.GAME_W / 2);
        tf.setPositionY(155 - i * 55);
        n = App.GAME_W - 150;
    }
    for (var i = 0; i < 3; ++i) {
        var sp = this.targetSprites[i];
        var name = txtData[2];
        changeFrame(sp, name);
        sp.setScale(name == "star" ? 66 / 100 : 1);
        sp.setPositionX(n + 100 - (i == 0 ? 0 : i == 1 ? 25 : 19));
    }
    this.continueText.setVisible(true);
};
TargetMenu.prototype.hide = function () {
    PauseLikeMenu.prototype.hide.call(this);
    this.continueText.setVisible(false);
};
TargetMenu.prototype.onDown = function (t, n) {
    PauseLikeMenu.prototype.onDown.call(this, t, n);
    if (this == MenuManager.instance.current) {
        MenuManager.instance.closeCurrent();
        if (Match3Level.instance.isPaused)Match3Level.instance.unpause()
    }
};


/***
 * ================================================================================================
 */
var PauseMenu = PauseLikeMenu.extend({
    ctor: function () {
        this._super();
        var that = this;
        this.targetPos = App.WIN_H * 0.45;
        var root = this.sprite;
        var r;
        var i = bitmapText("pause", BLUE_FONT);
        i.setPosition(cc.p(App.GAME_W / 2, 234));
        this.baseSprite.addChild(i);
        var s = new ButtonObject(6, function (e) {
            that.loadMainMenu(e)
        }, this.baseSprite, 350 + 35, 115 - 10);
        this.animatedButtons.push(s);
        this.clickables.push(s);
        var s = new ButtonObject(5, function (e) {
            that.restartLevel(e)
        }, this.baseSprite, 210 + 35, 115 - 10);
        this.animatedButtons.push(s);
        this.clickables.push(s);
        var s = new SoundButton(true, this.baseSprite, 570, 130);
        this.animatedButtons.push(s);
        this.clickables.push(s);
        var s = new SoundButton(false, this.baseSprite, 570, 35);
        this.animatedButtons.push(s);
        this.clickables.push(s);
        this.button = new AnimatedNode(AnimationManager.instance.getAnimation("button"), 1 / 30, null);
        this.baseSprite.addChild(this.button);
        this.button.addAction(97, 0, 0);
        this.button.addAction(106, 0, -1);
        this.button.setPosition(cc.p(App.GAME_W / 2 - 85, 51));
        this.button.setScale(0.75);
        this.button.addAction(this.button.totalFrames - 1, 1, 0);
        var o = new ClickableObject(this.button);
        o.setCircle(120 * this.button.getScaleX(), 0, 0);
        o.callback = function () {
            that.onPlayDown()
        };
        this.clickables.push(o)
    }
});
PauseMenu.prototype.show = function () {
    PauseLikeMenu.prototype.show.call(this);
    this.button.gotoAndPlay(0)
};
PauseMenu.prototype.onPlayDown = function () {
    try {
        this.button.gotoAndPlay(99);
        Match3Level.instance.unpause();
        SoundsManager.instance.playSound("pause")
    } catch (e) {
        trace("play downXX " + e)
    }
};
PauseMenu.prototype.update = function (t) {
    PauseLikeMenu.prototype.update.call(this, t);
    this.button.update(t)
};


/***
 * ==========================================================================================
 */
var LoseMenu = PauseLikeMenu.extend({
    ctor: function () {
        this._super();
        var that = this;
        this.showDelay = 0;
        var n = createSpriteFromSpritesheet("lose");
        n.setAnchorPoint(cc.p(0.5, 0));
        n.setPosition(cc.p(347, 123));
        this.baseSprite.addChild(n);
        this.char = new AnimatedNode(AnimationManager.instance.getAnimation("Char_lose"), 1 / 30, null);
        this.char.setPosition(cc.p(100, -80));
        this.baseSprite.addChild(this.char);
        var i = new ButtonObject(6, function () {
            that.loadMainMenu();
        }, this.baseSprite, 500, 57);
        this.animatedButtons.push(i);
        this.clickables.push(i);
        var i = new ButtonObject(5, function () {
            that.restartLevel()
        }, this.baseSprite, 340, 57);
        this.animatedButtons.push(i);
        this.clickables.push(i);
    }
});


LoseMenu.prototype.show = function () {
    PauseLikeMenu.prototype.show.call(this);
    SoundsManager.instance.playSound("fail");
    SoundsManager.instance.pauseMusic()
};
LoseMenu.prototype.hide = function () {
    PauseLikeMenu.prototype.hide.call(this);
    SoundsManager.instance.resumeMusic()
};
LoseMenu.prototype.update = function (t) {
    PauseLikeMenu.prototype.update.call(this, t);
    this.char.update(t)
};


/**
 * ==============================================================================================
 */
var ResultMenu = PauseLikeMenu.extend({
    ctor: function ResultMenu() {
        this._super();
        var that = this;
        this.dataTexts = [];
        tf = bitmapText("complete!", BLUE_FONT);
        tf.setPosition(cc.p(App.WIN_W / 2, 350));
        this.baseSprite.addChild(tf);
        this.backSprite.setScaleY(1.5);
        var titleStrArr = ["stars earned:", "total moves:", "total score:", "bonuses used:"];
        for (var i = 0; i < titleStrArr.length; ++i) {
            for (var j = 0; j < 2; j++) {
                var tf = bitmapText(j == 0 ? titleStrArr[i] : getInt(1e6).toString(), j == 0 ? BLUE_FONT : RED_FONT);
                if (j == 0) {
                    tf.setAnchorPoint(cc.p(0, 0));
                } else {
                    tf.setAnchorPoint(cc.p(0.5, 0));
                }
                tf.setPosition(cc.p(j == 0 ? 10 : 530, 250 - (i * 55 ) + (j == 0 ? 0 : 2)))
                tf.setScale(j == 0 ? .7 : 1);
                this.baseSprite.addChild(tf);
                if (j == 1) {
                    this.dataTexts.push(tf);
                }
            }
        }
        this.button = new AnimatedNode(AnimationManager.instance.getAnimation("button"), 1 / 30, null);
        this.baseSprite.addChild(this.button);
        this.button.addAction(97, 0, 0);
        this.button.addAction(106, 0, -1);
        this.button.setPositionX(App.GAME_W / 2 - 85);
        this.button.setPositionY(60);
        this.button.setScale(0.75);
        this.button.addAction(this.button.totalFrames - 1, 1, 0);
        var playBtn = new ClickableObject(this.button);
        playBtn.setCircle(120, 0, 0);
        playBtn.callback = function () {
            that.onPlayDown()
        };
        this.clickables.push(playBtn);
        this.targetPos -= 60
    }
});
ResultMenu.prototype.show = function () {
    PauseLikeMenu.prototype.show.call(this);
    this.button.gotoAndPlay(0);
    var strArr = [LevelManager.instance.totalStars + "/" + 180, LevelManager.instance.moves.toString(), LevelManager.instance.totalScores.toString(), LevelManager.instance.bonuses.toString()];
    for (var i = 0; i < strArr.length; ++i) {
        var tf = this.dataTexts[i];
        tf.setString(strArr[i]);
    }
    SoundsManager.instance.pauseMusic();
    SoundsManager.instance.playSound("win")
};
ResultMenu.prototype.hide = function () {
    PauseLikeMenu.prototype.hide.call(this);
    SoundsManager.instance.resumeMusic()
};
ResultMenu.prototype.onPlayDown = function () {
    try {
        this.button.gotoAndPlay(99);
        this.loadMainMenu()
    } catch (e) {
        trace("play downXXt " + e)
    }
};
ResultMenu.prototype.update = function (t) {
    PauseLikeMenu.prototype.update.call(this, t);
    this.button.update(t)
};


/**
 * =======================================================================================
 */
var CreditsMenu = PauseLikeMenu.extend({
    ctor: function CreditsMenu() {
        this._super();
        var t = this;
        this.dataTexts = [];
        s = bitmapText("Credits", BLUE_FONT);
        s.setPosition(cc.p(App.WIN_W / 2, 408));
        this.baseSprite.addChild(s);
        this.backSprite.setScaleY(1.8);
        var n = ["art:", "code:", "sound:", "thanks\nto:"];
        for (var r = 0; r < n.length; ++r) {
            for (var i = 0; i < 2; i++) {
                if (i == 1)continue;
                var s = bitmapText(i == 0 ? n[r] : getInt(1e6).toString(), i == 0 ? BLUE_FONT : RED_FONT);
                s.setPosition(cc.p(i == 0 ? 10 : 520, 60 + r * 55 + (i == 0 ? 0 : -20)));
                s.setScale(0.65);
                this.baseSprite.addChild(s)
            }
        }
        this.dataTexts = [];
        var n = ["Alexey Testov", "Andriy Vinchkovskiy", "alexander ahura", "           sergey batishchev\n         konstantin boronenkov\n  all flashgamedev.ru testers!"];
        for (var r = 0; r < n.length; ++r) {
            for (var i = 0; i < 2; i++) {
                if (i == 0)continue;
                var s = bitmapText(n[r], i == 0 ? BLUE_FONT : RED_FONT);
                s.setPositionX(390 + (r == 3 ? -50 : 0));
                s.setPositionY(70 + r * 55 + (i == 0 ? 0 : -20) + (r == 3 ? 10 : 0));
                s.setScaleX(r == 3 ? .6 : .75);
                this.dataTexts.push(s);
                this.baseSprite.addChild(s)
            }
        }
        this.button = new AnimatedNode(AnimationManager.instance.getAnimation("button"), 1 / 30, null);
        this.baseSprite.addChild(this.button);
        this.button.addAction(97, 0, 0);
        this.button.addAction(106, 0, -1);
        this.button.setPosition(cc.p(App.GAME_W / 2 - 85, 62));
        this.button.setScale(0.75);
        this.button.addAction(this.button.totalFrames - 1, 1, 0);
        var o = new ClickableObject(this.button);
        o.setCircle(120, 0, 0);
        o.callback = function () {
            t.onPlayDown()
        };
        this.clickables.push(o);
        this.targetPos -= 120
    }
});
CreditsMenu.prototype.show = function () {
    PauseLikeMenu.prototype.show.call(this);
    this.button.gotoAndPlay(0);
};
CreditsMenu.prototype.hide = function () {
    this.isMenuActive = false;
    PauseLikeMenu.prototype.hide.call(this)
};
CreditsMenu.prototype.onPlayDown = function () {
    try {
        this.button.gotoAndPlay(99);
        this.hide()
    } catch (e) {
        trace("play downXXt " + e)
    }
};
CreditsMenu.prototype.update = function (t) {
    PauseLikeMenu.prototype.update.call(this, t);
    this.button.update(t)
};
