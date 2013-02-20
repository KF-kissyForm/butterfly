/*
 * @fileoverview 文本输入框封装类入口
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
KISSY.add('gallery/form/1.3/textbox/index', function (S, TextBox, NumberTextBox, PhoneNumberTextBox, QQNumberTextBox) {
        return {
            TextBox: TextBox,
            NumberTextBox: NumberTextBox,
            PhoneNumberTextBox: PhoneNumberTextBox,
            QQNumberTextBox: QQNumberTextBox
        };
    },
    {
        requires: [
            './text',
            './number',
            './phonenumber',
            './qqnumber'
        ]
    });
