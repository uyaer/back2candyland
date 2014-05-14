if (sys.platform == 'browser') {
    var require = function (file) {
        var d = document;
        var s = d.createElement('script');
        s.src = file;
        d.body.appendChild(s);
    }
} else {
    require("jsb.js");
}

cc.debug = function (msg) {
    cc.log(msg);
}

cc.BuilderReader.replaceScene = function (path, ccbName) {
    var scene = cc.BuilderReader.loadAsSceneFrom(path, ccbName);
    cc.Director.getInstance().replaceScene(scene);
    return scene;
}

cc.BuilderReader.loadAsScene = function (file, owner, parentSize) {
    var node = cc.BuilderReader.load(file, owner, parentSize);
    var scene = cc.Scene.create();
    scene.addChild(node);
    return scene;
};

cc.BuilderReader.loadAsSceneFrom = function (path, ccbName) {
    if (path && path.length > 0) {
        cc.BuilderReader.setResourcePath(path + "/");
        return cc.BuilderReader.loadAsScene(path + "/" + ccbName);
    }
    else {
        return cc.BuilderReader.loadAsScene(ccbName);
    }
}

cc.BuilderReader.loadAsNodeFrom = function (path, ccbName, owner) {
    if (path && path.length > 0) {
        cc.BuilderReader.setResourcePath(path + "/");
        return cc.BuilderReader.load(path + "/" + ccbName, owner);
    }
    else {
        return cc.BuilderReader.load(ccbName, owner);
    }
}

cc.BuilderReader.runScene = function (module, name) {
    var director = cc.Director.getInstance();
    var scene = cc.BuilderReader.loadAsSceneFrom(module, name);
    var runningScene = director.getRunningScene();
    if (runningScene === null) {
        //cc.log("runWithScene");
        director.runWithScene(scene);
        director.setDisplayStats(true);
    }
    else {
        //cc.log("replaceScene");
        director.replaceScene(scene);
    }
}

var ccb_resources = [
    {type: 'plist', src: "sprites/art.plist"},
    {type: 'image', src: "sprites/art.png"},
    {type: 'image', src: "assets/back1.png"},
    {type: 'image', src: "assets/back2.png"},
    {type: 'image', src: "assets/bar.png"},
    {type: 'image', src: "assets/logo_top.png"},
    {type: 'image', src: "assets/main_menu.png"},
    {type: 'image', src: "assets/main_menu_ep2.png"},
    {type: 'image', src: "assets/menu_back.png"},
    {type: 'text', src: "assets/button.txt"},
    {type: 'text', src: "assets/buttons_pause_anim.txt"},
    {type: 'text', src: "assets/Char_lose.txt"},
    {type: 'text', src: "assets/Char_win.txt"},
    {type: 'text', src: "assets/gloss_anim.txt"},
    {type: 'text', src: "assets/logo.txt"},
    {type: 'text', src: "assets/pointer.txt"},
    {type: 'image', src: "assets/map/map_ep1_1.png"},
    {type: 'image', src: "assets/map/map_ep1_2.png"},
    {type: 'image', src: "assets/map/map_ep1_3.png"},
    {type: 'image', src: "assets/preloader/circle.png"},
    {type: 'image', src: "assets/preloader/play.png"},
    {type: 'image', src: "assets/preloader/preloader_back.png"},
    {type: 'image', src: "assets/preloader/progress_bar_top.png"},
    {type: 'image', src: "assets/preloader/zibbo_logo.png"},
    {type: 'sound', src: "assets/sound/bonus_bomb.ogg"},
    {type: 'sound', src: "assets/sound/bonus_color.ogg"},
    {type: 'sound', src: "assets/sound/bonus_line.ogg"},
    {type: 'sound', src: "assets/sound/bonus_set.ogg"},
    {type: 'sound', src: "assets/sound/bonus_show.ogg"},
    {type: 'sound', src: "assets/sound/btcl_main_music.ogg"},
    {type: 'sound', src: "assets/sound/button.ogg"},
    {type: 'sound', src: "assets/sound/cake_down.ogg"},
    {type: 'sound', src: "assets/sound/choco_crash.ogg"},
    {type: 'sound', src: "assets/sound/color_crash.ogg"},
    {type: 'sound', src: "assets/sound/cookie_crash.ogg"},
    {type: 'sound', src: "assets/sound/fail.ogg"},
    {type: 'sound', src: "assets/sound/hero_hide.ogg"},
    {type: 'sound', src: "assets/sound/hero_show.ogg"},
    {type: 'sound', src: "assets/sound/pause.ogg"},
    {type: 'sound', src: "assets/sound/play_button.ogg"},
    {type: 'sound', src: "assets/sound/pointer.ogg"},
    {type: 'sound', src: "assets/sound/remove1.ogg"},
    {type: 'sound', src: "assets/sound/remove2.ogg"},
    {type: 'sound', src: "assets/sound/remove3.ogg"},
    {type: 'sound', src: "assets/sound/remove4.ogg"},
    {type: 'sound', src: "assets/sound/star1.ogg"},
    {type: 'sound', src: "assets/sound/star2.ogg"},
    {type: 'sound', src: "assets/sound/star3.ogg"},
    {type: 'sound', src: "assets/sound/stop_move.ogg"},
    {type: 'sound', src: "assets/sound/transition.ogg"},
    {type: 'sound', src: "assets/sound/win.ogg"},
    {type: 'image', src: "assets/tutorial/t1.png"},
    {type: 'image', src: "assets/tutorial/t2.png"},
    {type: 'image', src: "assets/tutorial/t3.png"},
    {type: 'image', src: "assets/tutorial/t4.png"},
    {type: 'image', src: "assets/tutorial/t5.png"},
    {type: 'image', src: "assets/tutorial/t6.png"},
    {type: 'image', src: "assets/tutorial/t7.png"},
    {type: 'image', src: "fonts/redFont.png"},
    {type: 'image', src: "fonts/blueFont.png"},
    {type: 'fnt', src: "fonts/redFont.fnt"},
    {type: 'fnt', src: "fonts/blueFont.fnt"},
];

