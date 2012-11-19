/**
 * @fileoverview 初始化编辑器
 * @author  剑平（明河）<minghe36@gmail.com>
 */
KISSY.add(function (S, Event,Node,RenderUi,RenderLimiter) {
    var EMPTY = '';
    /**
     *  初始化编辑器
     *  @param {Object} config
     * @constructor
     */
    function RenderEditor(config) {
        var self = this;
        RenderEditor.superclass.constructor.call(self, config);
    }

    S.extend(RenderEditor, RenderUi, /** @lends RenderEditor.prototype*/{
        /**
         * 初始化
         * @private
         */
         _init:function(){
            var self = this;
            var $target = self.get('target');
            if (!$target || !$target.length) return false;

            var useMods = self.get('use');
            var editorConfig = self.getConfig('editor');

            //加载css
            self._loadCss();

            S.use('editor', function (S, Editor) {
                var editor = new Editor($target.getDOMNode(), editorConfig).use(useMods);
                editor.ready(function () {
                    self._editorReady();
                });
                self.set('ui',editor);
            });
            return self;
         },
        /**
         * 加载css
         * @private
         */
        _loadCss:function(){
            var self = this;
            var editorConfig = self.getConfig('editor');
            var cssUrl = editorConfig.cssUrl;
            if(!cssUrl) return false;
            cssUrl = S.UA.ie < 8 && cssUrl + 'editor-pkg-sprite.css' || cssUrl + 'editor-pkg-datauri.css';
            S.use(cssUrl);
        },
        /**
         * 编辑器初始化完毕后执行的方法
         * @private
         */
        _editorReady:function(){
            var self = this;
            var editor = self.get('ui');
            if(!editor) return false;
            var $target = self.get('target');
            //字数统计组件
            var limiter = self._renderLimiter();
            self._setWidth();
            Event.on(editor.document, "keyup", function (ev) {
                var val = editor.getData();
                $target.val(val);
                limiter.count();
            });
        },
        /**
         * 初始化字数统计
         * @private
         * @return {Limiter}
         */
        _renderLimiter:function(){
            var self = this;
            var $target = self.get('target');
            //运行字数统计
            var renderLimiter = new RenderLimiter({target:$target,uiConfig:self.get('uiConfig')});
            var limiter = renderLimiter.get('ui');
            if(!limiter) return false;
            self.set('limiter',limiter);
            return limiter;
        },
        /**
         * 设置编辑器宽度
         * @private
         * @return {Boolean}
         */
        _setWidth:function(){
            var self = this;
            var editor = self.get('ui');
            if(!editor) return false;

            var $target = self.get('target');
            //编辑器容器
            var $wrapper = editor.editorWrap;
            var width = $target.attr('width');
            // var height = $target.attr('height');
            //获取width和height属性设置容器宽高
            width && $wrapper.width(Number(width));
            return self;
        }
    },{
        ATTRS:/** @lends RenderEditor.prototype*/{
            /**
             * 加载的编辑器模块
             * @type String
             * @default undo,separator,removeformat,format,font,color,separator,list,indent,justify,separator,link,separator,table,resize,draft
             */
            use:{value:"undo,separator,removeformat,format,font,color,separator,list,indent,justify,separator,link,separator,table,resize,draft"},
            /**
            * 字数统计组件
            * @type Limiter
            * @default '' 
            */
            limiter:{value:EMPTY}
        }
    });

    return RenderEditor;
}, {
    requires:[
        'event',
        'node',
        './base',
        './limiter'
    ]
});