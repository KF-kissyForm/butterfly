/**
 * @fileoverview
 * @author czy88840616 <czy88840616@gmail.com>
 *
 */
KISSY.add('gallery/form/1.3/auth/msg/base', function (S, Base,Node) {
    var $ = Node.all;
    /**
     * msg cls
     * @type {String}
     */
    var AUTH_MSG_CLS = 'kf-msg';

    var Msg = function (srcNode, cfg) {
        var self = this;

        self._init(srcNode, cfg);

        Msg.superclass.constructor.call(self);
    };


    S.extend(Msg, Base, {
        /**
         * init msg
         * @param srcNode {htmlElement|String}
         * @param cfg {Object}
         * @private
         */
        _init:function (srcNode, cfg) {
            var self = this;
            self._el = S.one(srcNode);
            self.set('tpl', cfg.tpl);
            self.set('args', cfg.args);
            var $wrapper = self._getWrapper();

            self._msgContainer = S.one('.' + AUTH_MSG_CLS, $wrapper);

            if(!self._msgContainer) {
                self._msgContainer = S.one('<div class="' + AUTH_MSG_CLS +'" style="display: none"></div>');
                $wrapper.append(self._msgContainer);
            }

        },
        hide:function () {
            var self = this;
            var $msg = self._msgContainer;
            S.buffer(function () {
                $msg.hide();
            }, 50)();
        },
        show:function (o) {
            var self = this;
            var args =self.get('args');
            var tpl = self.get('tpl');
            o = S.merge(self.get('args'), o);

            S.buffer(function () {
                self._msgContainer.html(S.substitute(self.get('tpl'), o));
                self._msgContainer.show();
            }, 50)();
        },
        /**
         * 获取消息层容器
         * @private
         */
        _getWrapper:function(){
            var self = this;
            var $wrapper = self.get('wrapper');
            var $target = self._el;

            //html标签属性上存在消息层
            var wrapperHook = $target.attr('msg-wrapper');
            if(wrapperHook) $wrapper = $(wrapperHook);

            if(!$wrapper || !$wrapper.length){
                $wrapper = $target.parent();
            }
            return $wrapper;
        }
    }, {
        ATTRS:{
            tpl:{
                value:''
            },
            args:{
                value:{}
            },
            /**
             * 消息层容器
             * @type String
             * @default ''
             */
            wrapper:{
                value:'',
                getter:function(v){
                    return $(v);
                }
            }
        }
    });

    return Msg;

}, {
    requires:[
        'base',
        'node'
    ]
});