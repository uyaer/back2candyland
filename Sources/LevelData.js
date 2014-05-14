/**
 * Created by Administrator on 2014/5/4.
 */

/**
 * 每一个Level的数据格式
 */
var LevelData = function (lv, mapData, state) {
    if (typeof state === "undefined") {
        state = LevelData.CLOSED_STATE;
    }
    //关卡是编号
    this.levelNumber = lv;
    //地图数据
    this.data = mapData;
    //关卡状态
    this.state = state;
    //当前关卡的分数
    this.score = 0;
    this.pushPositions = [];
    //是否有巧克力块
    this.hasWhiteChoco = false;
    this.hasBlackChoco = false;
    //关卡获得的星星
    this.stars = 0;
    for (var i = 0; i < Match3Level.LEVEL_W; ++i) {
        this.pushPositions.push(i);
    }
    var dataArr = this.data.split("-");
    this.cellData = dataArr[0]; //地图数据
    this.targetData = parseInt(dataArr[1]); //类型？
    this.customData = parseInt(dataArr[2]);
    this.customData2 = parseInt(dataArr[3]);
    this.movesLeft = parseInt(dataArr[7]);
    this.starValues = [parseInt(dataArr[4]), parseInt(dataArr[5]), parseInt(dataArr[6])]; //1,2,3星星对应的分数
    if (dataArr.length > 8) {
        this.pushPositions = [];
        var o = dataArr[8];
        for (var i = 0; i < o.length && i < Match3Level.LEVEL_W; ++i) {
            if (parseInt(o.charAt(i)) == 1) {
                this.pushPositions.push(i)
            }
        }
    }
    for (var i = 0; i < Match3Level.LEVEL_W; ++i) {
        for (var j = 0; j < Match3Level.LEVEL_H; ++j) {
            var type = Match3Level.getCellDataType(this.cellData, i, j);
            if (type == 2){
                this.hasWhiteChoco = true;
            }else if (type == 3){
                this.hasBlackChoco = true;
            }
        }
    }
    switch (this.targetData) {
        case 0:
            this.targetSpriteName = "chocolate_white";
            break;
        case 1:
            this.targetSpriteName = "cookie";
            break;
        case 2:
            this.targetSpriteName = "cupcake";
            break;
        case 3:
            this.targetSpriteName = assetNames[this.customData2];
            break;
        case 4:
            this.targetSpriteName = "star";
            break;
        case-1:
            this.targetSpriteName = "star";
            break
    }
}

LevelData.CLOSED_STATE = 0;
LevelData.OPENED_STATE = 1;
LevelData.COMPLETED_STATE = 2;