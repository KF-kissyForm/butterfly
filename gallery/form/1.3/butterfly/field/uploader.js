KISSY.add('gallery/form/1.3/butterfly/field/uploader',function (S, Base, Node) {
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
            var ui = self.get('ui');
            if(!authField || !ui) return false;
            var msgCls = authField._msg;
            ui.on('error',function(ev){
                var rule = ev.rule;
                if(rule == 'required' || rule == 'require') msgCls.show({msg:ev.msg,style:'error'});
            });
            ui.on('success',function(ev){
                msgCls.hide();
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
         * Uploader的实例
         */
        ui:{value:EMPTY},
        //auth的验证字段
        authField:{ value:EMPTY }
    }});
    return Uploader;
},{requires:['base', 'node']});