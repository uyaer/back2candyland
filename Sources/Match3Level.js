/**
 * Created by Administrator on 2014/5/4.
 */

var Match3Level = cc.Layer.extend({
    ctor: function (hud) {
        this._super();
        this.isPaused = false;
        this.currentMove = 0;
        this.isGenerated = false;
        this.isLocked = false;
        this._isHardLocked = false;
        this.isEnded = false;
        this.score = 0;
        this.pushPositions = [];
        this.objects = [];
        this.customMatches = new Array();
        this.comboAmount = 0;
        this.maxCombo = 0;
        this.comboTimer = Match3Level.COMBO_TIME;
        this.turnedOff = false;
        this.isSelectBlocked = false;
        this.fieldCount = 5;
        this.timeSinceLastAction = 0;
        this.movesLeft = 0;
        this.showWinMenuIn = -1;
        this.playLoseIn = 1.3;
        this.cellData = null;
        this.cachedSprites = {};
        this.showTargetIn = -1;
        this.backLayer = cc.Layer.create();
        this.addChild(this.backLayer);
        this.underGemLayer = cc.Layer.create();
        this.gemLayer = cc.Layer.create();
        this.blockLayer = cc.Layer.create();
        this.gemDestroyLayer = cc.Layer.create();
        this.blockDestroyLayer = cc.Layer.create();
        this.bonusLayer = cc.Layer.create();
        this.bonusIndicatorLayer = cc.Layer.create();
        this.hudLayer = cc.Layer.create();
        Match3Level.instance = this;
        Match3Level.pool = new ObjectPool();
        var ids = ["blue_bomb", "blue_horizontal", "blue_vertical", "blue", "green_bomb", "green_horizontal",
            "green_vertical", "green", "orange_bomb", "orange_horizontal", "orange_vertical", "orange",
            "purple_bomb", "purple_horizontal", "purple_vertical", "purple"];
        for (var i = 0; i < ids.length; ++i) {
            var sp = createSpriteFromSpritesheet(ids[i]);
            var rect = sp.getBoundingBox();
            this.cachedSprites[ids[i]] = sp;
        }
        this.addChild(this.underGemLayer, 1);
        this.addChild(this.gemLayer, 2);
        this.addChild(this.blockLayer, 3);
        this.addChild(this.gemDestroyLayer, 4);
        this.addChild(this.blockDestroyLayer, 5);
        this.addChild(this.bonusLayer, 6);
        this.addChild(this.bonusIndicatorLayer, 7);
        this.addChild(this.hudLayer, 8);
        this.setFieldProps(Match3Level.TILE_SIZE, 26, 104, Match3Level.LEVEL_W, Match3Level.LEVEL_H);
        this.cells = new Array();
        for (var i = 0; i < this.fieldWidth; i++) {
            var arr = new Array();
            for (var j = 0; j < this.fieldHeight; j++) {
                var cell = new CellObject(i, j);
                arr.push(cell);
            }
            this.cells.push(arr);
        }
        this.marks = cc.LayerColor.create(cc.c4b(0, 0, 0, 255 * 0.000005));
        this.addChild(this.marks, 1);
        this.hud = hud;
        hud.level = this;

    }
});
Match3Level.prototype.pause = function () {
    if (this.isPaused || this.isEnded)return;
    this.isPaused = true;
    MenuManager.instance.show(MenuManager.instance.pause, false);
};
Match3Level.prototype.unpause = function () {
    this.isPaused = false;
    if (MenuManager.instance.current == MenuManager.instance.pause) {
        MenuManager.instance.closeCurrent();
    }
};
Object.defineProperty(Match3Level.prototype, "isActive", {get: function () {
    return this.getParent() != null;
}, enumerable: true, configurable: true});
Match3Level.prototype.init = function (lv) {
    this.reset();
    this.scheduleUpdate();
    this.showTargetIn = .3;
    this.showWinMenuIn = -1;
//    SoundsManager.instance.stopAll();

    this.isEnded = false;
    var mapData = null;
    var lvData = mapData ? new LevelData(lv, mapData) : LevelManager.instance.data[lv];
    this.levelData = lvData;
    this.cellData = lvData.cellData;
    var targetData = lvData.targetData;
    var customData = lvData.customData;
    var customData2 = lvData.customData2;
    this.movesLeft = lvData.movesLeft;
    var starValue = lvData.starValues;
    switch (targetData) {
        case 0:
            this.target = new BlockClearTarget();
            break;
        case 1:
            this.target = new ClearMarkTarget();
            break;
        case 2:
            this.target = new PushDownTarget(customData);
            break;
        case 3:
            this.target = new ColorTarget(customData, customData2);
            break;
        case 4:
            this.target = new ScoreTarget(customData);
            break;
        case -1:
            this.target = new InfiniteTarget();
            break;
    }
    this.target.scores = starValue;
    trace("...star value is: ", this.target.scores);

    this.score = 0;
    this.generate();
    this.hud.show();
    this.update(0)
};
/**
 * 开始移动奖励啦
 */
