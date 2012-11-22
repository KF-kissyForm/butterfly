/**
 * @fileoverview 初始化字数统计器
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,RenderUi,Limiter) {
    var EMPTY = '';
    var MAX_LENGTH = 'maxlength';
    var LIMITER_TARGET = 'limiter-target';
    /**
     *  初始化字数统计器
     *  @param {Object} config
     * @constructor
     */
    function RenderLimiter(config) {
        var self = this;
        RenderLimiter.superclass.constructor.call(self, config);
    }

    S.extend(RenderLimiter, RenderUi, /** @lends RenderLimiter.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            //获取配置
            var config = self._getConfig();

            var textLimiter = new Limiter($target, config);
            self._render(textLimiter);
            return self;
        },
        /**
         * 合并html中的组件配置
         * @return {Object|Boolean}
         * @private
         */
        _getConfig:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            //最大允许输入长度
            var maxLen = self.get('maxLen');
            //统计文案的目标元素
            var $limiterTarget = self.get('limiterTarget');
            //不存在字数统计基础配置
            if (!maxLen || !$limiterTarget.length) return false;

            //获取配置
            var config = self.getConfig('limiter');

            S.mix(config, {wrapper:$limiterTarget, max:maxLen});

            var type = $target.attr('type');
            //富编辑器，将html标签排除掉
            if (type == 'editor') S.mix(config, {isRejectTag:true});
            return config;
        }
    },{
        ATTRS:/** @lends RenderLimiter.prototype*/{
            /**
             * 最大允许输入长度
             * @type Number
             * @default 0
             */
            maxLen:{
                value:0,
                getter:function(v){
                    var self = this;
                    var $target = self.get('target');
                    if($target.length){
                        v = Number($target.attr(MAX_LENGTH));
                    }
                    return v;
                }
            },
            /**
             * 统计文案的目标元素
             * @type NodeList
             * @default ''
             */
            limiterTarget:{
                value:EMPTY,
                getter:function(v){
                    var self = this;
                    var $target = self.get('target');
                    if($target.length){
                        v = $($target.attr(LIMITER_TARGET));
                    }
                    return v;
                }
            }
        }
    });

    return RenderLimiter;
}, {
    requires:[
        'node',
        './base',
        'gallery/form/1.3/limiter/index'
    ]
});