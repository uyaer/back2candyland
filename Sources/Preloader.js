/**
 * Created by Administrator on 2014/5/6.
 */
var Preloader = cc.Layer.extend({
    ctor: function (onLoadOverCallback) {
        this._super();
        this.onLoadOverCallback = onLoadOverCallback;
        this.mainLoadingStarted = false;
        this.shownButton = false;
        this.loadedMain = false;
        Preloader.instance = this;
        this.barSize = cc.size(1, 1);
        this.loadResArr = [];
        this.loadTotalLen = 0;
        this.loadedCount = 0;
        this.isLoadOver = false;
        this.init();
    }
});

Preloader.prototype.onTouchesEnded = function (touches, event) {
    if (touches.length > 0) {
        var touch = touches[0];
        var pos = touch.getLocation();
        this.onDown(pos.x, pos.y);
    }
}

Preloader.prototype.init = function () {
    if (this.mainLoadingStarted)return;
    this.mainLoadingStarted = true;
    var that = this;

    this.setTouchEnabled(true);

    var sp = createBitmap("preloader_back");
    sp.setScale(1239 / 256);
    sp.setPosition(cc.p(App.WIN_W / 2, App.WIN_H / 2));
    this.addChild(sp);
    //line
    var line = cc.LayerColor.create(cc.c4b(255, 255, 255, 255), App.WIN_W / 2, 2);
    line.setContentSize(cc.size(App.WIN_W / 2, 2));
    line.setPosition(cc.p(App.WIN_W / 4, (App.WIN_H / 2 + 20)));
    this.addChild(line);

    //叶子
    var logo = createBitmap("progress_logo");
    logo.setAnchorPoint(cc.p(0, 0));
    logo.setPosition(cc.p(177, App.WIN_H / 2 + 20));
    this.addChild(logo);

    //txt
    var txt = createBitmap("progress_uyaer");
    txt.setAnchorPoint(cc.p(0.5, 1));
    txt.setPosition(cc.p(App.WIN_W / 2, App.WIN_H / 2 + 10));
    this.addChild(txt);

    var barBg = createBitmap("progress_bar_bg");
    barBg.setPosition(cc.p(App.WIN_W / 2, App.WIN_H / 2 + 20));
    barBg.setScaleY(2 / 39);
    barBg.setVisible(false);
    this.addChild(barBg);

    var barTop = createBitmap("progress_bar_top");
    this.addChild(barTop);
    barTop.setAnchorPoint(cc.p(0, 0.5));
    barTop.setPosition(cc.p((App.WIN_W - 451) / 2, App.WIN_H / 2 + 20));
    this.barSize = barTop.getContentSize();
    barTop.setVisible(false);
    this.bar = barTop;

    //play
    var playBtn = createBitmap("play");
    this.addChild(playBtn);
    playBtn.setPosition(cc.p(App.WIN_W / 2, App.WIN_H * 0.25 + 10));
    this.playButton = playBtn;
    this.playButton.setOpacity(0);


    var index = App.episode;
    var basePath = App.episode <= 1 ? "myassets/tutorial/" : "myassets/tutorial/episode2/";
    this.loadResArr = [
        {src: "myassets/preloader/zibbo_logo.png", type: Preloader.TYPE_TEXTURE},
        {src: ["myassets/map/map_ep1_3.png", "myassets/map/map_ep1_3.png", "myassets/map/map_ep2_3.png"][index], type: Preloader.TYPE_TEXTURE, id: "map3"},
        {src: ["myassets/map/map_ep1_2.png", "myassets/map/map_ep1_2.png", "myassets/map/map_ep2_2.png"][index], type: Preloader.TYPE_TEXTURE, id: "map2"},
        {src: ["myassets/map/map_ep1_1.png", "myassets/map/map_ep1_1.png", "myassets/map/map_ep2_1.png"][index], type: Preloader.TYPE_TEXTURE, id: "map1"},
        {src: "myassets/bar.png", type: Preloader.TYPE_TEXTURE},
        {src: "sprites/art.plist", type: Preloader.TYPE_PLIST},
        {src: App.episode == 2 ? "myassets/back2.png" : "myassets/back1.png", type: Preloader.TYPE_TEXTURE, id: "back1"},
        {src: App.episode != 2 ? "myassets/main_menu.png" : "myassets/main_menu_ep2.png", type: Preloader.TYPE_TEXTURE, id: "main_menu"},
        {src: "myassets/menu_back.png", type: Preloader.TYPE_TEXTURE},
        {src: "myassets/uyaer.png", type: Preloader.TYPE_TEXTURE},
        {src: "myassets/logo_top.png", type: Preloader.TYPE_TEXTURE},
        {src: "myassets/logo.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/button.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/Char_win.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/Char_lose.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/gloss_anim.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/buttons_pause_anim.txt", type: Preloader.TYPE_JSON},
        {src: "myassets/pointer.txt", type: Preloader.TYPE_JSON},
        {src: basePath + "t1.png", type: Preloader.TYPE_TEXTURE, id: "tutorial1"},
        {src: basePath + "t2.png", type: Preloader.TYPE_TEXTURE, id: "tutorial2"},
        {src: basePath + "t3.png", type: Preloader.TYPE_TEXTURE, id: "tutorial3"},
        {src: basePath + "t4.png", type: Preloader.TYPE_TEXTURE, id: "tutorial4"},
        {src: basePath + "t5.png", type: Preloader.TYPE_TEXTURE, id: "tutorial5"},
        {src: basePath + "t6.png", type: Preloader.TYPE_TEXTURE, id: "tutorial6"},
        {src: basePath + "t7.png", type: Preloader.TYPE_TEXTURE, id: "tutorial7"},
        {src: "myassets/sound/btcl_main_music", type: Preloader.TYPE_SOUND},
        {src: "myassets/sound/hero_show", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/hero_hide", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/win", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/fail", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/play_button", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/button", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/pause", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/transition", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/remove1", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/remove2", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/remove3", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/remove4", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/bonus_show", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/bonus_set", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/bonus_bomb", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/bonus_line", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/bonus_color", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/star1", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/pointer", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/star2", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/star3", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/cookie_crash", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/choco_crash", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/color_crash", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/cake_down", type: Preloader.TYPE_AUDIO},
        {src: "myassets/sound/stop_move", type: Preloader.TYPE_AUDIO},
        //字体的
        {src: "fonts/redFont.png", type: Preloader.TYPE_TEXTURE},
        {src: "fonts/blueFont.png", type: Preloader.TYPE_TEXTURE}
    ];

    this.loadTotalLen = this.loadResArr.length;
    this.loadedCount = 0;

    //run Animation
    logo.runAction(cc.MoveBy.create(0.5, cc.p(0, 16)));
    txt.runAction(cc.Sequence.create(
        cc.DelayTime.create(0.5),
        cc.MoveBy.create(0.5, cc.p(0, -35))
    ));
    line.runAction(cc.Sequence.create(
        cc.DelayTime.create(1),
        cc.Spawn.create(cc.ScaleTo.create(0.5, 455 / App.WIN_W / 2, 1), cc.TintTo.create(0.5, 0, 255, 0)),
        cc.CallFunc.create(function () {
            line.setVisible(false);
            barBg.setVisible(true);
            barBg.runAction(cc.Sequence.create(
                cc.ScaleTo.create(0.25, 1, 1),
                cc.CallFunc.create(function () {
                    barTop.setVisible(true);
                    that.load();
                })
            ));
        })
    ));

};
Preloader.prototype.load = function () {
    this.isLoadOver = false;
    if (this.loadResArr.length > 0) {
        this.loadedCount++;
        var resObj = this.loadResArr.splice(0, 1)[0];
        var url = resObj.src;
        var name = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
        if (resObj.id) name = resObj.id;
        switch (resObj.type) {
            case Preloader.TYPE_TEXTURE:
                cc.TextureCache.getInstance().addImage(url);
                textureCacheKey[name] = url;
                break;
            case Preloader.TYPE_PLIST:
                cc.SpriteFrameCache.getInstance().addSpriteFrames(url);
                break;
            case Preloader.TYPE_JSON:
                cc.FileUtils.getInstance().getStringFromFile(url);
                txtCacheKey[name] = url;
                break;
            case Preloader.TYPE_SOUND:
                url = url + (sys.os.toLowerCase() == "windows" ? ".mp3" : ".ogg");
                cc.AudioEngine.getInstance().preloadMusic(url);
                bgSoundURL = url;
                break;
            case Preloader.TYPE_AUDIO:
                name = url.substring(url.lastIndexOf("/") + 1, url.length);
                url = url + (sys.os.toLowerCase() == "windows" ? ".mp3" : ".ogg");
                cc.AudioEngine.getInstance().preloadEffect(url);
                audioCacheKey[name] = url;
                break;
        }
        this.onProgress();

        setTimeout(this.load, 1, this);
    } else {
        this.isLoadOver = true;
        this.onLoadComplete();
    }
}

