/**
 * Created by Administrator on 2014/5/6.
 */
var Menu = GameObject.extend({
    ctor: function () {
        this._super();
        this.animatedButtons = [];
        this.clickables = [];
        this.isMenuActive = false
    }
});
Menu.prototype.show = function () {
    if (this.sprite) {
        App.menuRoot.addChild(this.sprite, menuZOrder);
    }
    for (var e = 0; e < this.animatedButtons.length; ++e)this.animatedButtons[e].onShow();
    this.isMenuActive = true
};
Menu.prototype.update = function (t) {
    GameObject.prototype.update.call(this, t);
    var n = this.animatedButtons.length;
    for (var r = 0; r < n; ++r)this.animatedButtons[r].update(t)
};
Menu.prototype.hide = function () {
    this.sprite.removeFromParent();
    this.isMenuActive = false;
    for (var e = 0; e < this.animatedButtons.length; ++e)this.animatedButtons[e].onHide()
};
Menu.prototype.onResize = function () {
};
Menu.prototype.onDown = function (x, y) {
    var len = this.clickables.length;
    for (var r = 0; r < len; ++r) {
        var btn = this.clickables[r];
        if (btn && btn.checkClick(x, y)) {
            btn.onClick();
            break;
        }
    }
};
Menu.prototype.onUp = function (e, t) {
};
Menu.prototype.restartLevel = function () {
    LevelManager.instance.restartLevel();
};
Menu.prototype.loadMainMenu = function () {
    MenuManager.instance.show(MenuManager.instance.map);
};


/**
 * ===============================================================================================
 */
var MapMenu = Menu.extend({
    ctor: function () {
        this._super();
        var that = this;
        this.firstShow = true;
        this.isMoving = false;
        this.height = 0;
        this.pointerIsMoving = false;
        this.currentLevel = 0;
        this.downPos = cc.p(0, 0);
        this.speed = 0;
        this.isDown = false;
        this.dragSpeed = 0;
        this.lastSpeed = 0;
        this.mainSprites = [];
        this.buttons = [];
        this.levelToUnlock = -1;
        this.isLevelUnlocking = false;
        this.isPlayPressed = false;
        this.pointerSprites = [];
        MapMenu.BUTTON_RADIUS = App.episode == 2 ? 25 : 30;
        this.sprite = cc.Node.create();
        this.sprite.retain();
        this.scrollSprite = cc.Node.create();
        var totalOffY = 0;
        var arr = [
            [0, -10, -20],
            [0, -42, -44],
            [0, -39, -48]
        ];
        //添加地图
        for (var i = 1; i <= 3; ++i) {
            var sp = createBitmap("map" + i);
            var offsetY = arr[App.episode][i - 1];
            sp.setPositionY(totalOffY + offsetY);
            sp.setAnchorPoint(cc.p(0, 0));
            this.height += sp.getBoundingBox().height + offsetY;
            this.scrollSprite.addChild(sp);
            totalOffY += sp.getBoundingBox().height + offsetY;
            this.mainSprites.push(sp);
        }
        this.rect = cc.rect(0, 0, App.WIN_W, App.WIN_H);
        for (i = 0; i < LevelManager.LEVEL_AMOUNT; ++i) {
            var a = mapButtons[App.episode][i];
            var sp = createSpriteFromSpritesheet(a[2] ? i <= 41 ? "point_big_orange" : "point_big_pinc" : i <= 41 ? "point_small_orange" : "point_small_pinc");
            sp.setPosition(cc.p(a[0], this.height - a[1]));
            sp.setScaleX(a[3]);
            sp.setScaleY(a[4]);
            this.scrollSprite.addChild(sp);
            this.buttons.push(sp);
        }
        //那个指针图标
        var animNode = new AnimatedNode(AnimationManager.instance.getAnimation("pointer"), 1 / 30, null);
        animNode.stop();
        animNode.setPositionX(MapMenu.buttonPositions[App.episode][0][0]);
        animNode.setPositionY(this.height - MapMenu.buttonPositions[App.episode][0][1]);
        animNode.setAnchorPoint(cc.p(0.5, 0));
        this.scrollSprite.addChild(animNode);
        animNode.addAction(animNode.totalFrames - 1, 0);
        this.pointer = animNode;
        var lvTF = bitmapText("99", BLUE_FONT);
        lvTF.setPosition(cc.p(80, 210));
        this.pointer.getPart(0).addChild(lvTF);
        this.pointerSprites.push(lvTF);
        //几颗星星完成的
        for (var i = 0; i < 3; ++i) {
            var sp = createSpriteFromSpritesheet("star");
            this.pointer.getPart(0).addChild(sp);
            sp.setScale(.36 + i * .08);
            sp.setPositionX((i == 0 ? -27 : i == 1 ? 20 : 72) + 61);
            sp.setPositionY(248 - (i == 1 ? -11 : i == 0 ? 5 : 0));
            sp.setRotation((i - 1) * 25);
            this.pointerSprites.push(sp);
        }
        //当前关卡完成的图标
        sp = createSpriteFromSpritesheet("cookie");
        this.pointer.getPart(0).addChild(sp);
        this.pointerSprites.push(sp);
        sp.setPosition(cc.p(84, 150));
        var btn = new ClickableObject(this.pointer);
        btn.setCircle(85, 0, 54);
        btn.callback = function (e) {
            that.onPointerDown()
        };
        this.clickables.push(btn);
        var d = new SoundButton(true, this.sprite, 570, 115 - 50);
        this.animatedButtons.push(d);
        this.clickables.push(d);
        var d = new SoundButton(false, this.sprite, 570, 215 - 50);
        this.animatedButtons.push(d);
        this.clickables.push(d);
        var d = new ButtonObject(6, function (e) {
            that.loadMain(e)
        }, this.sprite, 350 + 35, 115 - 10);
        this.animatedButtons.push(d);
        this.clickables.push(d);

        this.sprite.addChild(this.scrollSprite);

        this.onResize();
    }

});

