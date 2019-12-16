/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/12/2
 * @doc TestCyclic.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        listV: List,
        listV2: List,
        listH: List,
        listH2: List,
    },

    onLoad() {
        this.listV.numItems =
            this.listV2.numItems =
            this.listH.numItems =
            this.listH2.numItems =
            3;
    },

    onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = idx;
    },

});
