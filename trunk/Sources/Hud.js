/**
 * Created by Administrator on 2014/5/6.
 */
var Hud = GameObject.extend({
    ctor: function (control) {
        this._super();
        this.oldScore = 0;
        this.currPregress = 0;
        this.toPregress = 0;
        this.currentMoves = -1;
        this.currentTarget = "";
        this.currentScore = 0;
        this.starScales = [.4, .75, 1];
        this.stars = [];
        this.starsEarned = [false, false, false];
        this.sprite = cc.Node.create();
        this.sprite.retain();
        this.shuffleText = cc.Sprite.create();
        this.shuffleText.retain();
        this.bar = control.bar;
        this.barRect = this.bar.getContentSize();
        this.movesText = control.movesText;
        this.targetText = control.targetText;
        this.scoreText = control.scoreText;
        this.targetXText = control.targetXText;
        this.targetIcon = control.targetIcon;
        this.stars.push(control.star1, control.star2, control.star3);
        this.pauseButton = control.pauseButton;
        for (var i = 0; i < 2; ++i) {
            var tf = bitmapText(i == 0 ? "no possible" : "moves!", BLUE_FONT);
            tf.setAnchorPoint(cc.p(0.5, 0.5));
            tf.setPositionX(0);
            tf.setPositionY(i == 0 ? 65 : 0);
            this.shuffleText.addChild(tf);
        }
    }
});
Hud.prototype.playShuffleAnimation = function () {
    var that = this;
    this.sprite.addChild(this.shuffleText);
    this.shuffleText.setPosition(cc.p(App.GAME_W / 2, App.VIEW_TOP));
    this.shuffleText.setOpacity(0);
    this.shuffleText.runAction(cc.Sequence.create(
        cc.Spawn.create(cc.FadeIn.create(0.4), cc.EaseElasticOut.create(cc.MoveBy.create(0.4, cc.p(0, -400)))),
        cc.DelayTime.create(1),
        cc.Spawn.create(cc.FadeOut.create(0.4), cc.EaseElasticOut.create(cc.MoveBy.create(0.4, cc.p(0, 500)))),
        cc.CallFunc.create(function () {
            that.stopShuffle();
        })
    ));
};

Hud.prototype.stopShuffle = function () {
    this.shuffleText.removeFromParent();
};
Hud.prototype.isShuffleActive = function () {
    return this.shuffleText.getParent() != null;
};
Hud.prototype.show = function () {
    this.currentMoves = -1;
    this.currentTarget = "";
    this.currentScore = -1;
    this.oldScore = 0;
    this.currPregress = 0;
    this.toPregress = 0;
    this.bar.setTextureRect(cc.rect(0, 0, limit(this.barRect.width * 0, 1, this.barRect.width), this.barRect.height));
    for (var i = 0; i < 3; ++i) {
        this.starsEarned[i] = false;
    }
    this.scores = Match3Level.instance.target.scores;
    var name = Match3Level.instance.target.getText()[2];
    changeFrame(this.targetIcon, name);
    var icon = this.targetIcon;
    icon.setScale(1);
    var w = icon.getContentSize().width;
    icon.setScale(55 / w);
    this.shuffleText.removeFromParent();
    this.update(0);
};
/**
 * 暂停
 */
