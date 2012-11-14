KISSY.add('gallery/form/1.3/butterfly/collection',function (S, Base, Node,Field,SingleSelectField,MultipleSelectField,Uploader) {
    var EMPTY = '',$ = Node.all;
    /**
     * 表单的数据集合
     * @class Collection
     * @constructor
     * @extends Base
     */
    function Collection(){
        Collection.superclass.constructor.apply(this, arguments);
    }
    S.extend(Collection, Base,/** @lends Collection.prototype*/{
        /**
         * 想集合添加Field或SelectField数据模型
         * @param data
         * @return {*}
         */
        add:function(data){
            if(!S.isObject(data)) return false;
            //字段name
            var name = data.name;
            var self = this;
            //已经存在该字段直接返回该字段
            if(self.isExist(name)) return self.field(name);

            var field;
            //特殊的自定义组件
            if(data.type == 'image-uploader'){
                field = data.uploader;
                if(!field) return false;
                new Uploader({authField:data.authField});
                field.set('name',name);
            }else{
                //数据模型类
                var FieldClass = self.getField(data);
                //实例化数据模型
                field = new FieldClass(data);
            }

            //向集合添加字段数据模型
            var fields = self.get('fields');
            fields.push(field);

            return field;
        },
        /**
         * 是否是SelectField数据模型
         * @param {String} type
         * @return {Boolean}
         */
        isSelectFieldType:function(type){
            var selectFieldTypes = ['radio','select','checkbox'];
            if(!type) return false;
            return S.inArray(type,selectFieldTypes);
        },
        /**
         * 是否是类似checkbox的多选方式的表单域
         * @param {String} type
         * @return {Boolean}
         */
        isMultipleType:function(type){
            var multipleTypes = ['checkbox'];
            if(!type) return false;
            return S.inArray(type,multipleTypes);
        },
        /**
         * collection中是否存在该字段的数据
         * @param {String} name 字段名称
         * @return {Boolean}
         */
        isExist:function(name){
            if(!name) return false;
            var self = this;
            var fields = self.get('fields');
            var field = self.field(name);
            return field != EMPTY;
        },
        /**
         * 从表单中删除一个字段
         */
        remove: function(){

        },
        /**
         * 设置表单域的值
         * @param {String} name 表单元素名
         * @param {String | Object} data
         * @return {*}
         */
        field:function(name,data){
            if(!S.isString(name)) return false;
            var self = this;
            var fields = self.get('fields');
            var field = EMPTY;
            if(!fields.length) return EMPTY;
            S.each(fields,function(f){
                if(f.get('name') == name){
                    field = f;
                    return true;
                }
            });
            if(S.isString(data)) {
                field.set('value',data);
            }
            else if(S.isObject(data)){
                S.each(data,function(v,k){
                    field.set(k,v);
                })
            }
            return field;
        },
        /**
         * 获取数据模型
         */
        getField:function(data){
            var FieldClass = Field;
            if(!S.isObject(data)) return FieldClass;

            var self = this;
            //字段name
            var name = data.name;
            //字段类型
            var type = data.type;
            //字段目标元素
            var $target = data.target;
            if(!name || !type || !$target) return FieldClass;

            //为选择类型的数据模型
            if(self.isSelectFieldType(type)){
                name = $target.attr('name');
                //TODO:需要优化
                //通过name来获取元素集合
                if(name) data.target = $(document.getElementsByName(name));
                FieldClass = self.isMultipleType(type) && MultipleSelectField || SingleSelectField;
            }
            return FieldClass;
        }
    },{
        ATTRS:{
            fields:{
                value:[]
            },
            data:{value:EMPTY}
        }
    });
    return Collection;
},{requires:['base', 'node',
    './field/base',
    './field/singleSelect',
    './field/multipleSelect',
    './field/uploader'
]});