/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestBag.
 * @end
 ******************************************/
import { _decorator, Component, Node, Label, Prefab, instantiate, Vec3 } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestBag')
export class TestBag extends Component {
    @property(List)
    list: List = null;

    @property(Prefab)
    bagItem: Prefab = null;
    @property(Label)
    curPage: Label = null;

    private totalItemNum: number = 90;  //总Item数
    private pagePreNum: number = 16;    //每页Item数量
    private pageTotalNum: number;       //总页数

    onLoad() {
        this.pageTotalNum = Math.ceil(this.totalItemNum / this.pagePreNum);//总页数
        this.list.numItems = this.pageTotalNum;
        this.onPageChange();
    }

    onListRender(item: Node, idx: number) {
        if (item.children.length) {
            for (let n = 0; n < item.children.length; n++) {
                let bi: any = item.children[n];
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        } else {
            // 我这里就不考虑性能了，直接实例化。
            for (let n = 0; n < this.pagePreNum; n++) {
                let bi: any = instantiate(this.bagItem);
                item.addChild(bi);
                let exactIdx = (idx * this.pagePreNum) + n;
                bi.getComponentInChildren(Label).string = exactIdx < this.totalItemNum ? (exactIdx + 1) : '';
            }
        }
        // 3.0.0Preview 有Bug，所以才加下面这两行，估计正式版会修复
        let pos: Vec3 = item.getPosition();
        item.setPosition(new Vec3(pos.x, 160));
    }

    onPageChange(pageNum: number = null) {
        let pageN = pageNum == null ? this.list.curPageNum : pageNum;
        this.curPage.string = '当前页数：' + (pageN + 1);
    }

}
