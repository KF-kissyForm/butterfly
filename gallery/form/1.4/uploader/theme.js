/**
 * @fileoverview 上传组件主题基类
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('gallery/form/1.4/uploader/theme', function (S, Node, Base) {
    var EMPTY = '', $ = Node.all,
        //主题样式名前缀
        classSuffix = {BUTTON:'-button', QUEUE:'-queue'};

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
            self._initQueue();
            self._usePlugins();
            self._restore();
            self._LoaderCss();
            self.fire('render');
        },
        /**
         * 运行主题（供主题扩展使用）
         */
        render:function(){

        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function (target) {
            return target && target.children('.J_FileStatus') || $('');
        },
        /**
         * 控制文件对应的li元素的显影
         * @param {Boolean} isShow 是否认显示
         * @param {NodeList} target li元素
         * @param {Function} callback 回调
         */
        displayFile:function (isShow, target, callback) {
            var self = this,
                duration = self.get('duration');
            if (!target || !target.length) return false;
            target[isShow && 'fadeIn' || 'fadeOut'](duration, function () {
                callback && callback.call(self);
                //移除节点
                if(!isShow) target.remove();
            });
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
                self._appendFileDom(file);
            })
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
        },
        /**
         * 初始化队列
         * @return {Queue}
         */
        _initQueue:function () {
            var self = this;
            var queue = self.get('queue');
            queue.on('add',self._queueAddHandler,self);
            queue.on('remove', self._removeFileHandler, self);
            queue.on('statusChange', function (ev) {
                self._setStatusVisibility(ev);
            });
            return queue;
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
         * 队列添加完一个文件后触发
         * @param {Object} ev
         */
        _queueAddHandler:function (ev) {
            var self = this;
            var queue = self.get('queue');
            var index = ev.index;
            var file = ev.file;
            var $target = self._appendFileDom(file);
            //将状态层容器写入到file数据
            queue.updateFile(index, {
                target:$target,
                statusWrapper:self._getStatusWrapper($target)
            });
            self.displayFile(true, $target);
            //给li下的按钮元素绑定事件
            self._bindTriggerEvent(index, file);
            return queue.getFile(index);
        },
        /**
         * 删除队列中的文件后触发的监听器
         */
        _removeFileHandler:function (ev) {
            var self = this,
                file = ev.file;
            self.displayFile(false, file.target);
        },
        /**
         * 给删除、上传、取消等按钮元素绑定事件
         * TODO 这个是不是也应该放在imageUploader里面呢？
         * @param {Number} index 文件索引值
         * @param {Object} 文件数据
         */
        _bindTriggerEvent:function (index, file) {
            var self = this,
                queue = self.get('queue'),
                uploader = self.get('uploader'),
                //文件id
                fileId = file.id,
                //上传链接
                $upload = $('.J_Upload_' + fileId),
                //取消链接
                $cancel = $('.J_Cancel_' + fileId),
                //删除链接
                $del = $(".J_Del_" + fileId);
            //点击上传
            $upload.on('click', function (ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(index);
            });
            //点击取消
            $cancel.on('click', function (ev) {
                ev.preventDefault();
                uploader.cancel(index);
            });
            //点击删除
            $del.on('click', function (ev) {
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(fileId);
            });
        },
        /**
         * 设置状态层的可见性
         * @param ev
         */
        _setStatusVisibility:function (ev) {
            var $statusWrapper = ev.file.statusWrapper, $status,
                file = ev.file, status = file.status;
            if (!$statusWrapper || !$statusWrapper.length) {
                return false;
            }
            $status = $statusWrapper.children('.status');
            $status.hide();
            $statusWrapper.children('.' + status + '-status').show();

            var $target = file.target;
            var statuses = ['waiting','start','uploading','progress','error','success'];
            S.each(statuses,function(status){
                $target.removeClass(status);
            });
            $target.addClass(status);
        },
        /**
         * 当队列添加完文件数据后向队列容器插入文件信息DOM结构
         * @param {Object} fileData 文件数据
         * @return {KISSY.NodeList}
         */
        _appendFileDom:function (fileData) {
            var self = this, tpl = self.get('fileTpl'),
                $target = $(self.get('queueTarget')),
                hFile;
            if (!$target.length) return false;
            hFile = S.substitute(tpl, fileData);
            return $(hFile).appendTo($target).data('data-file', fileData);
        },
        /**
         * 使用插件
         * @private
         */
        _usePlugins:function(){
            var self = this;
            var plugins = self.get('use');
            var uploader = self.get('uploader');
            uploader.use(plugins);
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
 *           - 去掉状态层的log消息
 *           - 增加默认渲染数据操作
 *           - 去掉插件加载
 */