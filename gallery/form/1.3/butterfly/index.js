/**
 * @fileoverview 表单美化组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/butterfly/index', function (S, Base, Node, Radio, Checkbox, Limiter, ImageUploader, SpinBox, Auth) {
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
                AFTER_LOAD_THEME:'afterLoadTheme'
            }
        });
        S.extend(Butterfly, Base, /** @lends Butterfly.prototype*/{
                /**
                 * 渲染组件
                 */
                render:function () {
                    var self = this;
                    var $target = self.get('target');
                    var $inputs;
                    if (!$target.length) {
                        S.log(LOG_PREFIX + '表单目标节点不存在！');
                        return false;
                    }
                    self._loadTheme(self.get('theme'), function () {
                        $inputs = $target.all('input');
                        if (!$inputs.length) {
                            S.log(LOG_PREFIX + '不存在需要美化的表单元素！');
                            return false;
                        }
                        $inputs.each(function ($input) {
                            self._renderCom($input)
                        });

                        self._initTextArea();
                        //实例化验证组件
                        self._renderAuth();
                        self._renderEditor();
                    });


                },
                /**
                 * 根据表单元素的type实例化对应的表单组件
                 * @param {NodeList} $input 表单元素
                 */
                _renderCom:function ($input) {
                    if (!$input || !$input.length) return false;
                    var self = this, type = $input.attr('type'), obj;
                    var fields = self.get('fields');
                    switch (type) {
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
                _renderGroupCom:function ($input) {
                    if (!$input || !$input.length) return false;
                    var self = this;
                    var name = $input.attr('name');
                    var type = $input.attr('type');
                    var fields = self.get('fields');
                    var CLASS;
                    if (name == EMPTY) {
                        S.log(LOG_PREFIX + type + '缺少name值');
                    } else {
                        if (!fields[name]) {
                            switch (type) {
                                case 'radio':
                                    CLASS = Radio;
                                    break;
                                case 'checkbox':
                                    CLASS = Checkbox;
                                    break;
                            }
                            $input = $(document.getElementsByName(name));
                            fields[name] = new CLASS($input, {cssUrl:EMPTY}).render();
                            self.set('fields', fields);
                        }
                    }
                    return self.get('fields');
                },
                /**
                 * 实例化验证组件
                 * @private
                 * @return {Auth}
                 */
                _renderAuth:function () {
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
                    self.set('auth', auth);
                    return auth;
                },
                /**
                 * 初始化textarea
                 * @private
                 */
                _initTextArea:function () {
                    var self = this;
                    var $target = self.get('target');
                    if (!$target.length) return false;
                    var $textAreas = $target.all('textarea');
                    if (!$textAreas.length) return false;
                    $textAreas.each(function ($textArea) {
                        self._renderLimiter($textArea);
                    });
                },
                /**
                 * 运行字数统计组件
                 * @private
                 */
                _renderLimiter:function ($textArea) {
                    if (!$textArea || !$textArea.length) return false;
                    var maxLen = $textArea.attr('maxlength');
                    var limiterTarget = $textArea.attr('limiter-target');
                    var $limiterTarget = $(limiterTarget);
                    //不存在字数统计基础配置
                    if (!maxLen || !$limiterTarget.length) return false;

                    var textLimiter = new Limiter($textArea, {wrapper:$limiterTarget, max:maxLen});
                    textLimiter.render();
                },
                /**
                 * 运行数字增减器
                 * @private
                 */
                _renderSpinbox:function ($input) {
                    if (!$input || !$input.length) return false;
                    var spinbox = new SpinBox($input, {cssUrl:''});
                    spinbox.render();
                    return spinbox;
                },
                /**
                 * 运行图片上传组件
                 * @param $input
                 * @private
                 */
                _renderImageUploader:function ($input) {
                    if (!$input || !$input.length) return false;
                    var imageUploader = new ImageUploader($input);
                    imageUploader.render();
                    return imageUploader;
                },
                /**
                 * 初始化富编辑器
                 * @paran {NodeList} $target
                 * @private
                 */
                _renderEditor:function ($target) {
                    //if(!$target || !$target.length) return false;
                    var cssUrl = S.UA.ie<8 && 'gallery/form/1.3/butterfly/themes/default/com/editor/editor-pkg-sprite.css' || 'gallery/form/1.3/butterfly/themes/default/com/editor/editor-pkg-datauri.css';
                    S.use(cssUrl);
                    S.use('editor', function (S, Editor) {
                        var config = {
                            "image":{
                                upload:{
                                    serverUrl:EMPTY,
                                    surfix:"png,jpg,jpeg,gif",
                                    fileInput:"imgFiledata",
                                    sizeLimit:3000
                                }
                            },
                            "font-bold":false,
                            "font-italic":false,
                            "font-size":{
                                items:[
                                    {
                                        value:"14px",
                                        attrs:{
                                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                                        },
                                        name:"" +
                                            " <span style='font-size:14px'>标准</span>" +
                                            "<span style='position:absolute;top:1px;right:3px;'>14px</span>"
                                    },
                                    {
                                        value:"16px",
                                        attrs:{
                                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                                        },
                                        name:"" +
                                            " <span style='font-size:16px'>大</span>" +
                                            "<span style='position:absolute;top:1px;right:3px;'>16px</span>"
                                    },
                                    {
                                        value:"18px",
                                        attrs:{
                                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                                        },
                                        name:"" +
                                            " <span style='font-size:18px'>特大</span>" +
                                            "<span style='position:absolute;top:1px;right:3px;'>18px</span>"
                                    },
                                    {
                                        value:"20px",
                                        attrs:{
                                            style:'position: relative; border: 1px solid #DDDDDD; margin: 2px; padding: 2px;'
                                        },
                                        name:"" +
                                            " <span style='font-size:20px'>极大</span>" +
                                            "<span style='position:absolute;top:1px;right:3px;'>20px</span>"
                                    }
                                ],
                                width:"115px"
                            }, "font-family":{
                                items:[
                                    {name:"宋体", value:"SimSun"},
                                    {name:"黑体", value:"SimHei"},
                                    {name:"楷体", value:"KaiTi_GB2312"},
                                    {name:"微软雅黑", value:"Microsoft YaHei"},
                                    {name:"Times New Roman", value:"Times New Roman"},
                                    {name:"Arial", value:"Arial"},
                                    {name:"Verdana", value:"Verdana"}
                                ]
                            }, "video":{
                                urlCfg:[
                                    {
                                        reg:/tudou\.com/i,
                                        url:"http://bangpai." + (location.host.indexOf('taobao.com') === -1 ? 'daily.taobao.net' : 'taobao.com') + "/json/getTudouVideo.htm?" +
                                            "url=@url@&callback=@callback@"//"&rand=@rand@"
                                    }
                                ]
                            },
                            "draft":{
                                interval:5,
                                limit:10,
                                helpHtml:"<div " +
                                    "style='width:200px;'>" +
                                    "<div style='padding:5px;'>草稿箱能够自动保存您最新编辑的内容," +
                                    "如果发现内容丢失" +
                                    "请选择恢复编辑历史</div></div>"
                            },
                            "resize":{
                                direction:["y"]
                            },
                            "font-strikeThrough":{
                                style:{
                                    element:'strike',
                                    overrides:[
                                        {element:'span', attributes:{ style:'text-decoration: line-through;' }},
                                        { element:'s' },
                                        { element:'del' }
                                    ]
                                }
                            }

                        };
                        var editor = new Editor('#J_Editor', config).use("separator," +
                            "undo,separator,removeformat,format,font,color,separator," +
                            "list,indent,justify,separator," +
                            "link," +
                            "image," +
                            "separator,table,resize,draft,separator",
                            function () {

                            });
                        editor.ready(function () {

                        });
                    });
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
                        self.set('comConfig', configs);
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
                    /**
                     * 表单组件的实例集合
                     * @type Object
                     * @default {}
                     */
                    fields:{
                        value:{
                        }
                    },
                    /**
                     * 表单组件配置
                     * @type Object
                     * @default {}
                     */
                    comConfig:{
                        value:{
                        }
                    },
                    auth:{
                        value:{
                        }
                    },
                    authConfig:{
                        value:{
                        }
                    }
                }
            }
        )
        ;
        return Butterfly;
    },
    {
        requires:['base', 'node', 'gallery/form/1.3/radio/index', 'gallery/form/1.3/checkbox/index', 'gallery/form/1.3/limiter/index', 'gallery/form/1.3/uploader/imageUploader', 'gallery/form/1.3/spinbox/index', 'gallery/form/1.3/auth/index']
    }
)
;