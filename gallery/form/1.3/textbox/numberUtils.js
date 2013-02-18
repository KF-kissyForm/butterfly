/*
 * 号码格式化生成工具
 * @author 牧云<muyun.my@taobao.com>
 * @date 2012-06
 */
KISSY.add(function (S, AJAX) {
    var re = {};

    var UTILS = re;

    /**
     * <p>12345678901 -> 123-4567-8901</p>
     * <p>0XXX12345678 -> 0XXX-12345678</p>
     * @param {String} number
     * @param {String} delimiter
     * @returns {String}
     */
    re.format = function (number, delimiter) {
        var re = number;

        delimiter = delimiter || '-';

        if (/^1\d{10}$/.test(number)) {
            // 格式化手机号码
            var arr = number.match(/^(\d{3})(\d{4})(\d{4})$/);
            re = arr[1] + delimiter + arr[2] + delimiter + arr[3];
        } else if (/^0\d{9,11}$/.test(number)) {
            // 格式化固定电话号码
            // 查找区号
            var prefix = this.getDistrictNumber(number);
            if (prefix !== '') {
                re = prefix + delimiter + number.substring(prefix.length);
            }
        }

        return re;
    };

    /**
     * <p>123 -> 123-</p>
     * <p>1234 -> 123-4</p>
     * <p>1234567 -> 123-4567-</p>
     * <p>12345678 -> 123-4567-8</p>
     * <p>010 -> 010-</p>
     * <p>0108 -> 010-8</p>
     * <p>0571 -> 0571-</p>
     * <p>05718 -> 0571-8</p>
     * @param {String} number
     * @param {String} delimiter
     * @returns {String}
     */
    re.format2 = function (number, delimiter) {
        var re = '',
            len = number.length;

        delimiter = delimiter || '-';

        if (number.charAt(0) == '1') {
            // 格式化手机号码
            if (len < 4) {
                re = number;
            } else {
                re = number.substring(0, 3);
                if (len < 8) {
                    re += '-' + number.substring(3, len);
                } else {
                    re += '-' + number.substring(3, 7) + '-' + number.substring(7, len);
                }
            }
            if (len == 3 || len == 7) {
                re += '-';
            }
        } else if (number.charAt(0) == '0') {
            // 格式化固定电话号码
            // 查找区号
            if (len <= 2) {
                re = number;
            } else if (/^0(10|2([0-5]||[7-9]))/.test(number)) {
                re = number.substring(0, 3) + '-' + number.substring(3, len);
            } else if (number.length < 4) {
                re = number;
            } else {
                re = number.substring(0, 4) + '-' + number.substring(4, len);
            }
        } else {
            re = number;
        }

        return re;
    };

    re.getDistrictNumber = function (number) {
        var re = '';

        if (/^0\d{9,11}$/.test(number)) {
            // 固定电话号码
            if (/^0(10|2([0-5]||[7-9]))/.test(number)) {
                // 三位区号
                re = number.substring(0, 3);
            } else {
                // 四位区号
                re = number.substring(0, 4);
            }
        }

        return re;

    };

    re.getProvince = function (number) {
        var re = '';

        if (S.isString(number) && /^0[1-9]\d{2}/.test(number)) {
            switch (number.substring(1, 3)) {
                case '10':
                    re = '北京';
                    break;
                case '21':
                    re = '上海';
                    break;
                case '22':
                    re = '天津';
                    break;
                case '23':
                    re = '重庆';
                    break;
                case '24':
                    // 沈阳
                    re = '辽宁';
                    break;
                case '25':
                    // 南京
                    re = '江苏';
                    break;
                case '27':
                    // 武汉
                    re = '湖北';
                    break;
                case '28':
                    // 成都
                    re = '四川';
                    break;
                case '29':
                    // 西安
                    re = '陕西';
                    break;
                case '20':
                    // 广州
                    re = '广东';
                    break;
                case '31':
                case '32':
                case '33':
                    re = '河北';
                    break;
                case '34':
                case '35':
                    re = '山西';
                    break;
                case '37':
                case '38':
                case '39':
                    re = '河南';
                    break;
                case '41':
                case '42':
                    re = '辽宁';
                    break;
                case '43':
                case '44':
                    re = '吉林';
                    break;
                case '45':
                case '46':
                    re = '黑龙江';
                    break;
                case '47':
                case '48':
                    re = '内蒙古';
                    break;
                case '51':
                case '52':
                    re = '江苏';
                    break;
                case '53':
                case '54':
                case '63':
                    re = '山东';
                    break;
                case '55':
                case '56':
                    re = '安徽';
                    break;
                case '57':
                case '58':
                    re = '浙江';
                    break;
                case '59':
                    re = '福建';
                    break;
                case '71':
                case '72':
                    re = '湖北';
                    break;
                case '73':
                case '74':
                    re = '湖南';
                    break;
                case '75':
                case '76':
                case '66':
                    re = '广东';
                    break;
                case '77':
                    re = '广西';
                    break;
                case '79':
                case '70':
                    re = '江西';
                    break;
                case '81':
                case '82':
                case '83':
                    re = '江西';
                    break;
                case '85':
                    re = '贵州';
                    break;
                case '87':
                case '88':
                case '69':
                    re = '云南';
                    break;
                case '89':
                    if (number.charAt(3) === '8') {
                        // 0898属海南
                        re = '海南';
                    } else {
                        // 089[1-7]属海南
                        re = '西藏';
                    }
                    break;
                case '91':
                    re = '陕西';
                    break;
                case '93':
                case '94':
                    re = '甘肃';
                    break;
                case '95':
                    re = '宁夏';
                    break;
                case '97':
                    re = '青海';
                    break;
                case '99':
                case '90':
                    re = '新疆';
                    break;
            }
        }

        return re;
    };

    re.NUMBER_TYPE = {
        UNKNOWN: 0,
        TEL: 1,
        FIXED: 2,
        ARR: [0, 1, 2]
    };



    re.VALIDATION_RESULT_TYPE = {
        VALID: 0,
        MISSING: 1,
        MISMATCH: 2,
        UNSUPPORTED: 3
    };

    re.isFixedNumber = function (number) {
        return /^(0\d{9,11})$/.test(number);
    };

    re.isTelNumber = function (number) {
        return /^(1\d{10})$/.test(number);
    };

    re._getCarrierStr = function (str) {
        var arr = str.match(/移动|联通|电信/);
        return arr && arr[0] || '';
    };

    re._numberInfoCache = {};

    re._tccUrlBase = S.substitute('http://{hostname}/cc/json/mobile_tel_segment.htm', {
        hostname: /assets\.daily\.taobao\.net/.test(S.Config.base) ? 'tcc.daily.taobao.net' : 'tcc.taobao.com'
    });

    /**
     * 取号码信息
     * @param {String} number
     * @param {Function} onSuccess
     * @param {Function} onError
     */
    re.getNumberInfo = function (number, onSuccess, onError) {
        var that = this,
            data,
            province;

        S.log('[number-utils]start to get info of ' + number);
        if (/^\d+$/.test(number)) {
            S.log('[number-utils]number is valid');
            S.log('[number-utils]check cache');
            data = this._numberInfoCache[number];
            if (data) {
                S.log('[number-utils]cache is found');
                // 缓存中有记录
                if (data.code == 1) {
                    onSuccess(data);
                } else {
                    onError(data);
                }
            } else {
                S.log('[number-utils]no cache');
                data = {};
                // 请求信息
                if (number.charAt(0) == '1') {
                    S.log('[number-utils]it\'s a telephone number, get its info from remote server');
                    // 手机号请求服务器
                    AJAX({
                        url: this._tccUrlBase,
                        dataType: 'script',
                        scriptCharset: 'gbk',
                        data: {
                            tel: number
                        },
                        cache: false,
                        timeout: 5,
                        error: function (nothing, textStatus) {
                            S.log('[number-utils]error happens during requesting, make the info unknown');
                            data.msg = '号码信息未知';
                            data.code = -1;
                            S.isFunction(onError) && onError(data);
                        },
                        success: function () {
                            var result = window.__GetZoneResult_;

                            data.msg = '';

                            if (result.telString) {
                                S.log('[number-utils]info: ' + result.province + ', ' + that._getCarrierStr(result.catName));
                                data.code = 1;
                                S.mix(data, {
                                    carrier: that._getCarrierStr(result.catName),
                                    area: result.province,
                                    number: number
                                });
                                S.log('[number-utils]caching...');
                                that._numberInfoCache[number] = data;
                                if (S.isFunction(onSuccess)) {
                                    onSuccess(data)
                                }
                            } else {
                                data.code = -1;
                                S.log('[number-utils]the info remains unknown');
                                data.error = '号码信息未知';
                                S.log('[number-utils]caching...');
                                that._numberInfoCache[number] = data;
                                S.isFunction(onError) && onError(data);
                            }

                        }
                    });
                } else {
                    S.log('[number-utils]it\'s a fixed number, try to guess its area info');
                    // 固定电话号码
                    province = that.getProvince(number);
                    if (province != '') {
                        // 固定电话号码无法判断运营商
                        S.mix(data, {
                            carrier: '固话',
                            area: province,
                            number: number
                        });
                        that._numberInfoCache[number] = data;
                        S.isFunction(onSuccess) && onSuccess(data);
                    } else {
                        data.error = '号码信息未知';
                        that._numberInfoCache[number] = data;
                        S.isFunction(onError) && onError(infoObj);
                    }
                }
            }
        }
    };

    re.NUMBER_HELPER_CONTENT_FN = {
        SIMPLE: function (number) {
            return this.format(number);
        },
        ADVANCED: function (number) {
            var str = S.substitute('<p class="{prefixCls}number">{number}</p>', {
                number: this.format(number),
                prefixCls: this.get('prefixCls') + 'helper-'
            });
            if (UTILS.isTelNumber(number)) {
                if (this.get('accept') == UTILS.NUMBER_TYPE.FIXED) {
                    str += '<p class="{prefixCls}tip">请输入固定电话号码</p>';
                } else {
                    str += '<p class="{prefixCls}tip">手机号是11位数字</p>';
                }
            } else {
                if (this.get('accept') == UTILS.NUMBER_TYPE.TEL) {
                    str += '<p class="{prefixCls}tip">请输入手机号码</p>';
                } else {
                    str += '<p class="{prefixCls}tip">小灵通或固话需10-12位</p>';
                }
            }
        }
    };

    /**
     * 返回指定类型、指定号码下的最大长度
     * @param {Number} accept
     * @param {String} number
     * @return {Number}
     */
    re.getMaxLength = function (accept, number) {
        var re;

        if (S.isNumber(accept) && S.inArray(accept, this.NUMBER_TYPE.ARR)) {
            if (S.isString(number) && number != '') {
                if (number.charAt(0) == '0' && accept != this.NUMBER_TYPE.TEL) {
                    re = 12;
                } else {
                    re = 11;
                }
            } else {
                if (accept == this.NUMBER_TYPE.FIXED) {
                    re = 12;
                } else {
                    re = 11;
                }
            }
        }
        return re;
    };

    /*
     * @param {String} value
     * @param {Number} 接受的号码类型
     * @returns {Number} 返回错误码
     **/
    re.validate = function (accept, number) {
        return this._analyze(accept, number).validationResultType;
    };

    re.getNumberType = function (accept, number) {
        return this._analyze(accept, number).numberType;
    };

    re._analyze = function (accept, number) {
        var re = {
            validationResultType: this.VALIDATION_RESULT_TYPE.VALID,
            numberType: this.NUMBER_TYPE.UNKNOWN
        };

        if (!accept) {
            accept = this.NUMBER_TYPE.UNKNOWN;
        }

        if (S.isString(number) && number != '') {
            if (accept == this.NUMBER_TYPE.TEL) {
                if (/^1\d{10}$/.test(number)) {
                    re.numberType = this.NUMBER_TYPE.TEL
                } else if (/^0/.test(number)) {
                    re.validationResultType = this.VALIDATION_RESULT_TYPE.UNSUPPORTED;
                } else {
                    re.validationResultType = this.VALIDATION_RESULT_TYPE.MISMATCH;
                }
            } else if (accept == this.NUMBER_TYPE.FIXED) {
                if (/^0\d{9,11}$/.test(number)) {
                    re.numberType = this.NUMBER_TYPE.FIXED
                } else if (/^1/.test(number)) {
                    re.validationResultType = this.VALIDATION_RESULT_TYPE.UNSUPPORTED;
                } else {
                    re.validationResultType = this.VALIDATION_RESULT_TYPE.MISMATCH;
                }
            } else if (/^1\d{10}$/.test(number)) {
                re.numberType = this.NUMBER_TYPE.TEL
            } else if (/^0\d{9,11}$/.test(number)) {
                re.numberType = this.NUMBER_TYPE.FIXED
            } else {
                re.validationResultType = this.VALIDATION_RESULT_TYPE.MISMATCH;
            }
        } else {
            re.validationResultType = this.VALIDATION_RESULT_TYPE.MISSING;
        }

        return re;
    };

    return re;
}, {
    requires: ['ajax']
});
