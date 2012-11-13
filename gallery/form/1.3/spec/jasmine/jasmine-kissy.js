/**
 * @fileoverview 用于jasmine测试前向页面插入测试用的html片段（应用于jsTestDriver）
 * @author 剑平（明河）<minghe36@126.com>
 **/
(function (S) {
    var $ = S.Node.all;

    /**
     * @name JamineFixture
     * @class 用于jasmine测试前向页面插入测试用的html片段（应用于jsTestDriver）
     * @constructor
     */
    function JamineFixture(config) {
        var self = this;
        S.mix(self, JamineFixture.defaultConfig, config);
    }

    JamineFixture.defaultConfig = {
        /**
         * 容器钩子
         */
        wrapperHook:'#J_JF',
        /**
         * html片段插入dom的容器id
         */
        wrapperTpl:'<div id ="J_JF">{fixture}</div>',
        /**
         * 数据缓存
         */
        cache:{},
        /**
         * html片段存放的目录路径
         */
        path:'http://localhost:9876/test/spec/fixtures/'
    };
    S.augment(JamineFixture, {
        /**
         * ajax读取html文件，并插入到测试容器（可以是多个url）
         * @return {NodeList}
         */
        load:function () {
            var self = this, html;
            if (!arguments) return false;
            html = self.read.apply(self, arguments);
            return self._appendTo(html);
        },
        /**
         * 只读取html文件，返回html片段数据
         * @return {String}
         */
        read:function () {
            var self = this, urls = arguments, aHtml = [];
            if (!urls.length) return false;
            S.each(urls, function (url) {
                aHtml.push(self._getHtml(url));
            });
            return aHtml.join('');
        },
        /**
         * 清除测试容器内的节点
         * @return {NodeList}
         */
        clean:function () {
            var self = this, wrapperHook = self.wrapperHook;
            return $(wrapperHook).html('');
        },
        /**
         * ajax读取单个html文件
         * @param {String} url html文件的url
         * @return {String}
         */
        _getHtml:function (url) {
            var self = this, cache = self.cache,
                path = self.path, htmlUrl;
            //不存在该html片段的缓存，ajax请求
            if (S.isUndefined(cache[url])) {
                htmlUrl = path.match('/$') && path + url || path + '/' + url;
                S.io({
                    //async必须设置为false，同步加载文件，否则jasmine的测试有可能是在获取文件之前执行导致测试失败
                    async:false,
                    cache:false,
                    dataType:'html',
                    url:htmlUrl,
                    success:function (data) {
                        self.cache[url] = data;
                    },
                    error:function (xhr, status, errorThrown) {
                        throw Error('Fixture could not be loaded: ' + url + ' (status: ' + status + ', message: ' + errorThrown.message + ')');
                    }
                })
            }
            return self.cache[url];
        },
        /**
         * 向页面添加html片段dom
         * @param {string} html html片段
         */
        _appendTo:function (html) {
            if (!S.isString(html)) return false;
            var self = this, wrapperTpl = self.wrapperTpl,
                wrapperHook = self.wrapperHook,
                wrapperHtml;
            if ($(wrapperHook).length) {
                $(wrapperHook).html(html);
            } else {
                wrapperHtml = S.substitute(wrapperTpl, {'fixture':html});
                $('body').append(wrapperHtml);
            }
            return $(wrapperHook);
        },
        /**
         * 清理缓存
         */
        cleanCache:function () {
            this.cache = {};
            return this;
        }
    });
    KISSY.JamineFixture = JamineFixture;
})(KISSY);
S = KISSY;
$ = S.Node.all;
JF =  new S.JamineFixture();

beforeEach(function () {
    //添加新的matcher
    this.addMatchers({
        toExist : function(){
            return this.actual.length > 0;
        },
        toHasClass:function (className) {
            return this.actual.hasClass(className);
        },
        toHasAttr:function (attr) {
            return this.actual.hasAttr(attr);
        },
        toHasProp:function (prop) {
            return this.actual.hasProp(prop);
        },
        toHasData:function (dataName) {
            return this.actual.data(dataName) != '';
        },
        toContain : function(selector){
            return this.actual.children(selector).length > 0;
        },
        toEqualValue : function(value){
            return this.actual.val() === value;
        },
        toEqualText : function(text){
            return S.trim(this.actual.text()) === text;
        },
        toShow : function(){
            return this.actual.css('display') === 'block';
        }
    });
});
afterEach(function () {
    JF.clean();
});