MapMenu.prototype.onResize = function () {
    Menu.prototype.onResize.call(this);
    for (var i = 1; i <= 3; ++i) {
        this.clickables[i].sprite.setPositionX(525 + (i - 2) * 75);
        this.clickables[i].sprite.setPositionY(i == 3 ? App.WIN_H - 55 : App.WIN_H - 66);
        this.clickables[i].sprite.setScale(i == 3 ? .55 : .75);
        this.clickables[i].updateRectScale();
    }
};
MapMenu.prototype.loadMain = function (e) {
    MenuManager.instance.show(MenuManager.instance.mainMenu)
};
MapMenu.prototype.updatePointerData = function () {
    var data = LevelManager.instance.data[this.currentLevel];
    var starsNum = data.stars;
    var n = data.targetSpriteName;
    var lvTF = this.pointerSprites[0];
    lvTF.setString((data.levelNumber + 1).toString());
    for (var i = 0; i < 3; ++i) {
        var star = this.pointerSprites[i + 1];
        star.setVisible(i < starsNum);
    }
    var icon = this.pointerSprites[4];
    changeFrame(icon, n);
    icon.setScale(1);
    var w = icon.getContentSize().width;
    icon.setScale(45 / w);
};
MapMenu.prototype.show = function () {
    SoundsManager.instance.playMusic();
    var that = this;
    Menu.prototype.show.call(this);
    this.isLevelUnlocking = this.levelToUnlock > 0;
    this.isPlayPressed = false;
    this.isMoving = false;
    this.pointerIsMoving = false;
    this.speed = 0;
    this.isDown = false;
    this.firstShow = LevelManager.instance.isFirstLoad;
    if (this.firstShow) {
        LevelManager.instance.isFirstLoad = false;
        this.firstShow = false;
        this.scrollSprite.setPositionY(App.WIN_H - this.height);
        //TODO  这里应该是4秒
        this.scroll(0, 0.5);
    } else if (this.isLevelUnlocking) {
        var btn = this.buttons[this.levelToUnlock];
        btn.runAction(cc.Sequence.create(
            cc.DelayTime.create(0.6),
            cc.Spawn.create(cc.ScaleTo.create(0.5, 1.4), cc.FadeTo.create(0.5, 25)),
            cc.CallFunc.create(function () {
                that.onButtonHide();
            })
        ));
    } else {
        this.movePoinPointerToButton(LevelManager.instance.lastOpened)
    }
    this.updatePointerData();
};
MapMenu.prototype.fastUnlock = function (e) {
    this.levelToUnlock = -1;
    this.buttons[e].removeFromParent();
};
MapMenu.prototype.onButtonHide = function () {
    this.movePoinPointerToButton(this.levelToUnlock)
};
MapMenu.prototype.hide = function () {
    Menu.prototype.hide.call(this);
};
MapMenu.prototype.destroy = function () {
    Menu.prototype.destroy.call(this)
};
//滚动区域
MapMenu.prototype.onPressDown = function (pos) {
    if (this.isLevelUnlocking)return;
    this.oldPos = pos;
    this.downTime = Date.now();
    this.isDown = true;
};
//滚动区域
MapMenu.prototype.onPressUp = function (pos) {
    if (this.isLevelUnlocking)return;
    var that = this;
    this.isDown = false;
    this.speed = this.lastSpeed;
    var t = sign(this.speed);
    this.speed = t * limit(Math.abs(this.speed), 0, 250);
    this.scrollSprite.stopAllActions();
    var toY = this.scrollSprite.getPositionY() + this.speed * 1.6;
    this.scrollSprite.runAction(
        cc.EaseOut.create(cc.MoveTo.create(1.6, cc.p(0, this.limitY(toY))), 2)
    );
};
//滚动区域
MapMenu.prototype.onPressMove = function (pos) {
    if (this.isLevelUnlocking)return;
    if (this.isMoving)return;
    var n = this.scrollSprite.getPositionY();
    this.scrollSprite.setPositionY(this.limitY(n + pos.y - this.oldPos.y));
    this.oldPos.y = pos.y;
    var useTime = Date.now() - this.downTime;
    this.lastSpeed = (this.scrollSprite.getPositionY() - n) * 1000 / useTime;
};

