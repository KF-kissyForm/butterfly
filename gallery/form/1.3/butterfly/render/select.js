/**
 * @fileoverview 初始化模拟选择框
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,Select) {
    var EMPTY = '';
    /**
     *  初始化模拟选择框
     *  @param {Object} config
     * @constructor
     * @extends RenderUi
     */
    function RenderSelect(config) {
        var self = this;
        RenderSelect.superclass.constructor.call(self, config);
    }

    S.extend(RenderSelect, RenderUi, /** @lends RenderSelect.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            //获取配置，合并html中的宽度配置
            var config = self.getConfig('select',$target,'width');

            var select = new Select($target, config);
            self._render(select);
            return self;
        }
    },{
        ATTRS:/** @lends RenderSelect.prototype*/{

        }
    });

    return RenderSelect;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.3/select/index'
    ]
});