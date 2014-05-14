/**
 * Created by Administrator on 2014/5/10.
 */

var HomeLayer = cc.Layer.extend({
    ctor:function(){

    }
});

HomeLayer.scene = function () {
    var sc = cc.Scene.create();
    var layer = new HomeLayer();
    sc.addChild(layer);
    return sc;
}