MapMenu.prototype.update = function (dt) {
    Menu.prototype.update.call(this, dt);
    var py = this.scrollSprite.getPositionY();
    for (var i = 0; i < 3; ++i) {
        var r = this.mainSprites[i]
    }
    for (var i = 0; i < LevelManager.LEVEL_AMOUNT; ++i) {
        var btn = this.buttons[i];
        var s = btn.convertToWorldSpaceAR(cc.p(0, 0));
        btn.setVisible(i == this.levelToUnlock || LevelManager.instance.data[i].state == LevelData.CLOSED_STATE && !(s.y > App.ACTUAL_H + 300 || s.y < -200));
    }
    this.pointer.update(dt);
};
/**
 * 关卡节点被点击，将指针移动到该节点上
 * @param pos
 */
MapMenu.prototype.onClick = function (pos) {
    if (this.isLevelUnlocking || this.isPlayPressed)return;
    if (!this.isMoving && !this.pointerIsMoving) {
        var clickPos = this.scrollSprite.convertToNodeSpace(pos);
        var len = MapMenu.buttonPositions[App.episode].length;
        for (var i = 0; i < len; ++i) {
            var btnPos = MapMenu.buttonPositions[App.episode][i];
            if (distanceBetweenPoints(clickPos.x, clickPos.y, btnPos[0], this.height - btnPos[1]) < MapMenu.BUTTON_RADIUS) {
                if (LevelManager.instance.data[i].state == LevelData.CLOSED_STATE)return;
                this.movePoinPointerToButton(i);
                break;
            }
        }
    }
};
/**
 * 移动指针到节点
 * @param index
 */
MapMenu.prototype.movePoinPointerToButton = function (index) {
    var pos = MapMenu.buttonPositions[App.episode][index];
    this.pointerIsMoving = true;
    this.currentLevel = index;
    this.pointer.gotoAndPlay(0);
    var that = this;
    this.pointer.runAction(cc.Sequence.create(
        cc.MoveTo.create(0.21 * 1.4, cc.p(pos[0], this.height - pos[1])),
        cc.CallFunc.create(function () {
            that.stopPointerMove();
        })
    ));
    this.scroll(pos[1] - this.height + App.WIN_H / 3, 0.5);
    this.updatePointerData();
    SoundsManager.instance.playSound("pointer")
};
MapMenu.prototype.scroll = function (toY, time) {
    var that = this;
    if (this.isMoving)return;
    this.isMoving = true;
    this.scrollSprite.stopAllActions();
    this.speed = 0;
    this.scrollSprite.runAction(cc.Sequence.create(
        cc.MoveTo.create(time, cc.p(0, this.limitY(toY))),
        cc.CallFunc.create(function () {
            that.stopMove();
        })
    ));
};

MapMenu.prototype.limitY = function (toY) {
    toY = limit(toY, App.WIN_H - this.height, 0);
    return toY;
};
/**
 * 当指针被点击，开始关卡
 */
MapMenu.prototype.onPointerDown = function () {
    if (this.isLevelUnlocking || this.isPlayPressed)return;
    if (!this.pointerIsMoving) {
        this.pointer.gotoAndPlay(0);
        LevelManager.instance.prepareToLoadLevel(this.currentLevel);
        SoundsManager.instance.playSound("play_button");
        this.isPlayPressed = true;
        return
    }
};
MapMenu.prototype.stopPointerMove = function () {
    this.pointerIsMoving = false;
    this.isLevelUnlocking = false;
    this.levelToUnlock = -1;
    if (!this.pointer.isPlaying)this.pointer.gotoAndPlay(0)
};
MapMenu.prototype.stopMove = function () {
    this.isMoving = false;
};
MapMenu.buttonPositions = [[
    [337, 655],
    [336, 730],
    [319, 785],
    [266, 825],
    [201, 849],
    [157, 889],
    [189, 947],
    [282, 966],
    [366, 1e3],
    [428, 1028],
    [488, 1077],
    [531, 1125],
    [550, 1168],
    [525, 1235],
    [465, 1267],
    [383, 1288],
    [353, 1342],
    [363, 1387],
    [366, 1510],
    [366, 1635],
    [377, 1739],
    [411, 1828],
    [459, 1885],
    [503, 1944],
    [517, 1995],
    [538, 2056],
    [551, 2115],
    [509, 2169],
    [431, 2174],
    [366, 2132],
    [316, 2098],
    [285, 2050],
    [226, 2019],
    [151, 2020],
    [84, 2049],
    [64, 2117],
    [62, 2184],
    [73, 2245],
    [111, 2295],
    [164, 2327],
    [244, 2362],
    [307, 2378],
    [374, 2393],
    [434, 2410],
    [507, 2442],
    [545, 2488],
    [568, 2525],
    [554, 2564],
    [501, 2586],
    [432, 2592],
    [358, 2625],
    [303, 2645],
    [269, 2679],
    [282, 2714],
    [332, 2744],
    [350, 2793],
    [315, 2827],
    [244, 2834],
    [172, 2842],
    [125, 2872]
].reverse(), [
    [184, 1921],
    [268, 1880],
    [328, 1826],
    [370, 1769],
    [372, 1702],
    [360, 1659],
    [313, 1623],
    [265, 1584],
    [207, 1558],
    [140, 1519],
    [171, 1473],
    [248, 1461],
    [340, 1443],
    [337, 1385],
    [305, 1319],
    [332, 1276],
    [386, 1249],
    [454, 1236],
    [522, 1206],
    [546, 1149],
    [535, 1103],
    [492, 1073],
    [432, 1043],
    [372, 1023],
    [289, 1006],
    [182, 993],
    [124, 976],
    [92, 928],
    [103, 875],
    [314, 793],
    [413, 802],
    [505, 783],
    [568, 735],
    [552, 674],
    [514, 610]
], [
    [509, 1918],
    [453, 1882],
    [404, 1841],
    [377, 1782],
    [371, 1708],
    [356, 1660],
    [354, 1600],
    [356, 1544],
    [359, 1487],
    [371, 1429],
    [362, 1390],
    [336, 1349],
    [336, 1310],
    [371, 1278],
    [421, 1236],
    [485, 1221],
    [532, 1206],
    [564, 1181],
    [571, 1142],
    [548, 1102],
    [519, 1070],
    [477, 1048],
    [421, 1028],
    [376, 1015],
    [324, 987],
    [264, 980],
    [203, 959],
    [147, 898],
    [176, 856],
    [229, 813],
    [301, 797],
    [356, 775],
    [400, 734],
    [374, 689],
    [348, 637]
]];
MapMenu.BUTTON_RADIUS = 30;


