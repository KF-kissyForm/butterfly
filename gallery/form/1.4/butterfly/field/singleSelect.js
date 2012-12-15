KISSY.add('gallery/form/1.4/butterfly/field/singleSelect',function (S, Base, Node) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 应用于radio或select的数据模型，是存在多个target、单个value、增加select和index的处理
     * @class SelectField
     * @constructor
     */
    function SelectField(config){
        SelectField.superclass.constructor.call(this, config);
        this._init();
    }
    S.extend(SelectField, Base,/** @lends SelectField.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            self._setOptions();
            self._syncValue();
        },
        /**
         * 设置选项数组
         * @private
         */
        _setOptions:function(){
            var self = this;
            var $target = self.get('target');
            var options = [];
            //选择框，去遍历option元素
            if(self.get('type') == 'select')$target = $target.children();
            $target.each(function($option){
                options.push($option.val());
            });
            self.set('options',options);
            return options;
        },
        /**
         * 验证表单字段
         * @return {Boolean}
         */
        test:function(){
            var self = this;
            var authSelectField = self.get('authField');
            var isPass = true;
            if(authSelectField) isPass = authSelectField.validate();
            return isPass;
        },
        /**
         * 监听事件，同步字段的选中
         * @private
         */
        _syncValue:function(){
            var self = this;
            var $target = self.get('target');
            if(!$target || !$target.length) return false;
            var syncValueEvents = self.get('syncEvents');
            //监听需要同步的事件
            $target.on(syncValueEvents,function(ev){
                var val = $(ev.target).val();
                self.set('isHtmlClick',true);
                self.set('value',val);
            })
        }
    },{ATTRS:{
        /**
         * 目标表单字段
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return $(v);
            }
        },
        /**
         * 同步表单字段值的事件
         */
        syncEvents:{
            value:'click change'
        },
        /**
         * 字段类型
         */
        type:{value:EMPTY},
        /**
         * 字段名
         */
        name:{value:EMPTY},
        /**
         * 字段当前选中的值
         * @type {String}
         * @default ''
         */
        value:{
            value:EMPTY,
            setter:function(v){
                var self = this;
                var $target = self.get('target');
                var options = self.get('options');
                //防止重复触发click，陷入死循环
                if(self.get('isHtmlClick')){
                    self.set('isHtmlClick',false);
                    return v;
                }
                if(options.length > 0) {
                    S.each(options,function(option,index){
                        if(v == option){
                            $($target[index]).fire('click');
                            self.set('index',index);
                        }
                    });
                }
                return v;
            }
        },
        /**
         * 字段当前选中的索引值
         * @type {Number}
         * @default -1
         */
        index:{
            value:-1
        },
        /**
         * 选项值，为数组
         * @type {Array}
         * @default []
         */
        options:{ value:[] },
        isHtmlClick:{value:false},
        //auth的验证字段
        authField:{ value:EMPTY }
    }});
    return SelectField;
},{requires:['base', 'node']});