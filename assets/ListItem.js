/******************************************
 * @author 刘奎麟 <klk0@qq.com>
 * @copyright Nemo 2019.5.15
 * @doc 列表Item组件.
 * 说明：
 *      1、此组件须配合List组件使用。（配套的配套的..）
 * 注意：
 *      1、List设置了选择模式的话，要在本组件的节点上添加按钮组件，否则程序会自动取消List的选择模式。
 * @end
 ******************************************/
const SelectedType = cc.Enum({
    NONE: 0,
    TOGGLE: 1, //单一（单个Node显示/隐藏）
    SWITCH: 2, //切换(单个Sprite切换SpriteFrame)
});

cc.Class({
    editor: {
        disallowMultiple: false,
        menu: '自定义组件/List Item',
        executionOrder: -5001,  //先于List
    },

    extends: cc.Component,

    properties: {
        icon: {
            default: null,
            type: cc.Sprite,
        },
        title: cc.Node,
        selectedMode: {
            default: SelectedType.NONE,
            type: SelectedType,
            tooltip: CC_DEV && '选择类型',
            // get: function () {
            //     return this._slideType;
            // },
            // set: function (val) {
            //     if (val != null)
            //         this._slideType = val;
            // }
        },
        selectedFlag: {
            default: null,
            type: cc.Node,
            visible: function () {
                let bool = this.selectedMode > 0;
                if (!bool)
                    this.selectedFlag = null;
                return bool;
            },
        },
        selectedSpriteFrame: {
            default: null,
            type: cc.SpriteFrame,
            visible: function () {
                let bool = this.selectedMode == SelectedType.SWITCH;
                if (!bool)
                    this.selectedSpriteFrame = null;
                return bool;
            },
        },
        _selected: false,
        selected: {
            visible: false,
            get() {
                return this._selected;
            },
            set(val) {
                this._selected = val;
                if (!this.selectedFlag)
                    return;
                switch (this.selectedMode) {
                    case SelectedType.TOGGLE:
                        this.selectedFlag.active = val;
                        break;
                    case SelectedType.SWITCH:
                        // this.selectedFlag.node.active = true;
                        this.selectedFlag.spriteFrame = val ? this.selectedSpriteFrame : this._unselectedSpriteFrame;
                        break;
                }
            }
        },
    },

    onLoad() {
        //强行把文字组件转换给title...方便使用
        if (this.title) {
            let com = this.title.getComponent(cc.Label);
            if (!com)
                com = this.title.getComponent(cc.RichText);
            if (!com)
                com = this.title.getComponent('MyRichText');
            this.title = com;
        }
        //获取按钮组件，没有的话，selectedFlag无效
        this._btnCom = this.node.getComponent(cc.Button);
        if (!this._btnCom)
            this._btnCom = this.node.getComponent('MyButton');
        if (!this._btnCom)
            this.selectedMode == SelectedType.NONE;
        //有选择模式时，保存相应的东西
        if (this.selectedMode == SelectedType.SWITCH) {
            let com = this.selectedFlag.getComponent(cc.Sprite);
            // if (!com)
            //     console.error('SelectedMode为"SWITCH"时，selectedFlag必须要有cc.Sprite组件！');
            this.selectedFlag = com;
            this._unselectedSpriteFrame = com.spriteFrame;
        }
    },

    start() {

    },

    update(dt) {

    },

    _registerEvent() {
        if (this._btnCom && this._list.selectedMode > 0 && !this.eventReg) {
            let eh = new cc.Component.EventHandler();
            eh.target = this.node;
            eh.component = 'ListItem';
            eh.handler = 'onClickThis';
            this._btnCom.clickEvents.unshift(eh);
            this.eventReg = true;
        }
    },

    showAni(aniType, callFunc, del) {
        let acts;
        switch (aniType) {
            case 0: //向上消失
                acts = [
                    new cc.scaleTo(.2, .7),
                    new cc.moveBy(.3, 0, this.node.height * 2),
                ];
                break;
            case 1: //向上消失
                acts = [
                    new cc.scaleTo(.2, .7),
                    new cc.moveBy(.3, this.node.width * 2, 0),
                ];
                break;
            case 2: //向上消失
                acts = [
                    new cc.scaleTo(.2, .7),
                    new cc.moveBy(.3, 0, this.node.height * -2),
                ];
                break;
            case 3: //向上消失
                acts = [
                    new cc.scaleTo(.2, .7),
                    new cc.moveBy(.3, this.node.width * -2, 0),
                ];
                break;
            default: //默认：缩小消失
                acts = [
                    new cc.scaleTo(.3, .1),
                ];
                break;
        }
        if (callFunc || del) {
            acts.push(new cc.CallFunc(() => {
                if (del) {
                    this._list._delSingleItem(this.node);
                    for (let n = this._list.displayData.length - 1; n >= 0; n--) {
                        if (this._list.displayData[n].listId == this.node._listId) {
                            this._list.displayData.splice(n, 1);
                            break;
                        }
                    }
                }
                callFunc();
            }));
        }
        this.node.runAction(new cc.Sequence(acts));
    },

    onClickThis() {
        // if (this._list.selectedMode == 1)
        this._list.selectedId = this.node._listId;
    },

});