require("App.js");
require("Data.js");
require("Utils.js");
require("GameObject.js");
require("AnimationManager.js");
require("AnimManager.js");
require("AnimatedNode.js");
require("Hud.js");
require("ObjectPool.js");
require("JumpText.js");
require("EndBonusIndicator.js");
require("TweenData.js");
require("Menu.js");
require("FieldObject.js");
require("SoundsManager.js");
require("Match3Level.js");
require("PauseLikeMenu.js");
require("MenuManager.js");
require("SinglePlayObject.js");
require("CellObject.js");
require("Preloader.js");
require("LevelData.js");
require("LevelTarget.js");
require("BonusIndicator.js");
require("ClickableObject.js");
require("GemDestroyAnimation.js");
require("LevelManager.js");
require("BonusDestroyAnimation.js");
require("Tutorial.js");
require("TutorialPage.js");


require("LoaderLayer.js");
require("MainLayer.js");

if (sys.platform == 'browser') {

    var Cocos2dXApplication = cc.Application.extend({
        config: document['ccConfig'],
        ctor: function () {
            this._super();
            cc.COCOS2D_DEBUG = this.config['COCOS2D_DEBUG'];
            cc.initDebugSetting();
            cc.setup(this.config['tag']);
            cc.AppController.shareAppController().didFinishLaunchingWithOptions();
        },
        applicationDidFinishLaunching: function () {
            cc.FileUtils.getInstance().addSearchPath("assets");
            cc.FileUtils.getInstance().addSearchPath("fonts");
            cc.FileUtils.getInstance().addSearchPath("sprites");
            var director = cc.Director.getInstance();
            // director->enableRetinaDisplay(true);
            // director.setDisplayStats(this.config['showFPS']);
            // set FPS. the default value is 1.0/60 if you don't call this
            director.setAnimationInterval(1.0 / this.config['frameRate']);
            var glView = director.getOpenGLView();
            glView.setDesignResolutionSize(1280, 720, cc.RESOLUTION_POLICY.SHOW_ALL);
            cc.Loader.preload(ccb_resources, function () {
                cc.BuilderReader.runScene("", "LoaderLayer");
            }, this);
            return true;
        }
    });
    var myApp = new Cocos2dXApplication();
} else {
    cc.FileUtils.getInstance().addSearchPath("assets");
    cc.FileUtils.getInstance().addSearchPath("fonts");
    cc.FileUtils.getInstance().addSearchPath("sprites");
    cc.BuilderReader.runScene("", "LoaderLayer");
}