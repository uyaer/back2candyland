/**
 * Created by Administrator on 2014/5/8.
 */

function MenuManager() {
    this.menus = [];
    this.map = new MapMenu;
    this.mainMenu = new MainMenu;
    this.transition = new TransitionMenu;
    this.winMenu = new WinMenu;
    this.loseMenu = new LoseMenu;
    this.target = new TargetMenu;
    this.pause = new PauseMenu;
    this.result = new ResultMenu;
    this.tutorial = new Tutorial;
    this.credits = new CreditsMenu;
    this.splashMenu = new SplashScreen;
    this.menus.push(this.map, this.mainMenu, this.transition, this.winMenu, this.loseMenu, this.target, this.pause, this.result, this.credits, this.splashMenu);
    MenuManager.instance = this;
}

MenuManager.prototype.isOnTutorial = function () {
    return this.current == this.tutorial
};
MenuManager.prototype.show = function (targetMenu, isShowTransistion) {
    if (arguments.length == 1) {
        isShowTransistion = true;
    }
    if (isShowTransistion) {
        this.transition.play(targetMenu);
    } else {
        this.closeCurrent();
        this.current = targetMenu;
        this.current.show();
        this.current.update(0)
    }
};
MenuManager.prototype.update = function (e) {
    if (this.credits.isMenuActive) this.credits.update(e);
    else if (this.current && !(this.current == this.map && this.transition.isActive && this.transition.menuToShow == null && !this.transition.hasDoneAction)) this.current.update(e);
    if (this.transition.isActive) this.transition.update(e)
};
MenuManager.prototype.closeCurrent = function () {
    if (this.current) {
        this.current.hide();
    }
    this.current = null
};
MenuManager.prototype.onResize = function () {
    if (this.current) this.current.onResize()
};
