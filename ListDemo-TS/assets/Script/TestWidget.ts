/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/12/2
 * @doc TestWidget.
 * @end
 ******************************************/
const { ccclass, property } = cc._decorator;

import List from './List';

@ccclass
export default class TestWidget extends cc.Component {
    @property(List)
    list: List = null;
    data: number[] = [];

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 100; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    }

    onListRender(item: cc.Node, idx: number) {
        item.getComponentInChildren(cc.Label).string = this.data[idx] + '';
    }

}