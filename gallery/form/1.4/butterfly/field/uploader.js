KISSY.add('gallery/form/1.4/butterfly/field/uploader',function (S, Base, Node) {
    var EMPTY = '';
    var $ = Node.all;
    /**
     * 图片上传模型
     * @class SelectField
     * @constructor
     */
    function Uploader(config){
        Uploader.superclass.constructor.call(this, config);
        this._init();
    }
    S.extend(Uploader, Base,/** @lends Uploader.prototype*/{
        /**
         * 初始化
         * @private
         */
        _init:function(){
            var self = this;
            var authField = self.get('authField');
            var oUploader = authField.get('uploader');
            if(!authField || !oUploader) return false;
            //验证消息类
            var message = authField.get('oMsg');
            oUploader.test = function(){
                authField.validate();
            };
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
        //auth的验证字段
        authField:{ value:EMPTY }
    }});
    return Uploader;
},{requires:['base', 'node']});