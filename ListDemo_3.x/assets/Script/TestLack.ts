/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestLack.
 * @end
 ******************************************/
import { _decorator, Component, Node, Label } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestLack')
export class TestLack extends Component {
    //水平列表
    @property(List)
    listH: List = null;
    //垂直列表
    @property(List)
    listV: List = null;

    private data: any = [];

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 3; n++) {
            this.data.push(n);
        }
        this.listH.numItems = this.data.length;
        this.listV.numItems = this.data.length;
    }

    onListRender(item: Node, idx: number) {
        item.getComponentInChildren(Label).string = this.data[idx] + '';
    }

}
