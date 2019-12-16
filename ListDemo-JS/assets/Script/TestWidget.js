/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/12/2
 * @doc TestPage.
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
        for (let n = 0; n < 100; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    },

    onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = this.data[idx];
    },

});