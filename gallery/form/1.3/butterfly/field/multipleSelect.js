/**
 *  模块名：gallery/form/1.3/butterfly/selectField
 *
 * @module butterfly
 * @submodule butterfly-model
 */

KISSY.add('gallery/form/1.3/butterfly/field/multipleSelect',function (S, Base, Node,SingleSelect) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 应用于radio或checkbox或select的数据模块，是存在多个target、多个value、增加select和index的处理
     * @class SelectField
     * @constructor
     */
    function MultipleSelect(config){
        MultipleSelect.superclass.constructor.call(this, config);
        this._setDefaultValue();
    }
    S.extend(MultipleSelect, SingleSelect,{
        /**
         * 设置默认的value属性
         * @private
         */
        _setDefaultValue:function(){
            var self = this;
            var $target = self.get('target');
            var values=[];
            $target.each(function($el){
                if($el.prop('checked')) values.push($el.val());
            });
            self.set('value',values);
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
        },
        /**
         * 处理多选框的选中
         * @private
         */
        _checked:function(value,indexs){
            var self = this;
            var $target = self.get('target');
            var options = self.get('options');
            //是否由原生的html改变触发的值设置
            var isHtmlClick = self.get('isHtmlClick');
            S.each(options,function(option,index){
                if(value == option){
                    if(!isHtmlClick){
                        $($target[index]).fire('click');
                        self.set('isHtmlClick',true);
                    }
                    indexs.push(index);
                }
            })
        }
    },{ATTRS:{
        /**
         * 目标表单字段
         */
        target:{
            value:EMPTY,
            getter:function(v){
                return S.Node.all(v);
            }
        },
        /**
         * 同步表单字段值的事件
         */
        syncEvents:{
            value:'change'
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
         * 字段当前选中的值（多个）
         * @type {Array}
         * @default []
         */
        value:{
            value:[],
            setter:function(v){
                var self = this;
                var options = self.get('options');
                var indexs = [];

                if(S.isString(v) && options.length > 0){
                    var values = self.get('value');
                    if(!S.isArray(values)) return [];
                    var isExist = S.inArray(v,values);
                    if(!isExist){
                        indexs = self.get('indexs');
                        values.push(v);
                        self._checked(v,indexs);
                        self.set('indexs',indexs);
                    }
                    return values;
                }

                if(S.isArray(v) && options.length > 0){
                    S.each(v,function(value){
                        self._checked(value,indexs);
                    });
                    self.set('indexs',indexs);
                }
                return v;
            }
        },
        /**
         * 字段选中的索引值
         * @type {Array}
         * @default []
         */
        indexs:{ value:[] },
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
    return MultipleSelect;
},{requires:['base', 'node','./singleSelect']});