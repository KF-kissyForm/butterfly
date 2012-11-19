/**
 * @fileoverview 初始化ui的基类
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Node,Base) {
    var EMPTY = '';
    /**
     *  初始化ui的基类
     * @constructor
     */
    function RenderUi(config) {
        var self = this;
        RenderUi.superclass.constructor.call(self, config);
        self._init();
    }
    S.mix(RenderUi,/** @lends RenderUi*/{
        event:{
            BEFORE_RENDER:'beforeRender',
            RENDER:'render'
        }
    });
    S.extend(RenderUi, Base, /** @lends RenderUi.prototype*/{
        /**
         * 初始化
         * @private
         */
         _init:function(){

         },
        /**
         * 触发组件初始化前的事件
         * @return this
         */
        fireBeforeRenderEvent:function(){
            this.fire(RenderUi.event.BEFORE_RENDER,this.eventObject());
            return this;
        },
        /**
         * 触发组件初始化后的事件
         * @return this
         */
        fireRenderEvent:function(){
            this.fire(RenderUi.event.RENDER,this.eventObject());
            return this;
        },
        /**
         * 触发事件时传递的对象
         * @return {Object}
         */
        eventObject:function(){
            var self = this;
            var ui = self.get('ui');
            var isReady = self.get('isReady');
            var target = self.get('target');
            return {ui : ui,isReady:isReady,target:target};
        },
        /**
         * 获取指定ui的配置
         * @param {String} uiName ui名称
         * @return {Object}
         */
        getConfig:function(uiName){
            var self = this;
            var config = {};
            var uiConfig = self.get('uiConfig');
            if(!S.isString(uiName) || !uiConfig[uiName]) return config;
            return uiConfig[uiName];
        }
    },{
        ATTRS:/** @lends RenderUi.prototype*/{
            /**
             * 是否初始化完毕
             * @type {Boolean}
             * @default false
             */
            isReady:{value:false},
            /**
             * ui的目标元素
             * @type {NodeList}
             * @default ''
             */
            target:{value:EMPTY },
            /**
             * ui实例
             * @type {Object}
             * @default ''
             */
            ui:{value:EMPTY},
            /**
             * ui配置
             * @type {Object}
             * @default {}
             */
            uiConfig:{value:{}}
        }
    });

    return RenderUi;
}, {
    requires:[
        'node',
        'base'
    ]
});