/**
 * Created by Administrator on 2014/5/6.
 */
var FrameSelector = cc.Class.extend({
    ctor: function (e) {
        this.object = e;
        this.names = new Array();
        this.values = new Array();
    }
});
FrameSelector.prototype.getFrame = function (e, t) {
    return 0
};
FrameSelector.prototype.testLayer = function (e) {
    return true
};
var SingleFlameSelector = FrameSelector.extend({
    ctor: function (t) {
        this._super();
        this.frame = t
    }
});
SingleFlameSelector.prototype.getFrame = function (e, t) {
    return this.frame
};


var AnimatedNode = cc.Node.extend({
    ctor: function (anim, fpsDelay, r) {
        this._super();
        this.animation = anim;
        this.parts = new Array;
        this.isPlaying = true;
        this.actions = new Array;
        this.hasCycle = false;
        this.owner = null;
        this.skins = new Array;
        this.frameSelector = r;
        this.initFrameDelay = fpsDelay;
        this.initParts();
    }
});

AnimatedNode.prototype.createUsualSprite = function (e) {
    return createSpriteFromSpritesheet(e)
};
AnimatedNode.prototype.initParts = function () {
    this.setFrameDelay(this.animation.forceFrameDelay > 0 ? this.animation.forceFrameDelay : Math.abs(this.initFrameDelay) < 1e-10 ? 1 / DESIGN_FPS : this.initFrameDelay);
    this.totalFrames = 1;
    for (var e = 0; e < this.animation.layers.length; e++) {
        var t = this.animation.layers[e];
        if (this.frameSelector && !this.frameSelector.testLayer(this.animation.name))continue;
        this.totalFrames = Math.max(this.totalFrames, t.frames.length);
        var n = this.frameSelector ? this.frameSelector.getFrame(this, t) : 0;
        if (n != -1) {
            this.skins.push(n);
            var s = t.getClipData(n);
            var sp = this.createUsualSprite(s.name);
            sp.setAnchorPoint(cc.p(s.anchor.x, (1 - s.anchor.y)));
            this.parts.push(sp);
            this.addChild(sp)
        } else {
            this.skins.push(-1);
            this.parts.push(null)
        }
    }
    this.gotoAndPlay(0);
    if (this.animation.transform)this.animation.transform.applyTransform(this);
    if (this.totalFrames <= 1)this.stop();
    if (this.frameSelector) {
        this.frameSelector = null
    }
    if (this.animation && this.animation.isAdd) {
    }
    if (this.animation && this.animation.isOverlay) {
    }
};
AnimatedNode.prototype.getFrameByPartIndex = function (e) {
    var t = this.animation;
    var n = e;
    var r = t.layers[n].frames[this.currentFrame];
    return r
};
AnimatedNode.prototype.disableLayer = function (e) {
    var t = this.getPartByFlashName(e);
    if (t)t.removeFromParent();
};
AnimatedNode.prototype.update = function (e) {
    if (this.isPlaying) {
        this.currentDelay -= e;
        while (this.currentDelay <= 0) {
            this.gotoAndPlay(this.currentFrame + 1);
            for (var t = 0; t < this.actions.length; t++) {
                this.actions[t].checkAction();
            }
            this.currentDelay += this.frameDelay;
            if (this.currentFrame == 0)this.hasCycle = true
        }
    }
};
AnimatedNode.prototype.setRandomFrame = function () {
    var e = getInt(this.totalFrames);
    if (this.isPlaying)this.gotoAndPlay(e); else this.gotoAndStop(e)
};
AnimatedNode.prototype.setFrameDelay = function (e) {
    this.currentDelay = this.frameDelay = e
};
AnimatedNode.prototype.setFps = function (e) {
    this.setFrameDelay(1 / e)
};
AnimatedNode.prototype.isOnLastFrame = function () {
    return this.currentFrame == this.totalFrames - 1
};
AnimatedNode.prototype.setOwner = function (e) {
    this.owner = e
};
AnimatedNode.prototype.getOwner = function () {
    return this.owner
};
AnimatedNode.prototype.gotoAndPlay = function (frameIndex) {
    this.play();
    this.currentFrame = Math.max(0, frameIndex);
    this.currentFrame = this.currentFrame % this.totalFrames;
    for (var i = 0; i < this.parts.length; i++) {
        var sp = this.parts[i];
        if (sp) {
            var r = this.animation;
            var s = r.layers[i].frames[this.currentFrame];
            s.applyTransform(sp);
            if (this.owner)sp.setVisible(sp.isVisible() && this.owner.canBeVisible(sp));
        }
    }
    var o = this.currentFrame;
    for (i = 0; i < this.actions.length; i++) {
        this.actions[i].checkAction();
        if (this.currentFrame != o)return
    }
};
AnimatedNode.prototype.gotoAndStop = function (e) {
    this.gotoAndPlay(e);
    this.stop()
};
AnimatedNode.prototype.play = function () {
    if (!this.isPlaying)this.resetFrameDelay();
    this.isPlaying = true
};
AnimatedNode.prototype.stop = function () {
    this.isPlaying = false;
    this.resetFrameDelay()
};
AnimatedNode.prototype.resetFrameDelay = function () {
    this.currentDelay = this.frameDelay
};
AnimatedNode.prototype.getCurrentDelay = function () {
    return this.currentDelay
};
AnimatedNode.prototype.setCurrentDelay = function (e) {
    this.currentDelay = this.frameDelay * e
};
AnimatedNode.prototype.getFloatFrame = function () {
    return this.currentFrame + limit((this.frameDelay - this.currentDelay) / this.frameDelay, 0, 1)
};
AnimatedNode.prototype.setPartSkin = function (name, t, n) {
    if (typeof n === "undefined") {
        n = false
    }
    var r = this.animation.getLayerByFlashName(name);
    var sp = this.parts[r];
    var s = this.animation.layers[r];
    if (n)t = s.clipDatas.length + t;
    this.skins[r] = t;
    var o = s.getClipData(t);
    changeFrame(sp, o.name);
};
AnimatedNode.prototype.getPart = function (e) {
    return this.parts[e]
};
AnimatedNode.prototype.getPartByFlashName = function (e) {
    return this.getPart(this.animation.getLayerByFlashName(e))
};
AnimatedNode.prototype.getPartSkin = function (e) {
    return this.skins[e]
};
AnimatedNode.prototype.getPartSkinByName = function (e) {
    return this.getPartSkin(this.animation.getLayerByFlashName(e))
};
AnimatedNode.prototype.getSkinByFlashName = function (e) {
    return this.getPartSkin(this.animation.getLayerByFlashName(e))
};
AnimatedNode.prototype.updateOwnerVisibility = function () {
    for (var e = 0; e < this.parts.length; e++) {
        var t = this.parts[e];
        if (t && this.owner)t.setVisible(t.isVisible() && this.owner.canBeVisible(t));
    }
};
AnimatedNode.prototype.destroy = function () {
    this.skins = null;
    this.frameSelector = null;
    for (var e = 0; e < this.parts.length; e++) {
        if (this.parts[e])this.parts[e].removeFromParent();
    }
    this.owner = null;
    this.parts = null;
    this.actions = null
};
AnimatedNode.prototype.addAction = function (e, t, n, r) {
    if (typeof n === "undefined") {
        n = -1
    }
    if (typeof r === "undefined") {
        r = 1
    }
    var i = new AnimationAction(e, t, this, n, r);
    this.actions.push(i);
    return i
};


/**
 * Created by Administrator on 2014/5/6.
 */
function AnimationAction(e, t, n, r, i) {
    this.frame = e;
    this.type = t;
    this.animation = n;
    this.data = r;
    this.probability = i;
    this.isEnabled = true;
    this.frameSelector = null
}

AnimationAction.prototype.checkAction = function () {
    if (this.isEnabled && this.animation.currentFrame == this.frame && this.animation.isPlaying && Math.random() <= this.probability) {
        switch (this.type) {
            case 0:
                this.animation.stop();
                break;
            case 1:
                this.animation.gotoAndPlay(this.calcNextFrame());
                break;
            case 2:
                this.animation.gotoAndStop(this.data);
                break
        }
    }
};
AnimationAction.prototype.calcNextFrame = function () {
    var e = !this.frameSelector ? this.data : this.frameSelector.selectFrame(this.frame);
    if (e == -1)e = this.data;
    return e
};
AnimationAction.prototype.setSelector = function (e) {
    this.frameSelector = e
};
AnimationAction.prototype.setEnabled = function (e) {
    this.isEnabled = e
};
AnimationAction.prototype.getEnabled = function () {
    return this.isEnabled
};
