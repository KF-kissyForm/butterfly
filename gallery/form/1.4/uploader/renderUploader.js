/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.4/uploader/renderUploader',function (S, Base, Node, Uploader,Auth) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploaderRender]:';
     //内置主题路径前缀
    var THEME_PREFIX='gallery/form/1.4/uploader/themes/';
    /**
     * @name RenderUploader
     * @class 异步文件上传入口文件
     * @version 1.4
     * @since 1.4
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置
     * @requires Uploader
     * @requires Auth
     */
    function RenderUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //超类初始化
        RenderUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget', buttonTarget);
        self.set('queueTarget', queueTarget);
        self.set('uploaderConfig', config);
    }

    S.mix(RenderUploader, /** @lends RenderUploader*/{
        /**
         * 监听的uploader事件
         */
        events:['select','start','progress','complete','success','uploadFiles','cancel','error','restore'],
        /**
         * 监听queue事件
         */
        queueEvents:['add','remove','statusChange','clear']
    });

    /**
     * @name RenderUploader#render
     * @desc 上传组件完全初始化成功后触发，对uploader的操作务必先监听render事件
     * @event
     * @param {Uploader} ev.uploader   Uploader的实例
     * @param {Button} ev.button   Button的实例
     * @param {Queue} ev.queue   Queue的实例
     * @param {Auth} ev.auth   Auth的实例
     */

    S.extend(RenderUploader, Base, /** @lends RenderUploader.prototype*/{
        /**
         * 初始化组件
         */
        render:function () {
            var self = this;
            var $target =self.get('buttonTarget');
            if(!$target.length) return false;
            if($target.attr('theme')) self.set('theme',$target.attr('theme'));

            //主题路径
            var  theme = self.get('theme');
            var uploader;

            self._setQueueTarget();
            self._setConfig();
            self._replaceBtn();

            //不使用主题
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
                    uploader.restore();
                    self.fire('render', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                });
            });
            return self;
        },
        /**
         * 初始化Uploader
         * @return {Uploader}
         */
        _initUploader:function(){
            var self = this, uploaderConfig = self.get('uploaderConfig');
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
                config = self.get('themeConfig');
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
            var self = this;
            var themeName = theme;
            var supportThemes = self.get('supportThemes');
            S.each(supportThemes,function(t){
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
                config = self.get('authConfig');
            if(S.isEmptyObject(config)) return false;
            var auth = new Auth(uploader,{rules : config});
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
            self.set('authConfig',authConfig);
            if(!S.isEmptyObject(authConfig)){
                self.set('authConfig', S.mix(authConfig,self.get('authConfig')));
            }

            var configkeys = ['name','urlsInputName','urlsTarget','autoUpload','postData','action','multiple','multipleLen','uploadType','disabled'];
            var serverConfig = {};
            S.each(configkeys,function(key){
                var htmlKey = key;
                var value = $btn.attr(htmlKey);
                if(value){

                    switch (key){
                        case 'postData' :
                            key = 'data';
                            value = value && S.JSON.parse(value);
                            serverConfig.data = value;
                            break;
                        case 'action' :
                            serverConfig.action = value;
                            break;
                        case 'uploadType':
                            key = 'type';
                            break;
                    }

                    if(key == 'autoUpload' || key == 'multiple' || key == 'disabled' ){
                        value = value == 'false' && false || true;
                    }

                    htmlConfig[key] = value;

                }
            });
            htmlConfig.serverConfig = serverConfig;
            uploaderConfig = S.merge(htmlConfig,uploaderConfig);
            self.set('uploaderConfig',uploaderConfig);
            self.set('name',uploaderConfig.name);
        },
        /**
         * 设置队列目标元素（合并html去queueTarget属性）
         * @private
         */
        _setQueueTarget:function(){
            var self = this;
            var $queue = self.get('queueTarget');
            var $btn = self.get('buttonTarget');
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
            var events = RenderUploader.events;
            var queueEvents = RenderUploader.queueEvents;
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
         * 从html中拉取验证配置
         * @private
         */
        _getAuthConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;

            var authConfig = {};
            //所有的验证规则
            var authRules = ['required','max','allowExts','maxSize','allowRepeat'];
            //验证消息
            var msgs = self.get('authMsg');
            var uploaderConfig = self.get('uploaderConfig');

            S.each(authRules,function(rule){
                //js配置验证
                if(!S.isUndefined(uploaderConfig[rule])){
                    authConfig[rule] = [uploaderConfig[rule],msgs[rule] || ''];
                }else{
                    //拉取属性的验证配置
                    var value = $btn.attr(rule);
                    if(value){
                        value = self._formatAuthConfig(rule,value);
                        authConfig[rule] = [value,msgs[rule] || ''];
                    }

                }
            });
            return authConfig;
        },
        /**
         * 格式化验证配置的值
         * @param rule
         * @param value
         * @return {*}
         * @private
         */
        _formatAuthConfig:function(rule,value){
            var self = this;
            switch (rule){
                case 'allowExts':
                    value = self._setAllowExts(value);
                    break;
                case 'max':
                    value = Number(value);
                    break;
                case 'maxSize':
                    value = Number(value);
                    break;
                case  'required':
                    value = true;
                    break;
                case 'allowRepeat':
                    value = true;
                    break;
            }
            return value;
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         * @private
         */
        _setAllowExts:function(exts){
            if(!S.isString(exts)) return exts;
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
            var $btn = self.get('buttonTarget');
            if(!$btn.length) return false;

            //渲染模拟按钮
            var text = $btn.val() || '上传文件';
            var btnHtml = S.substitute(self.get('btnTpl'),{text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);

            $btn.remove();
            self.set('buttonTarget',$aBtn);
            //覆盖配置中的按钮覆盖元素
            self.set('uploaderConfig', S.mix(self.get('uploaderConfig'),{target:$aBtn}));
            return $aBtn;
        }
    }, {
        ATTRS:/** @lends RenderUploader.prototype*/{
            /**
             * 支持的内置主题
             * @type Array
              */
            supportThemes:{value:[]},
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “default”
             */
            theme:{value:'default' },
            /**
             * 主题配置，会覆盖data-theme-config中的配置，不再推荐使用伪属性的方式配置主题参数
             * @type Object
             * @default {}
             * @since 1.2
             * @example
 //配置主题样式路径
themeConfig:{
    cssUrl:'gallery/form/1.4/uploader/themes/default/style.css'
}
             */
            themeConfig:{value:{}},
            /**
             * 按钮目标元素
             * @type String|HTMLElement|KISSY.NodeList
             * @default ""
             */
            buttonTarget:{
                value:EMPTY,
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 队列目标元素
             * @default ""
             * @type String|HTMLElement|KISSY.NodeList
             */
            queueTarget:{
                value:EMPTY,
                getter:function(v){
                    return $(v);
                }
            },
            /**
             * 上传组件配置
             * @type Object
             * @default {}
             */
            uploaderConfig:{},
            /**
             * 验证配置，弃用
             * @type Object
             * @default {}
             * @since 1.2
             * @example
             //验证配置
             authConfig: {
                 allowExts:[
                     {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"},
                     '不支持{ext}格式的文件上传！'
                 ],
                 max:[3, '每次最多上传{max}个文件！']
             }
             */
            authConfig:{value:{}},
            /**
             * 验证消息
             * @type Object
             * @default {}
             */
            authMsg:{ value:{ } },
            /**
             * Button（上传按钮）的实例
             * @type Button
             * @default ""
             */
            button:{value:EMPTY},
            /**
             * Queue（上传队列）的实例
             * @type Queue
             * @default ""
             */
            queue:{value:EMPTY},
            /**
             * 上传组件实例
             * @type Uploader
             * @default ""
             */
            uploader:{value:EMPTY},
            /**
             * 模拟上传按钮样式
             * @type String
             */
            btnTpl:{
                value:'<a href="javascript:void(0)" class="g-u ks-uploader-button"><span class="btn-text">{text}</span></a>'
            }
        }
    });
    return RenderUploader;
}, {requires:['base', 'node', './base','./plugins/auth/auth']});
