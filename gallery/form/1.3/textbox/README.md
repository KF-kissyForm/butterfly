# 表单输入域组件

对原生输入框做了封装，并在此基础上扩展。

## 提供的输入框种类

### 文本输入框 TextBox

所有输入框的基类。

支持的特性有：

* 支持输入框获取焦点时自动全选内容，开关功能
* 支持禁止粘贴，开关功能
* 支持内容改变时（主要是键入内容、粘贴、动态赋值）自动去除左右空格（trim功能）
* 通过API改变maxLength时，截断多余内容
* 兼容Placeholder功能。原生的Placeholder功能会在输入框键入内容的时候才会隐藏Placeholder，模拟的目前会在focus的时候隐藏Placeholder
* 封装了The Constraint Validation API，兼容required和pattern属性
* 输入内容的时候支持显示一个弹层，根据输入内容动态显示信息

以上特性所有继承于TextBox的类都会有。

### 号码输入框 NumberTextBox

只允许输入数字。

### QQ号输入框 QQNumberTextBox

继承于号码输入框，有效的QQ号是4-10位的数字。

### 电话号码输入框 PhoneNumberTextBox

继承于号码输入框。

可以选择支持的号码类型，手机号码，固定电话号码，还是两者皆可。

有效的手机号码是11位的数字。

有效的固定电话号码必须包含区号（3-4位），加上7-8位的号码，总长度在10-12位之间。

## TODO

* Placeholder模拟加强
* ARIA特性
* textarea
* email
* url

## 样式