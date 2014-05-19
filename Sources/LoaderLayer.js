var LoaderLayer = cc.Layer.extend({
    ctor: function () {
        this._super();
        this.init();
    },
    init: function () {
        SoundsManager.instance.stopAll();

        var size = cc.Director.getInstance().getWinSize();
        App.WIN_W = size.width;
        App.WIN_H = size.height;
        App.VIEW_BOTTOM = (App.WIN_H - App.GAME_H) / 2;
        App.VIEW_TOP = App.WIN_H - App.VIEW_BOTTOM;
        App.SHIFT_H = App.VIEW_BOTTOM;

        App.isShowSplashScreen = false;

        var preloader = new Preloader(this.startGame);
        this.addChild(preloader);
    },
    startGame: function () {
        cc.BuilderReader.runScene("", "MainLayer");
    }
});

LoaderLayer.getScene = function () {
    var scene = cc.Scene.create();
    var layer = new LoaderLayer();
    scene.addChild(layer);
    return scene;
}