Match3Level.prototype.starMoveAwardMode = function () {
    if (this.isEnded || this.isHardLocked)return;
    this.isEnded = true;
    var e = [];
    for (var n = 0; n < this.fieldWidth; ++n) {
        for (var r = 0; r < this.fieldHeight; ++r) {
            var i = this.cells[n][r];
            if (i && i.object && !i.object.isMoving && !i.object.isBonus && !i.object.isPushable) {
                e.push(i)
            }
        }
    }
    this.objects.push(Match3Level.pool.getText("amazing!", null, 3, App.GAME_W / 2, App.SHIFT_H + 400));
    var s = this.hud.movesText.getPositionX();
    var o = this.hud.movesText.getPositionY() - 20;
    var isHasMoveLeft = this.movesLeft > 0;
    var cellArr = [];
    var boundTypeArr = [];
    var delayTimeArr = [];
    for (var n = 0; n < this.fieldWidth; ++n)for (var r = 0; r < this.fieldHeight; ++r) {
        var cell = this.cells[n][r];
        if (cell && cell.object && cell.object.isBonus) {
            cellArr.push(cell);
            boundTypeArr.push(cell.getBonusType());
            delayTimeArr.push(!isHasMoveLeft ? 0 : .5)
        }
    }
    var len = e.length;
    var h = 0;
    var p = -1;
    var movesLeft = this.movesLeft;
    while (movesLeft > 0) {
        if (len <= 0) {
            this.objects.push(Match3Level.pool.getText("100", null, 0, s, o));
            this.movesLeft--
        } else {
            cell = e.splice(getInt(len), 1)[0];
            var v = .6 + h * .065;
            var m = 1 + getInt(3);
            boundTypeArr.push(m);
            var g = new EndBonusIndicator(s, o, cell, v, m);
            this.objects.push(g);
            cellArr.push(cell);
            p = Math.max(p, g.totalTime);
            delayTimeArr.push(g.totalTime);
            ++h
        }
        --len;
        movesLeft--
    }
    var y = [];
    p += .2;
    var b = -1;
    len = cellArr.length;
    for (var h = 0; h < len; ++h) {
        cell = cellArr[h];
        var w = this.getBonusGroup(cell, boundTypeArr[h]);
        v = delayTimeArr[h];
        var E = w.length;
        for (var S = 0; S < E; ++S) {
            var x = w[S];
            var T = this.getDistance(cell, x, false);
            var N = (!isHasMoveLeft ? 1 : 1.5) + v + T * FieldObject.GEM_KILL_DELAY + BonusDestroyAnimation.TIME;
            b = Math.max(N, b);
            if (x == cell || cellArr.indexOf(x) == -1)x.prepareToClear(N, boundTypeArr[h], -1, x == cell);
            y.push(x)
        }
        cell.scoreToAdd = this.getBonusScore(boundTypeArr[h], 0)
    }
    len = y.length;
    b += FieldObject.GEM_KILL_DELAY;
    for (h = 0; h < len; ++h)y[h].setTempBlock(true, b);
    this.showWinMenuIn = 1.6
};
Match3Level.prototype.getStarAmount = function () {
    var e = 0;
    for (var t = 1; t <= 3; ++t) {
        var n = this.target.scores[t - 1];
        if (this.score >= n)e = t
    }
    return e
};
Match3Level.prototype.destroyObjects = function () {
    var e = this.objects.length;
    for (var t = 0; t < e; ++t)this.objects[t].destroy();
    this.objects = []
};
Match3Level.prototype.onWin = function () {
    if (this.isEnded)return;
    this.isEnded = true;
    this.destroyObjects();
    var rect = this.getBoundingBox();
    var len = this.objects.length;
    for (var i = 0; i < len; ++i) {
        var obj = this.objects[i];
        if (obj && obj.isDestroyed && obj instanceof JumpText) {
            obj.finishMovement();
            obj.destroy();
        }
    }
    var s = this.getStarAmount();
    this.hud.forceFullUpdate();
    LevelManager.instance.onLevelComplete(s, this.score);
    var menu = this.levelData.levelNumber == LevelManager.LEVEL_AMOUNT - 1 ? MenuManager.instance.result : MenuManager.instance.winMenu;
    MenuManager.instance.show(menu, false);
};
Match3Level.prototype.onLose = function () {
    if (this.isEnded)return;
    this.isEnded = true;
    this.destroyObjects();
    var e = this.getBoundingBox();
    MenuManager.instance.show(MenuManager.instance.loseMenu, false)
};
Match3Level.prototype.trySpawnBonus = function (e) {
    if (e == null)return;
    var n = e.length;
    if (n < Match3Level.MIN_LINE_SIZE)return;
    var r = 0;
    var i = 0;
    var s = 0;
    var o = 0;
    var cell = null;
    var a = [];
    for (r = 0; r < n; ++r)a.push(e[r]);
    e = a;
    while (true) {
        n = e.length;
        if (n < Match3Level.MIN_LINE_SIZE)return;
        var f = [];
        for (r = 0; r < n; ++r)f[r] = false;
        var l = [];
        for (r = 0; r < n; ++r)l[r] = false;
        var c = [];
        var h = [];
        var p = 0;
        var d = [];
        for (r = 0; r < n; ++r) {
            var v = e[r].getType();
            if (v < 0)continue;
            s = e[r].x;
            o = e[r].y;
            i = p = 0;
            d = [];
            if (!f[r] && !(s - 1 >= 0 && this.cells[s - 1][o].getType() == v)) {
                while (true) {
                    cell = s + i < this.fieldWidth ? this.cells[s + i][o] : null;
                    var m = e.indexOf(cell);
                    if (cell && cell.getType() == v && m != -1) {
                        ++p;
                        d.push(cell);
                        f[m] = true
                    } else {
                        if (p >= Match3Level.MIN_LINE_SIZE) {
                            c.push(d);
                            h.push(p)
                        }
                        break
                    }
                    ++i
                }
            }
            i = p = 0;
            d = [];
            if (!l[r] && !(o - 1 >= 0 && this.cells[s][o - 1].getType() == v)) {
                while (true) {
                    cell = o + i < this.fieldHeight ? this.cells[s][o + i] : null;
                    var m = e.indexOf(cell);
                    if (cell && cell.getType() == v && m != -1) {
                        ++p;
                        d.push(cell);
                        l[m] = true
                    } else {
                        if (p >= Match3Level.MIN_LINE_SIZE) {
                            c.push(d);
                            h.push(p)
                        }
                        break
                    }
                    ++i
                }
            }
        }
        var g = c.length;
        for (r = 0; r < g; ++r) {
            d = c[r];
            var y = d.length;
            for (i = 0; i < y; ++i) {
                cell = d[i];
                for (var b = 0; b < g; b++) {
                    if (r != b) {
                        var w = c[b];
                        m = w.indexOf(cell);
                        if (m != -1) {
                            var E = w.length;
                            var S = m;
                            if (S < Match3Level.MIN_LINE_SIZE)S = 0;
                            var x = E - (m + 1);
                            if (x < Match3Level.MIN_LINE_SIZE)x = 0;
                            h[r] -= (E - (S + x)) * 1.1
                        }
                    }
                }
            }
        }
        var T = -1;
        var N = -1;
        for (r = 0; r < g; ++r) {
            var C = h[r];
            if (C > T || N == -1) {
                T = C;
                N = r
            }
        }
        if (T != -1 && N != -1) {
            d = c[N];
            y = d.length;
            for (r = 0; r < y; ++r) {
                m = e.indexOf(d[r]);
                e.splice(m, 1)
            }
            var bonusType = this.getBonusByMatch(y);
            var L = y <= 4 ? 3 : y <= 5 ? 4 : 5;
            this.spawnBonus(bonusType, d[0], d[L])
        }
        if (g <= 1 || e.length < Match3Level.MIN_LINE_SIZE)break
    }
};
Match3Level.prototype.getBonusByMatch = function (e) {
    return e >= 6 ? 4 : e <= 4 ? Math.random() > .5 ? 1 : 2 : 3;
    return 2;
    var t = Math.random();
    return t < .15 ? 1 : t < .3 ? 2 : t < .7 ? 3 : 4
};
Match3Level.prototype.combinateBonuses = function (fillList) {
    var arr = [];
    var len = fillList.length;
    for (var i = 0; i < len; ++i) {
        if (fillList[i].object && fillList[i].object.isBonus) {
            arr.push(fillList[i]);
        }
    }
    if (arr.length > 1) {
        arr = arr.sort(function (cell1, cell2) {
            return cell1.getBonusType() == cell2.getBonusType() ? 0 : cell1.getBonusType() > cell2.getBonusType() ? -1 : 1;
        });
        var cell1 = arr[0];
        var cell2 = arr[1];
        var bonusType1 = cell1.getBonusType();
        var bonusType2 = cell2.getBonusType();
        var f = bonusType1 == 1 || bonusType1 == 2;
        var l = bonusType2 == 1 || bonusType2 == 2;
        var comboCell = MenuManager.instance.isOnTutorial() ? Tutorial.instance.getBonusComboCell(cell1, cell2) : null;
        comboCell = comboCell ? comboCell : Math.random() > .5 ? cell1 : cell2;
        if (f && l) {
            cell1.object.setBonusType(kCrossBonus);
            cell2.object.setBonusType(kCrossBonus);
        } else if ((f || l) && (bonusType1 == kBombBonus || bonusType2 == kBombBonus)) {
            comboCell.object.setBonusType(kThickCrossBonus)
        } else if (bonusType1 == kBombBonus && bonusType2 == kBombBonus) {
            comboCell.object.setBonusType(kLargeBombBonus)
        } else if ((f || l) && (bonusType1 == kColorBonus || bonusType2 == kColorBonus)) {
            comboCell.object.setBonusType(kColorLineBonus)
        } else if ((bonusType1 == kColorBonus || bonusType2 == kColorBonus) && (bonusType1 == kBombBonus || bonusType2 == kBombBonus)) {
            comboCell.object.setBonusType(kColorBombBonus)
        } else if ((bonusType1 == kColorBonus || bonusType2 == kColorBonus) && (bonusType1 == kColorBonus || bonusType2 == kColorBonus)) {
            comboCell.object.setBonusType(kColorColorBonus)
        }
        this.objects.push(Match3Level.pool.getText("combo!", cell1, 2, (cell1.pos.x + cell2.pos.x) / 2, (cell1.pos.y + cell2.pos.y) / 2))
    }
};
Match3Level.prototype.spawnBonus = function (bonusType, cell1, cell2, bonusIndicator) {
    if (typeof bonusIndicator === "undefined") {
        bonusIndicator = null
    }
    var i;
    var s;
    var o;
    var cell;
    var a = MenuManager.instance.isOnTutorial() ? Tutorial.instance.getBonusSpawnCell() : null;
    for (i = 0; i < 80; ++i) {
        s = getInt(this.fieldWidth);
        o = getInt(this.fieldHeight);
        cell = a ? a : this.cells[s][o];
        var f = false;
        if (cell.object && !cell._isBlock && !cell.object.isBonus && !cell.object.isWaitingForDestruction && !cell.object.isMoving && !cell.isWaitingForClear && !cell.object.isPushable && !cell.object.isHighValue) {
            for (var l = 0; l < this.customMatches.length; ++l)if (this.customMatches[l].indexOf(cell) != -1) {
                f = true;
                break
            }
            if (!f) {
                if (bonusIndicator == null) {
                    this.objects.push(new BonusIndicator(cell1, cell2, cell, bonusType));
                } else {
                    bonusIndicator.updateTarget(cell);
                }
                return
            }
        }
    }
    if (bonusIndicator)bonusIndicator.destroy()
};
Match3Level.prototype.getBonusGroup = function (cell, bonusType, matchList) {
    bonusType = bonusType || 0;
    matchList = matchList || null;
    bonusType = bonusType != 0 ? bonusType : cell.getBonusType();
    var resultArr = [];
    switch (bonusType) {
        case 1:
            for (var s = 0; s < this.fieldWidth; ++s) {
                var o = this.cells[s][cell.y];
                if (o.isStable() || o.isBreakable)resultArr.push(o)
            }
            break;
        case 2:
            for (var u = 0; u < this.fieldHeight; ++u) {
                var a = this.cells[cell.x][u];
                if (a.isStable() || a.isBreakable)resultArr.push(a)
            }
            break;
        case 3:
            for (s = -2; s <= 2; ++s) {
                for (u = -2; u <= 2; ++u) {
                    var f = cell.x + s;
                    var l = cell.y + u;
                    if (f >= 0 && l >= 0 && l < this.fieldHeight && f < this.fieldWidth) {
                        var c = this.cells[f][l];
                        if (c.isStable() || c.isBreakable)resultArr.push(c)
                    }
                }
            }
            break;
        case 4:
            var h = this.getMatchColor(cell, matchList);
            var p = 200;
            var d = [];
            for (s = 0; s < this.fieldWidth; ++s)for (u = 0; u < this.fieldHeight; ++u) {
                if (this.cells[s][u] && (this.cells[s][u].isStable() || this.cells[s][u].isBreakable) && this.cells[s][u].getType() == h)d.push(this.cells[s][u])
            }
            var v = 70;
            var m = d.length;
            while (v > 0 && p > 0 && m > 0) {
                var g = getInt(m);
                --m;
                c = d[g];
                resultArr.push(c);
                d.splice(g, 1);
                v--;
                p--
            }
            break;
        case 5:
            for (s = 0; s < this.fieldWidth; ++s) {
                o = this.cells[s][cell.y];
                if (o.isStable() || o.isBreakable)resultArr.push(o)
            }
            for (u = 0; u < this.fieldHeight; ++u) {
                a = this.cells[cell.x][u];
                if (a.isStable() || o.isBreakable)resultArr.push(a)
            }
            break;
        case 6:
            for (s = 0; s < this.fieldWidth; ++s) {
                for (u = cell.y - 1; u <= cell.y + 1; ++u) {
                    if (s >= 0 && s < this.fieldWidth && u >= 0 && u < this.fieldHeight) {
                        o = this.cells[s][u];
                        if (o.isStable() || o.isBreakable)resultArr.push(o)
                    }
                }
            }
            for (s = cell.x - 1; s <= cell.x + 1; ++s) {
                for (u = 0; u < this.fieldHeight; ++u) {
                    if (s >= 0 && s < this.fieldWidth && u >= 0 && u < this.fieldHeight) {
                        o = this.cells[s][u];
                        if (o.isStable() || o.isBreakable)resultArr.push(o)
                    }
                }
            }
            break;
        case 7:
            for (s = -4; s <= 4; ++s) {
                for (u = -4; u <= 4; ++u) {
                    var f = cell.x + s;
                    var l = cell.y + u;
                    if (f >= 0 && l >= 0 && l < this.fieldHeight && f < this.fieldWidth) {
                        var c = this.cells[f][l];
                        if (c.isStable() || c.isBreakable)resultArr.push(c)
                    }
                }
            }
            break;
        case 8:
            var h = this.getMatchColor(cell, matchList);
            p = 10;
            var d = [];
            for (s = 0; s < this.fieldWidth; ++s)for (u = 0; u < this.fieldHeight; ++u) {
                c = this.cells[s][u];
                if (c && c.object && this.cells[s][u].getType() == h && !c._isBlock && !c.object.isBonus && !c.object.isMoving && !c.isWaitingForClear)d.push(c)
            }
            var v = 70;
            var m = d.length;
            while (v > 0 && p > 0 && m > 0) {
                var g = getInt(m);
                --m;
                c = d[g];
                resultArr.push(c);
                if (c != cell)c.object.setBonusType(Math.random() > .5 ? 1 : 2);
                d.splice(g, 1);
                v--;
                p--
            }
            break;
        case 9:
            var h = this.getMatchColor(cell, matchList);
            p = 10;
            var d = [];
            for (s = 0; s < this.fieldWidth; ++s)for (u = 0; u < this.fieldHeight; ++u) {
                c = this.cells[s][u];
                if (c && c.object && this.cells[s][u].getType() == h && !c._isBlock && !c.object.isBonus && !c.object.isMoving && !c.isWaitingForClear)d.push(c)
            }
            var v = 70;
            var m = d.length;
            while (v > 0 && p > 0 && m > 0) {
                var g = getInt(m);
                --m;
                c = d[g];
                resultArr.push(c);
                if (c != cell)c.object.setBonusType(3);
                d.splice(g, 1);
                v--;
                p--
            }
            break;
        case 10:
            for (s = 0; s < this.fieldWidth; ++s)for (u = 0; u < this.fieldHeight; ++u) {
                c = this.cells[s][u];
                if (c.isStable() || c.isBreakable)resultArr.push(c)
            }
            break
    }
    return resultArr;
};
Match3Level.prototype.trySpawnHighValue = function (e) {
    var t = e.length;
    var n = 0;
    var r = [];
    for (var i = 0; i < t; ++i) {
        r.push(e[i]);
        if (!e[i].object.isHighValue)++n
    }
    var s = Math.floor(n / 6);
    for (var i = 0; i < s; ++i) {
        var o = false;
        while (t > 0) {
            var u = getInt(t);
            t--;
            var a = r.splice(u, 1)[0];
            for (var f = 0; f < 4; ++f) {
                var l = a.x + (f == 0 ? -1 : f == 1 ? 1 : 0);
                var c = a.y + (f == 2 ? -1 : f == 3 ? 1 : 0);
                if (l >= 0 && c >= 0 && l < this.fieldWidth && c < this.fieldHeight) {
                    var h = this.cells[l][c];
                    var p = !MenuManager.instance.isOnTutorial() || Tutorial.instance.checkHighValueCell(h);
                    if (p && h.object && !h.object.isMoving && !h.isWaitingForClear && !h.object.isBonus && !h.object.isHighValue && !h.object.isPushable && !h.isWaitingForDestruction && !h.isBlock() && !h.object.isWaitingForDestruction) {
                        o = true;
                        h.object.setHighValueIn(a.clearIn > 0 ? a.clearIn : .1);
                        break
                    }
                }
            }
            if (o)break
        }
    }
};
Match3Level.prototype.getBonusDelay = function (bonusType) {
    var delay = 0;
    if (bonusType == kColorBonus) {
        delay += 2 / 3;
    } else if (bonusType != 0 && bonusType < 8) {
        delay += BonusDestroyAnimation.TIME;
    }
    return delay
};
Match3Level.prototype.getDistanceDelay = function (cell1, cell2, bonus, gen) {
    var i = (bonus == kColorLineBonus || bonus == kColorBombBonus) ? 1 : bonus == kColorBonus ? kVerticalLine : this.getDistance(cell1, cell2, false);
    return FieldObject.GEM_KILL_DELAY * i * Math.pow(.75, gen)
};
Match3Level.prototype.getMatchColor = function (e, t) {
    if (!t)return e.getType();
    var n = [0, 0, 0, 0, 0, 0];
    var r = n.length;
    for (var i = 0; i < r; ++i) {
        var s = t[i].getType();
        if (s >= 0) {
            n[s]++;
            if (n[s] >= 2)return s
        }
    }
    return e.getType()
};
Match3Level.prototype.onMouseDown = function (x, y) {
    if (this.isLocked || this.movesLeft <= 0 || this.isPaused || this.isWaitingForTarget)return;
    var pot = this.stageToGrid(x, y);
    var fillList = this.getFillZone(pot.x, pot.y);
    if (fillList && fillList.length >= 3) {
        this.isLocked = true;
        ++this.currentMove;
        --this.movesLeft;
        LevelManager.instance.moves++;
        this.combinateBonuses(fillList);
        var arr = [
            {match: fillList, mains: [this.cells[pot.x][pot.y]], delay: .15, bonus: 0, gen: 0, prevBonus: 0}
        ];
        var index = 0;
        var clearIn = -1;
        var a = true;
        while (index < arr.length) {
            var match = arr[index].match;
            var mains = arr[index].mains;
            var delay = arr[index].delay;
            var bonus = arr[index].bonus;
            var gen = arr[index].gen;
            var prevBonus = arr[index].prevBonus;
            ++index;
            this.customMatches.push(match);
            var len = match.length;
            for (var i = 0; i < len; ++i) {
                var clickCell = mains[0];
                var matchCell = match[i];
                var currDelay = delay + this.getDistanceDelay(clickCell, matchCell, bonus, gen) + this.getBonusDelay(matchCell.getBonusType());
                clearIn = Math.max(clearIn, matchCell.clearIn);
                if (matchCell && matchCell.object && matchCell.object.isBonus && !matchCell.object.isMoving && !matchCell.isWaitingForClear) {
                    var is1Or2 = matchCell.object.bonusType == 1 || matchCell.object.bonusType == 2;
                    var bonusType = bonus == matchCell.object.bonusType && is1Or2 ? bonus == 1 ? 2 : 1 : matchCell.object.bonusType;
                    matchCell.object.bonusType = bonusType;
                    var eatArr = this.getBonusGroup(matchCell, 0, match);
                    if (eatArr.length > 0) {
                        arr.push({match: eatArr, mains: [matchCell], delay: currDelay, bonus: bonusType, gen: gen + 1, prevBonus: bonus})
                    }
                }
                if (matchCell.object && matchCell.object.isHighValue) {
                    matchCell.scoreToAdd = this.getHighValueCellScore() + (matchCell.scoreToAdd >= 0 ? matchCell.scoreToAdd : 0);
                }
                matchCell.prepareToClear(currDelay, bonus);
            }
            if (a) {
                var x = this.getComboScore(len);
                var u = -1;
                var T = null;
                for (var m = 0; m < len; ++m) {
                    var y = match[m];
                    if (y.object && !y.object.isBonus && y.isWaitingForClear && y.clearIn > u) {
                        u = y.clearIn;
                        T = y
                    }
                }
                if (T) {
                    T.scoreToAdd = x + (y.scoreToAdd >= 0 ? y.scoreToAdd : 0);
                    T.bonusComboCount = index
                }
            } else {
                if (clickCell.object && clickCell.object.isBonus) {
                    clickCell.scoreToAdd = this.getBonusScore(bonus, gen - 1, prevBonus) + (clickCell.scoreToAdd >= 0 ? clickCell.scoreToAdd : 0);
                    clickCell.bonusComboCount = index;
                }
            }
            a = false
        }
        clearIn += FieldObject.GEM_KILL_DELAY * (this.customMatches.length <= 1 ? 3 : 7);
        for (i = 0; i < this.customMatches.length; ++i)for (var N = 0; N < this.customMatches[i].length; ++N)this.customMatches[i][N].setTempBlock(true, clearIn);
        this.customMatches = [];
        this.trySpawnBonus(fillList);
        this.trySpawnHighValue(fillList)
    } else {
        if (pot.x < 0 || pot.y < 0 || pot.x >= this.fieldWidth || pot.y >= this.fieldHeight)return;
        var y = this.cells[pot.x][pot.y];
        if (y && y.object && this.isGoodForClick(y))y.object.playJellyAnimation(1, 1)
    }
};
Match3Level.prototype.getBonusScore = function (e, n, r) {
    if (typeof r === "undefined") {
        r = -1
    }
    if (r >= 8 && r <= 9)return-1;
    var i = Match3Level.bonusScores[e] * Math.pow(1.2, n);
    i = Math.round(i / 10);
    i *= 10;
    return i
};
Match3Level.prototype.getHighValueCellScore = function () {
    return 30
};
Match3Level.prototype.getComboScore = function (e) {
    return e * CellObject.BASE_SCORE
};
Match3Level.prototype.getDistance = function (cell1, cell2, n) {
    if (typeof n === "undefined") {
        n = false
    }
    var r = Math.abs(cell1.x - cell2.x);
    if (n)r = Math.min(r, Math.abs(r - this.fieldWidth));
    var i = Math.abs(cell1.y - cell2.y);
    if (n)i = Math.min(i, Math.abs(i - this.fieldHeight));
    return r + i;
};
Match3Level.prototype.onExit = function () {
};
Match3Level.prototype.handleCombo = function () {
};

