/******************************************
 * @author kL <klk0@qq.com>
 * @date 2019/6/15
 * @doc TestPage.
 * @end
 ******************************************/
const { ccclass, property } = cc._decorator;

import List from './List';
import ListItem from './ListItem';

@ccclass
export default class TestPage extends cc.Component {
    @property(List)
    list: List = null;
    @property(cc.EditBox)
    input: cc.EditBox = null;
    data: number[] = [];

    onLoad() {
        this.data = [];
        for (let n: number = 0; n < 20; n++) {
            this.data.push(n);
        }
        this.list.numItems = this.data.length;
    }

    onListRender(item: cc.Node, idx: number) {
        item.getComponentInChildren(cc.Label).string = this.data[idx] + '';
    }

    onListPageChange(pageNum: number) {
        cc.log('当前是第' + pageNum + '页');
    }
    //按钮事件
    btnEvent(ev: cc.Event) {
        let name: string = ev.target.name;
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