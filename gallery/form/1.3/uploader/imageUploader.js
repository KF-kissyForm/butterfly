/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/imageUploader',function (S, Base, Node, RenderUploader,Auth) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[ImageUploader]:',
        dataName = {
            CONFIG:'data-config',
            BUTTON_CONFIG : 'data-button-config',
            THEME_CONFIG : 'data-theme-config'
        },
        //所支持的内置主题
        THEMES = ['default','imageUploader', 'ershouUploader','uploadify'],
        //内置主题路径前缀
        THEME_PREFIX='gallery/form/1.3/uploader/themes/';
    /**
     * @name ImageUploader
     * @class 异步文件上传入口文件，会从按钮的data-config='{}' 伪属性中抓取组件配置
     * @version 1.3
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
    }
    S.mix(ImageUploader, /** @lends ImageUploader*/{
        /**
         * 监听的uploader事件
         */
        events:['select','start','progress','complete','success','uploadFiles','cancel','error','restore'],
        /**
         * 监听queue事件
         */
        queueEvents:['add','remove','statusChange','clear']
    });
    S.extend(ImageUploader, RenderUploader, /** @lends ImageUploader.prototype*/{
        /**
         * 删除父类的自动初始化函数
         * @private
         */
        _init:function(){

        },
        /**
         * 初始化组件
         * @return {ImageUploader}
         */
        render:function () {
            var self = this;
            //主题路径
            var  theme = self.get('theme');
            var uploader;

            self._setQueueTarget();
            self._setConfig();
            self._replaceBtn();

            //不使用主题
            if(theme == EMPTY){
                uploader = self._initUploader();
                self.set('button', uploader.get('button'));
                S.later(function(){
                    self.fire('render', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
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
                        self._bindEvents(uploader);
                        // 抓取restoreHook容器内的数据，生成文件DOM
                        uploader.restore();
                        self.fire('render', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                    });
                });
            }
            return self;
        },
        /**
         * 设置队列目标元素
         * @private
         */
        _setQueueTarget:function(){
            var self = this;
            var $queue = self.get('queueTarget');
            var $btn = $(self.get('buttonTarget'));
            if(!$queue || !$queue.length){
                var queueTarget = $btn.attr('queueTarget');
                if(queueTarget != EMPTY){
                    self.set('queueTarget',$(queueTarget));
                }
            }
        },
        /**
         * 监听uploader的各个事件
         * @param {Uploader} uploader
         * @private
         */
        _bindEvents:function(uploader){
            if(!uploader) return false;
            var self = this;
            var events = ImageUploader.events;
            var queueEvents = ImageUploader.queueEvents;
            var queue = uploader.get('queue');
            var extEventObj =  {uploader:uploader,queue:queue};
            S.each(events,function(event){
                uploader.on(event,function(ev){
                    self.fire(event, S.mix(ev,extEventObj));
                })
            });
            S.each(queueEvents,function(event){
                queue.on(event,function(ev){
                    self.fire(event, S.mix(ev,extEventObj));
                })
            })
        },
        /**
         * 初始化文件验证
         * @return {Auth}
         * @private
         */
        _auth:function () {
            var self = this;
            var  uploader = self.get('uploader') ;
            var config = self.get('authConfig');
            var auth;
            if(S.isEmptyObject(config)) return false;
            auth = new Auth(uploader,{rules : config});
            uploader.set('auth',auth);
            return auth;
        },
        /**
         * 设置配置
         * @private
         */
        _setConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            var uploaderConfig = self.get('uploaderConfig');
            var htmlConfig = {};
            var authConfig = self._getAuthConfig();
            if(!S.isEmptyObject(authConfig)){
                  self.set('authConfig', S.mix(authConfig,self.get('authConfig')));
            }

            var configkeys = ['name','urlsInputName','autoUpload','postData','action','multiple','multipleLen','uploadType','disabled','restoreHook'];
            S.each(configkeys,function(key){
                var htmlKey = key;
                var value = $btn.attr(htmlKey);
                if(key == 'postData'){
                    key = 'data';
                    value = value && S.JSON.parse(value);
                }
                if(key == 'uploadType') key = 'type';
                htmlConfig[key] = value;
            });
            uploaderConfig = S.merge(htmlConfig,uploaderConfig);
            self.set('uploaderConfig',uploaderConfig);
            self.set('name',uploaderConfig.name);

        },
        /**
         * 从html中拉取验证配置
         * @private
         */
        _getAuthConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;
            var authConfig = {};
            var authRules = ['required','max','allowExts','maxSize'];
            var msgs = self.get('authMsg');
            if(!$btn.length) return false;
            S.each(authRules,function(rule){
                var value = $btn.attr(rule);
                if(value){
                    if(rule == 'allowExts') value = self._setAllowExts(value);
                    authConfig[rule] = [value,msgs[rule] || ''];
                }
            });
            return authConfig;
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         * @private
         */
        _setAllowExts:function(exts){
            if(!S.isString(exts)) return false;
            var ext = [];
            var desc = [];
            exts = exts.split(',');
            S.each(exts,function(e){
                ext.push('*.'+e);
                desc.push(e.toUpperCase());
            });
            ext = ext.join(';');
            desc = desc.join(',');
            return {desc:desc,ext:ext};
        },
        /**
         * 将input替换成上传按钮
         * @private
         */
        _replaceBtn:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;
            var text = $btn.val() || '上传图片';
            var btnHtml = S.substitute(self.get('btnTpl'),{text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);
            $btn.remove();
            self.set('buttonTarget',$aBtn);
            self.set('uploaderConfig', S.mix(self.get('uploaderConfig'),{target:$aBtn}));
            return $aBtn;
        }
    }, {
        ATTRS:/** @lends ImageUploader.prototype*/{
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “imageUploader”
             */
            theme:{value:'imageUploader' },
            /**
             * 验证消息
             * @type Object
             * @default {}
             */
            authMsg:{
                value:{
                    max:'每次最多上传{max}个文件！',
                    maxSize:'文件大小为{size}，文件太大！',
                    required:'至少上传一张图片！',
                    require:'至少上传一张图片！',
                    allowExts:'不支持{ext}格式的文件上传！'
                }
            },
            /**
             * 模拟上传按钮样式
             */
            btnTpl:{
                value:'<a href="javascript:void(0)" class="g-u ks-uploader-button">{text}</a>'
            }
        }
    });
    return ImageUploader;
}, {requires:['base', 'node','./index','./auth/base' ]});
