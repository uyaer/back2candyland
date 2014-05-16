set EDITOR=E:\work\cocos-editor\candyland\Published
set COCO_PROJECT=E:\cocos2d-x-2.2.2\projects\back2candyland\Resources

del %COCO_PROJECT% /s/q
xcopy %EDITOR% %COCO_PROJECT% /a/s/exclude:E:\work\cocos-editor\candyland\exclude.txt