Object.defineProperty(Match3Level.prototype, "isHardLocked", {get: function () {
    return this.isLocked || this._isHardLocked
}, enumerable: true, configurable: true});
Match3Level.prototype.update = function (dt) {
    if (!this.isGenerated)return;
    if (this.comboTimer > 0) {
        this.comboTimer--;
        if (this.comboTimer == 0) {
            if (this.comboAmount > this.maxCombo)this.maxCombo = this.comboAmount;
            this.handleCombo();
            this.comboAmount = 0;
            this.setCombo()
        }
    }
    var blockCount = 0;
    this._isHardLocked = false;
    this.isLocked = false;
    for (var i = 0; i < this.fieldWidth; ++i) {
        for (var j = 0; j < this.fieldHeight; ++j) {
            var cell = this.cells[i][j];
            cell.update(dt);
            if (cell.object == null && !cell.isBlock()) {
                ++blockCount;
            }
            this.isLocked = this.isLocked || cell.object && (cell.object.isMoving || cell.object.isWaitingForDestruction) || cell.isWaitingForClear || cell.isChangingType;
            this._isHardLocked = this._isHardLocked || this.isLocked || cell.isTempBlock && !cell._isBlock
        }
    }
    var len = this.objects.length;
    for (var i = 0; i < len; ++i) {
        var obj = this.objects[i];
        if (obj && !obj.isDestroyed) {
            obj.update(dt);
            this.isLocked = this.isLocked || obj.isLocked && !obj.isDestroyed
        } else {
            this.objects.splice(i, 1);
            i--;
            len--
        }
    }
    if (blockCount > 0) {
        var a = this.addObjects();
        a += this.pushObjects();
        this.isLocked = this.isLocked || a > 0
    }
    if (this.isLocked || this.isEnded) {
        this.timeSinceLastAction = 0;
    } else {
        this.timeSinceLastAction += dt;
        if (this.timeSinceLastAction > 3 && !MenuManager.instance.isOnTutorial()) {
            this.playHint();
        }
        if (!this.isHardLocked) {
            this.checkIfComboExists()
        }
    }
    if (this.showWinMenuIn > 0 && !this.isHardLocked) {
        this.showWinMenuIn -= dt;
        if (this.showWinMenuIn <= 0) {
            this.isEnded = false;
            this.onWin();
        }
    }
    this.isLocked = this.isLocked || this.isEnded;
    if (!this.isPaused && !this.isHardLocked && !this.isEnded && !this.target.isCompleted && this.movesLeft <= 0 && this.playLoseIn > 0) {
        this.playLoseIn -= dt;
        if (this.playLoseIn <= 0)this.onLose()
    }
    if (this.isWaitingForTarget && !this.isHardLocked) {
        this.showTargetIn -= dt;
        if (!this.isWaitingForTarget) {
            if (!Tutorial.instance.hasTutorial(this.levelData.levelNumber)) {
                MenuManager.instance.show(MenuManager.instance.target, false);
            } else {
                MenuManager.instance.show(MenuManager.instance.tutorial, false)
            }
        }
    }
    this.hud.update(dt);
};
/**
 * 检查是否可以有连线的
 */