/**
 * ===============================================================================================
 */
var CharMenu = Menu.extend({
    ctor: function () {
        this._super();
        this.char = new AnimatedNode(AnimationManager.instance.getAnimation("Char_win"), 1 / 30, null);
        this.char.setVisible(false);
        this.char.addAction(106, 1, 49);
        this.char.addAction(48, 1, 49);
        this.char.addAction(114, 0, -1);
        this.char.addAction(159, 0, -1);
        this.char.addAction(239, 0, -1);
        this.char.addAction(352, 0, -1);
        this.char.addAction(198, 1, 49);
        this.char.addAction(285, 1, 49);
        this.char.addAction(429, 1, 49)
    }
});
CharMenu.prototype.onCharDown = function (e) {
    var t = this.char.currentFrame;
    if (this.char.isVisible() && !(t >= 106 && t <= 114)) {
        this.char.gotoAndPlay(107);
        this.lookBackIn = -1;
        this.charLookIn = -1;
        this.setCharIn = lerp(0, 3, Math.random());
        SoundsManager.instance.playSound("hero_hide");
    }
};
CharMenu.prototype.setCharLookTime = function (e) {
    if (typeof e === "undefined") {
        e = false
    }
    this.charLookIn = lerp(e ? .01 : 1, e ? 6 : 10, Math.random())
};
CharMenu.prototype.show = function () {
    var t = this;
    Menu.prototype.show.call(this);
    this.char.setVisible(false);
    this.setCharIn = .5;
    this.isInitHeroShow = true;
};
CharMenu.prototype.hide = function () {
    Menu.prototype.hide.call(this);
};
CharMenu.prototype.getHeroPosData = function (e) {
    return null
};
CharMenu.prototype.showHero = function (e) {
    if (typeof e === "undefined") {
        e = false
    }
    var data = this.getHeroPosData(e);
    this.char.setPositionX(data[0]);
    this.char.setRotation(data[2]);
    var n = this.getCharY(data[1]);
    this.char.setPositionY(n);
    this.char.setVisible(true);
    this.char.gotoAndPlay(0);
    this.setCharLookTime(e);
    this.lookBackIn = -1;
    SoundsManager.instance.playSound("hero_show");
};
CharMenu.prototype.getCharY = function (e) {
    return e
};
CharMenu.prototype.update = function (t) {
    Menu.prototype.update.call(this, t);
    if (this.char.isVisible()) {
        this.char.update(t);
    }
    if (this.setCharIn > 0 && (!this.char.isPlaying || !this.char.isVisible())) {
        this.setCharIn -= t;
        if (this.setCharIn <= 0) {
            this.showHero(this.isInitHeroShow);
            this.isInitHeroShow = false
        }
    }
    if (this.char.currentFrame == 114)this.char.setVisible(false);
    if (this.lookBackIn > 0) {
        this.lookBackIn -= t;
        if (this.lookBackIn <= 0) {
            if (!this.char.isPlaying) {
                this.char.gotoAndPlay(this.lookId == 0 ? 161 : this.lookId == 1 ? 241 : 354);
                this.setCharLookTime()
            } else this.lookBackIn = .01
        }
    } else {
        this.charLookIn -= t;
        var n = this.char.currentFrame;
        if (this.charLookIn <= 0 && (n >= 49 && n <= 51 || n <= 105 && n >= 103)) {
            var r = this.lookId;
            while (r == this.lookId)r = getInt(3);
            this.char.gotoAndPlay(r == 0 ? 115 : r == 1 ? 199 : 286);
            this.lookBackIn = lerp(1.5, 3.5, Math.random());
            this.lookId = r
        }
    }
};


/**
 *  ===============================================================================================
 */
