/**
 * @fileoverview 数字文本框
 * @author 易敛<yilian.wj@taobao.com>
 * @date 12-4-22
 */
KISSY.add('gallery/form/1.3/spinbox/index', function(S, Node, Base){
	var $ = Node.all, D = S.DOM, Event = S.Event;
	/**
	 * @name SpinBox
	 * @class 数字文本框
	 * @constructor
	 * @extends Base
	 * @param {String} target 目标
	 * @param {Object} config 组件配置
	 * @example
	 * var ck = new Number('#J_SpinBox',{ariaLabel: '出价框，请输入价格'})
	 */
	function SpinBox(target, config) {
		
		var self = this;
		config = S.merge({target: $(target)},config);
		//调用父类构造器
		SpinBox.superclass.constructor.call(self, config);
	}

	S.extend(SpinBox, Base,  /** @lends SpinBox.prototype*/{
		/*
		* 运行
		*/
		render: function(){
			var self = this,$target = self.get('target');
            if(!$target.length || self._isNativeSpinBox()) return false;

            //增加ks-spinbox样式
            var boxCls = self.get('cls').init;
            if(!$target.hasClass(boxCls)) $target.addClass(boxCls);

            self._loadCss();
            self._addHTML();
            self._eventOnChangeNum();
            self._eventOnValide();
		},
		/**
		 * [_isNativeSpinBox 看是否原生SpinBox]
		 * @return {[type]} [description]
		 */
		_isNativeSpinBox: function(){
			var self = this, $target = self.get('target');
			if($target.attr('type') == 'number'){
				return true;
			}
			else {
				return false;
			}
		},
		/**
		 * 对input组件进行包装
		 */
		_addHTML: function(){
			var self = this, $target = self.get('target'), getCls = this.get('cls'), ariaLabel = self.get('ariaLabel');

			//创建元素
			$target.each(function(item){
				var $parent = item.parent(),
					$containerEl = $(D.create('<span class="'+ getCls.container  + '"></span>')),
					$plusEl = $(D.create('<a href="#!/plus" class="'+ getCls.plus + ' ' + getCls.sign +'">+</a>')),
					$minusEl = $(D.create('<a href="#!/minus" class="'+ getCls.minus + ' ' + getCls.sign +'">-</a>'));

					// 赋予aria属性
					item.attr({'aria-label':ariaLabel});

					//建立元素之间关系
					$containerEl.append($minusEl).append(item).append($plusEl);
					$parent.append($containerEl);
			})
			
		},

		_eventOnChangeNum: function(){
			var self = this,  getCls = self.get('cls'), $sign = $('.' + getCls.sign);
            var timer = '';
            $sign.on('keyup keydown mouseup mousedown', function(e){
				var $that = $(this), $parent = $that.parent(1), $target = $parent.children('.' + getCls.init), inputValue = Number(S.trim($target.val())),
				range = Number(S.trim($target.attr('data-range'))) || 1, onValueChange = self.get('onValueChange'),
                interval = 1000;
                var changeValue = function(){
                    if(e.target.className.indexOf(getCls.plus)> -1 ){
                        inputValue += range;
                    }
                    else if(e.target.className.indexOf(getCls.minus)>-1){
                        inputValue -= range;
                    }
                    self._limitRange(inputValue, $target);
                };
                if(e.type == 'keydown' || e.type == 'mousedown'){
                    changeValue();
                    timer = setTimeout(function(){
                        changeValue();
                        interval = 100;
                        timer = setTimeout(arguments.callee, interval);
                    },interval);
                }
                if(e.type == 'keyup' || e.type == 'mouseup'){
                    if(timer) {clearInterval(timer);}
                    /*调用外部方法*/
                    if(onValueChange){
                        onValueChange.call(self, {target: $target, trigger: $that});
                    }
                }


			})
		},
		_eventOnValide: function(){
			var self = this, $target = self.get('target');
			$target.on('blur',function(){
				self._formatNum($(this));
				self._limitRange(Number(S.trim($target.val())), $(this));
			})
		},

		_toFloat: function(value){
            return parseFloat(value);			
		},

        /**
		 * [numValidation 校正输入框格式，屏蔽非法字符]
		 * @param  {[NodeList]} $target [文本框节点]
		 */
        _formatNum : function($target){
    		var self = this, min = Number($target.attr('data-min')) || 1,
    		inputValue = self._toFloat($target.val().replace(/[^\d\.]/g, ''));
    		inputValue = isNaN(inputValue) ? min : Math.max(inputValue, min);
            var digit = ($target.attr('data-hasdecimal') == 'true') ? 2 : 0;
    		$target.val(inputValue.toFixed(digit));
        },
        /**
         * [_limitRange 控制输入数值的大小在最大值与最小值之间]
         * @param  {[Number]} value [输入框的值]
         * @param  {[NodeList]} target [文本框对象]
         */
        _limitRange : function(value, target){
        	var self = this, $target = target, $parent = $target.parent(1), _toFloat = self._toFloat,getCls = self.get('cls'),
        	min = _toFloat($target.attr('data-min')) || 1,
			max = _toFloat($target.attr('data-max')) || 1,
        	inputValue = min && Math.max(min, value);
			inputValue = max && Math.min(max, inputValue);
            var digit = ($target.attr('data-hasdecimal') == 'true') ? 2 : 0;
            $target.val(inputValue.toFixed(digit));
            if (inputValue === min) {
                $('.' + getCls.minus, $parent).addClass(getCls.disabled);
            }
            else if (inputValue === max) {
                $('.' + getCls.plus, $parent).addClass(getCls.disabled);
            }
            else {
                $('.' + getCls.sign, $parent).removeClass(getCls.disabled);
            }
        },
        /**
         * 加载css
         */
        _loadCss: function() {
            var self = this;
            var cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl != '')  S.use(cssUrl);
        }
	},{
		ATTRS: /** @lends SpinBox.prototype*/{
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
             * @default cls:{init: 'ks-spinbox',plus: 'ks-spinbox-plus',minus: 'ks-spinbox-minus',container: 'ks-radio-hover'}
             */
            cls: {
                value: {
                    init: 'ks-spinbox',
                    sign: 'ks-spinbox-sign',
                    plus: 'ks-spinbox-plus',
                    minus: 'ks-spinbox-minus',
                    container: 'ks-plus-minus-operation',
                    disabled: 'ks-spinbox-disabled'
                }
            },
            /**
            * value值改变时触发的事件函数
            * @default fn(){}
            * */
            onValueChange: {
              value: function(){}
            },
            /**
             * 无障碍，设置aria-label属性值
             * @default ''
             */
            ariaLabel: {
                value: ''
            },
            /**
             * css模块路径
             * @default gallery/form/1.1/radio/themes/default/style2.css
             */
            cssUrl: {
                value: 'gallery/form/1.3/spinbox/index.css'
            }
		}
	});
	return SpinBox;
},{requires:['node','base']});