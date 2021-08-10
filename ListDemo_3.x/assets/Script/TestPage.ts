/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestPage.
 * @end
 ******************************************/
import { _decorator, Component, Node, Label, EditBox } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestPage')
export class TestPage extends Component {
    @property(List)
    list: List = null;
    @property(EditBox)
    input: EditBox = null;
    data: number[] = [];

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 20; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    }

    onListRender(item: Node, idx: number) {
        item.getComponentInChildren(Label).string = this.data[idx] + '';
    }

    onListPageChange(pageNum: number) {
        console.log('当前是第' + pageNum + '页');
    }
    //按钮事件
    btnEvent(ev: Event) {
        let name: string = ev.target['name'];
        let t: any = this;
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
    }

}
