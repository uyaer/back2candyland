/**
 * Created by Administrator on 2014/5/6.
 */
/**
 * 管理器
 * @type {void|Function|*}
 */
var Tutorial = Menu.extend({
    ctor: function () {
        this._super();
        this.pages = [];
        this.currentPage = 0;
        this.currentSequence = [];
        this.sequences = {0: [0, 2, 3, 5], 1: [6, 1, 4]};
        Tutorial.instance = this;
        this.pages.push(new FirstGroupTapTutorial, new HighValueTapTutorial, new LineTapTutorial, new BonusTapTutorial, new BonusInfoTutorial, new ReachScoreTutorial, new BonusComboTapTutorial, new ComboInfoTutorial)
    }
});
Tutorial.prototype.hasTutorial = function (lv) {
    return this.sequences[lv.toString()]
};
Tutorial.prototype.show = function () {
    var e = this.sequences[Match3Level.instance.levelData.levelNumber.toString()];
    this.currentSequence = [];
    for (var t = 0; t < e.length; ++t) {
        this.currentSequence.push(this.pages[e[t]]);
    }
    this.currentPage = 0;
    this.currentSequence[this.currentPage].show()
};
Tutorial.prototype.hide = function () {
};
Tutorial.prototype.getBonusComboCell = function (cell1, cell2) {
    trace("combo!!");
    return this.currentPage == 1 && this.currentSequence[this.currentPage] == this.pages[1] && Match3Level.instance.currentMove == 1 ? App.episode <= 1 ? cell1.x < cell2.x ? cell1 : cell2 : cell1.x < cell2.x ? cell2 : cell1 : null
};
Tutorial.prototype.checkHighValueCell = function (e) {
    return this.currentPage == 1 && this.currentSequence[this.currentPage] == this.pages[1] && Match3Level.instance.currentMove == 1 && (App.episode <= 1 && e.x == 3 && e.y == 6 || App.episode == 2 && e.x == 6 && e.y == 8)
};
Tutorial.prototype.getBonusSpawnCell = function () {
    return this.currentPage == 2 && this.currentSequence[this.currentPage] == this.pages[3] ? App.episode <= 1 ? Match3Level.instance.cells[2][3] : Match3Level.instance.cells[1][3] : null
};
Tutorial.prototype.nextPage = function () {
    this.currentSequence[this.currentPage].hide();
    if (this.currentPage < this.currentSequence.length - 1) {
        ++this.currentPage;
        this.currentSequence[this.currentPage].show();
    } else {
        if (this == MenuManager.instance.current)MenuManager.instance.closeCurrent()
    }
};
Tutorial.prototype.allowTap = function (e, t) {
    return this.currentSequence[this.currentPage].allowTap(e, t)
};
Tutorial.prototype.onDown = function (x, y) {
    Menu.prototype.onDown.call(this, x, y);
    this.currentSequence[this.currentPage].onDown(x, y)
};
