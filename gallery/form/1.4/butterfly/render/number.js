/**
 * @fileoverview 初始化数字加减器
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,Spinbox) {
    var EMPTY = '';
    /**
     *  初始化数字加减器
     *  @param {Object} config
     * @constructor
     */
    function RenderNumber(config) {
        var self = this;
        RenderNumber.superclass.constructor.call(self, config);
    }

    S.extend(RenderNumber, RenderUi, /** @lends RenderNumber.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            //获取配置
            var config = self.getConfig('number');

            var number = new Spinbox($target,config);
            self._render(number);
            return self;
        }
    },{
        ATTRS:/** @lends RenderNumber.prototype*/{

        }
    });

    return RenderNumber;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.4/spinbox/index'
    ]
});