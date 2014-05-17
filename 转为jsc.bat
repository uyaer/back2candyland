set COCOS2D_CONSOLE=E:\cocos2d-x-2.2.2\tools\cocos2d-console\console\cocos2d.py
:: set GAME_HOME=E:\cocos2d-x-2.2.2\projects\back2candyland\proj.android\assets\
set GAME_HOME=E:\cocos2d-x-2.2.2\projects\back2candyland\Resources\
python %COCOS2D_CONSOLE% jscompile -s %GAME_HOME%  -d %GAME_HOME%
del /q/s %GAME_HOME%*.js