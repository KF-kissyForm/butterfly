/**
 * @fileoverview 表单美化组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/butterfly/index', function (S, Base, Node,Radio,Checkbox,Limiter,Uploader,spinbox) {
    var EMPTY = '';
    var $ = Node.all;
    var LOG_PREFIX = '[Butterfly]:';
    var CSS_URL_PRE = 'gallery/form/1.3/butterfly/themes/';
    var CSS_FILE_NAME = 'style.css';

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
             var self = this,
                 $target = self.get('target'),
                 $inputs;
            if(!$target.length){
                S.log(LOG_PREFIX + '表单目标节点不存在！');
                return false;
            }
            self._LoaderCss(self.get('theme'));
            $inputs = $target.all('input');
            if(!$inputs.length){
                S.log(LOG_PREFIX + '不存在需要美化的表单元素！');
                return false;
            }
            $inputs.each(function($input){
                self._renderCom($input)
            })
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
                case 'radio':
                   var name = $input.attr('name');
                    if(name == EMPTY){
                        S.log(LOG_PREFIX + 'radio缺少name值');
                    }else{
                        if(!fields[name]){
                            $input = $(document.getElementsByName(name));
                            fields[name] = new Radio($input,{cssUrl:EMPTY});
                        }
                    }
                break;
                case 'checkbox':
                    obj = new Checkbox($input,{cssUrl:EMPTY});
                break;
                case 'file':

                break;
                case 'button':
                break;
            }
            S.each(fields,function(field){
                field.render();
            })
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
        }
    }});
    return Butterfly;
}, {requires:['base', 'node','gallery/form/1.3/radio/index','gallery/form/1.3/checkbox/index','gallery/form/1.3/limiter/index','gallery/form/1.3/uploader/index','gallery/form/1.3/spinbox/index']});