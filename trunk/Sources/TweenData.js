/**
 * Created by Administrator on 2014/5/8.
 */
function TweenData() {
    this.initPos = cc.p(0, 0);
    this.endPos = cc.p(0, 0);
    this.currentTime = 0;
    this.totalTime = 0;
    this.corner = false
}

TweenData.prototype.init = function (x, y, endx, endy, totalTime, corner) {
    this.initPos.x = x;
    this.initPos.y = y;
    this.endPos.x = endx;
    this.endPos.y = endy;
    this.totalTime = totalTime;
    this.currentTime = 0;
    this.corner = corner;
};
TweenData.prototype.update = function (dt, obj) {
    this.currentTime += dt;
    var isEnd = false;
    if (this.currentTime >= this.totalTime) {
        this.currentTime = this.totalTime;
        isEnd = true;
    }
    var per = this.currentTime / this.totalTime;
    if (!this.corner)per *= per * per;
    obj.pos.x = this.initPos.x + (this.endPos.x - this.initPos.x) * per;
    obj.pos.y = this.initPos.y + (this.endPos.y - this.initPos.y) * per;
    if (isEnd){
        obj.stopMove();
    }
};