var MainMenu = CharMenu.extend({
    ctor: function () {
        this._super();
        var that = this;
        this.heroPositions = [
            [129, 983, 0],
            [665, 698, -44],
            [659, 239, -119],
            [165, -16, -180],
            [-17, 389, 118],
            [-17, 735, 69]
        ];
        this.blinks = [];
        this.blinksDelays = [];
        this.prevHeroId = -1;
        this.blinkData = [
            [392.6, 441.1, 1, 1],
            [422.4, 369.55, 1.1253662109375, 1.1253662109375],
            [480.35, 505.1, 1.0650634765625, 1.0650634765625],
            [496.1, 545.5, 1.0650634765625, 1.0650634765625],
            [372, 543.9, 1.499755859375, 1.499755859375],
            [339.5, 505.7, 1.002532958984375, 1.002532958984375],
            [282.35, 531.05, 1.3023529052734375, 1.3023529052734375],
            [584.75, 547.8, 1.3023529052734375, 1.3023529052734375],
            [524.35, 522.6, .9369049072265625, .9369049072265625],
            [440.6, 477.95, .9369049072265625, .9369049072265625],
            [376.25, 596.65, 1.0650634765625, 1.0650634765625],
            [439.35, 636.85, 1.0650634765625, 1.0650634765625],
            [435.65, 593.3, .72271728515625, .72271728515625],
            [198.05, 605.65, 1.0650634765625, 1.0650634765625],
            [274, 416, 1.0650634765625, 1.0650634765625],
            [588.45, 478, .7136383056640625, .7136383056640625],
            [459.05, -135.35, 1, 1]
        ];
        var root = cc.Node.create();
        this.sprite = root;
        this.sprite.retain();
        this.back = createBitmap("main_menu");
        this.back.setAnchorPoint(cc.p(0, 0));
        root.addChild(this.back);
        var len = this.blinkData.length;
        for (var i = 0; i < len; ++i) {
            var oneBlinkData = this.blinkData[i];
            var animNode = new AnimatedNode(AnimationManager.instance.getAnimation("gloss_anim"), 1 / 30, null);
            root.addChild(animNode);
            animNode.setPosition(cc.p(oneBlinkData[0], App.WIN_H - oneBlinkData[1]));
            animNode.setScaleX(oneBlinkData[2]);
            animNode.setScaleY(oneBlinkData[3]);
            this.blinks.push(animNode);
            animNode.runAction(cc.RepeatForever.create(cc.RotateBy.create(0.5, 180)));
            animNode.setVisible(false);
            animNode.stop();
            animNode.addAction(animNode.totalFrames - 1, 0, -1);
            this.blinksDelays.push(this.getBlinkDelay(true))
        }
        if (App.episode == 2) {
            this.crossButton = createSpriteFromSpritesheet("play_episode1");
            root.addChild(this.crossButton);
        }
        this.logo = new AnimatedNode(AnimationManager.instance.getAnimation("logo"), 1 / 30, null);
        var smallLogo = createSpriteFromSpritesheet(App.episode <= 1 ? "logo_ep1" : "logo_ep2");
        smallLogo.setPosition(cc.p(440, 85));
        this.logo.getPart(0).addChild(smallLogo);
        root.addChild(this.char);
        this.button = new AnimatedNode(AnimationManager.instance.getAnimation("button"), 1 / 30, null);
        root.addChild(this.button);
        this.button.addAction(97, 0, 0);
        this.button.addAction(106, 0, -1);
        this.button.addAction(this.button.totalFrames - 1, 1, 0);
        var playBtn = new ClickableObject(this.button);
        playBtn.setCircle(120, 0, 0);
        playBtn.callback = function () {
            trace("play Game click!");
            that.onPlayDown();
        };
        this.clickables.push(playBtn);
        var soundBtn1 = new SoundButton(true, root, 570, 115 - 50);
        this.animatedButtons.push(soundBtn1);
        this.clickables.push(soundBtn1);
        var soundBtn2 = new SoundButton(false, root, 570, 215 - 50);
        this.animatedButtons.push(soundBtn2);
        this.clickables.push(soundBtn2);
        var creditBtn = new ButtonObject(4, function (e) {
            that.loadCredits(e)
        }, this.sprite, 350 + 35, 115 - 10);
        this.animatedButtons.push(creditBtn);
        this.clickables.push(creditBtn);
        root.addChild(this.logo);
        this.moreGames = new MoreGamesButton(root, App.GAME_W / 2, 0, 1);
        this.clickables.push(this.moreGames);
        if (this.crossButton) {
            var a = new ClickableObject(this.crossButton);
            a.setCircle(85, 0, 0);
            a.callback = function () {
                that.onEpisodeDown()
            };
            this.clickables.push(a)
        }
        this.onResize()
    }
});
MainMenu.prototype.onEpisodeDown = function () {
//        if (this.crossButton) {
//            createjs.Tween.get(this.crossButton, {loop: false}).wait(0).to({scaleX: 1.15, scaleY: 1.15}, 150, createjs.Ease.quadOut).to({scaleX: 1, scaleY: 1}, 150, createjs.Ease.quadIn);
//            window.open("http://www.zibbo.com/", "_blank")
//        }
};
MainMenu.prototype.loadCredits = function (e) {
    MenuManager.instance.credits.show();
};
MainMenu.prototype.getCharY = function (y) {
    return 20;
};
MainMenu.prototype.getHeroPosData = function (e) {
    var t = this.prevHeroId;
    if (e)t = 0; else {
        while (t == this.prevHeroId)t = getInt(this.heroPositions.length)
    }
    this.prevHeroId = t;
    var n = this.heroPositions[t];
    return n
};
MainMenu.prototype.getBlinkDelay = function (e) {
    if (typeof e === "undefined") {
        e = false
    }
    return lerp(e ? 0 : 6, 16, Math.random())
};
MainMenu.prototype.onPlayDown = function () {
    try {
        this.button.gotoAndPlay(99);
        MenuManager.instance.show(MenuManager.instance.map);
        SoundsManager.instance.playSound("play_button")
    } catch (e) {
        trace("play down " + e)
    }
};
MainMenu.prototype.onResize = function () {
    CharMenu.prototype.onResize.call(this);
    this.logo.setPosition(cc.p(22, App.WIN_H - 75));
    this.button.setPosition(cc.p(401, 245));
    for (var i = 1; i <= 3; ++i) {
        this.clickables[i].sprite.setPositionX(525 + (i - 2) * 75);
        this.clickables[i].sprite.setPositionY(App.FULL_SCREEN_H - 66);
        this.clickables[i].sprite.setScale(i == 3 ? .75 : .75);
        this.clickables[i].updateRectScale();
    }
    if (this.moreGames.sprite) {
        this.moreGames.sprite.setPositionX(this.button.getPositionX() + 115);
        this.moreGames.sprite.setPositionY(this.button.getPositionY() + 50);
    }
    if (this.crossButton) {
        this.crossButton.setPosition(cc.p(110, 285));
    }
};
MainMenu.prototype.show = function () {
    CharMenu.prototype.show.call(this);
    this.button.gotoAndPlay(0);
    this.setPlayButtonTime(true)
};
MainMenu.prototype.hide = function () {
    CharMenu.prototype.hide.call(this)
};
MainMenu.prototype.setPlayButtonTime = function (e) {
    if (typeof e === "undefined") {
        e = false
    }
    if (this.button.currentFrame != 106)this.button.gotoAndPlay(e ? 130 : 0);
    this.playButtonIn = lerp(5, 12, Math.random())
};
MainMenu.prototype.update = function (t) {
    CharMenu.prototype.update.call(this, t);
    this.logo.update(t);
    this.button.update(t);
    this.playButtonIn -= t;
    if (this.playButtonIn <= 0 && !this.button.isPlaying)this.setPlayButtonTime();
    var len = this.blinks.length;
    for (var i = 0; i < len; ++i) {
        var sp = this.blinks[i];
        if (!sp.isPlaying) {
            this.blinksDelays[i] -= t;
            if (this.blinksDelays[i] <= 0) {
                this.blinksDelays[i] = this.getBlinkDelay();
                sp.gotoAndPlay(0)
            }
        } else {
            sp.update(t);
        }
        sp.setVisible(sp.isPlaying);
    }
};


