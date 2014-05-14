//
// CleanerScoreScene class
//
var LoaderLayer = function () {
    cc.log("LoaderLayer")
};

LoaderLayer.prototype.onDidLoadFromCCB = function () {
//    this.rootNode.onUpdate = function (dt)
//    {
//        this.controller.onUpdate();
//    };
//    this.rootNode.schedule(this.rootNode.onUpdate);

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
};

LoaderLayer.prototype.onEnter = function () {


    var size = cc.Director.getInstance().getWinSize();
    App.WIN_W = size.width;
    App.WIN_H = size.height;
    App.VIEW_BOTTOM = (App.WIN_H - App.GAME_H) / 2;
    App.VIEW_TOP = App.WIN_H - App.VIEW_BOTTOM;
    App.SHIFT_H = App.VIEW_BOTTOM;


    var preloader = new Preloader(this.startGame);
    this.rootNode.addChild(preloader);
}

LoaderLayer.prototype.startGame = function () {
    cc.BuilderReader.runScene("", "MainLayer");
}

LoaderLayer.prototype.onUpdate = function () {

}

LoaderLayer.prototype.onExit = function () {
    this.rootNode.removeAllChildren();
}
