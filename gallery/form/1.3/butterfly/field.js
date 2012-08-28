/**
 *  模块名：gallery/form/1.3/butterfly/field，表单数据层模块，当数据发生变化时会自动更新表单视图
 *
 * @module butterfly
 * @submodule butterfly-model
 */

KISSY.add('gallery/form/1.3/butterfly/field',function (S, Base, Node) {
    var EMPTY = '';
    /**
     * 表单field的数据模块
     * @class Field
     * @constructor
     * @extends mvc.Field
     */
    function Field(config){
        Field.superclass.constructor.apply(this, config);
    }
    S.extend(Field, Base,{ATTRS:{
        target:{
            value:EMPTY,
            getter:function(v){
                return S.Node.all(v);
            }
        },
        type:{value:EMPTY},
        name:{value:EMPTY},
        value:{
            value:EMPTY,
            setter:function(v){
                debugger;
                var self = this;
                var target = self.get('target');
                if(target && target.length > 0){
                    target.val(v);
                }
                return v;
            }
        },
        test:{value:false,
            setter:function(v){
                alert(2);
                return v;
            }
        },
        isGroup:{value:false},
        group:{value:[]}
    }});
    return Field;
},{requires:['base', 'node']});