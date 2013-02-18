/*
 * @fileoverview QQ号输入框封装类
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
KISSY.add(function (S, DOM, Node, NumberTextBox, NumberUtils) {
        /*
         * @name PhoneNumberTextBox
         * @class 电话号码输入框
         * @extends NumberTextBox
         * @constructor
         * @param {Node|DOMNode|String} container 容器
         * @param {Object} config
         */
        function PhoneNumberTextBox (container, config) {

            PhoneNumberTextBox.superclass.constructor.call(this, container, config);

            this._config(config);
        }

        S.extend(PhoneNumberTextBox, NumberTextBox, {
            render: function () {
                PhoneNumberTextBox.superclass._init.call(this);
                this._init();
            },
            _checkValidity: function (value) {
                var validationMessage,
                    validity,
                    re,
                    accept,
                    utils;

                PhoneNumberTextBox.superclass._checkValidity.call(this, value);

                if (S.isUndefined(value)) {
                    value = this.get('value');
                }

                validationMessage = '';
                validity = {
                    customError: false
                };
                accept = this.get('accept');
                utils = NumberUtils;

                if (this.get('validationMessage') == '' && value != '') {
                    re = utils.validate(accept, value);

                    if (re == utils.VALIDATION_RESULT_TYPE.MISMATCH) {
                        this.set('validity', S.merge(this.get('validity'), {
                            customError: false
                        }));
                        validationMessage = this.get('patternMismatchMessage');
                    } else if (re == utils.VALIDATION_RESULT_TYPE.UNSUPPORTED) {
                        this.set('validity', S.merge(this.get('validity'), {
                            customError: true
                        }));
                        validationMessage = this.get('numberUnsupportedMessage') || accept == NumberUtils.NUMBER_TYPE.TEL && '不支持固定电话号码' || accept == NumberUtils.NUMBER_TYPE.FIXED && '不支持手机号码';
                    }
                    this.set('validity', S.merge(this.get('validity'), validity));
                    this.set('validationMessage', validationMessage);
                }
            },
            /**
             * 初始化属性
             * @param {Object} config
             * @private
             */
            _config: function (config) {
                var textInputNode;

                textInputNode = this.get('textInputNode');

                this.set('patternMismatchMessage', config && config.patternMismatchMessage || textInputNode.attr('data-patternmismatchmessage') || '号码有误');
                this.set('accept', config && config.accept || textInputNode.attr('data-accept') * 1);
            },
            _init: function () {
                var textInputNode;

                textInputNode = this.get('textInputNode');

                if (textInputNode.prop('type') == 'text') {
                    // ie无法修改type
                    try {
                        textInputNode.prop('type', 'tel');
                    } catch (e) {
                    }
                }

                this.set('helperContentFn', NumberUtils.NUMBER_HELPER_CONTENT_FN.ADVANCED);

                this.on('afterValueChange', function (ev) {
                    // 自适应maxlength
                    this.set('maxLength', NumberUtils.getMaxLength(this.get('accept'), ev.newVal));

                    this.set('number', {
                        number: ev.value,
                        src: 'change'
                    });
                });

                this.on('afterAcceptChange', function (ev) {
                    var accept = ev.newVal;

                    // 自适应maxlength
                    this.set('maxLength', NumberUtils.getMaxLength(accept, this.get('textInputNode').val()));

                    if (accept == NumberUtils.NUMBER_TYPE.TEL) {
                        this.set('pattern', '\\d{11}');
                    } else if  (accept == NumberUtils.NUMBER_TYPE.FIXED) {
                        this.set('pattern', '\\d{10-12}');
                    }
                });

                this.on('afterLiveValueChange', function (ev) {
                    // 自适应maxlength
                    this.set('maxLength', NumberUtils.getMaxLength(this.get('accept'), ev.newVal));
                    this.set('number', {
                        number: ev.value,
                        src: 'input'
                    });
                });

                this.set('maxLength', NumberUtils.getMaxLength(this.get('accept'), textInputNode.val()));

                this.set('number', {
                    number: this.get('value'),
                    src: 'init'
                });
            }
        }, {
            ATTRS: {
                accept: {
                    value: NumberUtils.NUMBER_TYPE.UNKNOWN,
                    validator: function (value) {
                        return S.isNumber(value) && S.inArray(value, NumberUtils.NUMBER_TYPE.ARR);
                    }
                },
                phonenumber: {
                    value: {
                        number: '',
                        type: NumberUtils.NUMBER_TYPE.UNKNOWN,
                        src: ''
                    },
                    validator: function (value) {
                        return S.isPlainObject(value) && S.isString(value.number);
                    },
                    setter: function (value, key) {
                        var type = NumberUtils.getNumberType(this.get('accept'), value.number);

                        return {
                            number: type == NumberUtils.NUMBER_TYPE.UNKNOWN ? '' : ev.newVal,
                            numberType: type,
                            src: S.isString(value.src) || ''
                        };
                    }
                },
                numberUnsupportedMessage: {
                    value: '',
                    validator: function (value) {
                        return S.isString(value);
                    }
                }
            },
            utils: NumberUtils
        });

        return PhoneNumberTextBox;
    },
    {
        requires: [
            'dom',
            'node',
            './number',
            './numberUtils'
        ]
    });