/**
 * ===============================================================================================
 */
var TransitionMenu = Menu.extend({
    ctor: function () {
        this._super();
        this.isActive = false;
        this.direction = 2;
        this.moveProgress = -1;
        this.radius = 450 * .7;
        this.angleSpeed = 0;
        this.levelToLoad = -1;
        this.hasDoneAction = false;
        this.firstUpdate = false;
        var sp = createSpriteFromSpritesheet("menu_transfer");
        sp.setPosition(cc.p(App.WIN_W / 2, App.WIN_H / 2));
        this.sprite = sp
        this.sprite.retain();
    }
});
TransitionMenu.prototype.onResize = function () {
};
/**
 *
 * @param targetMenu
 * @param levelToLoad并不一定都是开始关卡的
 */
TransitionMenu.prototype.play = function (targetMenu, levelToLoad) {
    if (typeof targetMenu === "undefined") {
        targetMenu = null
    }
    if (typeof levelToLoad === "undefined") {
        levelToLoad = -1
    }
    this.hasDoneAction = false;
    this.menuToShow = targetMenu;
    this.levelToLoad = levelToLoad;
    this.isActive = true;
    App.menuRoot.addChild(this.sprite, menuZOrder + 1);
    var n = this.direction;
    while (n == this.direction)n = getInt(2);
    this.direction = n;
    this.moveProgress = 0;
    this.angleSpeed = 300 * (n == 1 || n == 2 ? 1 : -1);
    this.update(0);
    this.firstUpdate = true;
    this.zorder = 100;
    SoundsManager.instance.playSound("transition");
};
TransitionMenu.prototype.update = function (dt) {
    Menu.prototype.update.call(this, dt);
    if (!this.isActive)return;
    if (this.firstUpdate) {
        this.firstUpdate = false;
        dt = 1 / 60
    }
    this.moveProgress += dt / .7;
    var n = this.moveProgress >= 1;
    this.moveProgress = limit(this.moveProgress, 0, 1);
    if (this.moveProgress >= .5 && (this.menuToShow || this.levelToLoad >= 0) && !this.hasDoneAction) {
        this.doAction()
    }
    var r = Math.sqrt(App.ACTUAL_H * App.ACTUAL_H + App.GAME_W * App.GAME_W);
    this.sprite.setScale(r / this.radius);
    this.sprite.setRotation(this.sprite.getRotation() + this.angleSpeed * dt);
    var i = r / 2;
    switch (this.direction) {
        case 1:
            this.sprite.setPositionX(lerp(-i, App.GAME_W + i, this.moveProgress));
            this.sprite.setPositionY(App.FULL_SCREEN_H / 2);
            break;
        case 0:
            this.sprite.setPositionX(lerp(App.GAME_W + i, -i, this.moveProgress));
            this.sprite.setPositionY(App.FULL_SCREEN_H / 2);
            break;
        case 2:
            this.sprite.setPositionX(App.GAME_W / 2);
            this.sprite.setPositionY(lerp(App.ACTUAL_H + (App.FULL_SCREEN_H - App.ACTUAL_H) / 2 + i, (App.FULL_SCREEN_H - App.ACTUAL_H) / 2 - i, this.moveProgress));
            break;
        case 3:
            this.sprite.setPositionX(App.GAME_W / 2);
            this.sprite.setPositionY(lerp(App.ACTUAL_H + (App.FULL_SCREEN_H - App.ACTUAL_H) / 2 + i, (App.FULL_SCREEN_H - App.ACTUAL_H) / 2 - i, 1 - this.moveProgress));
            break
    }
    if (n)this.stopMove()
};
TransitionMenu.prototype.doAction = function () {
    if (!this.hasDoneAction) {
        this.hasDoneAction = true;
        if (this.menuToShow) {
            if ((this.menuToShow == MenuManager.instance.map || this.menuToShow == MenuManager.instance.mainMenu) && Match3Level.instance.isActive) {
                Match3Level.instance.reset();
            }
            MenuManager.instance.show(this.menuToShow, false);
        } else {
            MenuManager.instance.closeCurrent();
            LevelManager.instance.loadLevel(this.levelToLoad)
        }
        this.levelToLoad = -1;
        this.menuToShow = null
    }
};
TransitionMenu.prototype.stopMove = function () {
    if (!this.hasDoneAction)this.doAction();
    this.sprite.removeFromParent();
    this.isActive = false
};
TransitionMenu.WIDTH = 330;
TransitionMenu.HEIGHT = 328;


