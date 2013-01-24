/**
 * @fileoverview 初始化数字加减器
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,Radio) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *  初始化数字加减器
     *  @param {Object} config
     * @constructor
     */
    function RenderRadio(config) {
        var self = this;
        RenderRadio.superclass.constructor.call(self, config);
    }

    S.extend(RenderRadio, RenderUi, /** @lends RenderRadio.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            var ui = self.getUi();
            if(ui) return ui;

            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            $target =  self.getTargets();
            //获取配置
            var config = self.getConfig('radio');

            var radios = new Radio($target,config);
            self._render(radios);
            return self;
        },
        /**
         * 获取所有的元素（一般radio都是以多个一组的形式出现的）
         * @return {String}
         */
        getTargets:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return EMPTY;

            var $targets = EMPTY;
            var name = $target.attr('name');
            if(name){
                $targets = $(document.getElementsByName(name));
            }else{
                var hook = $target.attr('data-field-hook');
                if(hook) $targets = $(hook);
            }
            self.set('target',$target);
            return $targets;
        },
        /**
         * 是否已经实例化一个ui了
         * @return {Boolean}
         */
        getUi:function(){
            var self = this;
            var uis = self.get('uis');
            var name = self.get('name');
            return uis[name];
        }
    },{
        ATTRS:/** @lends RenderRadio.prototype*/{

        }
    });

    return RenderRadio;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.3/radio/index'
    ]
});