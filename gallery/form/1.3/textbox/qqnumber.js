/*
 * @fileoverview QQ号输入框封装类
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
/**
 * TODO
 * 1.将部分属性设置为只读
 * 2.aria支持
 */
KISSY.add(function (S, DOM, Node, Base, NumberTextBox, KeyCodeUtils) {
        /*
         * @name QQNumberTextBox
         * @class QQ号输入框
         * @extends TextBox
         * @constructor
         * @param {Node|DOMNode|String} contaienr 容器
         * @param {Object} config
         */
        function QQNumberTextBox (contaienr, config) {
            QQNumberTextBox.superclass.constructor.call(this, contaienr, config);

            this._config(config);
        }

        S.extend(QQNumberTextBox, NumberTextBox, {
            /**
             * 初始化属性
             * @param {Object} config
             * @private
             */
            _config: function (config) {
                var textInputNode;

                textInputNode = this.get('textInputNode');

                this.set('pattern', config && config.pattern || textInputNode.attr('pattern') || '\\d{5-11}');
                this.set('patternMismatchMessage', config && config.patternMismatchMessage || textInputNode.attr('data-patternmismatchmessage') || 'QQ号必须是5-11位的数字');
            },
            _init: function () {
                QQNumberTextBox.superclass._init.call(this);
            }
        });

        return QQNumberTextBox;
    },
    {
        requires: [
            'dom',
            'node',
            'base',
            './number',
            './keyCodeUtils'
        ]
    });
