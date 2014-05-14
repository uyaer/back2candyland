/**
 * Created by Administrator on 2014/5/8.
 */
var GameObject = cc.Class.extend({
    ctor: function () {
        this.sprite = null;
        this.isDestroyed = false;
        this.isWaitingForDestruction = false;
        this.isLocked = false;
        this.level = Match3Level.instance;
    }
});

GameObject.prototype.canBeVisible = function (e) {
    return true;
};
GameObject.prototype.update = function (e) {
};
GameObject.prototype.destroy = function () {
    if (this.isDestroyed)return;
    if(this.sprite){
        this.sprite.stopAllActions();
        this.sprite.removeFromParent();
        this.sprite = null;
    }
    this.isDestroyed = true;
};