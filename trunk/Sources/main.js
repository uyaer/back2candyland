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
    {type: 'image', src: "myassets/back1.png"},
    {type: 'image', src: "myassets/back2.png"},
    {type: 'image', src: "myassets/bar.png"},
    {type: 'image', src: "myassets/logo_top.png"},
    {type: 'image', src: "myassets/main_menu.png"},
    {type: 'image', src: "myassets/main_menu_ep2.png"},
    {type: 'image', src: "myassets/menu_back.png"},
    {type: 'text', src: "myassets/button.txt"},
    {type: 'text', src: "myassets/buttons_pause_anim.txt"},
    {type: 'text', src: "myassets/Char_lose.txt"},
    {type: 'text', src: "myassets/Char_win.txt"},
    {type: 'text', src: "myassets/gloss_anim.txt"},
    {type: 'text', src: "myassets/logo.txt"},
    {type: 'text', src: "myassets/pointer.txt"},
    {type: 'image', src: "myassets/map/map_ep1_1.png"},
    {type: 'image', src: "myassets/map/map_ep1_2.png"},
    {type: 'image', src: "myassets/map/map_ep1_3.png"},
    {type: 'image', src: "myassets/preloader/circle.png"},
    {type: 'image', src: "myassets/preloader/play.png"},
    {type: 'image', src: "myassets/preloader/preloader_back.png"},
    {type: 'image', src: "myassets/preloader/progress_bar_top.png"},
    {type: 'image', src: "myassets/preloader/zibbo_logo.png"},
    {type: 'sound', src: "myassets/sound/bonus_bomb.ogg"},
    {type: 'sound', src: "myassets/sound/bonus_color.ogg"},
    {type: 'sound', src: "myassets/sound/bonus_line.ogg"},
    {type: 'sound', src: "myassets/sound/bonus_set.ogg"},
    {type: 'sound', src: "myassets/sound/bonus_show.ogg"},
    {type: 'sound', src: "myassets/sound/btcl_main_music.ogg"},
    {type: 'sound', src: "myassets/sound/button.ogg"},
    {type: 'sound', src: "myassets/sound/cake_down.ogg"},
    {type: 'sound', src: "myassets/sound/choco_crash.ogg"},
    {type: 'sound', src: "myassets/sound/color_crash.ogg"},
    {type: 'sound', src: "myassets/sound/cookie_crash.ogg"},
    {type: 'sound', src: "myassets/sound/fail.ogg"},
    {type: 'sound', src: "myassets/sound/hero_hide.ogg"},
    {type: 'sound', src: "myassets/sound/hero_show.ogg"},
    {type: 'sound', src: "myassets/sound/pause.ogg"},
    {type: 'sound', src: "myassets/sound/play_button.ogg"},
    {type: 'sound', src: "myassets/sound/pointer.ogg"},
    {type: 'sound', src: "myassets/sound/remove1.ogg"},
    {type: 'sound', src: "myassets/sound/remove2.ogg"},
    {type: 'sound', src: "myassets/sound/remove3.ogg"},
    {type: 'sound', src: "myassets/sound/remove4.ogg"},
    {type: 'sound', src: "myassets/sound/star1.ogg"},
    {type: 'sound', src: "myassets/sound/star2.ogg"},
    {type: 'sound', src: "myassets/sound/star3.ogg"},
    {type: 'sound', src: "myassets/sound/stop_move.ogg"},
    {type: 'sound', src: "myassets/sound/transition.ogg"},
    {type: 'sound', src: "myassets/sound/win.ogg"},
    {type: 'image', src: "myassets/tutorial/t1.png"},
    {type: 'image', src: "myassets/tutorial/t2.png"},
    {type: 'image', src: "myassets/tutorial/t3.png"},
    {type: 'image', src: "myassets/tutorial/t4.png"},
    {type: 'image', src: "myassets/tutorial/t5.png"},
    {type: 'image', src: "myassets/tutorial/t6.png"},
    {type: 'image', src: "myassets/tutorial/t7.png"},
    {type: 'image', src: "fonts/redFont.png"},
    {type: 'image', src: "fonts/blueFont.png"},
    {type: 'fnt', src: "fonts/redFont.fnt"},
    {type: 'fnt', src: "fonts/blueFont.fnt"},
];

require("JSBHelper.js");
require("md5.js");

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
            cc.FileUtils.getInstance().addSearchPath("myassets");
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
    cc.FileUtils.getInstance().addSearchPath("myassets");
    cc.FileUtils.getInstance().addSearchPath("fonts");
    cc.FileUtils.getInstance().addSearchPath("sprites");
    cc.Director.getInstance().runWithScene(LoaderLayer.getScene());
}