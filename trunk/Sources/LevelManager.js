/**
 * Created by Administrator on 2014/5/4.
 */

/**
 * 管卡管理器
 */
var LevelManager = function LevelManager() {
    this.data = [];
    this.currentLevel = 0;
    this.version = .924;
    this.isFirstLoad = true;
    //最后开启的关卡
    this.lastOpened = 0;
    //总移动次数
    this.moves = 0;
    this.bonuses = 0;
    this.version += App.episode * 10;

}

LevelManager.LEVEL_AMOUNT = App.episode == 0 ? 60 : 35;
Object.defineProperty(LevelManager.prototype, "totalScores", {
    get: function () {
        var e = this.data.length;
        var t = 0;
        for (var n = 0; n < e; ++n) t += this.data[n].score;
        return t
    },
    enumerable: true,
    configurable: true
});
Object.defineProperty(LevelManager.prototype, "totalStars", {
    get: function () {
        var e = this.data.length;
        var t = 0;
        for (var n = 0; n < e; ++n) t += this.data[n].stars;
        return t
    },
    enumerable: true,
    configurable: true
});
LevelManager.prototype.loadLevel = function (lv) {
    MenuManager.instance.closeCurrent();
    this.currentLevel = lv;
    Match3Level.instance.init(lv);

    //显示广告
    App.showBannerAd();
};
LevelManager.prototype.loadNextLevel = function () {
    //当前关卡设置为成功状态
    this.data[this.currentLevel].state = LevelData.COMPLETED_STATE;
    if (this.currentLevel < LevelManager.LEVEL_AMOUNT - 1) {
        this.currentLevel++;
        var state = this.data[this.currentLevel].state;
        this.data[this.currentLevel].state = Math.max(LevelData.OPENED_STATE, this.data[this.currentLevel].state);
        this.lastOpened = Math.max(this.lastOpened, this.currentLevel);
        if (state == LevelData.CLOSED_STATE) {
            MenuManager.instance.map.levelToUnlock = this.currentLevel;
        }
        MenuManager.instance.show(MenuManager.instance.map, true);
    }
    this.save();
};
//重新开始下一关,通关所有关卡后的
LevelManager.prototype.restartLoadNextLevel = function () {
    this.data[this.currentLevel].state = LevelData.COMPLETED_STATE;
    if (this.currentLevel < LevelManager.LEVEL_AMOUNT - 1) {
        var t = this.data[this.currentLevel + 1].state;
        this.data[this.currentLevel + 1].state = Math.max(LevelData.OPENED_STATE, this.data[this.currentLevel + 1].state);
        this.lastOpened = Math.max(this.lastOpened, this.currentLevel + 1);
        if (t == LevelData.CLOSED_STATE) MenuManager.instance.map.fastUnlock(this.currentLevel + 1)
    }
    this.save();
};
LevelManager.prototype.onLevelComplete = function (star, score) {
    //显示几颗星星的动画
    MenuManager.instance.winMenu.setStarData(star);
    this.data[this.currentLevel].state = LevelData.COMPLETED_STATE;
    this.data[this.currentLevel].stars = Math.max(star, this.data[this.currentLevel].stars);
    this.data[this.currentLevel].score = Math.max(score, this.data[this.currentLevel].score);
    this.save();
};
LevelManager.prototype.prepareToLoadLevel = function (lv) {
    MenuManager.instance.transition.play(null, lv);
};
LevelManager.prototype.restartLevel = function () {
    this.prepareToLoadLevel(this.currentLevel);
};
LevelManager.prototype.save = function () {

    var t = [];
    for (var i = 0; i < this.data.length; ++i) {
        var r = this.data[i];
        t.push({c: r.state, s: r.stars, p: r.score})
    }
    var verifyKey = MD5(JSON.stringify(t)+"uyaer20111111");
    var str = {"version": verifyKey, "moves": this.moves, "bonuses": this.bonuses};
    str.levels = t;
    sys.localStorage.setItem("save_"+App.episode, JSON.stringify(str));
    trace("save data.......");
};
LevelManager.prototype.load = function () {
    this.reset();
    var saveData = sys.localStorage.getItem("save_"+App.episode);
    if (!saveData)return;

    saveData = JSON.parse(saveData);
    var t = saveData.levels;
    if (!t)return;
    var verifyKey = MD5(JSON.stringify(t)+"uyaer20111111");
    if (verifyKey != saveData.version) {
        trace("=========== data has changed!");
        return;
    }
    this.moves = Math.max(this.moves, saveData.moves);
    this.bonuses = Math.max(this.bonuses, saveData.bonuses);
    for (var i = 0; i < t.length; ++i) {
        this.data[i].state = t[i].c;
        this.data[i].stars = t[i].s;
        this.data[i].score = t[i].p;
        if (this.data[i].state >= LevelData.OPENED_STATE) {
            this.lastOpened = Math.max(this.lastOpened, i)
        }
    }
    this.isFirstLoad = false;
    trace("load data.......","save_"+App.episode,"this.lastOpened=",this.lastOpened);
};
LevelManager.prototype.reset = function () {
    this.isFirstLoad = true;
    this.lastOpened = 0;
    this.currentLevel = 0;
    this.moves = 0;
    this.bonuses = 0;
    this.data = [];
    LevelManager.LEVEL_AMOUNT = App.episode == 0 ? 60 : 35;
    var lvDatas = levelDatas[App.episode];
    for (var i = 0; i < LevelManager.LEVEL_AMOUNT; ++i) {
        var r = i < lvDatas.length ? "=" + lvDatas[i] : null;
        this.data.push(new LevelData(i, r, i == 0 ? LevelData.OPENED_STATE : LevelData.CLOSED_STATE));
    }
}

LevelManager.instance = new LevelManager();