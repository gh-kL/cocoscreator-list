/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/7/20
 * @doc TestLack.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        listH: List,
        listV: List,
    },

    onLoad: function () {
        this.data = [];
        for (let n = 0; n < 3; n++) {
            this.data.push(n);
        }
        this.listH.numItems = this.data.length;
        this.listV.numItems = this.data.length;
    },

    onListRender(item, idx) {
        item.listItem.title.string = this.data[idx];
    },

});