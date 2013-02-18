/*
 * @fileoverview 号码输入框封装类
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
/**
 * TODO
 * 1.将部分属性设置为只读
 * 2.aria支持
 */
KISSY.add(function (S, DOM, Node, TextBox, KeyCodeUtils) {
        /*
         * @name NumberTextBox
         * @class 号码输入框
         * @extends TextBox
         * @constructor
         * @param {Node|DOMNode|String} container 容器
         * @param {Object} config
         * 1.粘贴
         * 2.placeholder
         * 3.blur延时
         * 4.键入时全选
         * 5.键入后trim
         * 6.maxlength
         * 7.autocomplete
         */
        function NumberTextBox (container, config) {

            NumberTextBox.superclass.constructor.call(this, container, config);

            this._config(config);
        }

        S.extend(NumberTextBox, TextBox, {
            render: function () {
                this._init();
            },
            /**
             * 初始化属性
             * @param {Object} config
             * @private
             */
            _config: function (config) {
                var textInputNode;

                textInputNode = this.get('textInputNode');

                this.set('pattern', config && config.pattern || textInputNode.attr('pattern') || '\\d+');
                this.set('patternMismatchMessage', config && config.patternMismatchMessage || textInputNode.attr('data-patternmismatchmessage') || '只能输入数字');
            },
            _init: function () {
                NumberTextBox.superclass._init.call(this);
                // 绑定事件
                this.on('keydown', function (ev) {
                    if (KeyCodeUtils.inNumberBlacklist(ev)) {
                        ev.preventDefault();
                    }
                }, this);

                this.on('keyup', function () {

                    var textInputNode = this.get('textInputNode'),
                        value = textInputNode.val();

                    if (!/^\d*$/.test(value)) {
                        textInputNode.val(value.replace(/\D/g, ''));
                    }
                }, this);
            }
        });

        return NumberTextBox;
    },
    {
        requires: [
            'dom',
            'node',
            './text',
            './keyCodeUtils'
        ]
    });
