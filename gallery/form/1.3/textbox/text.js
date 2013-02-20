/*
 * @fileoverview 输入框封装类
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
/**
 * TODO
 * 1.将部分属性设置为只读
 * 2.aria支持
 */
KISSY.add(function (S, DOM, Node, Base, JSON, Overlay) {
    var UA = S.UA;

    var PLACEHOLDER_STYLE = {
        ALL: 0,
        AUTO: 1,
        ARR: [0, 1]
    };

    /*
     * @name TextBox
     * @class 文本输入框
     * @constructor
     * @param {Node|DOMNode|String} container input元素容器
     * @param {Object} config
     * config.selectAllOnFocus {Boolean} 是否在focus的时候全选
     * config.autoTrim {Boolean} 是否在focus的时候全选
     * config.paste {Boolean} 是否支持粘贴
     * config.placeholderStyle {Number} placeholder实现风格，0 - 统一模拟（浏览器实现交互方式不同），1 - 不支持的模拟，支持的不做处理
     * config.placeholderText {String} placeholder
     * config.prefixCls {String} css类名前缀
     */
    function TextBox (container, config) {
        var containerNode = Node.one(container);

        TextBox.superclass.constructor.call(this, containerNode, config);

        // TODO 加强验证
        try {
            this.set('containerNode', containerNode);
            this.set('textInputNode', containerNode.one('input'));
            if (!this.get('textInputNode')) {
                throw new Error('[TextBox]无法获取输入框元素');
            }
        } catch (e) {
            S.error(e.message);
        }

        // 配置
        this._config(config);
    }

    S.extend(TextBox, Base, {
        _needToImplementPlaceholder: function () {
            return this.get('placeholderStyle') == TextBox.PLACEHOLDER_STYLE.ALL || !TextBox.IS_PLACEHOLDER_SUPPORTED;
        },
        /**
         * 设置maxLength
         * @param {number} maxLength
         */
        _updateMaxLength: function (maxLength) {
            var val = this.get('textInputNode').val();

            maxLength = maxLength || this.get('maxLength');

            if (maxLength >= 0 && maxLength < val.length) {
                this.set('value', val.substring(0, maxLength));
            }

            this.get('textInputNode').prop('maxLength', maxLength);
        },
        selectAll: function () {
            var domNode = this.get('textInputNode').getDOMNode(),
                len = domNode.value.length,
                range,
                delay = 100;

            if (UA.ie) {
                S.later(function () {
                    range = domNode.createTextRange();
                    range.collapse(true);
                    range.moveStart('character', 0);
                    range.moveEnd('character', len);
                    range.select();
                }, delay);
            } else {
                S.later(function () {
                    domNode.setSelectionRange(0, len);
                }, delay);
            }
        },
        _trim: function () {
            var textInputNode = this.get('textInputNode'),
                prevVal = textInputNode.val(),
                newVal;

            newVal = S.trim(prevVal);
            if (newVal != prevVal) {
                textInputNode.val(newVal);
            }

        },
        checkValidity: function () {
            var re = true;

            if (!this.get('validity').valid) {
                this.fire('invalid');
                re = false;
            }

            return re;
        },
        setCustomValidity: function (msg) {
            this.set('validationMessage', msg);
        },
        render: function () {
            this._init();
        },
        _initPlaceholder: function () {
            var textInputNode = this.get('textInputNode'),
                containerNode = this.get('containerNode'),
                value;

            if (this._needToImplementPlaceholder()) {
                textInputNode.attr('placeholder', '');
                value = textInputNode.val();
                // 模拟placeholder
                if (value == '') {
                    // 当前输入框值为空时
                    textInputNode.val(this.get('placeholderText'));
                    containerNode.addClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                } else {
                    // 当前输入框值有值时
                    containerNode.removeClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                }

            } else {
                // 使用原生的placeholder实现
                textInputNode.attr('placeholder', this.get('placeholderText'));
            }
        },
        /**
         * 初始化属性
         * @param {Object} config
         * @private
         */
        _config: function (config) {
            var textInputNode = this.get('textInputNode');

            this.set('valueMissingMessage', config && config.valueMissingMessage || textInputNode.attr('data-valuemissingmessage'));
            this.set('patternMismatchMessage', config && config.patternMismatchMessage || textInputNode.attr('data-patternmismatchmessage'));
            this.set('helper', config && config.helper || textInputNode.attr('data-helper'));
            this.set('autoTrim', config && config.autoTrim || textInputNode.attr('data-autotrim'));
            this.set('selectAllOnFocus', config && config.selectAllOnFocus || textInputNode.attr('data-selectallonfocus'));
            this.set('paste', config && config.paste || textInputNode.attr('data-paste'));
            this.set('required', config && config.required || textInputNode.prop('required') || textInputNode.attr('required') == 'required');
            this.set('pattern', config && config.pattern || textInputNode.attr('pattern'));
            this.set('placeholderText', config && config.placeholderText || textInputNode.prop('placeholder') || textInputNode.attr('placeholder'));
            this.set('placeholderStyle', config && config.placeholderStyle || textInputNode.attr('data-placeholderstyle') * 1);
            this.set('maxLength', config && config.maxLength || textInputNode.prop('maxlength'));
            this.set('prefixCls', config && config.prefixCls || textInputNode.attr('data-prefixcls'));
        },
        _init: function () {
            // 初始化容器
            var textInputNode = this.get('textInputNode'),
                containerNode = this.get('containerNode');

            containerNode.addClass(this.get('prefixCls') + TextBox.CLS.CONTAINER);

            /*if (!containerNode) {
             containerNode = S.one(DOM.create('<div class="' + containerClassName + '"></div>'));
             containerNode.appendTo(textInputNode.parent());
             containerNode.append(textInputNode);
             }*/

            this.on('afterMaxLengthChange', function () {
                this._updateMaxLength();
            }, this);

            // 绑定事件
            textInputNode.on('focus', function (ev) {
                // 输入框focus事件
                var value = this.get('value');

                this.set('liveValue', value, {
                    silent: true
                });

                if (this._blurTimeout) {
                    // S.log('[TextBox]blurring is cancelled');
                    this._blurTimeout.cancel();
                    this._blurTimeout = null;
                }

                this.get('containerNode').addClass(this.get('prefixCls') + TextBox.CLS.ACTIVE);

                this.fire('focus');

                if (value != '') {
                    if (this.get('selectAllOnFocus')) {
                        this.selectAll();
                    }
                } else if (this._needToImplementPlaceholder()) {
                    // 模拟placeholder
                    textInputNode.val('');
                    this.get('containerNode').removeClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                }
            }, this);

            textInputNode.on('keydown', function (ev) {
                /*if (!this.get('paste')) {
                 // 屏蔽ctrl + v
                 // v对应的keyCode是86
                 // ctrl对应的keyCode是17
                 if (ev.ctrlKey && ev.keyCode == KeyCodeMap.key_v) {
                 ev.preventDefault();
                 }
                 }*/
                this.fire('keydown', ev);
            }, this);

            textInputNode.on('keyup', function (ev) {
                if (this.get('autoTrim')) {
                    // trim
                    this._trim();
                }

                this.set('liveValue', textInputNode.val());

                this.fire('keyup', ev);
            }, this);

            textInputNode.on('blur', function (ev) {
                var that = this;

                // S.log('[TextBox]blurring is delayed');
                that._blurTimeout = S.later(function () {
                    var value = that.get('value');

                    // S.log('[TextBox]blurring happens');
                    that.get('containerNode').removeClass(that.get('prefixCls') + TextBox.CLS.ACTIVE);

                    if (value == '' && that._needToImplementPlaceholder()) {
                        // 模拟placeholder
                        textInputNode.val(that.get('placeholderText'));
                        that.get('containerNode').addClass(that.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                    }
                    that.fire('blur');
                }, 0);

            }, this);

            textInputNode.on('change', function (ev) {
                this.set('value', ev.target.value);
                this.fire('change', ev);
            }, this);

            textInputNode.on('invalid', function (ev) {
                ev.preventDefault();
            }, this);

            if (TextBox.IS_PASTE_EVENT_SUPPORTED && !this.get('paste')) {
                textInputNode.on('paste', function (ev) {
                    ev.preventDefault();
                });
            }

            this.on('afterLiveValueChange', function (ev) {
                var helperContent,
                    helperContentFn,
                    helperOverlay;

                if (this.get('helper')) {
                    helperContentFn = this.get('helperContentFn');
                    if (S.isFucntion(helperContentFn)) {
                        helperContent = helperContentFn(ev.newVal);
                    } else {
                        helperContent = ev.newVal;
                    }
                    helperOverlay = this.get('helperOverlay');
                    if (!helperOverlay) {
                        helperOverlay = new Overlay({
                            prefixCls: this.get('prefixCls'),
                            content: helperContent
                        });
                    }
                    this._showHelperOverlay(helperContent);
                }
            }, this);

            this.on('afterValueChange', function (ev) {
                // trim
                var prevVal = ev.prevVal,
                    newVal = ev.newVal,
                    textInputNode = this.get('textInputNode');

                if (newVal != prevVal) {
                    if (!this._needToImplementPlaceholder()) {
                        textInputNode.val(newVal);
                    } else if (newVal == '') {
                        this.get('containerNode').addClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                        textInputNode.val(this.get('placeholderText'));
                    } else {
                        this.get('containerNode').removeClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                        textInputNode.val(newVal);
                    }
                }

                this._checkValidity(newVal);
            });

            this.on('afterPlaceholderTextChange', function (ev) {
                if (this.get('value') == '' && this._needToImplementPlaceholder()) {
                    textInputNode.val(ev.newVal);
                    textInputNode.addClass(this.get('prefixCls') + TextBox.CLS.PLACEHOLDER);
                }
            });

            this.on('afterRequiredChange', function (ev) {
                var valueMissing;
                if (ev.newVal && this.get('value') == '') {
                    valueMissing = true;
                } else if (!ev.newVal && this.get('validity').valueMissing) {
                    valueMissing = false;
                }

                if (!S.isNull(valueMissing)) {
                    this.set('validity', S.merge(this.get('validity'), {
                        valueMissing: valueMissing
                    }));
                }
            }, this);

            this.on('afterValidityChange', function (ev) {
                var valid = true;

                S.each(ev.newVal, function (value, key) {
                    if (key != 'valid' && value) {
                        valid = false;
                        return false;
                    }
                });

                ev.newVal.valid = valid;
            }, this);

            this.on('afterValidationMessageChange', function (ev) {
                var customError;
                if (ev.newVal == '' && this.get('validity').customError) {
                    customError = false;
                } else if (ev.newVal != '' && !this.get('validity').customError) {
                    customError = true;
                }

                if (!S.isNull(customError)) {
                    this.set('validity', S.merge(this.get('validity'), {
                        customError: customError
                    }));
                }
            }, this);

            this._initPlaceholder();

            this._checkValidity();
        },
        _checkValidity: function (value) {
            var validationMessage = '',
                validity = {
                    customError: false
                };

            if (S.isUndefined(value)) {
                value = this.get('value');
            }
            if (this.get('required') && value == '') {
                S.mix(validity, {
                    valueMissing: true
                });
                validationMessage = this.get('valueMissingMessage');
            } else {
                S.mix(validity, {
                    valueMissing: false
                });
            }

            if (value != '' && this.get('pattern') != '' && !(new RegExp(this.get('pattern'))).test(value)) {
                S.mix(validity, {
                    patternMismatch: true
                });
                validationMessage = this.get('patternMismatchMessage');
            } else {
                S.mix(validity, {
                    patternMismatch: false
                });
            }

            this.set('validity', S.merge(this.get('validity'), validity));
            this.set('validationMessage', validationMessage);
        }
    }, {
        PLACEHOLDER_STYLE: PLACEHOLDER_STYLE,
        // 浏览器是否支持placeholder
        IS_PLACEHOLDER_SUPPORTED: 'placeholder' in document.createElement('input'),
        // 浏览器是否支持粘贴事件 TODO opera不支持paste事件
        IS_PASTE_EVENT_SUPPORTED: UA.ie || UA.firefox || UA.safari || UA.chrome,
        ATTRS: {
            textInputNode: {
                value: null
            },
            containerNode: {
                value: null
            },
            selectAllOnFocus: {
                value: true,
                setter: function (value) {
                    if (S.isBoolean(value)) {
                        return value;
                    } else {
                        return value == 'enabled';
                    }
                },
                validator: function (value) {
                    return (S.isString(value) && (value == 'enabled' || value == 'disabled')) || S.isBoolean(value);
                }
            },
            autoTrim: {
                value: true,
                setter: function (value) {
                    if (S.isBoolean(value)) {
                        return value;
                    } else {
                        return value == 'enabled';
                    }
                },
                validator: function (value) {
                    return (S.isString(value) && (value == 'enabled' || value == 'disabled')) || S.isBoolean(value);
                }
            },
            paste: {
                value: true,
                setter: function (value) {
                    if (S.isBoolean(value)) {
                        return value;
                    } else {
                        return value == 'enabled';
                    }
                },
                validator: function (value) {
                    return (S.isString(value) && (value == 'enabled' || value == 'disabled')) || S.isBoolean(value);
                }
            },
            placeholderStyle: {
                value: PLACEHOLDER_STYLE.AUTO,
                validator: function (value) {
                    var re = true;

                    if (!S.isNumber(value) || !S.inArray(value, TextBox.PLACEHOLDER_STYLE.ARR)) {
                        re = false;
                    }

                    return re;
                }
            },
            placeholderText: {
                value: '',
                validator: function (value) {
                    return S.isString(value);
                }
            },
            prefixCls: {
                value: 'kf-textbox-',
                validator: function (value) {
                    return !!value;
                }
            },
            value: {
                value: '',
                setter: function (value, key) {
                    if (this.get('autoTrim')) {
                        return S.trim(value);
                    }
                }
            },
            maxLength: {
                value: -1,
                validator: function (value) {
                    return !!value;
                }
            },
            pattern: {
                value: '',
                validator: function (value) {
                    return S.isString(value);
                }
            },
            required: {
                value: false,
                validator: function (value) {
                    return S.isBoolean(value);
                }
            },
            validity: {
                value: {
                    customError: false,
                    patternMismatch: false,
                    rangeOverflow: false,
                    rangUnderflow: false,
                    stepMismatch: false,
                    tooLong: false,
                    typeMismatch: false,
                    valueMissing: false,
                    valid: true
                }
            },
            willValidate: {
                value: false
            },
            validationMessage: {
                value: '',
                validator: function (value) {
                    return S.isString(value);
                }
            },
            liveValue: {
                value: ''
            },
            valueMissingMessage: {
                value: '请输入',
                validator: function (value) {
                    return S.isString(value);
                }
            },
            patternMismatchMessage: {
                value: '输入有误',
                validator: function (value) {
                    return S.isString(value);
                }
            },
            helper: {
                valule: false,
                setter: function (value) {
                    var re = undefined;

                    if (!S.isUndefined(value)) {
                        if (S.isString(value)) {
                            if (value == 'enabled') {
                                re = true;
                            } else if (value == 'disabled') {
                                re = false;
                            }
                        } else {
                            re = !!value;
                        }
                    }
                    return re;
                }
            },
            helperOverlay: {
                value: null
            },
            helperContentFn: {
                value: null
            }
        },
        NAME: 'kf-textinput',
        CLS: {
            PLACEHOLDER: 'placeholder',
            ACTIVE: 'active',
            CONTAINER: 'container'
        }
    });

    return TextBox;
}, {
    requires: [
        'dom',
        'node',
        'base',
        'json',
        'overlay'
    ]
});
