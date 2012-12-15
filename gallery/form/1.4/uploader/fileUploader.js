/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.4/uploader/fileUploader',function (S, Base, Node, RenderUploader) {
    var EMPTY = '', $ = Node.all;
    /**
     * @name FileUploader
     * @class 异步文件上传入口文件
     * @version 1.4
     * @since 1.4
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置，该配置会覆盖data-config伪属性中的数据
     * @requires Uploader
     * @requires Auth
     * @example
     * @example
     *
KISSY.use('gallery/form/1.4/uploader/index', function (S, FileUploader) {
     var ru = new FileUploader('#J_UploaderBtn', '#J_UploaderQueue');
     ru.on("init", function (ev) {
        var uploader = ev.uploader;
     })
})
     */
    function FileUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //超类初始化
        FileUploader.superclass.constructor.call(self, config);
    }
    S.extend(FileUploader, RenderUploader, /** @lends FileUploader.prototype*/{

    }, {
        ATTRS:/** @lends FileUploader.prototype*/{
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “default”
             */
            theme:{value:'default' },
            /**
             * 验证消息
             * @type Object
             * @default {}
             */
            authMsg:{
                value:{
                    max:'每次最多上传{max}个文件！',
                    maxSize:'文件大小为{size}，超过{maxSize}！',
                    required:'至少上传一个文件！',
                    require:'至少上传一个文件！',
                    allowExts:'不支持{ext}格式！',
                    allowRepeat:'该文件已经存在！'
                }
            }
        }
    });
    return FileUploader;
}, {requires:['base', 'node','./renderUploader' ]});
