//
// CleanerScoreScene class
//
var MainLayer = function () {
    cc.log("MainLayer");

    this.borderNode = this.borderNode || cc.Node.create();
    this.bottom = this.bottom || cc.Node.create();
    this.top = this.top || cc.Node.create();
};

MainLayer.prototype.onDidLoadFromCCB = function () {
    if (sys.platform == 'browser') {
        this.onEnter();
    }
    else {
        this.rootNode.onEnter = function () {
            this.controller.onEnter();
        };
    }

    this.rootNode.onExit = function () {
        this.controller.onExit();
    };

    this.rootNode.onTouchBegan = function (touch, event) {
        var pos = touch.getLocation();
        if (MenuManager.instance.current == MenuManager.instance.map) {
            MenuManager.instance.map.onPressDown(pos);
        }
        return true;
    }
    this.rootNode.onTouchMoved = function (touch, event) {
        var pos = touch.getLocation();
        if (MenuManager.instance.current == MenuManager.instance.map) {
            MenuManager.instance.map.onPressMove(pos);
        }
    }

    this.rootNode.onTouchEnded = function (touch, event) {
        var pos = touch.getLocation();
        if (MenuManager.instance.credits.isMenuActive) { //假如打开了关于我们，则点击事件被吞噬
            MenuManager.instance.credits.onDown(pos.x, pos.y);
            return;
        }
        if (MenuManager.instance.current) {
            MenuManager.instance.current.onDown(pos.x, pos.y);
            if (MenuManager.instance.current == MenuManager.instance.map) {
                MenuManager.instance.map.onPressUp(pos);
                MenuManager.instance.map.onClick(pos);
            }
        } else if (Match3Level.instance) {
            Match3Level.instance.onMouseDown(pos.x, pos.y);
        }
    }

    this.rootNode.update = function (dt) {
        MenuManager.instance.update(dt);
    }

    this.rootNode.backClicked = function () {
        trace(" back clicked!!!! ");
        if (MenuManager.instance.isOnTutorial())return;
        if (Match3Level.instance.target) { //肯定在玩游戏中
            if (Match3Level.instance.isPaused) { //已经暂停了
                MenuManager.instance.pause.onPlayDown();
            } else {
                this.controller.onPauseClick();
            }
        } else {
            if (MenuManager.instance.isOnMap()) {
                MenuManager.instance.map.loadMain();
            } else if (MenuManager.instance.isOnMain()) {
                cc.Director.getInstance().end();
            }
        }
    }
};

MainLayer.prototype.onEnter = function () {
    new MenuManager();

    App.menuRoot = this.rootNode;
    if (!App.isShowSplashScreen) {
        App.isShowSplashScreen = true;
        MenuManager.instance.show(MenuManager.instance.splashMenu, false);
//        MenuManager.instance.show(MenuManager.instance.winMenu, false);
    }


    //设置背景
    var bgSp = createBitmap("back1");
    bgSp.setAnchorPoint(cc.p(0, 0));
    bgSp.setPosition(cc.p(0, App.SHIFT_H + 20));
    this.rootNode.addChild(bgSp, 0);

    //border
    this.borderNode.setZOrder(borderZOrder);
    this.borderNode.setPositionY(App.SHIFT_H - 20);
    //上下背景
    this.bottom.setPositionY(App.VIEW_BOTTOM);
    this.top.setPositionY(App.VIEW_TOP);
    this.bottom.setZOrder(borderZOrder + 1);
    this.top.setZOrder(borderZOrder + 1);
    //hud
    this.hud = new Hud(this);
    this.rootNode.addChild(this.hud.sprite, borderZOrder);

    var levelMatch = new Match3Level(this.hud);
    this.rootNode.addChild(levelMatch, levelZOrder);

    this.rootNode.scheduleUpdate();
    this.rootNode.setTouchMode(cc.TOUCH_ONE_BY_ONE);
    this.rootNode.setTouchEnabled(true);
    this.rootNode.setTouchPriority(-1);

    if (sys.os.toLowerCase() == "android") {
        this.rootNode.setKeyboardEnabled(true);
    }
}

MainLayer.prototype.onPauseClick = function () {
    this.hud.pauseLevel();
}

MainLayer.prototype.onExitClicked = function () {
    cc.log("onExitClicked");
}


MainLayer.prototype.onExit = function () {
    cc.log("onExit");
}

