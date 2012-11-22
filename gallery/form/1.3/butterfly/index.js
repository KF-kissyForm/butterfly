/**
 * @fileoverview 表单美化组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/butterfly/index', function (S, Base, Node, Event, Collection, RenderRadio, RenderCheckbox, RenderLimiter, RenderImageUploader, RenderNumber, Select,RenderEditor, Auth) {
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
        function Butterfly(target, config) {
            var self = this;
            config = S.mix({target:target}, config);
            //超类初始化
            Butterfly.superclass.constructor.call(self, config);
        }

        S.mix(Butterfly, /** @lends Butterfly*/{
            THEMES:['default'],
            event:{
                AFTER_LOAD_THEME:'afterLoadTheme',
                RENDER:'render'
            }
        });
        S.extend(Butterfly, Base, /** @lends Butterfly.prototype*/{
                /**
                 * 渲染组件
                 */
                render:function () {
                    var self = this;
                    var $target = self.get('target');
                    if (!$target.length) {
                        S.log(LOG_PREFIX + '表单目标节点不存在！');
                        return false;
                    }
                    //实例化表单数据集合
                    self.set('collection', new Collection());
                    self._loadTheme(self.get('theme'), function () {
                        //实例化验证组件
                        self._renderAuth();
                        self._initInput();
                        self._initTextArea();
                        self._initSelect();
                        self._fireRenderEvent();
                    });
                },
                /**
                 * fire render事件
                 * @private
                 * @return {Boolean}
                 */
                _fireRenderEvent:function(){
                    var self = this;
                    var isImageUploaderReady = self.get('_isImageUploaderReady');
                    //存在异步初始化的组件
                    if(isImageUploaderReady === false){
                        return false;
                    }
                    self.fire('render');
                    return true;
                },
                /**
                 * 获取元素的id，获取不到，获取name
                 * @param $el
                 * @return {String}
                 */
                getName:function ($el) {
                    if (!$el || !$el.length) return '';
                    return $el.attr('id') || $el.attr('name') || '';
                },
                /**
                 * 添加自定义验证规则
                 * @param {String} ruleName 规则名
                 * @param {Function} fnRule 规则函数
                 */
                addRule:function (ruleName, fnRule) {
                    var self = this;
                    var rules = self.get('customRules');
                    if (!S.isString(ruleName) || !S.isFunction(fnRule) || !S.isArray(rules)) return false;
                    rules.push([ruleName, fnRule]);
                    self.set('customRules', rules);
                },
                /**
                 * 当不传参时候，验证整个表单的合法性，当参数为字符串时候，验证指定表单字段的合法性，当参数为数组时候，验证多个字段的合法性
                 * @param {String|Array} field 字段名
                 * @return {Boolean} 是否通过
                 */
                test:function (field) {
                    var self = this;
                    var auth = self.get('auth');
                    var authField;
                    if (!auth) {
                        S.log(LOG_PREFIX + '不存在Auth的实例！');
                        return false;
                    }
                    //验证指定表单字段的合法性
                    if (S.isString(field)) {
                        authField = auth.getField(field);
                        return authField && authField.validate() || EMPTY;
                    }
                    else if (S.isArray(field)) {

                    }
                    else {
                        auth.validate();
                    }
                    return auth.get('result');
                },
                /**
                 * 向表单追加一个域
                 * @param field {Field|string|htmlElement} 表单域对象或html表单元素
                 * @param authConfig {object} 验证时使用的配置
                 */
                addFieldAuth:function (field, authConfig) {
                    var self = this;
                    if (!field) {
                        S.log(LOG_PREFIX + '缺少第一个field参数！');
                        return false;
                    }

                    var auth = self.get('auth');
                    if (!auth) {
                        S.log(LOG_PREFIX + '不存在Auth的实例！');
                        return false;
                    }

                    //处理传递的是元素name的情况
                    if (S.isString(field) && !/^#/.test(field)) field = document.getElementsByName(field)[0];

                    return auth.add(field, authConfig);
                },
                /**
                 * 获取指定的域Model
                 * @param name
                 * @return Model
                 *
                 */
                field:function (name, data) {
                    var self = this;
                    var collection = self.get('collection');
                    if (collection == EMPTY || !S.isString(name)) return false;
                    return collection.field(name, data);
                },
                /**
                 * 获取组件配置，会合并html属性中的配置
                 * @param $target
                 * @param uiName
                 * @param attrs
                 * @return {*}
                 */
                getUiConfig:function (uiName, $target, attrs) {
                    var self = this;
                    var config = self.get('uiConfig')[uiName] || {};
                    var tagConfig = {};
                    if (!$target || !$target.length) return config;
                    if (S.isArray(attrs)) {
                        S.each(attrs, function (attr) {
                            var val = $target.attr(attr);
                            if (val) tagConfig[attr] = val;
                        })
                    }
                    else if (S.isString(attrs)) {
                        var val = $target.attr(attrs);
                        if (val) tagConfig[attrs] = val;
                    }
                    return S.merge(config, tagConfig);
                },
                /**
                 * 向collection添加表单域数据
                 * @public
                 */
                add:function ($field, rulesConfig) {
                    var self = this;
                    var type = $field.attr('type');
                    var name = self.getName($field);
                    var collection = self.get('collection');
                    var data = {target:$field, type:type, name:name};
                    //区别异步上传组件，会带上ui属性(Uploader的实例)
                    if(type == 'image-uploader' && !S.isEmptyObject(rulesConfig)){
                        S.mix(data,rulesConfig);
                    }else{
                        var value = $field.val();
                        S.mix(data,{value:value});
                    }
                    //验证域
                    var authField = self.addFieldAuth($field, rulesConfig);
                    S.mix(data,{authField:authField});
                    return collection.add(data);
                },
                /**
                 * 根据input的type实例化对应的表单组件
                 */
                _initInput:function () {
                    var self = this;
                    var $target = self.get('target');
                    var $inputs = $target.all('input');
                    if (!$inputs.length) return false;
                    //遍历input
                    $inputs.each(function ($input) {
                        var type = $input.attr('type');
                        //添加field的model
                        self.add($input);
                        switch (type) {
                            case 'text':
                                self._renderUi(RenderLimiter,$input);
                                break;
                            case 'radio':
                                self._renderUi(RenderRadio,$input);
                                break;
                            case 'checkbox':
                                self._renderUi(RenderCheckbox,$input);
                                break;
                            case 'spinbox':
                                self._renderUi(RenderNumber,$input);
                                break;
                            case 'image-uploader':
                                self._renderImageUploader($input);
                                break;
                            case 'button':
                                break;
                        }
                    });
                },
                /**
                 * 实例化验证组件
                 * @private
                 * @return {Auth}
                 */
                _renderAuth:function () {
                    var self = this;
                    var $target = self.get('target');
                    if (!$target.length) return false;
                    var config = self.getUiConfig('auth');
                    var auth = new Auth(null, config);
                    self.set('auth', auth);

                    var rules = self.get('customRules');
                    if (rules.length) {
                        S.each(rules, function (rule) {
                            auth.register(rule[0], rule[1]);
                        })
                    }
                    return auth;
                },
                /**
                 * 初始化textarea
                 * @private
                 */
                _initTextArea:function () {
                    var self = this;
                    self._eachEls('textarea',function($textArea){
                        self._renderUi($textArea.attr('type') == 'editor' && RenderEditor || RenderLimiter,$textArea);
                    })
                },
                /**
                 * 初始化模拟选择框
                 * @private
                 */
                _initSelect:function () {
                    var self = this;
                    self._eachEls('select',function($select){
                        //为了和input保持统一
                        $select.attr('type','select');
                        //添加数据模型
                        self.add($select);
                        //render模拟UI
                        var config = self.getUiConfig('select', $select, 'width');
                        var select = new Select($select, config);
                        select.render();
                    })
                },
                /**
                 * 遍历表单元素
                 * @param type
                 * @param callback
                 * @private
                 * @return NodeList
                 */
                _eachEls:function(type,callback){
                    if(!type || !callback) return false;
                    var self = this;
                    var $target = self.get('target');
                    if (!$target.length) return false;
                    var $els = $target.all(type);
                    if(!$els.length) return false;

                    $els.each(function($el){
                        callback($el);
                    });

                    return $els;
                },
                /**
                 * 运行图片上传组件
                 * @param $input
                 * @private
                 */
                _renderImageUploader:function ($input) {
                    if (!$input || !$input.length) return false;
                    //TODO:uiConfig
                    var self = this;
                    self.set('_isImageUploaderReady',false);
                    var renderImageUploader = new RenderImageUploader({target:$input});
                    renderImageUploader.on('render',function(ev){
                        self.set('_isImageUploaderReady',true);
                        self.add($input,{uploader:ev.ui});
                        self._fireRenderEvent();
                    });
                },
                /**
                 * 初始化ui组件
                 * @private
                 */
                _renderUi:function(Class,$target){
                    if (!$target || !$target.length) return false;
                    var self = this;
                    var uis = self.get('uis');
                    var cls = new Class({target:$target,uiConfig:self.get('uiConfig'),uis:uis});
                    cls.on('render',function(){
                       self.set('uis',cls.get('uis'));
                    });
                    return cls;
                },
                /**
                 * 加载主题css文件
                 * @param url
                 * @param callback
                 * @return {Boolean}
                 * @private
                 */
                _LoaderCss:function (url, callback) {
                    var self = this;
                    if (!url) return false;
                    //不引用主题依旧执行回调
                    if (url == EMPTY) {
                        callback && callback.call(self);
                        return false;
                    }
                    var themes = Butterfly.THEMES;
                    S.each(themes, function (t) {
                        if (t == url) {
                            url = CSS_URL_PRE + url + '/' + CSS_FILE_NAME;
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
                _loadTheme:function (modUrl, callback) {
                    var self = this;
                    var themes = Butterfly.THEMES;
                    var url = modUrl;
                    S.each(themes, function (t) {
                        if (t == modUrl) {
                            url = CSS_URL_PRE + url + '/';
                            return false;
                        }
                    });
                    var cssUrl = url + CSS_FILE_NAME;
                    var jsUrl = url + CONFIG_FILE_NAME;
                    //加载主题样式
                    S.use(cssUrl);
                    //记载主题组件配置
                    S.use(jsUrl, function (S, configs) {
                        self.set('uiConfig', configs);
                        callback && callback.call(self, configs);
                    })

                }
            },
            {
                ATTRS:/** @lends Butterfly.prototype*/{
                    /**
                     *  美化的目标表单
                     * @type NodeList
                     * @default  ""
                     */
                    target:{
                        value:EMPTY,
                        getter:function (v) {
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
                        setter:function (v) {
                            var self = this;
                            self._LoaderCss(v);
                            return v;
                        }
                    },
                    collection:{
                        value:EMPTY
                    },
                    /**
                     * 表单组件的实例集合
                     * @type Object
                     * @default {}
                     */
                    uis:{
                        value:{
                        }
                    },
                    /**
                     * 表单组件配置
                     * @type Object
                     * @default {}
                     */
                    uiConfig:{
                        value:{
                        }
                    },
                    /**
                     * 验证组件实例
                     * @type Auth
                     * @default ''
                     */
                    auth:{ value:EMPTY },
                    /**
                     * 是否所有的UI组件都初始化完毕
                     * @type Boolean
                     * @default false
                     */
                    isAllUiReady:{value:false},
                    //自定义的验证规则
                    customRules:{value:[]}
                }
            }
        )
        ;
        return Butterfly;
    },
    {
        requires:['base', 'node', 'event',
            './collection',
            './render/radio',
            './render/checkbox',
            './render/limiter',
            './render/imageUploader',
            './render/number',
            'gallery/form/1.3/select/index',
            './render/editor',
            'gallery/form/1.3/auth/index']
    }
)
;