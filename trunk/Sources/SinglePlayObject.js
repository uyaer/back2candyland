/**
 * Created by Administrator on 2014/5/6.
 */

/**
 * color奖励的动画
 * @type {void|Function|*}
 */
var SinglePlayObject = GameObject.extend({
    ctor: function (x, y, name, lastFrame, parent, o, u, scale) {
        this._super();
        if (typeof scale === "undefined") {
            scale = 1
        }
        var sp = cc.Sprite.create();
        sp.setScale(scale);
        sp.setPosition(x, y);
        this.lastFrame = lastFrame;
        this.sprite = sp;
        parent.addChild(this.sprite);
        var that = this;
        sp.runAction(cc.Sequence.create(
            AnimManager.instance.getAnimate(name),
            cc.CallFunc.create(function () {
                that.destroy();
            })
        ));
    }
});