/**
 * ===============================================================================================
 */
var WinMenu = CharMenu.extend({
    ctor: function () {
        this._super();
        var that = this;
        this.stars = [];
        this.starAmount = 3;
        this.starsShowedAmount = 0;
        this.shines = [];
        this.starData = [
            [234, 199, 6.8, .82],
            [350, 208, 0, 1],
            [492, 204, -8, 1.25]
        ];
        this.starShowLeft = 0;
        var root = cc.Node.create();
        this.sprite = root;
        this.sprite.retain();
        root.setPositionY(App.GAME_H - 300);
        var gray = createSpriteFromSpritesheet("gray");
        gray.setAnchorPoint(cc.p(0, 0));
        var rect = gray.getBoundingBox();
        gray.setScaleX((100 + App.WIN_W) / rect.width);
        gray.setScaleY((80 + App.WIN_H) / rect.height);
        gray.setPosition(cc.p(-50, -root.getPositionY() - 40));
        this.grayBack = gray;
        root.addChild(gray);
        var s = createBitmap("menu_back");
        s.setAnchorPoint(cc.p(0, 0));
        root.addChild(s);
        var r = createSpriteFromSpritesheet("Victory");
        r.setPosition(cc.p(App.WIN_W / 2 + 20, 200));
        root.addChild(r);
        var sp = createSpriteFromSpritesheet("star_back");
        sp.setAnchorPoint(cc.p(0, 0));
        sp.setPosition(cc.p(159, 0));
        root.addChild(sp);
        for (var i = 0; i < this.starData.length; ++i) {
            sp = createSpriteFromSpritesheet("star_glow");
            var u = this.starData[i];
            sp.setPosition(cc.p(u[0], 227 - u[1]));
            sp.setScale(1.4 * u[3] / .82);
            root.addChild(sp);
            this.shines.push(sp)
        }
        for (var i = 0; i < this.starData.length; ++i) {
            sp = createSpriteFromSpritesheet("star");
            var u = this.starData[i];
            sp.setPosition(u[0], 227 - u[1]);
            sp.setRotation(u[2]);
            sp.setScale(u[3]);
            root.addChild(sp);
            this.stars.push(sp)
        }
        root.addChild(this.char);
        this.button = new AnimatedNode(AnimationManager.instance.getAnimation("button"), 1 / 30, null);
        root.addChild(this.button);
        this.button.addAction(97, 0, 0);
        this.button.addAction(106, 0, -1);
        this.button.setPosition(cc.p(450, -140));
        this.button.setScale(0.75);
        this.button.addAction(this.button.totalFrames - 1, 1, 0);
        var a = new ClickableObject(this.button);
        a.setCircle(120 * this.button.getScaleX(), 0, 0);
        a.callback = function () {
            that.onPlayDown()
        };
        this.clickables.push(a);
        var f = new ButtonObject(5, function (e) {
            that.restarAndUnlock(e)
        }, root, App.GAME_W / 2, -258);
        this.animatedButtons.push(f);
        this.clickables.push(f)
    }
});
WinMenu.prototype.restarAndUnlock = function (e) {
    LevelManager.instance.restartLoadNextLevel();
    this.restartLevel(e)
};
WinMenu.prototype.onPlayDown = function () {
    try {
        this.button.gotoAndPlay(99);
        if (!MenuManager.instance)new MenuManager;
        LevelManager.instance.loadNextLevel();
        SoundsManager.instance.playSound("pause");
    } catch (e) {
        trace("play down2 " + e)
    }
};
WinMenu.prototype.setStarData = function (e) {
    this.starAmount = e
};
WinMenu.prototype.getHeroPosData = function (e) {
    return[100, -80, 0]
};
WinMenu.prototype.show = function () {
    var that = this;
    CharMenu.prototype.show.call(this);
    this.starsShowedAmount = 0;
    this.grayBack.setOpacity(0);
    this.grayBack.runAction(cc.FadeIn.create(0.3));
    for (var i = 0; i < this.stars.length; ++i) {
        var sp = this.stars[i];
        sp.setVisible(false);
        this.shines[i].setVisible(false);
        sp.stopAllActions();
        this.shines[i].stopAllActions();
    }
    this.starShowLeft = this.starAmount;
    for (var i = 0; i < this.starAmount; ++i) {
        sp = this.stars[i];
        sp.setVisible(true);
        sp.setOpacity(0);
        sp.setScale(2);
        var scale = this.starData[i][3];
        var delay = (500 + i * 500);
        sp.runAction(cc.Sequence.create(
            cc.DelayTime.create(delay/1000),
            cc.Spawn.create(cc.FadeIn.create(0.2), cc.ScaleTo.create(0.2, scale)),
            cc.CallFunc.create(function () {
                that.stopStarMove();
            })
        ));
        if (sp.isVisible()) {
            SoundsManager.instance.playSound("star" + (i + 1), delay)
        }
    }
    if (this.scoreText) {
        this.scoreText.removeFromParent();
    }
    this.scoreText = bitmapText(Match3Level.instance.score.toString(), RED_FONT);
    this.scoreText.setAnchorPoint(cc.p(0, 0.5));
    this.sprite.addChild(this.scoreText);
    this.scoreText.setPosition(cc.p(340, 144));
    this.setCharIn = .1;
    this.setPlayButtonTime(true);
    this.button.gotoAndPlay(0);
    SoundsManager.instance.pauseMusic();
    SoundsManager.instance.playSound("win");
};
WinMenu.prototype.setPlayButtonTime = function (e) {
    if (typeof e === "undefined") {
        e = false
    }
    if (this.button.currentFrame != 106)this.button.gotoAndPlay(e ? 130 : 0);
    this.playButtonIn = lerp(5, 12, Math.random())
};
WinMenu.prototype.hide = function () {
    CharMenu.prototype.hide.call(this);
    SoundsManager.instance.resumeMusic()
};
WinMenu.prototype.stopStarMove = function () {
    var sp = this.shines[this.starsShowedAmount];
    sp.setVisible(true);
    sp.setRotation(0);
    sp.setOpacity(255);
    sp.runAction(cc.FadeOut.create(0.6));
    sp.runAction(cc.RotateTo.create(0.6, 90));
    this.starsShowedAmount++;
    this.starShowLeft--;
    if (this.starShowLeft <= 0) {
        //TODO  添加广告
//        App.instance.showAds()
    }
};
WinMenu.prototype.update = function (t) {
    CharMenu.prototype.update.call(this, t);
    this.button.update(t);
    this.playButtonIn -= t;
    if (this.playButtonIn <= 0 && !this.button.isPlaying)this.setPlayButtonTime()
};


