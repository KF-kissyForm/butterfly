/**
 * RichBase���kissy1.2�����䣬������S.ucfirst��������ֹ����
 */
/*
 Copyright 2012, KISSY UI Library v1.30
 MIT Licensed
 build time: Dec 20 22:28
 */
/**
 * @ignore
 * infrastructure for create plugin/extension-enabled class
 * @author yiminghe@gmail.com
 */
KISSY.add('rich-base', function (S, Base) {
    S.ucfirst = function (s) {
        s += '';
        return s.charAt(0).toUpperCase() + s.substring(1);
    }
    var ATTRS = 'ATTRS',
        ucfirst = S.ucfirst,
        ON_SET = '_onSet',
        noop = S.noop;

    /**
     * infrastructure for create plugin/extension-enabled class
     * @class KISSY.RichBase
     * @extend KISSY.Base
     */
    function RichBase() {
        var self = this, n, listeners;

        // apply attribute
        Base.apply(self, arguments);

        // setup listeners
        listeners = self.get("listeners");
        for (n in listeners) {
            self.on(n, listeners[n]);
        }

        // initialize main class and extension
        self.callMethodByHierarchy("initializer", "constructor");

        // initialize plugins
        self.constructPlugins();
        self.callPluginsMethod("initializer");

        self.bindInternal();
        self.syncInternal();
    }

    S.extend(RichBase, Base, {

        /**
         * collection all constructor by extend hierarchy
         * @protected
         * @return {Array}
         */
        collectConstructorChains: function () {
            var self = this,
                constructorChains = [],
                c = self.constructor;
            while (c) {
                constructorChains.push(c);
                c = c.superclass && c.superclass.constructor;
            }
            return constructorChains;
        },
        /**
         * call methods on main class and extension class by order
         * @protected
         * @param mainMethod method name of main class.
         * @param extMethod method name of extension class
         */
        callMethodByHierarchy: function (mainMethod, extMethod) {
            var self = this,
                c = self.constructor,
                extChains = [],
                ext,
                main,
                i,
                exts,
                t;

            // define
            while (c) {
                // 收集扩展�?
                t = [];
                if (exts = c.__ks_exts) {
                    for (i = 0; i < exts.length; i++) {
                        ext = exts[i];
                        if (ext) {
                            if (extMethod != "constructor") {
                                //只调用真正自己构造器原型的定义，继承原型链上的不要管
                                if (ext.prototype.hasOwnProperty(extMethod)) {
                                    ext = ext.prototype[extMethod];
                                } else {
                                    ext = null;
                                }
                            }
                            ext && t.push(ext);
                        }
                    }
                }

                // 收集主类
                // 只调用真正自己构造器原型的定义，继承原型链上的不要管 !important
                // �?以不用自己在 renderUI 中调�? superclass.renderUI 了，UIBase 构�?�器自动搜寻
                // 以及 initializer 等同�?
                if (c.prototype.hasOwnProperty(mainMethod) && (main = c.prototype[mainMethod])) {
                    t.push(main);
                }

                // 原地 reverse
                if (t.length) {
                    extChains.push.apply(extChains, t.reverse());
                }

                c = c.superclass && c.superclass.constructor;
            }

            // 初�P化函�?
            // 顺序：父类的�?有扩展类函数 -> 父类对应函数 -> 子类的所有扩展函�? -> 子类对应函数
            for (i = extChains.length - 1; i >= 0; i--) {
                extChains[i] && extChains[i].call(self);
            }
        },

        /**
         * call plugin method
         * @protected
         * @param method method name of plugin
         */
        callPluginsMethod: function (method) {
            var self = this;
            method = 'plugin' + ucfirst(method);
            S.each(self.get('plugins'), function (plugin) {
                if (plugin[method]) {
                    plugin[method](self);
                }
            });
        },

        /**
         * construct plugins
         * @protected
         */
        constructPlugins: function () {
            var plugins = this.get('plugins');
            S.each(plugins, function (plugin, i) {
                if (S.isFunction(plugin)) {
                    plugins[i] = new plugin();
                }
            });
        },

        /**
         * bind attribute change event
         * @protected
         */
        bindInternal: function () {
            var self = this,
                attrs = self.getAttrs(),
                attr,
                m;

            for (attr in attrs) {
                m = ON_SET + ucfirst(attr);
                if (self[m]) {
                    // 自动绑定事件到对应函�?
                    self.on('after' + ucfirst(attr) + 'Change', onSetAttrChange);
                }
            }
        },

        /**
         * sync attribute change event
         * @protected
         */
        syncInternal: function () {
            var self = this,
                attributeValue,
                onSetMethod,
                i,
                constructor,
                attributeName,
                onSetMethodName,
                cache = {},
                constructorChains = self.collectConstructorChains(),
                attrs;

            // 从父类到子类执行同步属�?�函�?
            for (i = constructorChains.length - 1; i >= 0; i--) {
                constructor = constructorChains[i];
                if (attrs = constructor[ATTRS]) {
                    for (attributeName in attrs) {
                        // 防止子类覆盖父类属�?�定义�?�成重夁执行
                        if (!cache[attributeName]) {
                            cache[attributeName] = 1;
                            onSetMethodName = ON_SET + ucfirst(attributeName);
                            // 存在方法，并且用户设置了初�P值或者存在默认�?�，就同步状�?
                            if ((onSetMethod = self[onSetMethodName]) &&
                                // 用户如果设置了显式不同步，就不同步，
                                // 比�b�?些�?�从 html 中读取，不需要同步再次设�?
                                attrs[attributeName].sync !== false &&
                                (attributeValue = self.get(attributeName)) !== undefined) {
                                onSetMethod.call(self, attributeValue);
                            }
                        }
                    }
                }
            }
        },

        /**
         * initialize for overridden
         * @protected
         */
        initializer: noop,

        /**
         * destroy for overridden
         * @protected
         */
        destructor: noop,

        /**
         * destroy current instance.
         */
        destroy: function () {
            var self = this;
            self.callPluginsMethod("destructor");
            destroyHierarchy(self);
            self.fire('destroy');
            self.detach();
        },

        /**
         * plugin a new plugins to current instance
         * @param {Function|Object} plugin
         * @chainable
         */
        'plug': function (plugin) {
            var self = this;
            if (S.isFunction(plugin)) {
                plugin = new plugin();
            }
            // initialize plugin
            if (plugin['pluginInitializer']) {
                plugin['pluginInitializer'](self);
            }
            self.get('plugins').push(plugin);
            return self;
        },

        /**
         * unplug by pluginId or plugin instance.
         * if called with no parameter, then destroy all plugins.
         * @param {Object|String} [plugin]
         * @chainable
         */
        'unplug': function (plugin) {
            var plugins = [],
                self = this,
                isString = typeof plugin == 'string';

            S.each(self.get('plugins'), function (p) {
                var keep = 0, pluginId;
                if (plugin) {
                    if (isString) {
                        // user defined takes priority
                        pluginId = p.get && p.get('pluginId') || p.pluginId;
                        if (pluginId != plugin) {
                            plugins.push(p);
                            keep = 1;
                        }
                    } else {
                        if (p != plugin) {
                            plugins.push(p);
                            keep = 1;
                        }
                    }
                }

                if (!keep) {
                    p.pluginDestructor(self);
                }
            });

            self.setInternal('plugins', plugins);
            return self;
        },

        /**
         * get specified plugin instance by id
         * @param {String} id pluginId of plugin instance
         * @return {Object}
         */
        'getPlugin': function (id) {
            var plugin = null;
            S.each(this.get('plugins'), function (p) {
                // user defined takes priority
                var pluginId = p.get && p.get('pluginId') || p.pluginId;
                if (pluginId == id) {
                    plugin = p;
                    return false;
                }
            });
            return plugin;
        }

    }, {
        ATTRS: {
            /**
             * Plugins for current component.
             * @cfg {Function[]/Object[]} plugins
             */
            /**
             * @ignore
             */
            plugins: {
                value: []
            },

            /**
             * Config listener on created.
             *
             * for example:
             *
             *      {
             *          click:{
             *              context:{x:1},
             *              fn:function(){
             *                  alert(this.x);
             *              }
             *          }
             *      }
             *      // or
             *      {
             *          click:function(){
             *              alert(this.x);
             *          }
             *      }
             *
             * @cfg {Object} listeners
             */
            /**
             * @ignore
             */
            listeners: {
                value: []
            }
        }
    });

    S.mix(RichBase, {
        /**
         * create a new class from extensions and static/prototype properties/methods.
         * @param {Function[]} [extensions] extension classes
         * @param {Object} [px] key-value map for prototype properties/methods.
         * @param {Object} [sx] key-value map for static properties/methods.
         * @return {Function} new class which extend called, it also has a static extend method
         *
         * for example:
         *
         *      var parent = RichBase.extend({
         *          isParent: 1
         *      });
         *      var child = parent.extend({
         *          isChild: 1,
         *          isParent: 0
         *      })
         */
        extend: function extend(extensions, px, sx) {
            var baseClass = this,
                name = "RichBaseDerived",
                t,
                C,
                args = S.makeArray(arguments);

            if (extensions == null || S.isObject(extensions)) {
                sx = px;
                px = extensions;
                extensions = [];
            }

            if (typeof (t = args[args.length - 1]) == 'string') {
                name = t;
            }

            px = px || {};
            if (px.hasOwnProperty('constructor')) {
                C = px.constructor;
            } else {
                C = function () {
                    C.superclass.constructor.apply(this, arguments);
                };
                // debug mode, give the right name for constructor
                // refer : http://limu.iteye.com/blog/1136712
                if (S.Config.debug) {
                    eval("C=function " + name.replace(/[-./]/g, "_") +
                        "(){ C.superclass.constructor.apply(this, arguments);}");
                }
            }

            C.name = name;

            S.extend(C, baseClass, px, sx);

            if (extensions) {
                C.__ks_exts = extensions;

                var attrs = {},
                    prototype = {};

                // [ex1,ex2]，扩展类后面的优先，ex2 定义的�f�? ex1 定义�?
                // 主类�?优先
                S.each(extensions['concat'](C), function (ext) {
                    if (ext) {
                        // 合并 ATTRS 到主�?
                        // 不�f盖主类上的定�?(主类位于 constructors �?�?)
                        // 因为继承层次上扩展类比主类层次高
                        // 注意：最�? value 必须是简单对象，自定�? new 出来的对象就会有问题
                        // (�? function return 出来)!
                        // a {y:{value:2}} b {y:{value:3,getter:fn}}
                        // b is a extension of a
                        // =>
                        // a {y:{value:2,getter:fn}}

                        S.each(ext[ATTRS], function (v, name) {
                            var av = attrs[name] = attrs[name] || {};
                            S.mix(av, v);
                        });

                        // 方法合并
                        var exp = ext.prototype, p;
                        for (p in exp) {
                            // do not mess with parent class
                            if (exp.hasOwnProperty(p)) {
                                prototype[p] = exp[p];
                            }
                        }
                    }
                });

                C[ATTRS] = attrs;

                S.augment(C, prototype);
            }

            C.extend = extend;

            return C;
        }
    });

    // # private start --------------------------------------

    // �?毁顺序： 子类 destructor -> 子类扩展 destructor -> 父类 destructor -> 父类扩展 destructor
    function destroyHierarchy(self) {
        var c = self.constructor,
            extensions,
            d,
            i;

        while (c) {
            // 只触发该类真正的析构器，和父亲没关系，所以不要在子类析构器中调用 superclass
            if (c.prototype.hasOwnProperty("destructor")) {
                c.prototype.destructor.apply(self);
            }

            if ((extensions = c.__ks_exts)) {
                for (i = extensions.length - 1; i >= 0; i--) {
                    d = extensions[i] && extensions[i].prototype.__destructor;
                    d && d.apply(self);
                }
            }

            c = c.superclass && c.superclass.constructor;
        }
    }

    function onSetAttrChange(e) {
        // ignore bubbling
        if (e.target == this) {
            var m = ON_SET + e.type.slice(5).slice(0, -6);
            this[m](e.newVal, e);
        }
    }

    // # private end --------------------------------------

    return RichBase;

}, {
    requires: ['base']
});