/******************************************
 * @author kL <klk0@qq.com>
 * @copyright Nemo 2019/1/5
 * @doc 列表组件.
 * ### 说明：
 *      1、在编辑器中，创建一个ScrollView（也就是ScrollView->Mask->Content这样层级结构的节点!）。
 *      2、将List组件拖拽到ScrollView节点上。
 *      3、设置模板Item，选择TemplateType，可切换模板类型，请按需选择。
 *      4、设置滑动模式（SlideMode），NORMAL=通常，ADHERING=粘附（可用来制作分页效果）。
 *      5、设置是否为虚拟列表（Virtual），默认为true，如果为false，则跟普通列表没有区别。
 *      6、可选设置逐帧渲染（FrameByFrameRenderNum），该数量为每帧渲染的数量。
 *      7、设置渲染器（RenderEvent），在View中写一个函数，将该函数指向RenderEvent，运行时，设置List数量，Item将会通过该函数进行回调，开发者在该函数中实现Item的刷新。
 *      8、可选设置选择模式（SelectedMode），选择模式有SIMPLE（单选）、MULT（多选）两种模式，须与ListItem组件搭配使用，ListItem组件需要拖拽到模板Item上。在View中写一个函数，将该函数指向SelectedEvent，运行时，当选择变更，将会通过该函数回调。在View中，若是单选模式，用list.selectedId=N来改变当前选择。若是多选模式，则调用list.setMultSelected(args, boolean)接口来设置多选数据。
 *      9、完成以上设置后，在View中调用list.numItems=N设置列表数量，本组件就会通过渲染器（即RenderEvent）进行回调了!
 *      10、在View中可设置list.customSize以达到每个Item宽度或高度不一样的虚拟列表效果，简直美滋滋!但这个会耗费更多性能!仅支持虚拟列表!仅支持单列或单行!
 * ----------------------------------------
 * ### 注意：
 *      1、本组件所依赖的ScrollView节点以及ScrollView下的孙子节点Content，这两个节点的锚点需要按方向去设置。比如从顶到底单列排列，就需要设置锚点为（0.5, 1）。如果是从左到右网格排列，就需要设置锚点为（0, 1）。始终将锚点设置到首个Item那一边。
 *      2、各种反方向排列的布局（BOTTOM_TO_TOP、RIGHT_TO_LEFT）都会有问题（item数量过少，就会导致Content错位），这个是官方Bug。而本组件是配合cc.ScrollView去写的，所以也不支持，待官方后续修复（Last test by Creator_v2.1.1）。
 *      3、理论上设为虚拟列表后不可再设回普通列表（即virtual属性）。
 *      4、SlideMode设为ADHERING（粘附）后，组件将强行屏蔽惯性滚动。
 * @end
 ******************************************/
const TemplateType = cc.Enum({
    'NODE': 1,
    'PREFAB': 2,
});
const SlideType = cc.Enum({
    'NORMAL': 1, //普通
    'ADHERING': 2, //粘附效果，没有滚动惯性
    'PAGE': 3,   //页面
});
const SelectedType = cc.Enum({
    'NONE': 0,
    'SINGLE': 1, //单选
    'MULT': 2, //多选
});

const ListItem = require('ListItem');

