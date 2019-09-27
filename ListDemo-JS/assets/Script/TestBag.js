/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/9/27
 * @doc TestBag.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        list: List,
        bagItem: cc.Prefab,
        curPage: cc.Label,
    },

    onLoad: function () {
        this.totalItemNum = 90; //总Item数
        this.pagePreNum = 16;   //每页Item数量
        this.pageTotalNum = Math.ceil(this.totalItemNum / this.pagePreNum); //总页数
        this.list.numItems = this.pageTotalNum;
        this.onPageChange();
    },

    onListRender(item, idx) {
        if (item.childrenCount) {
            for (let n = 0; n < item.childrenCount; n++) {
                let bi = item.children[n];
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(cc.Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        } else {
            // 我这里就不考虑性能了，直接实例化。
            for (let n = 0; n < this.pagePreNum; n++) {
                let bi = cc.instantiate(this.bagItem);
                item.addChild(bi);
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(cc.Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        }
    },

    onPageChange(pageNum) {
        let pageN = pageNum == null ? this.list.curPageNum : pageNum;
        this.curPage.string = '当前页数：' + (pageN + 1);
    },

});