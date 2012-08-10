/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/imageUploader',function (S, Base, Node, RenderUploader) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploaderRender]:',
        dataName = {
            CONFIG:'data-config',
            BUTTON_CONFIG : 'data-button-config',
            THEME_CONFIG : 'data-theme-config',
            AUTH : 'data-auth'
        },
        //所支持的内置主题
        THEMES = ['default','imageUploader', 'ershouUploader','uploadify'],
        //内置主题路径前缀
        THEME_PREFIX='gallery/form/1.3/uploader/themes/';
    /**
     * @name ImageUploader
     * @class 异步文件上传入口文件，会从按钮的data-config='{}' 伪属性中抓取组件配置
     * @version 1.2
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置，该配置会覆盖data-config伪属性中的数据
     * @requires Uploader
     * @requires Auth
     * @example
     * <a id="J_UploaderBtn" class="uploader-button" data-config=
     '{"type" : "auto",
     "serverConfig":{"action":"upload.php"},
     "name":"Filedata",
     "urlsInputName":"fileUrls"}'
     href="#">
     选择要上传的文件
     </a>
     <ul id="J_UploaderQueue">

     </ul>
     * @example
     *
KISSY.use('gallery/form/1.3/uploader/index', function (S, ImageUploader) {
     var ru = new ImageUploader('#J_UploaderBtn', '#J_UploaderQueue');
     ru.on("init", function (ev) {
        var uploader = ev.uploader;
     })
})
     */
    function ImageUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //合并配置
        config = S.mix(S.form.parseConfig(buttonTarget), config);
        //超类初始化
        ImageUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget', buttonTarget);
        self.set('queueTarget', queueTarget);
        self.set('uploaderConfig', config);
        self._init();
    }
    /**
     * @name ImageUploader#init
     * @desc 上传组件完全初始化成功后触发，对uploader的操作务必先监听init事件
     * @event
     * @param {Uploader} ev.uploader   Uploader的实例
     * @param {Button} ev.button   Button的实例
     * @param {Queue} ev.queue   Queue的实例
     * @param {Auth} ev.auth   Auth的实例
     */

    S.extend(ImageUploader, RenderUploader, /** @lends ImageUploader.prototype*/{
        /**
         * 初始化组件
         */
        _init:function () {
            var self = this,
                //主题路径
                theme = self.get('theme'),
                uploader;
            //不使用主题
            if(theme == EMPTY){
                uploader = self._initUploader();
                self.set('button', uploader.get('button'));
                S.later(function(){
                    self.fire('init', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                },500);
            }else{
                self._initThemes(function (theme) {
                    uploader = self._initUploader();
                    self.set('button', uploader.get('button'));
                    theme.set('uploader',uploader);
                    theme.set('button',uploader.get('button'));
                    theme.set('queue',uploader.get('queue'));
                    theme.set('auth',uploader.get('auth'));
                    theme._UploaderRender(function(){
                        theme.afterUploaderRender(uploader);
                        // 抓取restoreHook容器内的数据，生成文件DOM
                        uploader.restore();
                        self.fire('init', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                    });
                });
            }
        },
        /**
         * 初始化Uploader
         * @return {Uploader}
         */
        _initUploader:function(){
            var self = this, uploaderConfig = self.get('uploaderConfig'),
                name = self.get('name');
            S.mix(uploaderConfig.serverConfig,{'fileDataName':name});
            //配置增加按钮实例和队列实例
            S.mix(uploaderConfig, {target:self.get('buttonTarget')});
            var uploader = new Uploader(uploaderConfig);
            uploader.render();
            self.set('uploader', uploader);
            self._auth();
            return uploader;
        },
        /**
         * 初始化主题
         * @param {Function} callback 主题加载完成后的执行的回调函数
         */
        _initThemes:function (callback) {
            var self = this, theme = self.get('theme'),
                target = self.get('buttonTarget'),
                cf = self.get('themeConfig'),
                //从html标签的伪属性中抓取配置
                config = S.form.parseConfig(target,dataName.THEME_CONFIG);
            S.mix(config,cf);
            self.set('themeConfig',config);
            //如果只是传递主题名，组件自行拼接
            theme = self._getThemeName(theme);
            S.use(theme, function (S, Theme) {
                var queueTarget = self.get('queueTarget'), theme;
                S.mix(config,{queueTarget:queueTarget,buttonTarget:self.get('buttonTarget')});
                theme = new Theme(config);
                theme.on('render',function(){
                    callback && callback.call(self, theme);
                });
                theme.render();
            })
        },
        /**
         * 获取正确的主题名
         * @param {String} theme 主题名
         * @return {String}
         */
        _getThemeName:function(theme){
            var themeName = theme;
            S.each(THEMES,function(t){
               if(t == theme){
                   themeName = THEME_PREFIX + theme;
               }
            });
            themeName = themeName + '/index';
            return themeName;
        },
        /**
         * 文件上传验证
         */
        _auth:function () {
            var self = this,buttonTarget = self.get('buttonTarget'),
                uploader = self.get('uploader'),
                cf = self.get('authConfig'),
                config = S.form.parseConfig(buttonTarget,dataName.AUTH);
            S.mix(config,cf);
            self.set('authConfig',config);
            if(S.isEmptyObject(config)) return false;
            auth = new Auth(uploader,{rules : config});
            uploader.set('auth',auth);
            return auth;
        }
    }, {
        ATTRS:/** @lends ImageUploader.prototype*/{
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “default”
             */
            theme:{value:'default' }
        }
    });
    return ImageUploader;
}, {requires:['base', 'node','./index' ]});