Hud.prototype.pauseLevel = function () {
    this.pauseButton.setScale(-1.5, 1.5);
    this.pauseButton.runAction(cc.ScaleTo.create(0.2, -1, 1));
    if (MenuManager.instance.target.sprite.getParent() || Match3Level.instance.isWaitingForTarget && !Match3Level.instance.isHardLocked || MenuManager.instance.current == MenuManager.instance.tutorial)return;
    this.level.pause();
    SoundsManager.instance.playSound("pause");
};
Hud.prototype.updateBar = function (dt) {
    var per = Match3Level.instance.score / this.scores[2];
    var score = Match3Level.instance.score;
    if (this.oldScore != score) {
        //需要重新计算，
        var toPre = 1;
        if (per >= 1 - 0.000001) {//3星星
            toPre = 1;
        } else if (per >= this.scores[1] / this.scores[2]) {//2-3
            toPre = 0.75 + (score - this.scores[1]) / (this.scores[2] - this.scores[1]) * 0.25;
        } else if (per >= this.scores[0] / this.scores[2]) {//1-2
            toPre = 0.4 + (score - this.scores[0]) / (this.scores[1] - this.scores[0]) * 0.6;
        } else {//一颗星星都没有达到
            toPre = 0.4 * score / this.scores[0];
        }
        this.toPregress = toPre;
        this.oldScore = score;
    } else {
        //执行动画
        this.currPregress += 0.3 * dt;
        this.currPregress = limit(this.currPregress, 0, this.toPregress);
    }
    this.bar.setTextureRect(cc.rect(0, 0, limit(this.barRect.width * this.currPregress, 1, this.barRect.width), this.barRect.height));
    for (var i = 0; i < this.starScales.length; i++) {
        if (this.currPregress >= this.starScales[i] && !this.starsEarned[i]) {
            this.starsEarned[i] = true;
            this.stars[i].setScale(2);
            this.stars[i].runAction(cc.ScaleTo.create(0.4, 1));
            break;
        }
    }
};
Hud.prototype.forceFullUpdate = function () {
    this.updateBar(10);
    this.scoreText.setString(Match3Level.instance.score.toString());
};
Object.defineProperty(Hud.prototype, "starEarnedAmount", {get: function () {
    var count = 0;
    for (var i = 0; i < 3; ++i) {
        if (this.starsEarned[i])count++;
    }
    return count
}, enumerable: true, configurable: true});
Hud.prototype.update = function (dt) {
    if (Match3Level.instance && this.scores) {
        this.updateBar(dt);
    }
    if (this.level.target && this.level.target.isCompleted && (!this.level.target.isScoreTarget || this.level.movesLeft <= 0))this.level.starMoveAwardMode();
    var n = Match3Level.instance.movesLeft;
    if (this.currentMoves != n) {
        this.movesText.stopAllActions();
        this.currentMoves = n;
        this.movesText.setString(n.toString());
        this.movesText.setPosition(cc.p(117, App.VIEW_TOP - 77));
        this.movesText.setScaleX(0.9);
        this.movesText.setScaleY(1.5);
        this.movesText.runAction(cc.ScaleTo.create(0.2, 1, 1));
    }
    if (Match3Level.instance && Match3Level.instance.target) {
        var txt = Match3Level.instance.target.getTargetText();
        if (txt != this.currentTarget) {
            this.targetText.stopAllActions();
            this.currentTarget = txt;
            var s = txt.charAt(0) == "x";
            this.targetXText.setVisible(s);
            var o = s ? txt.substr(1, txt.length - 1) : txt;
            this.targetText.setString(o);
            this.targetText.setAnchorPoint(cc.p(0.5, 0));
            this.targetText.setPositionY(App.GAME_H - 42);
            this.targetText.setPositionX(s ? 315 : 307);
            this.targetText.setScaleY(1.25);
            this.targetText.runAction(cc.ScaleTo.create(0.2, 1, 1));
        }
    }
    var u = Match3Level.instance.score;
    if (this.currentScore != u) {
        this.scoreText.stopAllActions();
        this.currentScore = u;
        this.scoreText.setString(u.toString());
        this.scoreText.setAnchorPoint(cc.p(0.5, 0));
        this.scoreText.setPosition(cc.p(480, App.GAME_H - 61));
        this.scoreText.setScaleY(1.25);
        this.scoreText.runAction(cc.ScaleTo.create(0.2, 1, 1));
    }
};
Hud.prototype.destroy = function () {
    GameObject.prototype.destroy.call(this)
};
Hud.prototype.reset = function () {
    this.oldScore = 0;
    this.currPregress = 0;
    this.toPregress = 0;
};
