/**
 * @fileoverview 表单美化组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/butterfly/index', function (S, Base, Node,Radio,Checkbox,Limiter,Uploader,SpinBox,Auth) {
    var EMPTY = '';
    var $ = Node.all;
    var LOG_PREFIX = '[Butterfly]:';
    var CSS_URL_PRE = 'gallery/form/1.3/butterfly/themes/';
    var CSS_FILE_NAME = 'style.css';
    var CONFIG_FILE_NAME = 'config.js';
    /**
     *
     * @param target
     * @param config
     * @constructor
     */
    function Butterfly(target,config) {
        var self = this;
        config = S.mix({target:target},config);
        //超类初始化
        Butterfly.superclass.constructor.call(self, config);
    }
    S.mix(Butterfly,/** @lends Butterfly*/{
        THEMES:['default'],
        event:{
            AFTER_LOAD_THEME:'afterLoadTheme'
        }
    });
    S.extend(Butterfly, Base, /** @lends Butterfly.prototype*/{
        /**
         * 渲染组件
         */
        render : function(){
             var self = this;
             var $target = self.get('target');
             var $inputs;
            if(!$target.length){
                S.log(LOG_PREFIX + '表单目标节点不存在！');
                return false;
            }
            self._loadTheme(self.get('theme'),function(){
                $inputs = $target.all('input');
                if(!$inputs.length){
                    S.log(LOG_PREFIX + '不存在需要美化的表单元素！');
                    return false;
                }
                $inputs.each(function($input){
                    self._renderCom($input)
                });

                self._initTextArea();
                //实例化验证组件
                self._renderAuth();
            });
        },
        /**
         * 根据表单元素的type实例化对应的表单组件
         * @param {NodeList} $input 表单元素
         */
        _renderCom:function($input){
            if(!$input || !$input.length) return false;
            var self = this,type = $input.attr('type'),obj;
            var fields = self.get('fields');
            switch (type){
                case 'text':
                    self._renderLimiter($input);
                break;
                case 'radio':
                   self._renderGroupCom($input);
                break;
                case 'checkbox':
                    self._renderGroupCom($input);
                break;
                case 'spinbox':
                    self._renderSpinbox($input);
                break;
                case 'image-uploader':
                    self._renderImageUploader($input);
                break;
                case 'button':
                break;
            }
        },
        /**
         * 实例化像radio和checkbox的模拟组件（多个input）
         * @private
         */
        _renderGroupCom:function($input){
            if(!$input || !$input.length) return false;
            var self = this;
            var name = $input.attr('name');
            var type = $input.attr('type');
            var fields = self.get('fields');
            var CLASS;
            if(name == EMPTY){
                S.log(LOG_PREFIX + type +'缺少name值');
            }else{
                if(!fields[name]){
                    switch (type){
                        case 'radio':
                            CLASS =  Radio;
                        break;
                        case 'checkbox':
                            CLASS = Checkbox;
                        break;
                    }
                    $input = $(document.getElementsByName(name));
                    fields[name] = new CLASS($input,{cssUrl:EMPTY}).render();
                    self.set('fields',fields);
                }
            }
            return self.get('fields');
        },
        /**
         * 实例化验证组件
         * @private
         * @return {Auth}
         */
        _renderAuth:function(){
            var self = this;
            var authConfig = self.get('authConfig');
            var auth = EMPTY;
            auth = new Auth(self.get('target'), {
                autoBind:true,
                stopOnError:false,
                msg:{
                    tpl:'<div class="msg {prefixCls}"><p class="{style}">{msg}</p></div>',
                    args:{
                        prefixCls:'under'
                    }
                }
            });
            self.set('auth',auth);
            return auth;
        },
        /**
         * 初始化textarea
         * @private
         */
        _initTextArea:function(){
            var self = this;
            var $target = self.get('target');
            if(!$target.length) return false;
            var $textAreas = $target.all('textarea');
            if(!$textAreas.length) return false;
            $textAreas.each(function($textArea){
                self._renderLimiter($textArea);
            });
        },
        /**
         * 运行字数统计组件
         * @private
         */
        _renderLimiter:function($textArea){
            if(!$textArea || !$textArea.length) return false;
            var maxLen = $textArea.attr('maxlength');
            var limiterTarget = $textArea.attr('limiter-target');
            var $limiterTarget = $(limiterTarget);
            //不存在字数统计基础配置
            if(!maxLen || !$limiterTarget.length) return false;

            var textLimiter = new Limiter($textArea,{wrapper:$limiterTarget,max:maxLen});
            textLimiter.render();
        },
        /**
         * 运行数字增减器
         * @private
         */
        _renderSpinbox:function($input){
            if(!$input || !$input.length) return false;
            var spinbox = new SpinBox($input,{cssUrl:''});
            spinbox.render();
            return spinbox;
        },
        /**
         * 运行图片上传组件
         * @param $input
         * @private
         */
        _renderImageUploader:function($input){

        },
        /**
         * 加载主题css文件
         * @param url
         * @param callback
         * @return {Boolean}
         * @private
         */
        _LoaderCss:function (url,callback) {
            var self = this;
            if(!url) return false;
            //不引用主题依旧执行回调
            if (url == EMPTY){
                callback && callback.call(self);
                return false;
            }
            var themes = Butterfly.THEMES;
            S.each(themes,function(t){
                if(t == url){
                    url = CSS_URL_PRE+url+'/'+CSS_FILE_NAME;
                    return false;
                }
            });
            S.use(url, function () {
                callback && callback.call(self);
                self.fire(Butterfly.event.AFTER_LOAD_THEME);
            });
            return true;
        },
        /**
         * 读取主题样式和组件配置文件
         * @param modUrl
         * @param callback
         * @return {Boolean}
         * @private
         */
        _loadTheme:function(modUrl,callback){
            var self = this;
            var themes = Butterfly.THEMES;
            var url =  modUrl;
            S.each(themes,function(t){
                if(t == modUrl){
                    url = CSS_URL_PRE+url+'/';
                    return false;
                }
            });
            var cssUrl = url + CSS_FILE_NAME;
            var jsUrl = url + CONFIG_FILE_NAME;
            //加载主题样式
            S.use(cssUrl);
            //记载主题组件配置
            S.use(jsUrl,function(S,configs){
                self.set('comConfig',configs);
                callback && callback.call(self,configs);
            })

        }
    }, { ATTRS:/** @lends Butterfly.prototype*/{
        /**
         *  美化的目标表单
         * @type NodeList
         * @default  ""
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        /**
         * 主题路径，使用自制主题，请使用完整路径，目前内置主题“default”
         * @type String
         * @default "default"
         */
        theme:{
            value:'default',
            setter:function(v){
                var self = this;
                self._LoaderCss(v);
                return v;
            }
        },
        /**
         * 表单组件的实例集合
         * @type Object
         * @default {}
         */
        fields:{
            value:{}
        },
        /**
         * 表单组件配置
         * @type Object
         * @default {}
         */
        comConfig:{
            value:{}
        },
        auth:{
            value:{}
        },
        authConfig:{
            value:{}
        }
    }});
    return Butterfly;
}, {requires:['base', 'node','gallery/form/1.3/radio/index','gallery/form/1.3/checkbox/index','gallery/form/1.3/limiter/index','gallery/form/1.3/uploader/index','gallery/form/1.3/spinbox/index','gallery/form/1.3/auth/index']});