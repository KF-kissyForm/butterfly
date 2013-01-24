/**
 * @fileoverview 初始化ui的基类
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,ImageUploader) {
    /**
     *  初始化ui的基类
     * @constructor
     */
    function RenderImageUploader(config) {
        var self = this;
        RenderImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(RenderImageUploader, RenderUi, /** @lends RenderImageUploader.prototype*/{
        /**
         * 初始化
         * @private
         */
         _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            var imageUploader = new ImageUploader($target);
            self.fireBeforeRenderEvent(imageUploader);
            imageUploader.on('render',function(ev){
                //组件准备完成
                self.set('isReady',true);
                self.set('ui',ev.uploader);
                self.fireRenderEvent();
            });
            imageUploader.render();
            return self;
         }
    },{
        ATTRS:/** @lends RenderImageUploader.prototype*/{

        }
    });

    return RenderImageUploader;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.3/uploader/imageUploader'
    ]
});