Match3Level.prototype.checkIfComboExists = function () {
    if (this.hud.isShuffleActive() || this.isWaitingForTarget || MenuManager.instance.current == MenuManager.instance.target) return;
    for (var e = 0; e < this.fieldHeight; ++e) {
        for (var t = 0; t < this.fieldWidth; ++t) {
            var n = this.cells[t][e];
            var r = this.getFillZone(t, e, 3);
            if (r && r.length >= 3) {
                return;
            }
        }
    }
    //已经没有可以连线的啦，必须重排位置啦
    this.hud.playShuffleAnimation();
    var arr = [];
    for (var t = 0; t < this.fieldWidth; ++t) for (var e = 0; e < this.fieldHeight; ++e) if (this.isGoodForClick(this.cells[t][e])) arr.push(this.cells[t][e]);
    var len = arr.length;
    this.isLocked = true;
    var o = 80;
    var u = false;
    var a = .6;
    while (o >= 0 && !u) {
        o--;
        var f = getInt(len);
        var n = arr[f];
        if (!n.object.isPushable) {
            var l = [n];
            for (var c = 0; c < 4; ++c) {
                t = n.x + (c == 0 ? 1 : c == 1 ? -1 : 0);
                e = n.y + (c == 2 ? 1 : c == 3 ? -1 : 0);
                if (t >= 0 && e >= 0 && t < this.fieldWidth && e < this.fieldHeight) {
                    var h = this.cells[t][e];
                    if (this.isGoodForClick(h)) {
                        l.push(h);
                        if (l.length >= 3) {
                            var p = (n.getType() + 1) % this.assetNumber;
                            u = true;
                            for (var d = 0; d < l.length; ++d) {
                                l[d].prepareToChangeType(a + lerp(0, .2, Math.random()), p);
                                f = arr.indexOf(l[d]);
                                if (f != -1) {
                                    arr.splice(f, 1);
                                    len--
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
    }
    while (len > 0) {
        var f = getInt(len);
        len--;
        var n = arr.splice(f, 1)[0];
        n.prepareToChangeType(a + lerp(0, .2, Math.random()))
    }
    return;
    while (len > 0) {
        var f = getInt(len);
        len--;
        var n = arr.splice(f, 1)[0];
        if (!n.object || n.timeSinceLastTypeChange < 1) continue;
        var l = [];
        for (var c = 0; c < 4; ++c) {
            t = n.x + (c == 0 ? 1 : c == 1 ? -1 : 0);
            e = n.y + (c == 2 ? 1 : c == 3 ? -1 : 0);
            if (t >= 0 && e >= 0 && t < this.fieldWidth && e < this.fieldHeight) {
                var h = this.cells[t][e];
                if (this.isGoodForClick(h)) {
                    l.push(h);
                    if (l.length >= 2) {
                        for (var d = 0; d < l.length; ++d) l[d].changeObjectType(n.getType());
                        return
                    }
                }
            }
        }
    }
    return;
    while (len > 0) {
        var f = Math.random() < .5 ? Math.floor(len / 2 + getInt(Math.floor(len / 2))) : getInt(len);
        len--;
        var n = arr.splice(f, 1)[0];
        if (!n.object || n.timeSinceLastTypeChange < 1) continue;
        var l = [];
        for (var c = 0; c < 4; ++c) {
            t = n.x + (c == 0 ? 1 : c == 1 ? -1 : 0);
            e = n.y + (c == 2 ? 1 : c == 3 ? -1 : 0);
            if (t >= 0 && e >= 0 && t < this.fieldWidth && e < this.fieldHeight) {
                var h = this.cells[t][e];
                if (this.isGoodForClick(h)) {
                    l.push(h);
                    if (l.length >= 2) {
                        for (var d = 0; d < l.length; ++d) l[d].changeObjectType(n.getType());
                        return
                    }
                }
            }
        }
    }
};
//播放提示，随机选择一个cell，然后判定其是否可以连接3个以上，然后让这个cell播放动画
Match3Level.prototype.playHint = function () {
    var e = [];
    for (var t = 0; t < this.fieldWidth; ++t)for (var n = 0; n < this.fieldHeight; ++n)e.push(this.cells[t][n]);
    var r = 15;
    var i = e.length;
    while (--r > 0 && i > 0) {
        var s = getInt(i);
        i--;
        var o = e.splice(s, 1)[0];
        if (!this.isGoodForClick(o))continue;
        var u = this.getFillZone(o.x, o.y, 3);
        if (u && u.length >= 3) {
            this.timeSinceLastAction = -Math.random() * 4;
            u[getInt(u.length)].object.playJellyAnimation(.2 + Math.random() * .2, .25 + Math.random() * .25);
            return
        }
    }
};
Match3Level.prototype.setCombo = function () {
};
Match3Level.prototype.isGoodForClick = function (e) {
    return e.object && e.object.colorType != -1 && !e.object.isMoving && !e.isWaitingForClear && !e.isColorBlocked && e.object.colorType != 4 && !e.isChangingType
};
Match3Level.prototype.getFillZone = function (row, col, count) {
    if (typeof count === "undefined") {
        count = -1;
    }
    if (row < 0 || col < 0 || row >= this.fieldWidth || col >= this.fieldHeight)return null;
    var fillList = new Array();
    var tempArr = new Array();
    var cell = this.cells[row][col];
    if (!this.isGoodForClick(cell))return fillList;
    var colorType = cell.object.colorType;
    tempArr.push(cell);
    var index = 0;
    var len = tempArr.length;
    while (index < len && (count < 0 || index < count)) {
        var aCell = tempArr[index];
        fillList.push(aCell);
        ++index;
        //检查四个方向
        for (var i = 0; i < 4; ++i) {
            row = aCell.x + (i == 0 ? -1 : i == 1 ? 1 : 0);
            col = aCell.y + (i == 2 ? -1 : i == 3 ? 1 : 0);
            if (row >= 0 && col >= 0 && row < this.fieldWidth && col < this.fieldHeight) {
                var tempCell = this.cells[row][col];
                if (tempCell.object && (tempCell.object.colorType == colorType || tempCell.object.bonusType == 4) && !tempCell.object.isMoving && tempArr.indexOf(tempCell) == -1) {
                    tempArr.push(tempCell);
                    ++len
                }
            }
        }
    }
    return fillList;
};
Match3Level.prototype.pushObjects = function (e, t) {
    if (typeof e === "undefined") {
        e = -1
    }
    if (typeof t === "undefined") {
        t = -1
    }
    var n = 0;
    n += this.pushBaseObjects(e, t);
    n += this.pushHoles();
    return n
};
Match3Level.prototype.pushBaseObjects = function (e, t) {
    if (typeof e === "undefined") {
        e = -1
    }
    if (typeof t === "undefined") {
        t = -1
    }
    var n = 0;
    for (var r = 0; r < this.fieldWidth; r++) {
        if (e != -1 && r != e)continue;
        for (var i = this.fieldHeight - 1; i >= 0; i--) {
            if (t != -1 && i != t)continue;
            var s = this.cells[r][i];
            var o = s._isBlock || s.isTempBlock;
            if (o)continue;
            if (s.object == null && !o) {
                var u = -1;
                var a = false;
                for (var f = i - 1; f >= 0; f--) {
                    var l = this.cells[r][f];
                    var c = l._isBlock || l.isTempBlock;
                    if (c || l.isWaitingForClear) {
                        a = true;
                        break
                    } else if (l.object != null && !c && !l.object.isMoving) {
                        u = f;
                        break
                    }
                }
                if (u != -1 && !a) {
                    var h = s.pos;
                    l.object.moveTo(h.x, h.y, false, .05);
                    s.setObject(l.object);
                    l.object = null;
                    ++n
                }
            }
        }
    }
    return n
};
Match3Level.prototype.pushHoles = function () {
    var count = 0;
    for (var i = 0; i < this.fieldWidth; ++i) {
        var isEnd = this.isEnded;
        for (var j = 0; j < this.fieldHeight; ++j) {
            var cell = this.cells[i][j];
            var isBlock = cell._isBlock || cell.isTempBlock;
            if (isBlock) {
                isEnd = true;
                continue;
            } else if (cell.object == null && isEnd) {
                if (cell.blockWasRemovedRecently)continue;
                var o = Math.random() > .5;
                var u = [cc.p(i + (o ? 1 : -1), j - 1), cc.p(i + (o ? -1 : 1), j - 1)];
                for (var a = 0; a < 2; a++) {
                    var f = u[a];
                    if (!(f.x >= 0 && f.y >= 0 && f.x < this.fieldWidth && f.y < this.fieldHeight))continue;
                    var l = this.cells[f.x][f.y];
                    if (l.isStable() && l.object != null && !l.isWaitingForClear && !l.isTempBlock && !l.isColorBlocked) {
                        var c = cell.pos;
                        l.object.moveTo(c.x, c.y, false, .05, true);
                        cell.setObject(l.object);
                        l.object = null;
                        ++count;
                        break;
                    }
                }
            } else if (cell.object != null && isEnd) {
                isEnd = false;
            }
        }
    }
    return count;
};
Match3Level.prototype.addObjects = function () {
    var e = -1;
    var n = -1;
    if (this.isEnded)return 0;
    var count = 0;
    for (var i = 0; i < this.fieldWidth; i++) {
        if (e != -1 && i != e)continue;
        var flag = false;
        for (var j = 0; j < this.fieldHeight; j++) {
            if (n != -1 && j != n)continue;
            if (this.cells[i][j].object || this.cells[i][j].isBlock()) {
                if (this.isGenerated)break; else flag = true
            } else {
                var pos = this.gridToStage(i, j);
                var a = -1;
                if (flag) {
                    if (this.getCellDataColor(i, j) <= 0) {
                        continue;
                    } else {
                        a = j;
                    }
                }
                var otherPos = this.gridToStage(i, a);
                var type = this.getObjectType(i, j);
                var obj = Match3Level.pool.getObject(this.cells[i][j], otherPos, this.assetNumber, type);
                if (a != j) {
                    obj.moveTo(pos.x, pos.y);
                }
                this.cells[i][j].setObject(obj);
                ++count;
            }
        }
    }
    return count;
};
Match3Level.prototype.getObjectType = function (row, col) {
    if (!this.isGenerated) {
        var n = this.getCellDataColor(row, col);
        return n - 1;
    }
    return this.target.getExactType(row, col)
};
Match3Level.getCellDataType = function (cellData, row, col) {
    if (!cellData) {
        return -1;
    }
    return parseInt(cellData.charAt(2 * (col + row * Match3Level.LEVEL_H) + 1));
};
Match3Level.prototype.getCellDataColor = function (row, col) {
    if (!this.cellData) {
        return -1;
    }
    return parseInt(this.cellData.charAt(2 * (col + row * this.fieldHeight) + 2));
};
Match3Level.prototype.generateCells = function () {
    for (var i = 0; i < this.fieldWidth; i++) {
        for (var j = 0; j < this.fieldHeight; j++) {
            var cell = this.cells[i][j];
            var type = Match3Level.getCellDataType(this.cellData, i, j);
            switch (type) {
                case 0:
                case -1:
                    break;
                case 1:
                    cell.setBlock();
                    break;
                case 2:
                    cell.setBlock(1);
                    break;
                case 3:
                    cell.setBlock(2);
                    break;
                case 4:
                    cell.setBlock(0, true);
                    break;
                case 5:
                    cell.setMark(1);
                    break;
                case 6:
                    cell.setMark(2);
                    break;
            }
            var color = this.getCellDataColor(i, j);
            if (color == 5) {
                cell.setBlock(0, true);
            }
        }
    }
};
Match3Level.prototype.generateField = function () {
    this.addObjects();
    this.target.onLevelGenerated();
    if (this.levelData.levelNumber == 1) {
        this.cells[App.episode <= 1 ? 1 : 4][App.episode <= 1 ? 4 : 5].object.setBonusType(kBombBonus);
        this.cells[App.episode <= 1 ? 2 : 3][App.episode <= 1 ? 7 : 7].object.setBonusType(kHorizontalLine);
    }
};
Match3Level.prototype.generate = function () {
    this.assetNumber = 4;
    this.generateCells();
    this.generateField();
    this.isGenerated = true;
};
Match3Level.prototype.setFieldProps = function (tileSize, offsetX, offsetY, fieldWidth, fieldHeight) {
    this.tileSize = tileSize;
    this.offsetX = offsetX;
    this.offsetY = App.VIEW_TOP - offsetY;
    this.fieldWidth = fieldWidth;
    this.fieldHeight = fieldHeight;
};
Match3Level.prototype.gridToStage = function (row, col) {
    return cc.p(this.offsetX + (row + .5) * this.tileSize, this.offsetY - (col + .5) * this.tileSize)
};
Match3Level.prototype.stageToGrid = function (x, y) {
    return cc.p(Math.round((x - this.offsetX) / this.tileSize - 0.5), Math.round((this.offsetY - y) / this.tileSize - 0.5));
};
Object.defineProperty(Match3Level.prototype, "isWaitingForTarget", {get: function () {
    return this.showTargetIn > 0
}, enumerable: true, configurable: true});
Match3Level.prototype.reset = function () {
    this.unscheduleUpdate();
    this.isEnded = false;
    this.currentMove = 0;
    this.playLoseIn = 1.3;
    this.isPaused = false;
    this._isHardLocked = false;
    this.showTargetIn = .3;
    this.isGenerated = false;
    this.showWinMenuIn = -1;
    for (var i = 0; i < this.fieldWidth; ++i) {
        for (var j = 0; j < this.fieldHeight; ++j) {
            this.cells[i][j].reset();
        }
    }
    var len = this.objects.length;
    for (var i = 0; i < len; ++i) {
        this.objects[i].destroy();
    }
    this.objects = [];
    this.target = null;
    this.hud.reset();
};
Match3Level.bonusScores = [0, 80, 80, 100, 150, 110, 180, 180, 250, 280, 500];
Match3Level.COMBO_TIME = 70;
Match3Level.OLD_TILE_SIZE = 50;
Match3Level.TILE_SIZE = 59;
Match3Level.LEVEL_W = 10;
Match3Level.LEVEL_H = 10;
Match3Level.MIN_LINE_SIZE = 4;