/**
 * ====================================================================================
 * @type {void|Function|*}
 */
var SplashScreen = Menu.extend({
    ctor: function () {
        this._super();
        var root = cc.Node.create();
        var sp = createSpriteFromSpritesheet("white");
        sp.setScaleX((100 + App.WIN_W) / 50);
        sp.setScaleY((100 + App.WIN_H) / 50);
        sp.setAnchorPoint(cc.p(0, 0));
        sp.setPosition(cc.p(-50, -50));
        root.addChild(sp);
        this.sprite = root;
        this.sprite.retain();
        var logo = createBitmap("zibbo_logo");
        root.addChild(logo);
        logo.setPosition(cc.p(App.WIN_W / 2, App.WIN_H / 2 + 60));
        this.logo = logo;
    }
});

SplashScreen.prototype.show = function () {
    var that = this;
    Menu.prototype.show.call(this);
    this.logo.stopAllActions();
    this.logo.setScale(0.85);
    this.logo.runAction(cc.Sequence.create(
        cc.DelayTime.create(0.1),
        cc.ScaleTo.create(0.3, 1.2),
        cc.ScaleTo.create(0.4, 1),
        cc.CallFunc.create(function () {
            that.onAnimEnd();
        })
    ))
};
SplashScreen.prototype.onAnimEnd = function () {
    MenuManager.instance.show(MenuManager.instance.mainMenu, true);
};