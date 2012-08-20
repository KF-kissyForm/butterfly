/**
 * cocoon用于表单数据存储，是butterfly的model层，当数据发生变化时会自动更新表单视图
 * @module cocoon
 */

/**
 *  模块名：gallery/form/1.3/cocoon/index，cocoon的入口模块
 *
 * @module cocoon
 * @submodule cocoon-index
 */

KISSY.add('gallery/form/1.3/cocoon/index',function (S, Base, Node) {
    /**
     * cocoon的入口类
     * @class Cocoon
     * @for Cocoon
     * @constructor
     * @extends Base
     */
    function Cocoon(){

    }
    S.extend(Cocoon, Base, {
        /**
         * 获取指定字段数据
         * @method get
         * @public
         */
        get:function(fieldName){

        }
    });
    return Cocoon;
},{requires:['base', 'node']});