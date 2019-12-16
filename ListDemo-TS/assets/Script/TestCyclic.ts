/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/12/2
 * @doc TestCyclic.
 * @end
 ******************************************/
const { ccclass, property } = cc._decorator;

import List from './List';

@ccclass
export default class TestCyclic extends cc.Component {

    @property(List)
    listV: List = null;
    @property(List)
    listV2: List = null;
    @property(List)
    listH: List = null;
    @property(List)
    listH2: List = null;

    onLoad() {
        this.listV.numItems =
            this.listV2.numItems =
            this.listH.numItems =
            this.listH2.numItems =
            3;
    }

    onListRender(item: cc.Node, idx: number) {
        item.getComponentInChildren(cc.Label).string = idx + '';
    }
}
