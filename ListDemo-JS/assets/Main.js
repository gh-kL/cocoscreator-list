/******************************************
 * @author kL <klk0@qq.com>
 * @copyright Nemo 2019/1/5
 * @doc Main.
 * @end
 ******************************************/
const List = require('List');

cc.Class({
    extends: cc.Component,

    properties: {
        //垂直列表
        listV: List,
        //水平列表
        listH: List,
        //网格列表
        listG: List,
        //网格列表2
        listG2: List,
        //输入框
        input: cc.EditBox,
        //信息Labal
        info: cc.Label,
    },

    onLoad: function () {
        this.data = [];
        for (let n = 0; n < 30; n++) {
            this.data.push(n);
        }
        this.listV.numItems = this.data.length;
        this.listH.numItems = this.data.length;
        this.listG.numItems = this.data.length;
        this.listG2.numItems = this.data.length;
    },
    //垂直列表渲染器
    onListVRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        let lab = item.getChildByName('label2');
        let label2;
        if (lab)
            label2 = lab.getComponent(cc.Label);
        if (label2)
            label2.string = 'height=' + item.height;
        this.info.string = 'ListV当前渲染总数 = ' + this.listV.actualNumItems;
    },
    //水平列表渲染器
    onListHRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        let lab = item.getChildByName('label2');
        let label2;
        if (lab)
            label2 = lab.getComponent(cc.Label);
        if (label2)
            label2.string = 'width=' + item.width;
        this.info.string = 'ListH当前渲染总数 = ' + this.listH.actualNumItems;
    },
    //网格列表渲染器
    onListGridRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = 'ListG当前渲染总数 = ' + this.listG.actualNumItems;
    },
    //网格列表2渲染器
    onListGrid2Render(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = 'ListG2当前渲染总数 = ' + this.listG2.actualNumItems;
    },
    //当列表项被选择...
    onListSelected(item, selectedId, lastSelectedId, val) {
        if (!item)
            return;
        let list = item.listItem._list;
        let str = '当前操作List为：' + list.node.name + '，当前选择的是：' + selectedId + '，上一次选择的是：' + lastSelectedId;
        if (list.selectedMode == 2) { //如果是多选模式
            str += '，当前值为：' + val;
        }
        console.log(str);
    },
    //按钮事件
    btnEvent(ev) {
        let name = ev.target.name;
        let t = this;
        let callFunc = function (idx) {
            if (idx != null) {
                t.data.splice(idx, 1);
                console.log('------删除完毕！', idx);
                t.listV.numItems = t.data.length;
                t.listH.numItems = t.data.length;
                t.listG.numItems = t.data.length;
                t.listG2.numItems = t.data.length;
            }
        }
        switch (name) {
            case 'btn1':
                t.listV.aniDelItem(1, callFunc, 3);
                break;
            case 'btn2':
                t.listH.aniDelItem(t.listH.selectedId, callFunc, 0);
                break;
            case 'btn3':
                t.listG.aniDelItem(1, callFunc);
                break;
            case 'btn4':
                //key=Id，val=Size
                let heightData = {
                    0: 300,
                    5: 260,
                    6: 300,
                    10: 210,
                    13: 100,
                    14: 130,
                    15: 160,
                    17: 1000,
                };
                t.listV.customSize = heightData;
                //设置了customSize后，要刷新（也就是重新设置numItems）
                t.listV.numItems = t.data.length;
                break;
            case 'btn5':
                //key=Id，val=Size
                let widthData = {
                    0: 400,
                    5: 260,
                    6: 300,
                    10: 210,
                    13: 100,
                    14: 130,
                    15: 160,
                };
                t.listH.customSize = widthData;
                //设置了customSize后，要刷新（也就是重新设置numItems）
                t.listH.numItems = t.data.length;
                break;
            case 'btn6':
                t.listV.scrollTo(parseInt(t.input.string), .5);
                t.listH.scrollTo(parseInt(t.input.string), .5);
                t.listG.scrollTo(parseInt(t.input.string), .5);
                t.listG2.scrollTo(parseInt(t.input.string), .5);
                break;
        }
    },

});