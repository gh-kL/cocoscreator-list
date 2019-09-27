/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/9/27
 * @doc TestBag.
 * @end
 ******************************************/
const { ccclass, property } = cc._decorator;

import List from './List';

@ccclass
export default class TestBag extends cc.Component {
    @property(List)
    list: List = null;

    @property(cc.Prefab)
    bagItem: cc.Prefab = null;
    @property(cc.Label)
    curPage: cc.Label = null;

    private totalItemNum: number = 90;  //总Item数
    private pagePreNum: number = 16;    //每页Item数量
    private pageTotalNum: number;       //总页数

    onLoad() {
        this.pageTotalNum = Math.ceil(this.totalItemNum / this.pagePreNum);//总页数
        this.list.numItems = this.pageTotalNum;
        this.onPageChange();
    }

    onListRender(item: cc.Node, idx: number) {
        if (item.childrenCount) {
            for (let n = 0; n < item.childrenCount; n++) {
                let bi: any = item.children[n];
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(cc.Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        } else {
            // 我这里就不考虑性能了，直接实例化。
            for (let n = 0; n < this.pagePreNum; n++) {
                let bi: any = cc.instantiate(this.bagItem);
                item.addChild(bi);
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(cc.Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        }
    }

    onPageChange(pageNum: number = null) {
        let pageN = pageNum == null ? this.list.curPageNum : pageNum;
        this.curPage.string = '当前页数：' + (pageN + 1);
    }

}