/**
 *  模块名：gallery/form/1.3/butterfly/field，表单数据层模块，当数据发生变化时会自动更新表单视图
 *
 * @module butterfly
 * @submodule butterfly-model
 */

KISSY.add('gallery/form/1.3/butterfly/field/base',function (S, Base, Node) {
    var EMPTY = '';
    /**
     * 表单field的数据模块
     * @class Field
     * @constructor
     */
    function Field(config){
        Field.superclass.constructor.call(this, config);
        this._init();
    }
    S.extend(Field, Base,{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            self._syncValue();
        },
        /**
         * 改变表单字段的值
         * @param value
         * @return value
         */
        val:function(value){
            var self = this;
            if(!S.isUndefined(value)) self.set('value',value);
            return self.get('value');
        },
        /**
         * 验证表单字段
         * @return {Boolean}
         */
        test:function(){
            var self = this;
            var authField = self.get('authField');
            var isPass = true;
            if(authField) isPass = authField.validate();
            return isPass;
        },
        /**
         * 监听事件，同步字段的值
         * @private
         */
        _syncValue:function(){
            var self = this;
            var $target = self.get('target');
            if(!$target || !$target.length) return false;
            var syncValueEvents = self.get('syncEvents');
            //监听需要同步的事件
            $target.on(syncValueEvents,function(){
                var val =$target.val();
                self.val(val);
                self.test();
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
            value:'blur'
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
         * 值
         */
        value:{
            value:EMPTY,
            setter:function(v){
                var self = this;
                var target = self.get('target');
                if(target && target.length > 0) target.val(v);
                return v;
            }
        },
        //auth的验证字段
        authField:{ value:EMPTY }
    }});
    return Field;
},{requires:['base', 'node']});