/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/uploader/1.4/plugins/auth/auth', function (S, Node,Base) {
    var EMPTY = '', $ = Node.all,
        console = console || S, LOG_PREFIX = '[uploader-auth]:';

    /**
     * @name Auth
     * @class 文件上传验证，可以从按钮的data-auth伪属性抓取规则配置
     * @constructor
     * @extends Base
     * @param {Uploader} uploader *，上传组件实例
     * @param {Object} config 配置
     */
    function Auth(config) {
        var self = this;
        Auth.superclass.constructor.call(self, config);
    }
    S.mix(Auth,/** @lends Auth*/{
        /**
         * 事件
         */
        event : {
            ERROR : 'error'
        },
        /**
         * 默认规则配置
         */
        defaultRules:{
            /**
             * 允许上传的文件格式，如果是使用flash上传方式，在选择文件时就可以过滤格式
             */
            allowExts:[
                {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"},
                '不支持{ext}格式的文件上传！'
            ],
            /**
             * 是否必须上传个文件
             */
            required:[false, '必须至少上传一个文件！'],
            /**
             * 允许的最大上传数
             */
            max:[3, '每次最多上传{max}个文件！'],
            /**
             * 文件最大大小，单位为kb
             */
            maxSize:[1000, '文件大小为{size}，文件太大！'],
            /**
             * 允许重复上传相同文件
             */
            allowRepeat:[false, '该文件已经存在！']
        }
    });
    /**
     * @name Auth#error
     * @desc  当验证出错时触发
     * @event
     * {rule:'require',msg : rule[1],value : isRequire}
     * @param {String} ev.rule 规则名
     * @param {String} ev.msg 出错消息
     * @param {Boolean|String} ev.value 规则值
     */
    S.extend(Auth, Base, /** @lends Auth.prototype*/{
        /**
         * 初始化
         */
        pluginInitializer:function (uploader) {
            if(!uploader) return false;
            var self = this;
            self.set('uploader',uploader);
            var queue = uploader.get('queue');
            self._setSwfButtonExt();
            self._addUploaderAttrs();

            //给uploader增加常用的max和required验证方法
            uploader.testMax = function(){
                return self.testMax();
            };
            uploader.testRequired = function(){
                return self.testRequired();
            };
            uploader.test = function(){
                return self.testMax() && self.testRequired();
            };

            queue.on('add',function(ev){
                var file = ev.file;
                var type = file.type;
                if(type != 'restore'){
                    var isPass = true;
                    isPass = self.testAllowExt(file);
                    if(isPass) isPass = self.testMaxSize(file);
                    if(isPass) self.testRepeat(file);
                }
            });
            queue.on('remove',function(ev){
                var file = ev.file,status = file.status;
                //删除的是已经成功上传的文件，需要重新检验最大允许上传数
                if(status == 'success') self.testMax() && self.testRequired();
            });
            queue.on('statusChange',function(ev){
                var status = ev.status;
                //如果已经是禁用上传状态，阻止后面文件的上传，并予以移除
                if(status == 'start' && uploader.get('disabled')){
                    self._maxStopUpload();
                }
                if(status == 'success') self.testMax();
            });
            uploader.on('error', function (ev) {
                //允许继续上传文件
                uploader.set('isAllowUpload', true);
            });
        },
        /**
         * 给uploader增加验证规则属性
         * @private
         */
        _addUploaderAttrs:function(){
            var self = this;
            var uploader = self.get('uploader');
            var rules = self.get('rules');
            var defaultRules = Auth.defaultRules;
            S.each(defaultRules,function(aRule,key){
                var hasRule = !S.isUndefined(rules[key]);
                var ruleVal = hasRule && rules[key][0] || null;
                if(hasRule){
                    uploader.addAttr(key,{
                        value:ruleVal,
                        getter:function(v){
                            if(key == 'allowExts') v = self.getAllowExts(v);
                            return v;
                        },
                        setter:function(v){
                            var rules = self.get('rules');
                            if(key == 'allowExts') v = self.setAllowExts(v);
                            rules[key][0] = v;
                            return v;
                        }
                    });
                }
            });
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         */
        setAllowExts:function(exts){
            if(!S.isString(exts)) return false;
            var ext = [];
            var desc = [];
            exts = exts.split(',');
            S.each(exts,function(e){
                ext.push('*.'+e);
                desc.push(e.toUpperCase());
            });
            ext = ext.join(';');
            desc = desc.join(',');
            return {desc:desc,ext:ext};
        },
        /**
         * 获取简化的图片格式，举例：将{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}转成jpg,jpeg,png,gif,bmp
         * @param exts
         * @return String
         */
        getAllowExts:function(exts){
            if(!S.isObject(exts)) return exts;
            var allExt = exts['ext'];
            exts = allExt.split(';');
            var arrExt = [];
            S.each(exts,function(ext){
                arrExt.push(ext.replace('*.',''));
            });
            return arrExt.join(',');
        },
        /**
         * 验证上传数、是否必须上传
         * @return {Boolean}
         */
        testAll : function(){
            var self = this;
            return self.testRequire() && self.testMax();
        },
        /**
         * 获取指定规则
         * @param {String} ruleName 规则名
         * @return {Array}
         */
        getRule : function(ruleName){
            var self = this,rules = self.get('rules');
            return rules[ruleName];
        },
        /**
         * 判断上传方式
         * @param type
         * @return {Boolean}
         */
        isUploaderType:function (type) {
            var self = this, uploader = self.get('uploader'),
                uploaderType = uploader.get('type');
            return type == uploaderType;
        },
        /**
         * 检验是否必须上传一个文件
         * @return {Boolean}
         */
        testRequired:function(){
            var self = this;
            var uploader = self.get('uploader');
            var queue = uploader.get('queue');
            var files = queue.getFiles('success');
            return files.length > 0;
        },
        /**
         * 测试是否是允许的文件上传类型
         * @param {Object} file 文件对象
         * @return {Boolean} 是否通过
         */
        testAllowExt:function (file) {

            if (!S.isObject(file)) return false;
            var self = this,
                fileName = file.name,
                allowExts = self.getRule('allowExts'),
                exts = [],
                fileExt, msg,
                isAllow;
            if (!S.isArray(allowExts)) return false;
            //扩展名数组
            exts = self._getExts(allowExts[0].ext);

            isAllow = _isAllowUpload(fileName);
            //如果不是支持的文件格式，出现错误
            if(!isAllow){
                fileExt = _getFileExt(fileName);
                msg = S.substitute(allowExts[1],{ext : fileExt});
                self._fireUploaderError('allowExts',[allowExts[0],msg],file);
            }
            /**
             * 是否允许上传
             * @param {String} fileName 文件名
             * @return {Boolean}
             */
            function _isAllowUpload(fileName) {
                var isAllow = false, reg;
                S.each(exts, function (ext) {
                    reg = new RegExp('^.+\.' + ext + '$');
                    //存在该扩展名
                    if (reg.test(fileName))  return isAllow = true;
                });
                return isAllow;
            }
            /**
             * 获取文件扩展名
             * @param {String} file
             */
            function _getFileExt(file){
                var arr = file.split('.');
                return arr[arr.length -1];
            }
            return isAllow;
        },
        /**
         * 检验是否达到最大允许上传数
         * @return {Boolean}
         */
        testMax:function () {
            var self = this, uploader = self.get('uploader'),
                queue = uploader.get('queue'),
                successFiles = queue.getFiles('success'),
                len = successFiles.length,
                rule = self.getRule('max'),
                msg;
            if(rule){
                //不存在max的配置
                if(!rule[0]) return true;
            	var isPass = len < rule[0];
	            //达到最大允许上传数
	            if(!isPass){
                    //禁用按钮
	                uploader.set('disabled',true);
	                uploader.set('isAllowUpload', false);
                    msg = S.substitute(rule[1],{max : rule[0]});
                    self._fireUploaderError('max',[rule[0],msg]);
	            }else{
                    uploader.set('disabled',false);
	                uploader.set('isAllowUpload', true);
	            }
	            return isPass;
            }
        },
        /**
         * 检验是否超过允许最大文件大小，留意iframe上传方式此验证无效
         * @param {Object} file 文件对象
         */
        testMaxSize : function(file){
            var self = this,
                size = file.size,
                rule = self.getRule('maxSize');
            if(rule){
                var uploader = self.get('uploader');
                if(S.UA.ie && uploader.get('type') == 'iframe'){
                    return true;
                }
            	var maxSize = Number(rule[0]) * 1024,
	                isAllow = size <= maxSize,
	                msg;
	            if(!isAllow){
	                msg = S.substitute(rule[1],{maxSize:S.convertByteSize(maxSize),size : file.textSize});
                    self._fireUploaderError('maxSize',[rule[0],msg],file);
	            }
	            return isAllow;
            }
        },
        /**
         * 检验文件是否重复（检验文件名，很有可能存在误差，比如不同目录下的相同文件名会被判定为同一文件）
         * @param {Object} file 文件对象
         * @return {Boolean}
         */
        testRepeat : function(file){
            if(!S.isObject(file)) return false;
            var self = this,
                fileName = file.name,
                rule = self.getRule('allowRepeat');
            if(rule){
            	var isAllowRepeat = rule[0],
	                uploader = self.get('uploader'),
	                queue = uploader.get('queue'),
	                //上传成功的文件
	                files = queue.getFiles('success'),
	                isRepeat = false ;
	            //允许重复文件名，直接返回false
	            if(isAllowRepeat) return false;
	            S.each(files,function(f){
	                if(f.name == fileName && f.size == file.size){
                        self._fireUploaderError('allowRepeat',rule,file);
	                    return isRepeat = true;
	                }
	            });
	            return isRepeat;
            }
        },
        /**
         * 设置flash按钮的文件格式过滤
         * @return {Auth}
         */
        _setSwfButtonExt:function () {
            var self = this, uploader = self.get('uploader'),
                allowExts = self.getRule('allowExts'),
                button = uploader.get('button'),
                isFlashType = self.isUploaderType('flash');
            if (!isFlashType || !S.isArray(allowExts)) return false;
            //设置文件过滤
            if(button) button.set('fileFilters', allowExts[0]);
            return self;
        },
        /**
         * 获取扩展名，需额外添加大写扩展名
         * @param {String} sExt 扩展名字符串，类似*.jpg;*.jpeg;*.png;*.gif;*.bmp
         * @retunr {Array}
         */
        _getExts:function (sExt) {
            if (!S.isString(sExt)) return false;
            var exts = sExt.split(';'),
                uppercaseExts = [],
                reg = /^\*\./;
            S.each(exts, function (ext) {
                ext = ext.replace(reg, '');
                uppercaseExts.push(ext.toUpperCase());
            });
            S.each(uppercaseExts,function(ext){
                exts.push(ext);
            });
            return exts;
        },
        /**
         * 触发uploader的error事件
         * @param ruleName
         * @param rule
         * @param file
         */
        _fireUploaderError:function(ruleName,rule,file){
            var self = this,
                uploader = self.get('uploader'),
                queue = uploader.get('queue'),
                params = {status:-1,rule:ruleName},
                index = -1;
            if(file){
                index = queue.getFileIndex(file.id);
                S.mix(params,{file:file,index:index});
            }
            //result是为了与uploader的error事件保持一致
            if(rule) S.mix(params,{msg : rule[1],value : rule[0],result:{}});
            queue.fileStatus(index, 'error', params);
            self.fire(Auth.event.ERROR,params);
            uploader.fire('error',params);
        },
        /**
         * 如果达到最大上传数，阻止后面文件的上传，并予以移除
         * @private
         */
        _maxStopUpload:function(){
            var self = this,
                uploader = self.get('uploader'),
                queue = uploader.get('queue');
                var curFileIndex = uploader.get('curUploadIndex');
                if(curFileIndex == EMPTY) return false;
                var files = queue.get('files');
                uploader.stop();
                S.each(files,function(file,index){
                    if(index >= curFileIndex){
                        queue.remove(index);
                    }
                })
        },
        /**
         * 获取/设置指定规则的验证消息
          * @param {String} rule 规则名
         * @param {String} msg  消息
         * @return {String}
         */
        msg:function(rule,msg){
            var self = this;
            if(!S.isString(rule)) return self;
            var msgs = self.get('msgs');
            if(!S.isString(msg)){
                return msgs[rule];
            }

            msgs[rule] = msg;
            return msg;
        },
        _processRuleConfig:function(rule,config){
            var self = this;
            if(!S.isString(rule)) return self;
            //demo max:[o,''达到最大上传数！]带有消息参数需要设置下消息
            if(S.isArray(config)){
               self.msg(rule,config[1]);
            }
            return self;
        }
    }, {ATTRS:/** @lends Auth.prototype*/{
        /**
         * 插件名称
         * @type String
         * @default auth
         */
        pluginId:{
            value:'auth'
        },
        /**
         * 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{ value:EMPTY },
        /**
         * 至少上传一个文件验证规则配置
         * @type Boolean
         * @default ''
         */
        required:{value:EMPTY},
        /**
         * 最大允许上传数验证规则配置
         * @type Boolean
         * @default ''
         */
        max:{value:EMPTY},
        /**
         *  文件格式验证规则配置
         * @type Boolean
         * @default ''
         */
        allowExts:{value:EMPTY},
        /**
         * 文件大小验证规则配置
         * @type Boolean
         * @default ''
         */
        maxSize:{value:EMPTY},
        /**
         *  文件重复性验证规则配置
         * @type Boolean
         * @default ''
         */
        allowRepeat:{value:EMPTY},
        /**
         *
         * @type Boolean
         * @default ''
         */
        size:{value:EMPTY},
        /**
         * 验证消息配置
         * @type Object
         * @default {
            max:'每次最多上传{max}个文件！',
            maxSize:'文件大小为{size}，超过{maxSize}！',
            required:'至少上传一个文件！',
            require:'至少上传一个文件！',
            allowExts:'不支持{ext}格式！',
            allowRepeat:'该文件已经存在！'
        }
         */
        msgs:{value:{
            max:'每次最多上传{max}个文件！',
            maxSize:'文件大小为{size}，超过{maxSize}！',
            required:'至少上传一个文件！',
            require:'至少上传一个文件！',
            allowExts:'不支持{ext}格式！',
            allowRepeat:'该文件已经存在！'
        }
        },
        /**
         * 上传验证规则，每个规则都是一个数组，数组第一个值为规则，第二个值为错误消息
         * @type Object
         * @default  { allowExts:[ {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}, '不支持{ext}格式的文件上传！' ], require:[false, '必须至少上传一个文件！'], max:[3, '每次最多上传{max}个文件！'], maxSize:[1000, '文件大小为{size}，文件太大！'], allowRepeat:[false, '该文件已经存在！'] } }
         *
         */
        rules:{
            value : Auth.defaultRules
        }
    }});
    return Auth;
}, {requires:['node','base']});

/**
 * changes:
 * 明河：1.4
 *           - 更改模块路径，将auth移到plugins下
 *           - 重构验证类，以rich base插件的形式出现
 *           - 去掉testRequire方法，并通过queue的file进行验证
 * 明河：2012.11.22
 *          - 去掉重复的代码，敲自己脑袋
 *          - 修正必须存在max的bug
 */