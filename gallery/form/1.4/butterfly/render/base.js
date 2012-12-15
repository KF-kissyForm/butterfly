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
        self._guid = S.guid();
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
         * 运行ui
         * @param {Object} ui
         * @private
         */
        _render:function(ui){
            var self = this;
            self.fireBeforeRenderEvent(ui);
            ui.render();
            self.fireRenderEvent();
            return self;
        },
        /**
         * 触发组件初始化前的事件
         * @param {Object} ui ui实例
         * @return this
         */
        fireBeforeRenderEvent:function(ui){
            var self = this;
            self.set('ui',ui);
            this.fire(RenderUi.event.BEFORE_RENDER,self.eventObject());
            return self;
        },
        /**
         * 触发组件初始化后的事件
         * @return this
         */
        fireRenderEvent:function(){
            var self = this;
            self.addUi();
            self.fire(RenderUi.event.RENDER,self.eventObject());
            return self;
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
         * 获取指定ui的配置（可以合并元素上的属性配置）
         * @param {String} uiName ui名称
         * @param {NodeList} $target
         * @param {String} attrs 目标元素上的属性
         * @return {Object}
         */
        getConfig:function(uiName,$target, attrs){
            var self = this;
            var uiConfig = self.get('uiConfig');
            if(!uiName) return {};
            var config = uiConfig[uiName] || {};

            if($target && attrs){
                attrs = attrs.split(',');
                S.each(attrs, function (attr) {
                    var val = $target.attr(attr);
                    if (val) config[attr] = val;
                })
            }

            return config;
        },
        /**
         * 向ui集合添加ui
         */
        addUi:function(){
            var self = this;
            var uis = self.get('uis');
            if(!S.isObject(uis)) return {};

            var name = self.get('name');
            var ui = self.get('ui');
            if(!uis[name])  uis[name] = ui;
            return self;
        },
        /**
         * 删除ui
         * @return {*}
         */
        removeUi:function(){
            var self = this;
            var uis = self.get('uis');
            var name = self.get('name');
            var ui = self.get('ui');
            delete uis[name];
            return self;
        }
    },{
        ATTRS:/** @lends RenderUi.prototype*/{
            /**
            * ui对应的表单元素标识
            * @type String
            * @default ''
            */
            name:{
                value:EMPTY,
                getter:function(v){
                    var self = this;
                    var $el = self.get('target');
                    v = $el.attr('id') || $el.attr('name') || self._guid || '';
                    return v;
                }
            },
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
             * 表单内所有ui组件实例集合
             */
            uis:{value:{}},
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