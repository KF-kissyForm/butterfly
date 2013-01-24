/**
 * @fileoverview 初始化数字加减器
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderRadio,Checkbox) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     *  初始化数字加减器
     *  @param {Object} config
     * @constructor
     */
    function RenderCheckbox(config) {
        var self = this;
        RenderCheckbox.superclass.constructor.call(self, config);
    }

    S.extend(RenderCheckbox, RenderRadio, /** @lends RenderCheckbox.prototype*/{
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
            var config = self.getConfig('checkbox');

            var checkbox = new Checkbox($target,config);
            self._render(checkbox);
            return self;
        }
    },{
        ATTRS:/** @lends RenderCheckbox.prototype*/{

        }
    });

    return RenderCheckbox;
}, {
    requires:[
        'node',
        './radio',
        'gallery/form/1.3/checkbox/index'
    ]
});