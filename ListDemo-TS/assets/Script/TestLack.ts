/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/7/20
 * @doc TestLack.
 * @end
 ******************************************/
const { ccclass, property } = cc._decorator;

import List from './List';

@ccclass
export default class TestLack extends cc.Component {
    //水平列表
    @property(List)
    listH: List = null;
    //垂直列表
    @property(List)
    listV: List = null;

    private data = [];

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 3; n++) {
            this.data.push(n);
        }
        this.listH.numItems = this.data.length;
        this.listV.numItems = this.data.length;
    }

    onListRender(item: cc.Node, idx: number) {
        item.getComponentInChildren(cc.Label).string = this.data[idx] + '';
    }
}
