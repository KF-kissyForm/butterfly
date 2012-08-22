KISSY.add('gallery/form/1.3/butterfly/collection',function (S, Base, Node,mvc,Model) {
    /**
     * 表单的数据模块
     * @class Collection
     * @constructor
     * @extends Base
     */
    function Collection(){
        Collection.superclass.constructor.apply(this, arguments);
    }
    S.extend(Collection, mvc.Collection, {
        ATTRS:{
            Model:{
                value:Model
            }
        }
    });
    return Collection;
},{requires:['base', 'node','mvc','./model']});