Preloader.prototype.onLoadComplete = function () {

    LevelManager.instance.load();

    this.animationManager = new AnimationManager();
    this.animationManager.putAnimation("logo", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["logo"])), 0);
    this.animationManager.putAnimation("button", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["button"])), 0);
    this.animationManager.putAnimation("Char_win", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["Char_win"])), 0);
    this.animationManager.putAnimation("Char_lose", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["Char_lose"])), 0);
    this.animationManager.putAnimation("gloss_anim", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["gloss_anim"])), 0);
    this.animationManager.putAnimation("pointer", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["pointer"])), 0);
    this.animationManager.putAnimation("buttons_anim", JSON.parse(cc.FileUtils.getInstance().getStringFromFile(txtCacheKey["buttons_pause_anim"])), 0);

    AnimManager.instance.init();

    trace("  assets ... load  over!!!!!!!!!!!!");

    this.onProgress();
    this.showButton();
};
Preloader.prototype.showButton = function () {
    if (!this.shownButton) {
        this.shownButton = true;
        this.playButton.setScale(0.5);
        this.playButton.runAction(cc.Sequence.create(
            cc.Spawn.create(cc.FadeIn.create(0.15), cc.ScaleTo.create(0.15, 1.2)),
            cc.ScaleTo.create(0.25, 1)
        ));
    }
};
Preloader.prototype.onDown = function (x, y) {
    if (!this.loadedMain) {
        var rect = this.playButton.getBoundingBox();
        if (this.playButton.isVisible() && this.isLoadOver && x >= rect.x && x <= rect.x + rect.width && y >= y && y <= rect.y + rect.height) {
            this.loadedMain = true;
            this.onLoadOverCallback();
        }
    }
};

Preloader.prototype.onProgress = function () {
    var per = this.loadedCount / this.loadTotalLen;
    trace("has load assets:" + (int(per * 10000) / 100) + "%");
    per = limit(per, 0, 1);
    var rect = cc.rect(0, 0, limit(this.barSize.width * per, 1, this.barSize.width), this.barSize.height);
    this.bar.setTextureRect(rect);
};

Preloader.TYPE_TEXTURE = 1;
Preloader.TYPE_PLIST = 2;
Preloader.TYPE_AUDIO = 3;
Preloader.TYPE_JSON = 4;
Preloader.TYPE_SOUND = 5;

