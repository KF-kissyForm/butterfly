/**
 * @fileoverview 默认主题
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.4/uploader/themes/default/index', function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name DefaultTheme
     * @class 默认主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 剑平（明河）<minghe36@126.com>
     */
    function DefaultTheme(config) {
        var self = this;
        //调用父类构造函数
        DefaultTheme.superclass.constructor.call(self, config);
    }

    S.extend(DefaultTheme, Theme, /** @lends DefaultTheme.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         */
        render:function () {

        },
        /**
         * 文件处于等待上传状态时触发
         */
       _waitingHandler:function(ev){

        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler : function(ev){

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function(ev){

        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function(ev){
            var file = ev.file;
            var id = file.id;
            var $del = $(".J_Del_" + id);
            var $cancel = $(".J_Cancel_" + id);
            $del.show();
           $cancel.hide();
        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function(ev){
            var msg = ev.msg,
                id = ev.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
        }
    }, {ATTRS:/** @lends DefaultTheme.prototype*/{
        /**
         *  主题名（文件名）
         * @type String
         * @default "defaultTheme"
         */
        name:{value:'defaultTheme'},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.4/uploader/themes/default/style.css"
         */
        cssUrl:{value:'gallery/form/1.4/uploader/themes/default/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l status-wrapper">' +
                    '<div class="status waiting-status">等待上传，<a class="J_Upload_{id}" href="#Upload">点此上传</a> </div>' +
                    '<div class="status start-status progress-status success-status clearfix">' +
                        '<div class="J_ProgressBar_{id} f-l uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                        ' <a  class="J_Cancel_{id} f-l upload-cancel" href="#uploadCancel">取消</a>' +
                        '<a href="#fileDel" class=" f-l J_Del_{id}" style="display:none;">删除</a>' +
                    '</div> ' +
                    '<div class="status cancel-status">已经取消上传，<a href="#reUpload" id="J_ReUpload_{id}" class="J_Upload_{id}">点此重新上传</a> </div>' +
                    '<div class="status error-status upload-error"><span class="J_ErrorMsg_{id}"></span><a href="#fileDel" class="J_Del_{id}">删除</a></div>' +
                '</div>' +
            '</li>'
        },
        /**
         * 引入的插件
         * @type String
         * @default 'proBars' 进度条
         */
        use:{
            value:'proBars'
        },
        /**
         * 验证消息
         * @since 1.4
         * @type Object
         * @default {max:'每次最多上传{max}个文件！',
                    maxSize:'文件大小为{size}，超过{maxSize}！',
                    required:'至少上传一个文件！',
                    require:'至少上传一个文件！',
                    allowExts:'不支持{ext}格式！',
                    allowRepeat:'该文件已经存在！'}
         */
        authMsg:{
            value:{
                max:'每次最多上传{max}个文件！',
                maxSize:'文件大小为{size}，超过{maxSize}！',
                required:'至少上传一个文件！',
                allowExts:'不支持{ext}格式！',
                allowRepeat:'该文件已经存在！'
            }
        }
    }});
    return DefaultTheme;
}, {requires:['node', '../../theme']});