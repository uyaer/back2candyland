/**
 * Created by Administrator on 2014/4/7.
 */

var SoundsManager = cc.Class.extend({

    /**
     * 是否播放音乐
     */
    isAudio: true,
    /**
     * 是否播放背景音乐
     */
    isBG: true,
    /**
     * 当前背景音乐的路径
     */
    bgSoundPath: "",
    ctor: function () {
        this.lastPlays = {};
        this.delays = {};
        this.shifts = {};
        this.volumes = {};
        this.delays["remove1"] = this.delays["remove2"] = this.delays["remove3"] = this.delays["remove4"] = FieldObject.GEM_KILL_DELAY * 2;
        this.delays["cookie_crash"] = this.delays["choco_crash"] = this.delays["color_crash"] = .25;
        this.delays["stop_move"] = .5;
        this.delays["bonus_show"] = .25;
        this.volumes["bonus_set"] = .78;
        this.volumes["choco_crash"] = 1.6;
        this.volumes["cookie_crash"] = 1.6;
        this.volumes["color_crash"] = 1;

        this.load();
    }
});

SoundsManager.prototype.load = function () {
    var dataStr = sys.localStorage.getItem("sound");
    if (!dataStr)return;
    var sound = JSON.parse(dataStr);
    this.isBG = sound.isBG;
    this.isAudio = sound.isAudio;
}
SoundsManager.prototype.save = function () {
    var data = {"isBG": this.isBG, "isAudio": this.isAudio};
    sys.localStorage.setItem("sound", JSON.stringify(data));
}

/**
 * 是否有音乐播放
 * @param flag
 */
SoundsManager.prototype.setHasBgMusic = function (flag) {
    if (this.isBG != flag) {
        this.isBG = flag;
        if (flag) {
            this.playMusic();
        } else {
            cc.AudioEngine.getInstance().stopMusic();
        }
        this.save();
    }
}
/**
 * 是否有音效播放
 * @param flag
 */
SoundsManager.prototype.setHasAudioEff = function (flag) {
    if (this.isAudio != flag) {
        this.isAudio = flag;
        if (!flag) {
            cc.AudioEngine.getInstance().stopAllEffects();
        }
        this.save();
    }
}

/**
 * 播放背景音乐
 * @param path
 */
SoundsManager.prototype.playMusic = function (path) {
    path = path || bgSoundURL;
    if (this.isBG) {
        trace("play bg sound!!!!!!!", cc.AudioEngine.getInstance().isMusicPlaying());
        if (!cc.AudioEngine.getInstance().isMusicPlaying()) {
            this.bgSoundPath = path;
            cc.AudioEngine.getInstance().playMusic(path, true);
            cc.AudioEngine.getInstance().setMusicVolume(0.55);
        }
    }
}
/**
 * 播放音效
 * @param path
 * @param loop 默认false
 */
SoundsManager.prototype.playEffect = function (path, loop, vol) {
    if (arguments.length < 3) {
        vol = 1;
    }
    if (this.isAudio) {
        loop = arguments[1] || false;
        cc.AudioEngine.getInstance().playEffect(path, loop);
        cc.AudioEngine.getInstance().setEffectsVolume(vol);
    }
}
SoundsManager.prototype.playSound = function (name, delay) {
    if (typeof delay === "undefined") {
        delay = 0
    }
    this.time = Date.now() / 1000;
    var delaysN = this.delays[name];
    var lastPlayTime = this.lastPlays[name];
    var shift = this.shifts[name];
    var time = 0;
    var vol = this.volumes[name] ? this.volumes[name] : 1;
    if (delaysN) {
        if (!shift) {
            if (lastPlayTime && Math.abs(this.time - lastPlayTime) < delaysN) {
                return;
            } else {
                this.lastPlays[name] = this.time
            }
        } else {
            if (!lastPlayTime || lastPlayTime < this.time) {
                this.lastPlays[name] = this.time;
            } else {
                if (lastPlayTime + shift < this.time + delaysN) {
                    this.lastPlays[name] = lastPlayTime + shift;
                    time = (this.lastPlays[name] - this.time) * 1000;
                } else return
            }
        }
    }
    var totalDelay = time + delay;
    if (!audioCacheKey[name]) {
        trace("no music ,the name is::", name);
    }
    if (totalDelay > 0) {
        (function (name, totalDelay) {
            setTimeout(function () {
                trace("delay success!!!!", name, totalDelay);
                SoundsManager.instance.playEffect(audioCacheKey[name]);
            }, totalDelay, this);
        })(name, totalDelay);
    } else {
        SoundsManager.instance.playEffect(audioCacheKey[name]);
    }
}

SoundsManager.prototype.stopAll = function () {
    cc.AudioEngine.getInstance().stopMusic(false);
    cc.AudioEngine.getInstance().stopAllEffects();
    this.time = 0;
    this.lastPlays = {};
}
SoundsManager.prototype.pauseMusic = function () {
    cc.AudioEngine.getInstance().pauseMusic();
}
SoundsManager.prototype.resumeMusic = function () {
    cc.AudioEngine.getInstance().resumeMusic();
}


SoundsManager.instance = new SoundsManager();