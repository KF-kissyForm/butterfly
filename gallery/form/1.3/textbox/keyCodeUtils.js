/*
 * @fileoverview KeyCode Map
 * @author 牧云 <muyun.my@taobao.com>
 * @date 2013-01-22
 */
KISSY.add(function (S) {
    return {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        ESC: 27,
        TAB: 9,
        /*
         * 是否在号码输入键的黑名单中（65-90，219-222，186-192, shiftKey + 96-105,48-57）
         * @param {Object} keyEvent
         */
        inNumberBlacklist: function (keyEvent) {
            var re = false,
                keyCode = keyEvent.keyCode,
                shiftKey = keyEvent.shiftKey,
                ctrlKey = keyEvent.ctrlKey,
                metaKey = keyEvent.metaKey;

            if (keyCode) {
                keyCode = keyCode * 1;

                if ((keyCode >= 96 && keyCode <= 105 || keyCode >= 48 && keyCode <= 57 ) && shiftKey || keyCode >= 65 && keyCode <= 90 && !metaKey || keyCode >= 219 && keyCode <= 222 || keyCode >= 186 && keyCode <= 192) {
                    re = true;
                }
            }

            return re;
        }
    };
});
