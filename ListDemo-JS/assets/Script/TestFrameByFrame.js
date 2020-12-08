/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/3/12
 * @doc TestFrameByFrame.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        list: List,
    },

    onLoad: function () {
        this.data = [];
        for (let n = 0; n < 999; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    },

    onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = this.data[idx];
    },

});