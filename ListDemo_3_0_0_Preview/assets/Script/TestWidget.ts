/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestWidget.
 * @end
 ******************************************/
import { _decorator, Component, Node, Label } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestWidget')
export class TestWidget extends Component {
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

    onListRender(item: Node, idx: number) {
        item.getComponentInChildren(Label).string = this.data[idx] + '';
    }

}
