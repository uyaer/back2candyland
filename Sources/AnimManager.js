/**
 * Created by Administrator on 2014/5/6.
 */

var AnimManager = function () {
}
AnimManager.instance = new AnimManager();


AnimManager.prototype.init = function () {
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("blue", 16), ANIM_BLUE);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("orange", 17), ANIM_ORANGE);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("purple", 16), ANIM_PURPLE);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("green", 13), ANIM_GREEN);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("chocolate_destroy", 14), ANIM_CHOCOLATE_BLACK);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("chocolate_white_destr", 18), ANIM_CHOCOLATE_WHITE);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("color_bonus", 37), ANIM_COLOR_BONUS);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("color_wall", 18), ANIM_COLOR_WALL);
    cc.AnimationCache.getInstance().addAnimation(makeAnimation("color_bonus", 37,30,1,30), ANIM_BONUS_BLINK);
}
AnimManager.prototype.getAnimate = function (name) {
    var cache = cc.AnimationCache.getInstance();
    var animation = cache.getAnimation(name);
    if(!animation){
        trace("the name is:",name);
    }
    var anim = cc.Animate.create(animation);
    return anim;
}