cc.Class({
    extends: cc.Component,

    editor: {
        disallowMultiple: false,
        menu: '自定义组件/List',
        //脚本生命周期回调的执行优先级。小于 0 的脚本将优先执行，大于 0 的脚本将最后执行。该优先级只对 onLoad, onEnable, start, update 和 lateUpdate 有效，对 onDisable 和 onDestroy 无效。
        executionOrder: -5000,
    },

    properties: {
        templateType: {
            default: TemplateType.NODE,
            type: TemplateType,
        },
        tmpNode: {
            default: null,
            type: cc.Node,
            tooltip: CC_DEV && 'Item模版，type:cc.Node',
            visible: function () {
                let bool = this.templateType == TemplateType.NODE;
                if (!bool)
                    this.tmpNode = null;
                return bool;
            }
        },
        tmpPrefab: {
            default: null,
            type: cc.Prefab,
            tooltip: CC_DEV && 'Item模版，type:cc.Prefab',
            visible: function () {
                let bool = this.templateType == TemplateType.PREFAB;
                if (!bool)
                    this.tmpPrefab = null;
                return bool;
            }
        },
        _slideMode: 1,
        slideMode: {
            type: SlideType,
            tooltip: CC_DEV && '滑动模式',
            get: function () {
                return this._slideMode;
            },
            set: function (val) {
                if (val != null)
                    this._slideMode = val;
            }
        },
        pageDistance: {
            default: .3,
            type: cc.Float,
            range: [0, 1, .1],
            tooltip: CC_DEV && '翻页作用距离',
            slide: true,
            visible: function () {
                return this._slideMode == SlideType.PAGE;
            },
        },
        pageChangeEvent: {
            default: null,
            type: cc.Component.EventHandler,
            tooltip: CC_DEV && '页面改变事件',
            visible: function () {
                let bool = this._slideMode == SlideType.PAGE;
                if (!bool)
                    this.pageChangeEvent = null;
                return bool;
            },
        },
        _virtual: true,
        virtual: {
            tooltip: CC_DEV && '是否为虚拟列表（动态列表）',
            get() {
                return this._virtual;
            },
            set(val) {
                if (val != null)
                    this._virtual = val;
                if (!CC_DEV && this._numItems != 0) {
                    this._onScrolling();
                }
            }
        },
        _updateRate: 2,
        updateRate: {
            type: cc.Integer,
            range: [0, 6, 1],
            tooltip: CC_DEV && '刷新频率（值越大刷新频率越低、性能越高）',
            slide: true,
            get() {
                return this._updateRate;
            },
            set(val) {
                if (val >= 0 && val <= 6) {
                    this._updateRate = val;
                }
            }
        },
        frameByFrameRenderNum: {
            default: 0,
            type: cc.Integer,
            range: [0, 12, 1],
            tooltip: CC_DEV && '逐帧渲染时，每帧渲染的Item数量（<=0时关闭分帧渲染）',
            slide: true,
        },
        renderEvent: {
            default: null,
            type: cc.Component.EventHandler,
            tooltip: CC_DEV && '渲染事件（渲染器）',
        },
        selectedMode: {
            default: SelectedType.NONE,
            type: SelectedType,
            tooltip: CC_DEV && '选择模式',
        },
        selectedEvent: {
            default: null,
            type: cc.Component.EventHandler,
            tooltip: CC_DEV && '触发选择事件',
            visible: function () {
                let bool = this.selectedMode > 0;
                if (!bool)
                    this.selectedEvent = null;
                return bool;
            },
        },
        _selectedId: -1,
        selectedId: {
            visible: false,
            get: function () {
                return this._selectedId;
            },
            set: function (val) {
                if (this.selectedMode == SelectedType.SINGLE && val == this._selectedId)
                    return;
                let item;
                switch (this.selectedMode) {
                    case SelectedType.SINGLE: {
                        if (val == this._selectedId)
                            return;
                        item = this.getItemByListId(val);
                        if (!item && val >= 0)
                            return;
                        if (this._selectedId >= 0)
                            this._lastSelectedId = this._selectedId;
                        else //如果＜0则取消选择，把_lastSelectedId也置空吧，如果以后有特殊需求再改吧。
                            this._lastSelectedId = null;
                        this._selectedId = val;
                        if (item)
                            item.listItem.selected = true;
                        if (this._lastSelectedId >= 0) {
                            let lastItem = this.getItemByListId(this._lastSelectedId);
                            if (lastItem) {
                                lastItem.listItem.selected = false;
                            }
                        }
                        if (this.selectedEvent) {
                            cc.Component.EventHandler.emitEvents([this.selectedEvent], item, val, this._lastSelectedId);
                        }
                        break;
                    }
                    case SelectedType.MULT: {
                        item = this.getItemByListId(val);
                        if (!item)
                            return;
                        if (this._selectedId >= 0)
                            this._lastSelectedId = this._selectedId;
                        this._selectedId = val;
                        let bool = !item.listItem.selected;
                        item.listItem.selected = bool;
                        let sub = this.multSelected.indexOf(val);
                        if (bool && sub < 0) {
                            this.multSelected.push(val);
                        } else if (!bool && sub >= 0) {
                            this.multSelected.splice(sub, 1);
                        }
                        if (this.selectedEvent) {
                            cc.Component.EventHandler.emitEvents([this.selectedEvent], item, val, this._lastSelectedId, bool);
                        }
                        break;
                    }
                }
            },
        },
        _numItems: 0,
        numItems: {
            visible: false,
            get() {
                return this._numItems;
            },
            set(val) {
                if (!this.checkInited())
                    return;
                if (val == null || val < 0) {
                    cc.error('numItems set the wrong::', val);
                    return;
                }
                this._numItems = val;
                this._forceUpdate = true;

                switch (this._align) {
                    case cc.Layout.Type.HORIZONTAL: {
                        switch (this._horizontalDir) {
                            case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
                                this._alignCalcType = 1;
                                break;
                            case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
                                this._alignCalcType = 2;
                                break;
                        }
                        break;
                    }
                    case cc.Layout.Type.VERTICAL: {
                        switch (this._verticalDir) {
                            case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
                                this._alignCalcType = 3;
                                break;
                            case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
                                this._alignCalcType = 4;
                                break;
                        }
                        break;
                    }
                    case cc.Layout.Type.GRID: {
                        switch (this._startAxis) {
                            case cc.Layout.AxisDirection.HORIZONTAL:
                                switch (this._verticalDir) {
                                    case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
                                        this._alignCalcType = 3;
                                        break;
                                    case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
                                        this._alignCalcType = 4;
                                        break;
                                }
                                break;
                            case cc.Layout.AxisDirection.VERTICAL:
                                switch (this._horizontalDir) {
                                    case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
                                        this._alignCalcType = 1;
                                        break;
                                    case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
                                        this._alignCalcType = 2;
                                        break;
                                }
                                break;
                        }
                        break;
                    }
                }

                if (this._virtual) {
                    this._resizeContent();
                    this._onScrolling();
                } else {
                    let layout = this.content.getComponent(cc.Layout);
                    if (layout) {
                        layout.enabled = true;
                    }
                    this._delRedundantItem();

                    this.firstListId = 0;
                    if (this.frameByFrameRenderNum > 0) {
                        //先渲染几个出来
                        let len = this.frameByFrameRenderNum > this._numItems ? this._numItems : this.frameByFrameRenderNum;
                        for (let n = 0; n < len; n++) {
                            this._createOrUpdateItem2(n);
                        }
                        if (this.frameByFrameRenderNum < this._numItems) {
                            this._updateCounter = this.frameByFrameRenderNum;
                            this._updateDone = false;
                        }
                    } else {
                        for (let n = 0; n < val; n++) {
                            this._createOrUpdateItem2(n);
                        }
                        this.actualNumItems = val;
                    }
                }
            }
        },
    },

    onLoad() {
        this._init();
    },

    onEnable() {
        if (!CC_EDITOR) {
            this._registerEvent();
        }
        this._init();
    },

    onDisable() {
        if (!CC_EDITOR) {
            this._unregisterEvent();
        }
    },
    //注册事件
    _registerEvent() {
        this.node.on('touch-up', this._onScrollTouchUp, this, true);
        // this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onScrollTouchUp, this);
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onScrollTouchMove, this);
        this.node.on('scroll-began', this._onScrollBegan, this, true);
        this.node.on('scroll-ended', this._onScrollEnded, this, true);
        this.node.on('scrolling', this._onScrolling, this, true);
    },
    //卸载事件
    _unregisterEvent() {
        this.node.off('touch-up', this._onScrollTouchUp, this, true);
        // this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onScrollTouchUp, this);
        // this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onScrollTouchMove, this);
        this.node.off('scroll-began', this._onScrollBegan, this, true);
        this.node.off('scroll-ended', this._onScrollEnded, this, true);
        this.node.off('scrolling', this._onScrolling, this, true);
    },
    //初始化各种..
    _init() {
        if (this._inited)
            return;

        this._scrollView = this.node.getComponent(cc.ScrollView);
        if (!this._scrollView) {
            cc.error(this.node.name + ' no assembly cc.ScrollView!');
            return;
        }
        this.content = this._scrollView.content;
        if (!this.content) {
            cc.error(this.node.name + "'s cc.ScrollView unset content!");
            return;
        }

        this._layout = this.content.getComponent(cc.Layout);

        this._align = this._layout.type; //排列模式
        this._resizeMode = this._layout.resizeMode; //自适应模式
        this._startAxis = this._layout.startAxis;

        this._topGap = this._layout.paddingTop; //顶边距
        this._rightGap = this._layout.paddingRight; //右边距
        this._bottomGap = this._layout.paddingBottom; //底边距
        this._leftGap = this._layout.paddingLeft; //左边距

        this._columnGap = this._layout.spacingX; //列距
        this._lineGap = this._layout.spacingY; //行距

        this._colLineNum; //列数或行数（非GRID模式则=1，表示单列或单行）;

        this._verticalDir = this._layout.verticalDirection; //垂直排列子节点的方向
        this._horizontalDir = this._layout.horizontalDirection; //水平排列子节点的方向

        this.setTemplateItem(this.templateType == TemplateType.PREFAB ? this.tmpPrefab.data : this.tmpNode);

        if (this._slideMode == SlideType.ADHERING || this._slideMode == SlideType.PAGE)//特定的滑动模式需要关闭惯性
            this._scrollView.inertia = false;

        this._lastDisplayData = []; //最后一次刷新的数据
        this.displayData = []; //当前数据
        this._pool = []; //这是个池子..
        this._forceUpdate = false;
        this._updateCounter = 0;
        this._updateDone = true;

        this.curPageNum = 0;

        this.content.removeAllChildren();
        this._inited = true;
    },
    //设置模板Item
    setTemplateItem(item) {
        this._itemTmp = item;
        if (this._resizeMode == cc.Layout.ResizeMode.CHILDREN)
            this._itemSize = this._layout.cellSize;
        else
            this._itemSize = new cc.size(this._itemTmp.width, this._itemTmp.height);
        //获取ListItem，如果没有就取消选择模式
        let com = this._itemTmp.getComponent(ListItem);
        let remove = false;
        if (!com) {
            remove = true;
        }
        if (com) {
            // com._list = this;
            // this._itemTmp.listItem = com;
            if (!com._btnCom) {
                remove = true;
            }
        }
        if (remove) {
            this.selectedMode = SelectedType.NONE;
        }
        if (this.selectedMode == SelectedType.MULT)
            this.multSelected = [];

        switch (this._align) {
            case cc.Layout.Type.HORIZONTAL:
                this._colLineNum = 1;
                this._sizeType = false;
                break;
            case cc.Layout.Type.VERTICAL:
                this._colLineNum = 1;
                this._sizeType = true;
                break;
            case cc.Layout.Type.GRID:
                switch (this._startAxis) {
                    case cc.Layout.AxisDirection.HORIZONTAL:
                        //计算列数
                        let trimW = this.content.width - this._leftGap - this._rightGap;
                        this._colLineNum = 1;
                        while (1) {
                            if (trimW - ((this._colLineNum * this._itemSize.width) + ((this._colLineNum - 1) * this._columnGap)) < 0) {
                                this._colLineNum--;
                                break;
                            } else {
                                this._colLineNum++;
                            }
                        }
                        this._sizeType = true;
                        break;
                    case cc.Layout.AxisDirection.VERTICAL:
                        //计算行数
                        let trimH = this.content.height - this._topGap - this._bottomGap;
                        this._colLineNum = 1;
                        while (1) {
                            if (trimH - ((this._colLineNum * this._itemSize.height) + ((this._colLineNum - 1) * this._lineGap)) < 0) {
                                this._colLineNum--;
                                break;
                            } else {
                                this._colLineNum++;
                            }
                        }
                        this._sizeType = false;
                        break;
                }
                break;
        }
    },
    /**
     * 检查是否初始化
     * @param {Boolean} printLog 是否打印错误信息
     * @returns
     */
    checkInited(printLog) {
        let pL = printLog ? printLog : true;
        if (!this._inited) {
            if (pL) {
                cc.error('List initialization not completed!');
            }
            return false;
        }
        return true;
    },
    //禁用 Layout 组件，自行计算 Content Size
    _resizeContent() {
        let layout = this.content.getComponent(cc.Layout);
        if (layout) {
            layout.enabled = false;
        }
        switch (this._align) {
            case cc.Layout.Type.HORIZONTAL: {
                let res;
                if (this.customSize) {
                    let fixed = this._getFixedSize();
                    res = this._leftGap + fixed.val + (this._itemSize.width * (this._numItems - fixed.count)) + (this._columnGap * (this._numItems - 1)) + this._rightGap;
                } else {
                    res = this._leftGap + (this._itemSize.width * this._numItems) + (this._columnGap * (this._numItems - 1)) + this._rightGap;
                }
                this.content.width = res;
                break;
            }
            case cc.Layout.Type.VERTICAL: {
                let res;
                if (this.customSize) {
                    let fixed = this._getFixedSize();
                    res = this._topGap + fixed.val + (this._itemSize.height * (this._numItems - fixed.count)) + (this._lineGap * (this._numItems - 1)) + this._bottomGap;
                } else {
                    res = this._topGap + (this._itemSize.height * this._numItems) + (this._lineGap * (this._numItems - 1)) + this._bottomGap;
                }
                this.content.height = res;
                break;
            }
            case cc.Layout.Type.GRID: {
                switch (this._startAxis) {
                    case cc.Layout.AxisDirection.HORIZONTAL:
                        let lineNum = Math.ceil(this._numItems / this._colLineNum);
                        this.content.height = this._topGap + (this._itemSize.height * lineNum) + (this._lineGap * (lineNum - 1)) + this._bottomGap;
                        break;
                    case cc.Layout.AxisDirection.VERTICAL:
                        let colNum = Math.ceil(this._numItems / this._colLineNum);
                        this.content.width = this._leftGap + (this._itemSize.width * colNum) + (this._columnGap * (colNum - 1)) + this._rightGap;
                        break;
                }
                break;
            }
        }
        // cc.log('_resizeContent()  numItems =', this._numItems, '，content =', this.content);
    },
    //滚动进行时...
    _onScrolling(ev) {
        if (this.frameCount == null)
            this.frameCount = this._updateRate;
        if (!this._forceUpdate && (ev && ev.type != 'scroll-ended') && this.frameCount > 0) {
            this.frameCount--;
            return;
        } else
            this.frameCount = this._updateRate;

        if (this._aniDelRuning)
            return;

        this._calcViewPos();

        if (this._virtual) {
            this.displayData = [];
            let itemPos;

            let curId = 0;
            let endId = this._numItems - 1;

            if (this.customSize) {
                let breakFor = false;
                //如果该item的位置在可视区域内，就推入displayData
                for (; curId <= endId && !breakFor; curId++) {
                    itemPos = this._calcItemPos(curId);
                    switch (this._align) {
                        case cc.Layout.Type.HORIZONTAL:
                            if (itemPos.right >= this.viewLeft && itemPos.left <= this.viewRight) {
                                this.displayData.push(itemPos);
                            } else if (curId != 0 && this.displayData.length > 0) {
                                breakFor = true;
                            }
                            break;
                        case cc.Layout.Type.VERTICAL:
                            if (itemPos.bottom <= this.viewTop && itemPos.top >= this.viewBottom) {
                                this.displayData.push(itemPos);
                            } else if (curId != 0 && this.displayData.length > 0) {
                                breakFor = true;
                            }
                            break;
                        case cc.Layout.Type.GRID:
                            switch (this._startAxis) {
                                case cc.Layout.AxisDirection.HORIZONTAL:
                                    if (itemPos.bottom <= this.viewTop && itemPos.top >= this.viewBottom) {
                                        this.displayData.push(itemPos);
                                    } else if (curId != 0 && this.displayData.length > 0) {
                                        breakFor = true;
                                    }
                                    break;
                                case cc.Layout.AxisDirection.VERTICAL:
                                    if (itemPos.right >= this.viewLeft && itemPos.left <= this.viewRight) {
                                        this.displayData.push(itemPos);
                                    } else if (curId != 0 && this.displayData.length > 0) {
                                        breakFor = true;
                                    }
                                    break;
                            }
                            break;
                    }
                }
            } else {
                let ww = this._itemSize.width + this._columnGap;
                let hh = this._itemSize.height + this._lineGap;
                switch (this._alignCalcType) {
                    case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                        curId = (this.viewLeft + this._leftGap) / ww;
                        endId = (this.viewRight + this._rightGap) / ww;
                        break;
                    case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                        curId = (-this.viewRight - this._rightGap) / ww;
                        endId = (-this.viewLeft - this._leftGap) / ww;
                        break;
                    case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                        curId = (-this.viewTop - this._topGap) / hh;
                        endId = (-this.viewBottom - this._bottomGap) / hh;
                        break;
                    case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                        curId = (this.viewBottom + this._bottomGap) / hh;
                        endId = (this.viewTop + this._topGap) / hh;
                        break;
                }
                curId = Math.floor(curId) * this._colLineNum;
                endId = Math.ceil(endId) * this._colLineNum;
                endId--;
                if (curId < 0)
                    curId = 0;
                if (endId < 0)
                    endId = 0;
                else if (endId >= this._numItems)
                    endId = this._numItems - 1;
                // cc.log(curId, endId);
                for (; curId <= endId; curId++) {
                    this.displayData.push(this._calcItemPos(curId));
                }
            }
            if (this.displayData.length <= 0)
                return;
            this.firstListId = this.displayData[0].id;
            this.actualNumItems = this.displayData.length;
            let len = this._lastDisplayData.length;
            //判断数据是否与当前相同，如果相同，return。
            //因List的显示数据是有序的，所以只需要判断数组长度是否相等，以及头、尾两个元素是否相等即可。
            if (this._forceUpdate ||
                this.actualNumItems != len ||
                this.firstListId != this._lastDisplayData[0] ||
                this.displayData[this.actualNumItems - 1].id != this._lastDisplayData[len - 1]
            ) {
                this._lastDisplayData = [];
                if (this.frameByFrameRenderNum > 0) { //逐帧渲染
                    if (this._numItems > 0) {
                        if (!this._updateDone) {
                            this._doneAfterUpdate = true;
                        } else {
                            this._updateCounter = 0;
                        }
                        this._updateDone = false;
                    } else {
                        this._delRedundantItem();
                        this._updateCounter = 0;
                        this._updateDone = true;
                    }
                    // cc.log('List Display Data I::', this.displayData);
                } else { //直接渲染
                    // cc.log('List Display Data II::', this.displayData);
                    for (let c = 0; c < this.actualNumItems; c++) {
                        this._createOrUpdateItem(this.displayData[c]);
                    }
                    this._delRedundantItem();
                    this._forceUpdate = false;
                }
            }
            this._calcNearestItem();
        }
    },
    //计算可视范围
    _calcViewPos() {
        let scrollPos = this.content.getPosition();
        switch (this._alignCalcType) {
            case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                this.elasticLeft = scrollPos.x > 0 ? scrollPos.x : 0;
                this.viewLeft = (scrollPos.x < 0 ? -scrollPos.x : 0) - this.elasticLeft;
                this.viewRight = this.viewLeft + this.node.width;
                this.elasticRight = this.viewRight > this.content.width ? Math.abs(this.viewRight - this.content.width) : 0;
                this.viewRight += this.elasticRight;
                // cc.log(this.elasticLeft, this.elasticRight, this.viewLeft, this.viewRight);
                break;
            case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                this.elasticRight = scrollPos.x < 0 ? -scrollPos.x : 0;
                this.viewRight = (scrollPos.x > 0 ? -scrollPos.x : 0) + this.elasticRight;
                this.viewLeft = this.viewRight - this.node.width;
                this.elasticLeft = this.viewLeft < -this.content.width ? Math.abs(this.viewLeft + this.content.width) : 0;
                this.viewLeft -= this.elasticLeft;
                // cc.log(this.elasticLeft, this.elasticRight, this.viewLeft, this.viewRight);
                break;
            case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                this.elasticTop = scrollPos.y < 0 ? Math.abs(scrollPos.y) : 0;
                this.viewTop = (scrollPos.y > 0 ? -scrollPos.y : 0) + this.elasticTop;
                this.viewBottom = this.viewTop - this.node.height;
                this.elasticBottom = this.viewBottom < -this.content.height ? Math.abs(this.viewBottom + this.content.height) : 0;
                this.viewBottom += this.elasticBottom;
                // cc.log(this.elasticTop, this.elasticBottom, this.viewTop, this.viewBottom);
                break;
            case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                this.elasticBottom = scrollPos.y > 0 ? Math.abs(scrollPos.y) : 0;
                this.viewBottom = (scrollPos.y < 0 ? -scrollPos.y : 0) - this.elasticBottom;
                this.viewTop = this.viewBottom + this.node.height;
                this.elasticTop = this.viewTop > this.content.height ? Math.abs(this.viewTop - this.content.height) : 0;
                this.viewTop -= this.elasticTop;
                // cc.log(this.elasticTop, this.elasticBottom, this.viewTop, this.viewBottom);
                break;
        }
    },
    //计算位置 根据id
    _calcItemPos(id) {
        let width, height, top, bottom, left, right, itemX, itemY;
        switch (this._align) {
            case cc.Layout.Type.HORIZONTAL:
                switch (this._horizontalDir) {
                    case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                        if (this.customSize) {
                            let fixed = this._getFixedSize(id);
                            left = this._leftGap + ((this._itemSize.width + this._columnGap) * (id - fixed.count)) + (fixed.val + (this._columnGap * fixed.count));
                            let cs = this.customSize[id];
                            width = (cs > 0 ? cs : this._itemSize.width);
                            right = left + width;
                        } else {
                            left = this._leftGap + ((this._itemSize.width + this._columnGap) * id);
                            right = left + this._itemSize.width;
                            width = this._itemSize.width;
                        }
                        return {
                            id: id,
                            left: left,
                            right: right,
                            x: left + (this._itemTmp.anchorX * width),
                            y: this._itemTmp.y,
                        };
                    }
                    case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                        if (this.customSize) {
                            let fixed = this._getFixedSize(id);
                            right = -this._rightGap - ((this._itemSize.width + this._columnGap) * (id - fixed.count)) - (fixed.val + (this._columnGap * fixed.count));
                            let cs = this.customSize[id];
                            width = (cs > 0 ? cs : this._itemSize.width);
                            left = right - width;
                        } else {
                            right = -this._rightGap - ((this._itemSize.width + this._columnGap) * id);
                            left = right - this._itemSize.width;
                            width = this._itemSize.width;
                        }
                        return {
                            id: id,
                            right: right,
                            left: left,
                            x: left + (this._itemTmp.anchorX * width),
                            y: this._itemTmp.y,
                        };
                    }
                }
                break;
            case cc.Layout.Type.VERTICAL: {
                switch (this._verticalDir) {
                    case cc.Layout.VerticalDirection.TOP_TO_BOTTOM: {
                        if (this.customSize) {
                            let fixed = this._getFixedSize(id);
                            top = -this._topGap - ((this._itemSize.height + this._lineGap) * (id - fixed.count)) - (fixed.val + (this._lineGap * fixed.count));
                            let cs = this.customSize[id];
                            height = (cs > 0 ? cs : this._itemSize.height);
                            bottom = top - height;
                        } else {
                            top = -this._topGap - ((this._itemSize.height + this._lineGap) * id);
                            bottom = top - this._itemSize.height;
                            height = this._itemSize.height;
                        }
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: this._itemTmp.x,
                            y: bottom + (this._itemTmp.anchorY * height),
                        };
                    }
                    case cc.Layout.VerticalDirection.BOTTOM_TO_TOP: {
                        if (this.customSize) {
                            let fixed = this._getFixedSize(id);
                            bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * (id - fixed.count)) + (fixed.val + (this._lineGap * fixed.count));
                            let cs = this.customSize[id];
                            height = (cs > 0 ? cs : this._itemSize.height);
                        } else {
                            bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * id);
                            height = this._itemSize.height;
                        }
                        top = bottom + height;
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: this._itemTmp.x,
                            y: bottom + (this._itemTmp.anchorY * height),
                        };
                        break;
                    }
                }
            }
            case cc.Layout.Type.GRID: {
                let colLine = Math.floor(id / this._colLineNum);
                switch (this._startAxis) {
                    case cc.Layout.AxisDirection.HORIZONTAL: {
                        switch (this._verticalDir) {
                            case cc.Layout.VerticalDirection.TOP_TO_BOTTOM: {
                                top = -this._topGap - ((this._itemSize.height + this._lineGap) * colLine);
                                bottom = top - this._itemSize.height;
                                itemY = bottom + (this._itemTmp.anchorY * this._itemSize.height);
                                break;
                            }
                            case cc.Layout.VerticalDirection.BOTTOM_TO_TOP: {
                                bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * colLine);
                                top = bottom + this._itemSize.height;
                                itemY = bottom + (this._itemTmp.anchorY * this._itemSize.height);
                                break;
                            }
                        }
                        itemX = this._leftGap + ((id % this._colLineNum) * (this._itemSize.width + this._columnGap));
                        switch (this._horizontalDir) {
                            case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                                itemX += (this._itemTmp.anchorX * this._itemSize.width);
                                itemX -= (this.content.anchorX * this.content.width);
                                break;
                            }
                            case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                                itemX += ((1 - this._itemTmp.anchorX) * this._itemSize.width);
                                itemX -= ((1 - this.content.anchorX) * this.content.width);
                                itemX *= -1;
                                break;
                            }
                        }
                        return {
                            id: id,
                            top: top,
                            bottom: bottom,
                            x: itemX,
                            y: itemY,
                        };
                    }
                    case cc.Layout.AxisDirection.VERTICAL: {
                        switch (this._horizontalDir) {
                            case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                                left = this._leftGap + ((this._itemSize.width + this._columnGap) * colLine);
                                right = left + this._itemSize.width;
                                itemX = left + (this._itemTmp.anchorX * this._itemSize.width);
                                itemX -= (this.content.anchorX * this.content.width);
                                break;
                            }
                            case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT: {
                                right = -this._rightGap - ((this._itemSize.width + this._columnGap) * colLine);
                                left = right - this._itemSize.width;
                                itemX = left + (this._itemTmp.anchorX * this._itemSize.width);
                                itemX += ((1 - this.content.anchorX) * this.content.width);
                                break;
                            }
                        }
                        itemY = -this._topGap - ((id % this._colLineNum) * (this._itemSize.height + this._lineGap));
                        switch (this._verticalDir) {
                            case cc.Layout.VerticalDirection.TOP_TO_BOTTOM: {
                                itemY -= ((1 - this._itemTmp.anchorY) * this._itemSize.height);
                                itemY += ((1 - this.content.anchorY) * this.content.height);
                                break;
                            }
                            case cc.Layout.VerticalDirection.BOTTOM_TO_TOP: {
                                itemY -= ((this._itemTmp.anchorY) * this._itemSize.height);
                                itemY += (this.content.anchorY * this.content.height);
                                itemY *= -1;
                                break;
                            }
                        }
                        return {
                            id: id,
                            left: left,
                            right: right,
                            x: itemX,
                            y: itemY,
                        };
                    }
                }
                break;
            }
        }
    },
    //获取固定尺寸
    _getFixedSize(listId) {
        if (!this.customSize)
            return null;
        if (listId == null)
            listId = this._numItems;
        let fixed = 0;
        let count = 0;
        for (let id in this.customSize) {
            if (parseInt(id) < listId) {
                fixed += this.customSize[id];
                count++;
            }
        }
        return {
            val: fixed,
            count: count,
        }
    },
    //滚动开始时..
    _onScrollBegan() {
        this._beganPos = this._sizeType ? this.viewTop : this.viewLeft;
    },
    //滚动结束时..
    _onScrollEnded() {
        let t = this;
        if (t.scrollToListId != null) {
            let item = t.getItemByListId(t.scrollToListId);
            t.scrollToListId = null;
            if (item) {
                item.runAction(new cc.sequence(
                    new cc.scaleTo(.1, 1.06),
                    new cc.scaleTo(.1, 1),
                    //new cc.callFunc(function (runNode) {

                    // })
                ));
            }
        }
        t._onScrolling();

        if (t._slideMode == SlideType.ADHERING &&
            !t.adhering
        ) {
            //cc.log(t.adhering, t._scrollView.isAutoScrolling(), t._scrollView.isScrolling());
            t.adhere();
        } else if (t._slideMode == SlideType.PAGE) {
            if (t._beganPos != null) {
                this._pageAdhere();
            } else {
                t.adhere();
            }
        }
    },
    //触摸抬起时..
    _onScrollTouchUp() {
        let t = this;
        t._scrollPos = null;
        if (t._slideMode == SlideType.ADHERING
            // !t.adhering
        ) {
            if (this.adhering)
                this._adheringBarrier = true;
            t.adhere();
            // }
        } else if (t._slideMode == SlideType.PAGE) {
            if (t._beganPos != null) {
                this._pageAdhere();
            } else {
                t.adhere();
            }
        }
    },

    _pageAdhere() {
        let t = this;
        if (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0)
            return;
        let curPos = t._sizeType ? t.viewTop : t.viewLeft;
        let dis = (t._sizeType ? t.node.height : t.node.width) * t.pageDistance;
        let canSkip = Math.abs(t._beganPos - curPos) > dis;
        if (canSkip) {
            let timeInSecond = .5;
            switch (t._alignCalcType) {
                case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                    if (t._beganPos > curPos)
                        t.prePage(timeInSecond);
                    else
                        t.nextPage(timeInSecond);
                    break;
                case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                    if (t._beganPos < curPos)
                        t.prePage(timeInSecond);
                    else
                        t.nextPage(timeInSecond);
                    break;
            }
        } else if (t.elasticTop <= 0 && t.elasticRight <= 0 && t.elasticBottom <= 0 && t.elasticLeft <= 0) {
            t.adhere();
        }
        t._beganPos = null;
    },
    //粘附
    adhere() {
        let t = this;
        if (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0)
            return;
        t.adhering = true;
        // if (!t._virtual)
        t._calcNearestItem();
        let offset = (t._sizeType ? t._topGap : t._leftGap) / (t._sizeType ? t.node.height : t.node.width);
        let timeInSecond = .7;
        t.scrollTo(t.nearestListId, timeInSecond, offset);
    },
    //Update..
    update() {
        if (this.frameByFrameRenderNum <= 0 || this._updateDone)
            return;
        // cc.log(this.displayData.length, this._updateCounter, this.displayData[this._updateCounter]);
        if (this._virtual) {
            let len = (this._updateCounter + this.frameByFrameRenderNum) > this.actualNumItems ? this.actualNumItems : (this._updateCounter + this.frameByFrameRenderNum);
            for (let n = this._updateCounter; n < len; n++) {
                let data = this.displayData[n];
                if (data)
                    this._createOrUpdateItem(data);
            }

            if (this._updateCounter >= this.actualNumItems - 1) { //最后一个
                if (this._doneAfterUpdate) {
                    this._updateCounter = 0;
                    this._updateDone = false;
                    if (!this._scrollView.isScrolling())
                        this._doneAfterUpdate = false;
                } else {
                    this._updateDone = true;
                    this._delRedundantItem();
                    this._forceUpdate = false;
                    this._calcNearestItem();
                }
            } else {
                this._updateCounter += this.frameByFrameRenderNum;
            }
        } else {
            if (this._updateCounter < this._numItems) {
                let len = (this._updateCounter + this.frameByFrameRenderNum) > this._numItems ? this._numItems : (this._updateCounter + this.frameByFrameRenderNum);
                for (let n = this._updateCounter; n < len; n++) {
                    this._createOrUpdateItem2(n);
                }
                this._updateCounter += this.frameByFrameRenderNum;
            } else {
                this._updateDone = true;
                this._calcNearestItem();
            }
        }
    },
    /**
     * 创建或更新Item（虚拟列表用）
     * @param {Object} data 数据
     */
    _createOrUpdateItem(data) {
        let item = this.getItemByListId(data.id);
        if (!item) { //如果不存在
            item = this._pool.shift();
            //判断取出的item是否当前正在显示（滑动太快的情况下就会有这种情况，所以这里必须做这一步）
            while (item && this.firstListId <= item._listId && item._listId <= this.displayData[this.actualNumItems - 1].id) {
                item = this._pool.shift();
            }
            if (!item) {
                item = cc.instantiate(this._itemTmp);
                // cc.log('新建::', data.id, item);
            } else {
                // cc.log('从池中取出::   旧id =', item._listId, '，新id =', data.id, item);
            }
            item._listId = data.id;
            item.setPosition(new cc.v2(data.x, data.y));
            this._resetItemSize(item);
            this.content.addChild(item);
            item.setSiblingIndex(this.content.childrenCount - 1);
            let listItem = item.getComponent(ListItem);
            item.listItem = listItem;
            if (listItem) {
                listItem._list = this;
                listItem._registerEvent();
            }
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, data.id);
            }
        } else if (this._forceUpdate && this.renderEvent) { //强制更新
            item.setPosition(new cc.v2(data.x, data.y));
            this._resetItemSize(item);
            // cc.log('ADD::', data.id, item);
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, data.id);
            }
        }
        this._resetItemSize(item);

        this._updateListItem(item.listItem);
        if (this._lastDisplayData.indexOf(data.id) < 0) {
            this._lastDisplayData.push(data.id);
        }
    },
    //创建或更新Item（非虚拟列表用）
    _createOrUpdateItem2(listId) {
        let item = this.content.children[listId];
        if (!item) { //如果不存在
            item = cc.instantiate(this._itemTmp);
            item._listId = listId;
            this.content.addChild(item);
            let listItem = item.getComponent(ListItem);
            item.listItem = listItem;
            if (listItem) {
                listItem._list = this;
                listItem._registerEvent();
            }
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
            }
        } else if (this._forceUpdate && this.renderEvent) { //强制更新
            item._listId = listId;
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
            }
        }
        this._updateListItem(item.listItem);
        if (this._lastDisplayData.indexOf(listId) < 0) {
            this._lastDisplayData.push(listId);
        }
    },

    _updateListItem(listItem) {
        if (!listItem)
            return;
        if (this.selectedMode > SelectedType.NONE) {
            switch (this.selectedMode) {
                case SelectedType.SINGLE:
                    listItem.selected = this.selectedId == listItem.node._listId;
                    break;
                case SelectedType.MULT:
                    listItem.selected = this.multSelected.indexOf(listItem.node._listId) >= 0;
                    break;
            }
        }
    },
    //仅虚拟列表用
    _resetItemSize(item) {
        if (!this.customSize || !this.customSize[item._listId]) {
            item.setContentSize(this._itemSize);
            return;
        }
        let size = this.customSize[item._listId];
        if (this._align == cc.Layout.Type.HORIZONTAL) {
            item.width = size;
        } else if (this._align == cc.Layout.Type.VERTICAL) {
            item.height = size;
        }
    },
    /**
     * 设置多选
     * @param {Array} args 可以是单个listId，也可是个listId数组
     * @param {Boolean} bool 值，如果为null的话，则直接用args覆盖
     */
    setMultSelected(args, bool) {
        let t = this;
        if (!Array.isArray(args)) {
            args = [args];
        }
        if (bool == null) {
            t.multSelected = null;
            t.multSelected = args;
        } else {
            let listId, sub;
            if (bool) {
                for (let n = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub < 0) {
                        t.multSelected.push(listId);
                    }
                }
            } else {
                for (let n = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub >= 0) {
                        t.multSelected.splice(sub, 1);
                    }
                }
            }
        }
        t._forceUpdate = true;
        t._onScrolling();
    },
    /**
     * 更新指定的Item
     * @param {Array} args 单个listId，或者数组
     * @returns
     */
    updateAppointed(args) {
        if (!Array.isArray(args)) {
            args = [args];
        }
        let len = args.length;
        for (let n = 0; n < len; n++) {
            let listId = args[n];
            let item = this.getItemByListId(listId);
            if (item) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
            }
        }
    },
    /**
     * 根据ListID获取Item
     * @param {Number} listId
     * @returns
     */
    getItemByListId(listId) {
        for (let n = this.content.childrenCount - 1; n >= 0; n--) {
            if (this.content.children[n]._listId == listId)
                return this.content.children[n];
        }
        return null;
    },
    /**
     * 获取在显示区域外的Item
     * @returns
     */
    _getOutsideItem() {
        let item, isOutside;
        let result = [];
        for (let n = this.content.childrenCount - 1; n >= 0; n--) {
            item = this.content.children[n];
            isOutside = true;
            for (let n = this._pool.length; n >= 0; n--) {
                if (item == this._pool[n]) {
                    isOutside = false;
                    break;
                }
            }
            if (isOutside) {
                for (let c = this.actualNumItems - 1; c >= 0; c--) {
                    let listId = this.displayData[c].id;
                    if (item._listId == listId) {
                        isOutside = false;
                        break;
                    }
                }
            }
            if (isOutside) {
                result.push(item);
            }
        }
        return result;
    },
    //删除显示区域以外的Item
    _delRedundantItem() {
        if (this._virtual) {
            let arr = this._getOutsideItem();
            // let str = '';
            for (let n = arr.length - 1; n >= 0; n--) {
                arr[n].removeFromParent();
                this._pool.push(arr[n]);
                // str += (arr[n]._listId + ', ');
            }
            if (arr.length) {
                let item;
                for (let n = this._pool.length - 1; n >= 0; n--) {
                    item = this._pool[n];
                    if (item._listId < this.firstListId - this._colLineNum || item._listId > this.firstListId + this.actualNumItems + this._colLineNum) {
                        this._pool.splice(n, 1);
                        this._delSingleItem(item);
                    }
                }
            }
            // cc.log('存入::', str, '    pool.length =', this._pool.length);
        } else {
            while (this.content.childrenCount > this._numItems) {
                this._delSingleItem(this.content.children[this.content.childrenCount - 1]);
            }
        }
    },
    //删除单个Item
    _delSingleItem(item) {
        // cc.log('DEL::', item._listId, item);
        item.removeFromParent();
        if (item.destroy)
            item.destroy();
        item = null;
    },
    /** 
     * 动效删除Item（此方法只适用于虚拟列表，即_virtual=true）
     * 一定要在回调函数里重新设置新的numItems进行刷新，毕竟本List是靠数据驱动的。
     */
    aniDelItem(listId, callFunc, aniType) {
        let t = this;
        let item = t.getItemByListId(listId);
        if (t._aniDelRuning || !t._virtual) {
            return;
        }
        if (!item) {
            callFunc(listId);
            return;
        }
        t._aniDelRuning = true;
        let curLastId = t.displayData[t.displayData.length - 1].id;
        let resetSelectedId = item.listItem.selected;
        item.listItem.showAni(aniType, () => {
            //判断有没有下一个，如果有的话，创建粗来
            let newId;
            if (curLastId < t._numItems - 2) {
                newId = curLastId + 1;
            }
            if (newId != null) {
                let newData = t._calcItemPos(newId);
                t.displayData.push(newData);
                if (t._virtual)
                    t._createOrUpdateItem(newData);
                else
                    t._createOrUpdateItem2(newId);
            } else
                t._numItems--;
            if (t.selectedMode == SelectedType.SINGLE) {
                if (resetSelectedId) {
                    t._selectedId = -1;
                } else if (t._selectedId - 1 >= 0) {
                    t._selectedId--;
                }
            } else if (t.selectedMode == SelectedType.MULT && t.multSelected.length) {
                let sub = t.multSelected.indexOf(listId);
                // let tmp;
                if (sub >= 0) {
                    t.multSelected.splice(sub, 1);
                }
                //多选的数据，在其后的全部减一
                for (let n = t.multSelected.length - 1; n >= 0; n--) {
                    let id = t.multSelected[n];
                    if (id >= listId)
                        t.multSelected[n]--;
                }
            }
            if (t.customSize) {
                if (t.customSize[listId])
                    delete t.customSize[listId];
                let newCustomSize = {};
                let size;
                for (let id in t.customSize) {
                    size = t.customSize[id];
                    id = parseInt(id);
                    newCustomSize[id - (id >= listId ? 1 : 0)] = size;
                }
                t.customSize = newCustomSize;
            }
            //后面的Item向前怼的动效
            let sec = .2333;
            let acts, haveCB;
            for (let n = newId != null ? newId : curLastId; n >= listId + 1; n--) {
                item = t.getItemByListId(n);
                if (item) {
                    let posData = t._calcItemPos(n - 1);
                    acts = [
                        new cc.moveTo(sec, new cc.v2(posData.x, posData.y)),
                    ];
                    if (n <= listId + 1) {
                        haveCB = true;
                        acts.push(new cc.CallFunc(() => {
                            t._aniDelRuning = false;
                            callFunc(listId);
                        }));
                    }
                    if (acts.length > 1)
                        item.runAction(new cc.Sequence(acts));
                    else
                        item.runAction(acts[0]);
                }
            }
            if (!haveCB) {
                t._aniDelRuning = false;
                callFunc(listId);
            }
        }, true);
    },
    /**
     * 滚动到..
     * @param {Number} listId 索引（如果<0，则滚到首个Item位置，如果>=_numItems，则滚到最末Item位置）
     * @param {Number} timeInSecond 时间
     * @param {Number} offset 索引目标位置偏移，0-1
     * @param {Boolean} overStress 滚动后是否强调该Item（这只是个实验功能）
     */
    scrollTo(listId, timeInSecond, offset, overStress) {
        let t = this;
        if (!t.checkInited())
            return;
        t._scrollView.stopAutoScroll();
        if (timeInSecond == null || timeInSecond < 0)
            timeInSecond = 0;
        if (listId < 0)
            listId = 0;
        else if (listId >= t._numItems)
            listId = t._numItems - 1;
        let pos = t._calcItemPos(listId); //嗯...不管virtual=true还是false，都自己算，反正结果都一样，懒得去遍历content.children了。
        let targetX, targetY;


        switch (t._alignCalcType) {
            case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                targetX = pos.left;
                if (offset != null)
                    targetX -= t.node.width * offset;
                else
                    targetX -= t._leftGap;
                pos = new cc.v2(targetX, 0);
                break;
            case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                targetX = pos.right - t.node.width;
                if (offset != null)
                    targetX += t.node.width * offset;
                else
                    targetX += t._rightGap;
                pos = new cc.v2(targetX + t.content.width, 0);
                break;
            case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                targetY = pos.top;
                if (offset != null)
                    targetY += t.node.height * offset;
                else
                    targetY += t._topGap;
                pos = new cc.v2(0, -targetY);
                break;
            case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                targetY = pos.bottom + t.node.height;
                if (offset != null)
                    targetY -= t.node.height * offset;
                else
                    targetY -= t._bottomGap;
                pos = new cc.v2(0, -targetY + t.content.height);
                break;
        }

        let viewPos = t.content.getPosition();
        viewPos = Math.abs(t._sizeType ? viewPos.y : viewPos.x);

        let comparePos = t._sizeType ? pos.y : pos.x;
        let runScroll = Math.abs((t._scrollPos != null ? t._scrollPos : viewPos) - comparePos) > .5;
        // cc.log(runScroll, t._scrollPos, viewPos, comparePos)

        t._scrollView.stopAutoScroll();
        if (runScroll) {
            t._scrollPos = comparePos;
            t._scrollView.scrollToOffset(pos, timeInSecond);
            // cc.log(listId, t.content.width, t.content.getPosition(), pos);
            t.scheduleOnce(() => {
                if (!t._adheringBarrier) {
                    t.adhering = t._adheringBarrier = false;
                }
                t._scrollPos = null;
                //cc.log('2222222222', t._adheringBarrier)
                if (overStress) {
                    // t.scrollToListId = listId;
                    let item = t.getItemByListId(listId);
                    if (item) {
                        item.runAction(new cc.sequence(
                            new cc.scaleTo(.1, 1.05),
                            new cc.scaleTo(.1, 1),
                        ));
                    }
                }
            }, timeInSecond + .1);

            if (timeInSecond <= 0) {
                t._onScrolling();
            }
        }
    },
    /**
     * 计算当前滚动窗最近的Item
     */
    _calcNearestItem() {
        this.nearestListId = null;
        let data, center;

        if (this._virtual)
            this._calcViewPos();

        let breakFor = false;
        for (let n = 0; n < this.content.childrenCount && !breakFor; n += this._colLineNum) {
            data = this._virtual ? this.displayData[n] : this._calcExistItemPos(n);
            center = this._sizeType ? ((data.top + data.bottom) / 2) : (center = (data.left + data.right) / 2);
            switch (this._alignCalcType) {
                case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                    if (data.right >= this.viewLeft) {
                        this.nearestListId = data.id;
                        if (this.viewLeft > center)
                            this.nearestListId += this._colLineNum;
                        breakFor = true;
                    }
                    break;
                case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                    if (data.left <= this.viewRight) {
                        this.nearestListId = data.id;
                        if (this.viewRight < center)
                            this.nearestListId += this._colLineNum;
                        breakFor = true;
                    }
                    break;
                case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                    if (data.bottom <= this.viewTop) {
                        this.nearestListId = data.id;
                        if (this.viewTop < center)
                            this.nearestListId += this._colLineNum;
                        breakFor = true;
                    }
                    break;
                case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                    if (data.top >= this.viewBottom) {
                        this.nearestListId = data.id;
                        if (this.viewBottom > center)
                            this.nearestListId += this._colLineNum;
                        breakFor = true;
                    }
                    break;
            }
        }
        //判断最后一个Item。。。（哎，这些判断真心恶心，判断了前面的还要判断最后一个。。。一开始呢，就只有一个布局（单列布局），那时候代码才三百行，后来就想着完善啊，艹..这坑真深，现在这行数都一千五了= =||）
        data = this._virtual ? this.displayData[this.actualNumItems - 1] : this._calcExistItemPos(this._numItems - 1);
        if (data && data.id == this._numItems - 1) {
            center = this._sizeType ? ((data.top + data.bottom) / 2) : (center = (data.left + data.right) / 2);
            switch (this._alignCalcType) {
                case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                    if (this.viewRight > center)
                        this.nearestListId = data.id;
                    break;
                case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                    if (this.viewLeft < center)
                        this.nearestListId = data.id;
                    break;
                case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                    if (this.viewBottom < center)
                        this.nearestListId = data.id;
                    break;
                case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                    if (this.viewTop > center)
                        this.nearestListId = data.id;
                    break;
            }
        }
        // cc.log('this.nearestListId =', this.nearestListId);
    },
    //计算已存在的Item的位置
    _calcExistItemPos(id) {
        let item = this.getItemByListId(id);
        if (!item)
            return null;
        let data = {
            id: id,
            x: item.x,
            y: item.y,
        }
        if (this._sizeType) {
            data.top = item.y + (item.height * (1 - item.anchorY));
            data.bottom = item.y - (item.height * item.anchorY);
        } else {
            data.left = item.x - (item.width * item.anchorX);
            data.right = item.x + (item.width * (1 - item.anchorX));
        }
        return data;
    },
    //上一页
    prePage(timeInSecond) {
        this.skipPage(this.curPageNum - 1, timeInSecond);
    },
    //下一页
    nextPage(timeInSecond) {
        this.skipPage(this.curPageNum + 1, timeInSecond);
    },
    //跳转到第几页
    skipPage(pageNum, timeInSecond) {
        let t = this;
        if (t._slideMode != SlideType.PAGE)
            return cc.error('This function is not allowed to be called, Must SlideMode = PAGE!');
        if (pageNum < 0 || pageNum >= t._numItems)
            return;
        if (t.curPageNum == pageNum)
            return;
        t.curPageNum = pageNum;
        if (t.pageChangeEvent) {
            cc.Component.EventHandler.emitEvents([t.pageChangeEvent], pageNum);
        }
        t.scrollTo(pageNum, timeInSecond);
    }
});