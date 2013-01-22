/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.4/uploader/index', function (S, Node, UploaderBase, RichBase) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader]:';
    //内置主题路径前缀
    var THEME_PREFIX = 'gallery/form/1.4/uploader/themes/';
    var PLUGIN_PREFIX = 'gallery/form/1.4/uploader/plugins/';
    /**
     * @name Uploader
     * @class 异步文件上传组件，支持ajax、flash、iframe三种方案
     * @constructor
     * @extends Base
     * @requires IframeType
     * @requires  AjaxType
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {Boolean} config.isAllowUpload 是否允许上传文件
     * @param {Boolean} config.autoUpload 是否自动上传
     * @example
     * var uploader = new Uploader({button:button,queue:queue,serverConfig:{action:'test.php'}})
     */

    var type = {AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'};

    /**
     * @name Uploader#select
     * @desc  选择完文件后触发
     * @event
     * @param {Array} ev.files 文件完文件后返回的文件数据
     */

    /**
     * @name Uploader#add
     * @desc  向队列添加文件后触发
     * @since 1.4
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#start
     * @desc  开始上传后触发
     * @event
     * @param {Number} ev.index 要上传的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#progress
     * @desc  正在上传中时触发，这个事件在iframe上传方式中不存在
     * @event
     * @param {Object} ev.file 文件数据
     * @param {Number} ev.loaded  已经加载完成的字节数
     * @param {Number} ev.total  文件总字节数
     */

    /**
     * @name Uploader#complete
     * @desc  上传完成（在上传成功或上传失败后都会触发）
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#success
     * @desc  上传成功后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#error
     * @desc  上传失败后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     * @param {Object} ev.status 服务器端返回的状态码，status如果是-1，说明是前端验证返回的失败
     */

    /**
     * @name Uploader#cancel
     * @desc  取消上传后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     */

    /**
     * @name Uploader#uploadFiles
     * @desc  批量上传结束后触发
     * @event
     */

    /**
     * @name Uploader#remove
     * @desc  从队列中删除文件后触发
     * @since 1.4
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#themeLoad
     * @since 1.4
     * @desc 主题加载后触发
     * @event
     */

    var Uploader = RichBase.extend([UploaderBase], /** @lends Uploader.prototype*/{
        constructor:function (target, config) {
            var self = this;
            Uploader.superclass.constructor.call(self, config);
            self.set('target', target);
            self._init();
        },
        /**
         * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
         * @return {Uploader}
         */
        _init:function () {
            var self = this;

            var $target = self.get('target');
            if (!$target.length) {
                S.log('目标元素不存在！');
                return false;
            }

            var type = self.get('type');
            var UploadType = self.getUploadType(type);
            if (!UploadType) return false;

            //生成模拟按钮，并实例化按钮类
            self._replaceBtn();
            var button = self._renderButton();

            var uploaderTypeEvent = UploadType.event;
            var serverConfig = self.get('serverConfig');
            var uploadType;
            self._renderQueue();

            //如果是flash异步上传方案，增加swfUploaderBase的实例作为参数
            if (self.get('type') == UploaderBase.type.FLASH) {
                S.mix(serverConfig, {swfUploaderBase:button.get('swfUploaderBase')});
            }
            serverConfig.fileDataName = self.get('name');
            //实例化上传方式类
            uploadType = new UploadType(serverConfig);
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
            uploadType.on(uploaderTypeEvent.ERROR, function (ev) {
                self.fire(event.ERROR, {status:ev.status, result:ev.result});
            }, self);
            //监听上传器上传进度事件
            if (uploaderTypeEvent.PROGRESS) uploadType.on(uploaderTypeEvent.PROGRESS, self._uploadProgressHandler, self);
            //监听上传器上传停止事件
            uploadType.on(uploaderTypeEvent.STOP, self._uploadStopHanlder, self);
            self.set('uploadType', uploadType);
            return self;
        },
        /**
         * 将input替换成上传按钮
         * @return {NodeList}
         * @private
         */
        _replaceBtn:function () {
            var self = this;
            var $btn = self.get('target');
            if (!$btn.length) return false;
            //渲染模拟按钮
            var text = $btn.val() || '上传文件';
            var btnHtml = S.substitute(self.get('btnTpl'), {text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);

            $btn.remove();
            self.set('target', $aBtn);
            return $aBtn;
        },
        /**
         * 使用插件
         * @param {String} plugin 插件名称
         * @param {Object} config 插件配置
         */
        use:function (plugin, config) {
            var self = this;
            var oPlugin;
            if(!plugin) return self;
            var plugins = plugin.split(',');
            S.each(plugins,function(p,i){
                //如果使用的是内置插件，拼接插件路径
                //拼接的路径类似gallery/form/1.4/uploader/plugins/auth/auth
                if (!/\//.test(p)) {
                    plugins[i] = PLUGIN_PREFIX+plugin + '/' +plugin;
                }
            });
            S.use(plugins.join(','),function(){
                var args = S.makeArray(arguments).slice(1);
                S.each(args,function(Plugin){
                    var c = S.merge(config,{uploader:self});
                    oPlugin = new Plugin(c);
                    if (oPlugin['pluginInitializer']) {
                        oPlugin['pluginInitializer'](self);
                    }
                    self.get('plugins').push(oPlugin);
                });
            });
            return self;
        },
        /**
         * 使用指定主题
         * @param {String|Theme} name 主题路径或主题类
         * @param {Object} config
         * @return  {Uploader}
         */
        theme:function (name, config) {
            var self = this;
            var theme = self.get('theme');
            if (theme) {
                S.log('不支持重新渲染主题！');
                return self;
            }
            //为模块路径
            if (S.isString(name)) {
                theme = self._initTheme(name, config || {});
            }
            //传入的是Theme的实例，直接返回
            else if (S.isObject(name)) {
                theme = name;
                theme.render();
            }
            self.set('theme', theme);
            return self;
        },
        /**
         * 初始化主题
         * @param {Function} callback 主题加载完成后的执行的回调函数
         */
        _initTheme:function (name, config) {
            var self = this;
            //如果只是传递主题名，组件自行拼接
            var theme = self._getThemeName(name);
            if (!config.queueTarget) {
                S.log('主题配置缺少queueTarget！');
                return false;
            }
            //引入主题
            S.use(theme, function (S, Theme) {
                //合并配置
                S.mix(config, {buttonTarget:self.get('target')});
                theme = new Theme(config);
                theme.set('uploader', self);
                theme.set('queue', self.get('queue'));
                theme.on('render', function () {
                    self.fire('themeLoad', {theme:theme, name:name});
                });
                theme.render();
            })
        },
        /**
         * 获取正确的主题名
         * @param {String} theme 主题名
         * @return {String}
         */
        _getThemeName:function (theme) {
            var self = this;
            var themeName = theme;
            //遍历内置模版，判断是否是内置模版
            var supportThemes = self.get('supportThemes');
            S.each(supportThemes, function (t) {
                if (t == theme) {
                    themeName = THEME_PREFIX + theme;
                }
            });
            themeName = themeName + '/index';
            return themeName;
        }
    }, {ATTRS:/** @lends Uploader.prototype*/{
        /**
         * 上传组件的目标元素（一般为file表单域）
         * @type NodeList
         * @since 1.4
         * @default ""
         */
        target:{
            value:EMPTY,
            getter:function (v) {
                return $(v);
            }
        },
        /**
         * 主题实例
         * @type Theme
         * @since 1.4
         * @default ""
         */
        theme:{ value:EMPTY },
        /**
         * 支持的内置主题
         * @type Array
         * @since 1.4
         * @default ['default','imageUploader', 'ershouUploader', 'loveUploader', 'refundUploader', 'singleImageUploader']
         */
        supportThemes:{value:['default', 'imageUploader', 'ershouUploader', 'loveUploader', 'refundUploader', 'singleImageUploader']},
        /**
         * 模拟上传按钮样式，不推荐替换
         * @type String
         * @since 1.4
         */
        btnTpl:{
            value:'<a href="javascript:void(0)" class="g-u ks-uploader-button"><span class="btn-text">{text}</span></a>'
        },
        /**
         * Button按钮的实例
         * @type Button
         * @default {}
         */
        button:{value:{}},
        /**
         * Queue队列的实例
         * @type Queue
         * @default {}
         */
        queue:{value:{}},
        /**
         * 采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","flash","iframe"]。
         * @type String|Array
         * @default "auto"
         * @since V1.2 （当“type” : “auto”，等价于["ajax","flash","iframe"]）
         */
        type:{value:type.AUTO},
        /**
         * 是否开启多选支持，部分浏览器存在兼容性问题
         * @type Boolean
         * @default false
         * @since V1.2
         */
        multiple:{
            value:false,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('multiple', v);
                }
                return v;
            }
        },
        /**
         * 用于限制多选文件个数，值为负时不设置多选限制
         * @type Number
         * @default -1
         * @since V1.2.6
         */
        multipleLen:{ value:-1 },
        /**
         * 是否可用,false为可用
         * @type Boolean
         * @default false
         * @since V1.2
         */
        disabled:{
            value:false,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('disabled', v);
                }
                return v;
            }
        },
        /**
         * 服务器端配置。action：服务器处理上传的路径；data： post给服务器的参数，通常需要传递用户名、token等信息
         * @type Object
         * @default  {action:EMPTY, data:{}, dataType:'json'}
         */
        serverConfig:{value:{action:EMPTY, data:{}, dataType:'json'}},
        /**
         * 服务器处理上传的路径
         * @type String
         * @default ''
         */
        action:{
            value:EMPTY,
            getter:function (v) {
                return self.get('serverConfig').action;
            },
            setter:function (v) {
                if (S.isString(v)) {
                    var self = this;
                    self.set('serverConfig', S.mix(self.get('serverConfig'), {action:v}));
                }
                return v;
            }
        },
        /**
         * 此配置用于动态修改post给服务器的数据，会覆盖serverConfig的data配置
         * @type Object
         * @default {}
         * @since V1.2.6
         */
        data:{
            value:{},
            getter:function () {
                var self = this, uploadType = self.get('uploadType'),
                    data = self.get('serverConfig').data || {};
                if (uploadType) {
                    data = uploadType.get('data');
                }
                return data;
            },
            setter:function (v) {
                if (S.isObject(v)) {
                    var self = this, uploadType = self.get('uploadType');
                    self.set('serverConfig', S.mix(self.get('serverConfig'), {data:v}));
                    if (S.isFunction(uploadType)) uploadType.set('data', v);

                }
                return v;
            }
        },
        /**
         * 是否允许上传文件
         * @type Boolean
         * @default true
         */
        isAllowUpload:{value:true},
        /**
         * 是否自动上传
         * @type Boolean
         * @default true
         */
        autoUpload:{value:true},
        /**
         * 服务器端返回的数据的过滤器
         * @type Function
         * @default function(){}
         */
        filter:{
            value:EMPTY,
            setter:function (v) {
                var self = this;
                var uploadType = self.get('uploadType');
                if (uploadType)uploadType.set('filter', v);
                return v;
            }
        },
        /**
         *  当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
         *  @type Number
         *  @default ""
         */
        curUploadIndex:{value:EMPTY},
        /**
         * 上传方式实例
         * @type UploaderType
         * @default {}
         */
        uploadType:{value:{}},
        /**
         * UrlsInput实例
         * @type UrlsInput
         * @default ""
         */
        urlsInput:{value:EMPTY},
        /**
         * 存在批量上传文件时，指定的文件状态
         * @type String
         * @default ""
         */
        uploadFilesStatus:{value:EMPTY},
        /**
         * 强制设置flash的尺寸，只有在flash上传方式中有效，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        swfSize:{value:{}}
    }}, 'Uploader');
    return Uploader;
}, {requires:['node', './base', 'rich-base']});
/**
 * changes:
 * 明河：1.4
 *           - 重构模块
 *           - 去掉urlsInputName参数
 *           - 新增add和remove事件
 */