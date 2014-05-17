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


//////////////////////////////////////
///////////////  plus ///////////////////////
////////////////         //////////////////////
/////////////////             /////////////////////


App.showCpAd = function () {
    if (sys.os.toLowerCase() == "android") {
        SendMessageToNative("showCpAd", null);
    }
}
App.showBannerAd = function () {
    if (sys.os.toLowerCase() == "android") {
        SendMessageToNative("showBannerAd", {"isShow": "1"});
    }
}
App.hideBannerAd = function () {
    if (sys.os.toLowerCase() == "android") {
        SendMessageToNative("showBannerAd", {"isShow": "0"});
    }
}
App.closeApp = function () {
    cc.Director.getInstance().end();
}