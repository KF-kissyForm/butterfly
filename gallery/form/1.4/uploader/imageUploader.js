/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.4/uploader/imageUploader', function (S, Base, Node, RenderUploader) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name ImageUploader
     * @class 异步图片上传入口文件
     * @version 1.4
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置，该配置会覆盖html属性中的数据
     * @requires Uploader
     * @requires Auth
     */
    function ImageUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //超类初始化
        ImageUploader.superclass.constructor.call(self, buttonTarget, queueTarget, config);
    }

    S.extend(ImageUploader, RenderUploader, /** @lends ImageUploader.prototype*/{
        /**
         * 从html中拉取验证配置
         * @private
         */
        _getAuthConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;

            var authConfig = {};
            //所有的验证规则
            var authRules = ['required','max','allowExts','maxSize','allowRepeat'];
            //验证消息
            var msgs = self.get('authMsg');
            var uploaderConfig = self.get('uploaderConfig');

            S.each(authRules,function(rule){
                //js配置验证
                if(!S.isUndefined(uploaderConfig[rule])){
                    authConfig[rule] = [uploaderConfig[rule],msgs[rule] || ''];
                }else{
                    //拉取属性的验证配置
                    var value = $btn.attr(rule);
                    if(value){
                        self._formatAuthConfig(rule,value);
                        authConfig[rule] = [value,msgs[rule] || ''];
                    }

                }
            });

            //默认允许上传的图片格式
            if(!authConfig['allowExts']){
                var defaultAllowExts = self.get('defaultAllowExts');
                authConfig['allowExts'] = [self._setAllowExts(defaultAllowExts),msgs['allowExts'] || ''];
            }
            return authConfig;
        }
    }, {
        ATTRS:/** @lends ImageUploader.prototype*/{
            /**
             * 支持的内置主题
             * @type Array
             * @default ['default','daogouUploader']
             */
            supportThemes:{value:['default','imageUploader', 'ershouUploader', 'loveUploader', 'refundUploader', 'singleImageUploader']},
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “imageUploader”
             */
            theme:{value:'imageUploader' },

            /**
             * 默认的文件格式过滤器
             * @type String
             * @default 'jpg,jpeg,png,gif,bmp'
             */
            defaultAllowExts:{value:'jpg,jpeg,png,gif,bmp'},
            /**
             * 验证消息
             * @type Object
             * @default {}
             */
            authMsg:{
                value:{
                    max:'每次最多上传{max}个图片！',
                    maxSize:'图片大小为{size}，超过{maxSize}！',
                    required:'至少上传一张图片！',
                    require:'至少上传一张图片！',
                    allowExts:'不支持{ext}格式！',
                    allowRepeat:'该图片已经存在！'
                }
            }
        }
    });
    return ImageUploader;
}, {requires:['base', 'node', './renderUploader' ]});
/**
 * changes:
 * 明河：v1.4
 *           - 继承于新的RenderUploader
 *           - 新增supportThemes
 * 明河：201212.11
 *          - 修正allowRepeat规则无效的bug
 * 明河：2012.11.22
 *          - 去掉默认不允许图片重复的验证
 */
