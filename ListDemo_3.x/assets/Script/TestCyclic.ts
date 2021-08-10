/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestCyclic.
 * @end
 ******************************************/
import { _decorator, Component, Node, Label } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestCyclic')
export class TestCyclic extends Component {
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

    onListRender(item: Node, idx: number) {
        item.getComponentInChildren(Label).string = idx + '';
    }

}
