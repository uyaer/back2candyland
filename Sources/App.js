/**
 * Created by Administrator on 2014/5/4.
 */

//主要控制器，程序入口
var App = {};


App.menuRoot = null;
App.isShowSplashScreen = false;
var menuZOrder = 1000;
var borderZOrder = 500;
var levelZOrder = 200;

App.GAME_W = 640;
App.GAME_H = 742;
App.WIN_W = 640;
App.WIN_H = 960;
App.VIEW_BOTTOM = (App.WIN_H - App.GAME_H) / 2;
App.VIEW_TOP = App.WIN_H - App.VIEW_BOTTOM;
App.FULL_SCREEN_H = 960;
App.ACTUAL_H = App.GAME_H;
App.SHIFT_H = (App.FULL_SCREEN_H - App.GAME_H) / 2;
App.CURRENT_SHIFT = 0;
App.episode = 1;
//
//var SoundsssManager = function () {
//    function SoundsssManager() {
//        this.lastPlays = {};
//        this.delays = {};
//        this.shifts = {};
//        this.musicPlayed = false;
//        this.isSoundEnabled = true;
//        this.isMusicEnabled = true;
//        this.musicPaused = false;
//        this.volumes = {};
//        SoundsssManager.instance = this;
//        this.delays["remove1"] = this.delays["remove2"] = this.delays["remove3"] = this.delays["remove4"] = FieldObject.GEM_KILL_DELAY * .5;
//        this.delays["cookie_crash"] = this.delays["choco_crash"] = this.delays["color_crash"] = .05;
//        this.delays["stop_move"] = .05;
//        this.delays["bonus_show"] = .05;
//        this.volumes["bonus_set"] = .78;
//        this.volumes["choco_crash"] = 1.6;
//        this.volumes["cookie_crash"] = 1.6;
//        this.volumes["color_crash"] = 1
//    }
//
//    SoundsssManager.prototype.update = function (e) {
//        this.time += e
//    };
//    SoundsssManager.prototype.playSound = function (name, delay) {
//        if (typeof delay === "undefined") {
//            delay = 0
//        }
//        if (!this.isSoundEnabled) return;
//        var delaysN = this.delays[name];
//        var lastPlayTime = this.lastPlays[name];
//        var shift = this.shifts[name];
//        var time = 0;
//        var vol = this.volumes[name] ? this.volumes[name] : 1;
//        if (delaysN) {
//            if (!shift) {
//                if (lastPlayTime && Math.abs(this.time - lastPlayTime) < delaysN) {
//                    return;
//                } else {
//                    this.lastPlays[name] = this.time
//                }
//            } else {
//                if (!lastPlayTime || lastPlayTime < this.time) {
//                    this.lastPlays[name] = this.time;
//                }else {
//                    if (lastPlayTime + shift < this.time + delaysN) {
//                        this.lastPlays[name] = lastPlayTime + shift;
//                        time = (this.lastPlays[name] - this.time) * 1e3
//                    } else return
//                }
//            }
//        }
//        createjs.Sound.play(name, "none", time + delay, 0, 0, vol)
//    };
//    SoundsssManager.prototype.playMusic = function () {
//        if (!this.musicPlayed) {
//            var e = this.music != null;
//            if (!this.music) this.music = createjs.Sound.play("main_music", {
//                interrupt: createjs.Sound.INTERRUPT_ANY,
//                loop: -1,
//                volume: .55
//            });
//            else this.music.play(createjs.Sound.INTERRUPT_NONE, 0, 0, -1, 1);
//            this.musicPlayed = this.music.playState == createjs.Sound.PLAY_SUCCEEDED;
//            if (!this.isMusicEnabled) this.music.pause()
//        }
//    };
//    SoundsssManager.prototype.pauseMusic = function () {
//        console.log("pause", App.game.gameTime);
//        this.musicPaused = true;
//        if (this.musicPlayed && this.music) {
//            createjs.Tween.removeTweens(this.music);
//            createjs.Tween.get(this.music, {
//                loop: false
//            }).wait(0).to({
//                    volume: 0
//                },
//                200, createjs.Ease.cubicIn)
//        }
//    };
//    SoundsssManager.prototype.resumeMusic = function () {
//        console.log("resume", App.game.gameTime);
//        this.musicPaused = false;
//        if (this.musicPlayed && this.music) {
//            createjs.Tween.removeTweens(this.music);
//            createjs.Tween.get(this.music, {
//                loop: false
//            }).wait(0).to({
//                    volume: .55
//                },
//                200, createjs.Ease.cubicIn)
//        }
//    };
//    SoundsssManager.prototype.setSound = function (e) {
//        if (typeof e === "undefined") {
//            e = true
//        }
//        this.isSoundEnabled = e
//    };
//    SoundsssManager.prototype.setMusic = function (e) {
//        if (typeof e === "undefined") {
//            e = true
//        }
//        this.isMusicEnabled = e;
//        if (this.music) {
//            if (e) this.music.resume();
//            else this.music.pause()
//        }
//    };
//    SoundsssManager.prototype.reset = function () {
//        this.time = 0;
//        this.lastPlays = {}
//    };
//    return SoundsssManager
//}();
//
//
