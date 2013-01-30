/**
 * @fileoverview 上传组件主题基类
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('gallery/uploader/1.4/theme', function (S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    //主题样式名前缀
    var classSuffix = {BUTTON:'-button', QUEUE:'-queue'};
    //html中拉取主题模版的容器的type：<script type="text/uploader-theme"></script>
    var HTML_THEME = 'text/uploader-theme';

    /**
     * @name Theme
     * @class 上传组件主题基类
     * @constructor
     * @extends Base
     * @requires Queue
     */
    function Theme(config) {
        var self = this;
        //调用父类构造函数
        Theme.superclass.constructor.call(self, config);
        self._init();
    }

    S.extend(Theme, Base, /** @lends Theme.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            self._addThemeCssName();
            self._tplFormHtml();
            self._usePlugins();
            self._bind();
            self._LoaderCss(function(){
                self._restore();
                self.fire('init');
            });
        },
        /**
         * 运行主题（供主题扩展使用）
         */
        render:function(){

        },
        /**
         * 选择文件后执行的方法
         * @private
         */
        _selectHandler:function(){

        },
        /**
         * 队列添加完一个文件后触发
         */
        _addHandler:function (ev) {

        },
        /**
         * 删除队列中的文件后触发的监听器
         */
        _removeHandler:function (ev) {

        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function (ev) {

        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler:function (ev) {

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function (ev) {

        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {

        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {

        },
        /**
         * 渲染默认数据
         * @private
         */
        _restore:function(){
            var self = this;
            var uploader = self.get('uploader');
            var urlsInput = uploader.getPlugin('urlsInput');
            if(!urlsInput) return false;
            var autoRestore = urlsInput.get('autoRestore');
            if(!autoRestore) return false;

            var queue = uploader.get('queue');
            var files = queue.get('files');
            if(!files.length) return false;

            S.each(files,function(file){
                //将存在的文件数据渲染到队列DOM中，状态为success
                file.status = 'success';
                file.target = self._appendFileDom(file);
                self._renderHandler('_successHandler',{file:file});
            });

            return self;
        },
        /**
         * 将主题名写入到队列和按钮目标容器，作为主题css样式起始
         */
        _addThemeCssName:function () {
            var self = this, name = self.get('name'),
                $queueTarget = $(self.get('queueTarget')),
                $btn = $(self.get('buttonTarget'));
            if (name == EMPTY) return false;
            if($queueTarget.length)  $queueTarget.addClass(name + classSuffix.QUEUE);
            $btn.addClass(name + classSuffix.BUTTON);
            return self;
        },
        /**
         * 监听uploader的事件
         * @private
         */
        _bind:function(){
            var self = this;
            var uploader = self.get('uploader');
            var uploaderEvents = ['add','remove','select','start','progress','success','error','complete'];

            uploader.on(uploaderEvents[0],function(ev){
                var $target = self._appendFileDom(ev.file);
                var queue = uploader.get('queue');
                queue.updateFile(ev.index,{target:$target});
            });

            uploader.on(uploaderEvents[1],function(ev){
                self._removeFileDom(ev.file);
            });

            S.each(uploaderEvents,function(e){
                uploader.on(e,function(ev){
                    var handlerName = '_'+ev.type+'Handler';
                    self._renderHandler(handlerName,ev);
                });
            })
        },
        /**
         * 运行监听器方法
         * @private
         */
        _renderHandler:function(handlerName,ev){
            var self = this;
            var extend = self.get('extend');
            var handler = self[handlerName];
            self._setStatusVisibility(ev.file);
            if(S.isObject(extend) && S.isFunction(extend[handlerName])){
                extend[handlerName].call(self,ev);
            }else{
                handler && handler.call(self,ev);
            }
        },
        /**
         * 设置各个状态下的消息可见性
         * @param {Object} file 文件
         */
        _setStatusVisibility:function (file) {
            var self = this;
            if(!S.isObject(file)) return self;
            //处理消息层的显影
            var status = file.status;
            var $target = file.target;
            var $status = $target.all('.'+status+'-status');
            if($status.length){
                $target.all('.status').hide();
                $status.show();
            }
            //处理队列元素的状态样式
            var statuses = ['waiting','start','uploading','progress','error','success'];
            S.each(statuses,function(status){
                $target.removeClass(status);
            });
            $target.addClass(status);
            return self;
        },
        /**
         * 加载css文件
         */
        _LoaderCss:function (callback) {
            var self = this,
                cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl == EMPTY){
                callback && callback.call(self);
                return false;
            }
            S.use(cssUrl, function () {
                S.log(cssUrl + '加载成功！');
                callback && callback.call(self);
            });
        },
        /**
         * 当队列添加完文件数据后向队列容器插入文件信息DOM结构
         * @param {Object} fileData 文件数据
         * @return {KISSY.NodeList}
         */
        _appendFileDom:function (fileData) {
            var self = this;
            var tpl = self.get('fileTpl');
            var $target = $(self.get('queueTarget'));
            var hFile;
            if (!$target.length) return false;
            hFile = S.substitute(tpl, fileData);
            return $(hFile).hide().appendTo($target).fadeIn(0.4).data('data-file', fileData);
        },
        /**
         *  移除文件DOM
         * @private
         */
        _removeFileDom:function(file){
            if(!S.isObject(file)) return false;
            var $target = file.target;
            if(!$target || !$target.length) return false;
            $target.fadeOut(0.4,function(){
                $target.remove();
            })
        },
        /**
         * 使用插件
         * @private
         */
        _usePlugins:function(){
            var self = this;
            var plugins = self.get('use');
            if(plugins == EMPTY) return false;
            var uploader = self.get('uploader');
            uploader.use(plugins);
            return self;
        },
        /**
         * 从html中拉取模版
         * @private
         * @return {String}
         */
        _tplFormHtml:function(){
            var self = this;
            var tpl = self.get('fileTpl');
            var $target = $(self.get('queueTarget'));
            var hasHtmlTpl = false;
            if(!$target.length) return false;

            var $tpl = $target.all('script');
            $tpl.each(function(el){
                  if(el.attr('type') == HTML_THEME){
                      hasHtmlTpl = true;
                      tpl = el.html();
                      self.set('fileTpl',tpl);
                  }
            });

            return tpl;
        }

    }, {ATTRS:/** @lends Theme.prototype*/{
        /**
         *  主题名
         * @type String
         * @default ""
         */
        name:{value:EMPTY},
        /**
        * 使用插件
        * @type String
        * @default ''
        */
        use:{value:EMPTY},
        /**
         * css模块路径
         * @type String
         * @default ""
         */
        cssUrl:{value:EMPTY},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:EMPTY },
        /**
        * 覆盖主题方法集合
        * @type Object
        * @default ''
        */
        extend:{value:EMPTY},
        /**
         * 验证消息
         * @since 1.4
         * @type Object
         * @default {max:'每次最多上传{max}个文件！',
                    maxSize:'文件大小为{size}，超过{maxSize}！',
                    required:'至少上传一个文件！',
                    require:'至少上传一个文件！',
                    allowExts:'不支持{ext}格式！',
                    allowRepeat:'该文件已经存在！'}
         */
        authMsg:{
            value:{
                max:'每次最多上传{max}个文件！',
                maxSize:'文件大小为{size}，超过{maxSize}！',
                required:'至少上传一个文件！',
                require:'至少上传一个文件！',
                allowExts:'不支持{ext}格式！',
                allowRepeat:'该文件已经存在！'
            }
        },
        /**
         * 队列目标元素（一般是ul），队列的实例化过程在Theme中
         * @type String
         * @default ""
         */
        queueTarget:{value:EMPTY},
        /**
         * Queue（上传队列）实例
         * @type Queue
         * @default ""
         */
        queue:{value:EMPTY},
        /**
         * Uploader 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY}
    }});
    return Theme;
}, {requires:['node', 'base']});
/**
 * changes:
 * 明河：1.4
 *           - 去掉状态层概念和log消息
 *           - 增加默认渲染数据操作
 *           - 去掉插件加载
 *           - 增加从html拉取模版的功能
 *           - 增加从外部快速覆盖主题监听器的功能
 */