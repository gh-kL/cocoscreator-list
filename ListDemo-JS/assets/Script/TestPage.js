/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/6/15
 * @doc TestPage.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        list: List,
        input: cc.EditBox,
    },

    onLoad: function () {
        this.data = [];
        for (let n = 0; n < 20; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    },

    onListRender(item, idx) {
        item.listItem.title.string = this.data[idx];
    },

    onListPageNumChange(pageNum) {
        cc.log('当前是第' + pageNum + '页');
    },
    //按钮事件
    btnEvent(ev) {
        let name = ev.target.name;
        let t = this;
        switch (name) {
            case 'btn1':
                t.list.prePage(.5);
                break;
            case 'btn2':
                t.list.nextPage(.5);
                break;
            case 'btn3':
                t.list.skipPage(parseInt(t.input.string), .5);
                break;
        }
    },

});