/**
 * @fileoverview 可编辑下拉列表
 * @author 易敛<yilian.wj@taobao.com>
 * @date 12-11-18
 */
KISSY.add('gallery/form/1.3/combobox/index',function(S, Node, Base){
    var $ = Node.all, D = S.DOM;
    var COMBOBOXCLS, COMBOSELECTCLS, COMBOTEXTCLS, COMBOHIDECLS;

    /**
     * @name ComboBox
     * @class 可编辑下拉列表
     * @constructor
     * @extends Base
     * @param {String} target 目标
     * @param {Object} config 组件配置
     * @example
     * var ck = new Number('#J_ComboBox',{aria: true})
     */

    function ComboBox(target, config) {

        var self = this;
        config = S.merge({target: $(target)},config);
        //调用父类构造器
        ComboBox.superclass.constructor.call(self, config);

    }

    ComboBox.ATTRS = {
        /**
         * 配置的目标,选择器的字符串
         * @type {String}
         */
        target: {
            value: '',
            setter: function(v) {
                return $(v);
            },
            getter: function(v) {
                return $(v);
            }
        },
        /**
         * 一组样式名
         * @type {Object}
         * @default cls:{combobox: 'ks-combobox',comboselect: 'ks-combobox-select',combotext: 'ks-combobox-text',combohide: 'ks-combobox-hide'}
         */
        cls: {
            value: {
                combobox: 'ks-combobox',
                comboselect: 'ks-combobox-select',
                combotext: 'ks-combobox-text',
                combohide: 'ks-combobox-hide'
            }
        },
        /**
         * 无障碍，设置aria-label属性值
         * @default ''
         */
        aria: {
            value: ''
        },
        /**
         * css模块路径
         * @default gallery/form/1.1/radio/themes/default/style2.css
         */
        cssUrl: {
            value: 'gallery/form/1.3/combobox/index.css'
        }
    };

    S.extend(ComboBox, Base, {
        render: function(){
            var self = this,$target = self.get('target');
            var cls = self.get('cls');
            COMBOBOXCLS = cls.combobox;
            COMBOSELECTCLS = cls.comboselect;
            COMBOTEXTCLS = cls.combotext;
            COMBOHIDECLS = cls.combohide;

            if(!$target.length) return false;

            self._loadCss();
            self._reformSelect($target);
            self._eventOnChangeValue();

        },
        _loadCss: function(){
            var self = this;
            var cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl != '')  S.use(cssUrl);
        },
        /*重新组装select，套一层容器*/
        _reformSelect: function($target){
            var self = this;

            S.each($target, function(item){
                var $item = $(item);
                var $parent = $item.parent();
                var comboBox = self._productComboBox(item);
                var $combobox = $(comboBox);
                $parent.append(comboBox);
                var offsetWidth = item.offsetWidth;
                if(S.UA.ie == 6){
                    offsetWidth = offsetWidth - 20;
                }
                else{
                    offsetWidth = offsetWidth - 27;
                }
                /*定位添加的text控件位置，覆盖掉部分select*/
                $combobox.children('.'+ COMBOTEXTCLS).css({left: item.offsetLeft + 1, width: offsetWidth, height: item.offsetHeight - 4});
                S.UA.ie == 6 && $combobox.children('.J_ComboFrame').css({left: item.offsetLeft + 1, width: offsetWidth, height: item.offsetHeight - 4});
            })
        },
        _productComboBox: function(item){
            var self = this, con = document.createElement('span'), tpl;
            var name = item.name, text = item.options[0].text;
            var ieVersion = S.UA.ie;
            var required = (ieVersion == 6 ? item.getAttribute('required') : item.hasAttribute('required'));
            var aria = self.get('aria');
            var ariaLabel = '可选择，也可手动输入';
            var isIE6 = (ieVersion == 6);
            con.className = COMBOBOXCLS;
            item.className = COMBOSELECTCLS;
            item.name = 'ks_comboselelct';
            item.removeAttribute('required');

            /*将select用combobox替换，name值赋予隐藏控件，实际提交的为隐藏控件
            * 如果设置aria属性，则显示aria-label，否则显示文字提示*/
            if(aria){
                tpl = '<input type="text" name="ks_combotext" class="J_ComboText ' + COMBOTEXTCLS + '" value="' + text + '" maxLength="30" aria-label="'+ariaLabel+'">' +
                    (isIE6 ? '<iframe class="ks-comboframe J_ComboFrame"></iframe>' : '') +
                    '<input type="hidden" name="' + name + '" class="J_ComboHide ' + COMBOHIDECLS + '" required="' + required + '">';
            }
            else{
                tpl = '<input type="text" name="ks_combotext" class="J_ComboText ' + COMBOTEXTCLS + '" value="' + text + '" maxLength="30"><span>  （可手动输入属性值）</span>' +
                    (isIE6 ? '<iframe class="ks-comboframe J_ComboFrame"></iframe>' : '') +
                    '<input type="hidden" name="' + name + '" class="J_ComboHide ' + COMBOHIDECLS + '" required="' + required + '">';

            }
            var $con = $(con);
            $con.append(item);
            $con.append(tpl);
            return con;
        },
        _eventOnChangeValue: function(){
            var self = this;
            S.Event.delegate(document, 'change', '.'+COMBOSELECTCLS , function(e){
                self._changeComboSelectHandler(e);
            });
            S.Event.delegate(document, 'keyup', '.'+COMBOTEXTCLS , function(e){
                self._changeComboTextHandler(e);
            });
        },
        _changeComboSelectHandler: function(e){
            var that = $(e.target);
            that.siblings('.'+COMBOHIDECLS)[0].value = that.val();
            that.siblings('.'+COMBOTEXTCLS)[0].value = that[0].options[that[0].selectedIndex].text;
        },
        _changeComboTextHandler: function(e){
            var that = $(e.target);
            var thatValue = S.trim(that.val());
            var $comboHide = that.siblings('.'+COMBOHIDECLS);
            $comboHide[0].value = thatValue;
        }

});

    return ComboBox;
},{requires:['node','base']});