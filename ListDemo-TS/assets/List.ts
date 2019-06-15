/******************************************
 * @author kL <klk0@qq.com>
 * @copyright Nemo 2019/6/6
 * @doc 列表组件.
 * TS版必须与ListItem搭配使用!TS版必须与ListItem搭配使用!TS版必须与ListItem搭配使用!
 * @end
 ******************************************/

const { ccclass, property, disallowMultiple, menu, executionOrder } = cc._decorator;

import ListItem from './ListItem';

enum TemplateType {
    NODE = 1,
    PREFAB = 2,
}

enum SlideType {
    NORMAL = 1,//普通
    ADHERING = 2,//粘附效果，没有滚动惯性
    PAGE = 3,//页面，没有滚动惯性
}

enum SelectedType {
    NONE = 0,
    SINGLE = 1,//单选
    MULT = 2,//多选
}

@ccclass
@disallowMultiple()
@menu('自定义组件/List')
//脚本生命周期回调的执行优先级。小于 0 的脚本将优先执行，大于 0 的脚本将最后执行。该优先级只对 onLoad, onEnable, start, update 和 lateUpdate 有效，对 onDisable 和 onDestroy 无效。
@executionOrder(-5000)
export default class NewClass extends cc.Component {
    //模板类型
    @property({ type: cc.Enum(TemplateType), tooltip: CC_DEV && '模板类型', })
    private templateType: TemplateType = TemplateType.NODE;
    //模板Item（Node）
    @property({
        type: cc.Node,
        tooltip: CC_DEV && '模板Item',
        visible() { return this.templateType == TemplateType.NODE }
    })
    tmpNode: cc.Node = null;
    //模板Item（Prefab）
    @property({
        type: cc.Prefab,
        tooltip: CC_DEV && '模板Item',
        visible() { return this.templateType == TemplateType.PREFAB }
    })
    tmpPrefab: cc.Prefab = null;
    //滑动模式
    @property()
    private _slideMode: SlideType = SlideType.NORMAL;
    @property({
        type: cc.Enum(SlideType),
        tooltip: CC_DEV && '滑动模式'
    })
    set slideModel(val: SlideType) {
        this._slideMode = val;
    }
    get slideModel() {
        return this._slideMode;
    }
    //翻页作用距离
    @property({
        type: cc.Float,
        range: [0, 1, .1],
        tooltip: CC_DEV && '翻页作用距离',
        slide: true,
        visible() { return this._slideMode == SlideType.PAGE }
    })
    public pageDistance: number = .3;
    //页面改变事件
    @property({
        type: cc.Component.EventHandler,
        tooltip: CC_DEV && '页面改变事件',
        visible() { return this._slideMode == SlideType.PAGE }
    })
    private pageChangeEvent: cc.Component.EventHandler = new cc.Component.EventHandler();
    //是否为虚拟列表（动态列表）
    @property()
    private _virtual: boolean = true;
    @property({
        type: cc.Boolean,
        tooltip: CC_DEV && '是否为虚拟列表（动态列表）'
    })
    set virtual(val: boolean) {
        if (val != null)
            this._virtual = val;
        if (!CC_DEV && this._numItems != 0) {
            this._onScrolling(null);
        }
    }
    get virtual() {
        return this._virtual;
    }
    //刷新频率
    @property({ type: cc.Integer })
    private _updateRate: number = 2;
    @property({
        type: cc.Integer,
        range: [0, 6, 1],
        tooltip: CC_DEV && '刷新频率（值越大刷新频率越低、性能越高）',
        slide: true,
    })
    set updateRate(val: number) {
        if (val >= 0 && val <= 6) {
            this._updateRate = val;
        }
    }
    get updateRate() {
        return this._updateRate;
    }
    //分帧渲染（每帧渲染的Item数量（<=0时关闭分帧渲染））
    @property({
        type: cc.Integer,
        range: [0, 12, 1],
        tooltip: CC_DEV && '逐帧渲染时，每帧渲染的Item数量（<=0时关闭分帧渲染）',
        slide: true,
    })
    public frameByFrameRenderNum: number = 0;
    //渲染事件（渲染器）
    @property({
        type: cc.Component.EventHandler,
        tooltip: CC_DEV && '渲染事件（渲染器）',
    })
    private renderEvent: cc.Component.EventHandler = new cc.Component.EventHandler();
    //选择模式
    @property({
        type: cc.Enum(SelectedType),
        tooltip: CC_DEV && '选择模式'
    })
    public selectedMode: SelectedType = SelectedType.NONE;
    //触发选择事件
    @property({
        type: cc.Component.EventHandler,
        tooltip: CC_DEV && '触发选择事件',
        visible() { return this.selectedMode > SelectedType.NONE }
    })
    private selectedEvent: cc.Component.EventHandler = null//new cc.Component.EventHandler();
    //当前选择id
    private _selectedId: number = -1;
    private _lastSelectedId: number;
    private multSelected: number[];
    set selectedId(val: number) {
        if (this.selectedMode == SelectedType.SINGLE && val == this._selectedId)
            return;
        let item: any;
        switch (this.selectedMode) {
            case SelectedType.SINGLE: {
                if (val == this._selectedId)
                    return;
                item = this.getItemByListId(val);
                if (!item && val >= 0)
                    return;
                let listItem: ListItem;
                if (this._selectedId >= 0)
                    this._lastSelectedId = this._selectedId;
                else //如果＜0则取消选择，把_lastSelectedId也置空吧，如果以后有特殊需求再改吧。
                    this._lastSelectedId = null;
                this._selectedId = val;
                if (item) {
                    listItem = item.getComponent(ListItem);
                    listItem.selected = true;
                }
                if (this._lastSelectedId >= 0) {
                    let lastItem: any = this.getItemByListId(this._lastSelectedId);
                    if (lastItem) {
                        lastItem.getComponent(ListItem).selected = false;
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
                let listItem = item.getComponent(ListItem);
                if (this._selectedId >= 0)
                    this._lastSelectedId = this._selectedId;
                this._selectedId = val;
                let bool: boolean = !listItem.selected;
                listItem.selected = bool;
                let sub: number = this.multSelected.indexOf(val);
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
    }
    get selectedId() {
        return this._selectedId;
    }
    private _forceUpdate: boolean = false;
    private _align: number;
    private _horizontalDir: number;
    private _verticalDir: number;
    private _startAxis: number;
    private _alignCalcType: number;
    public content: cc.Node;
    private firstListId: number;
    public actualNumItems: number;
    private _updateDone: boolean = true;
    private _updateCounter;
    //渲染数量（通过这个刷新）
    private _numItems: number = 0;
    set numItems(val: number) {
        if (!this.checkInited(false))
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
            this._onScrolling(null);
        } else {
            let layout: cc.Layout = this.content.getComponent(cc.Layout);
            if (layout) {
                layout.enabled = true;
            }
            this._delRedundantItem();

            this.firstListId = 0;
            if (this.frameByFrameRenderNum > 0) {
                //先渲染几个出来
                let len: number = this.frameByFrameRenderNum > this._numItems ? this._numItems : this.frameByFrameRenderNum;
                for (let n: number = 0; n < len; n++) {
                    this._createOrUpdateItem2(n);
                }
                if (this.frameByFrameRenderNum < this._numItems) {
                    this._updateCounter = this.frameByFrameRenderNum;
                    this._updateDone = false;
                }
            } else {
                for (let n: number = 0; n < val; n++) {
                    this._createOrUpdateItem2(n);
                }
                this.actualNumItems = val;
            }
        }
    }
    get numItems() {
        return this._numItems;
    }
    private _inited: boolean = false;
    private _scrollView: cc.ScrollView;
    get scrollView() {
        return this._scrollView;
    }
    private _layout: cc.Layout;
    private _resizeMode: cc.Layout.ResizeMode;
    private _topGap: number;
    private _rightGap: number;
    private _bottomGap: number;
    private _leftGap: number;

    private _columnGap: number;
    private _lineGap: number;
    private _colLineNum: number;

    private _lastDisplayData: number[];
    public displayData: any[];
    private _pool: any[];

    private _itemTmp: any;
    private _itemSize: cc.Size;
    private _sizeType: boolean;

    public customSize: any;

    private frameCount: number;
    private _aniDelRuning: boolean = false;
    private viewTop: number;
    private viewRight: number;
    private viewBottom: number;
    private viewLeft: number;

    private _doneAfterUpdate: boolean = false;

    private elasticTop: number;
    private elasticRight: number;
    private elasticBottom: number;
    private elasticLeft: number;

    private scrollToListId: number;

    private adhering: boolean = false;

    private _adheringBarrier: boolean = false;
    private nearestListId: number;

    public curPageNum: number = 0;
    private _beganPos: number;
    private _scrollPos: number;

    onLoad() {
        this._init();
    }

    start() {
        this._init();
    }

    onEnable() {
        if (!CC_EDITOR) {
            this._registerEvent();
        }
        this._init();
    }

    onDisable() {
        if (!CC_EDITOR) {
            this._unregisterEvent();
        }
    }
    //注册事件
    _registerEvent() {
        this.node.on('touch-up', this._onScrollTouchUp, this);
        this.node.on('scroll-began', this._onScrollBegan, this, true);
        this.node.on('scroll-ended', this._onScrollEnded, this, true);
        this.node.on('scrolling', this._onScrolling, this, true);
    }
    //卸载事件
    _unregisterEvent() {
        this.node.off('touch-up', this._onScrollTouchUp, this);
        this.node.off('scroll-began', this._onScrollBegan, this, true);
        this.node.off('scroll-ended', this._onScrollEnded, this, true);
        this.node.off('scrolling', this._onScrolling, this, true);
    }
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

        if (this._slideMode == SlideType.ADHERING || this._slideMode == SlideType.PAGE) //特定的滑动模式需要关闭惯性
            this._scrollView.inertia = false;

        this._lastDisplayData = []; //最后一次刷新的数据
        this.displayData = []; //当前数据
        this._pool = []; //这是个池子..
        this._forceUpdate = false;
        this._updateCounter = 0;
        this._updateDone = true;

        this.content.removeAllChildren();
        this._inited = true;
    }
    //设置模板Item
    setTemplateItem(item: any) {
        this._itemTmp = item;
        if (this._resizeMode == cc.Layout.ResizeMode.CHILDREN)
            this._itemSize = this._layout.cellSize;
        else
            this._itemSize = cc.size(this._itemTmp.width, this._itemTmp.height);
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
                        let trimW: number = this.content.width - this._leftGap - this._rightGap;
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
                        let trimH: number = this.content.height - this._topGap - this._bottomGap;
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
    }
    /**
     * 检查是否初始化
     * @param {Boolean} printLog 是否打印错误信息
     * @returns
     */
    checkInited(printLog: boolean) {
        let pL: boolean = printLog ? printLog : true;
        if (!this._inited) {
            if (pL)
                cc.error('List initialization not completed!');
            return false;
        }
        return true;
    }
    //禁用 Layout 组件，自行计算 Content Size
    _resizeContent() {
        let layout = this.content.getComponent(cc.Layout);
        if (layout) {
            layout.enabled = false;
        }
        switch (this._align) {
            case cc.Layout.Type.HORIZONTAL: {
                let res: number;
                if (this.customSize) {
                    let fixed: any = this._getFixedSize(null);
                    res = this._leftGap + fixed.val + (this._itemSize.width * (this._numItems - fixed.count)) + (this._columnGap * (this._numItems - 1)) + this._rightGap;
                } else {
                    res = this._leftGap + (this._itemSize.width * this._numItems) + (this._columnGap * (this._numItems - 1)) + this._rightGap;
                }
                this.content.width = res;
                break;
            }
            case cc.Layout.Type.VERTICAL: {
                let res: number;
                if (this.customSize) {
                    let fixed: any = this._getFixedSize(null);
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
                        let lineNum: number = Math.ceil(this._numItems / this._colLineNum);
                        this.content.height = this._topGap + (this._itemSize.height * lineNum) + (this._lineGap * (lineNum - 1)) + this._bottomGap;
                        break;
                    case cc.Layout.AxisDirection.VERTICAL:
                        let colNum: number = Math.ceil(this._numItems / this._colLineNum);
                        this.content.width = this._leftGap + (this._itemSize.width * colNum) + (this._columnGap * (colNum - 1)) + this._rightGap;
                        break;
                }
                break;
            }
        }
        // cc.log('_resizeContent()  numItems =', this._numItems, '，content =', this.content);
    }

    //滚动进行时...
    _onScrolling(ev: cc.Event) {
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
            let itemPos: any;

            let curId: number = 0;
            let endId: number = this._numItems - 1;

            if (this.customSize) {
                let breakFor: boolean = false;
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
                let ww: number = this._itemSize.width + this._columnGap;
                let hh: number = this._itemSize.height + this._lineGap;
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
            let len: number = this._lastDisplayData.length;
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
                    for (let c: number = 0; c < this.actualNumItems; c++) {
                        this._createOrUpdateItem(this.displayData[c]);
                    }
                    this._delRedundantItem();
                    this._forceUpdate = false;
                }
            }
            this._calcNearestItem();
        }
    }
    //计算可视范围
    _calcViewPos() {
        let scrollPos: any = this.content.getPosition();
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
    }
    //计算位置 根据id
    _calcItemPos(id: number) {
        let width: number, height: number, top: number, bottom: number, left: number, right: number, itemX: number, itemY: number;
        switch (this._align) {
            case cc.Layout.Type.HORIZONTAL:
                switch (this._horizontalDir) {
                    case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT: {
                        if (this.customSize) {
                            let fixed: any = this._getFixedSize(id);
                            left = this._leftGap + ((this._itemSize.width + this._columnGap) * (id - fixed.count)) + (fixed.val + (this._columnGap * fixed.count));
                            let cs: number = this.customSize[id];
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
                            let fixed: any = this._getFixedSize(id);
                            right = -this._rightGap - ((this._itemSize.width + this._columnGap) * (id - fixed.count)) - (fixed.val + (this._columnGap * fixed.count));
                            let cs: number = this.customSize[id];
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
                            let fixed: any = this._getFixedSize(id);
                            top = -this._topGap - ((this._itemSize.height + this._lineGap) * (id - fixed.count)) - (fixed.val + (this._lineGap * fixed.count));
                            let cs: number = this.customSize[id];
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
                            let fixed: any = this._getFixedSize(id);
                            bottom = this._bottomGap + ((this._itemSize.height + this._lineGap) * (id - fixed.count)) + (fixed.val + (this._lineGap * fixed.count));
                            let cs: number = this.customSize[id];
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
                let colLine: number = Math.floor(id / this._colLineNum);
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
    }
    //获取固定尺寸
    _getFixedSize(listId: number) {
        if (!this.customSize)
            return null;
        if (listId == null)
            listId = this._numItems;
        let fixed: number = 0;
        let count: number = 0;
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
    }
    //滚动结束时..
    _onScrollBegan() {
        this._beganPos = this._sizeType ? this.viewTop : this.viewLeft;
    }
    //滚动结束时..
    _onScrollEnded() {
        let t: any = this;
        if (t.scrollToListId != null) {
            let item: any = t.getItemByListId(t.scrollToListId);
            t.scrollToListId = null;
            if (item) {
                item.runAction(cc.sequence(
                    cc.scaleTo(.1, 1.06),
                    cc.scaleTo(.1, 1),
                    //new cc.callFunc(function (runNode) {

                    // })
                ));
            }
        }
        t._onScrolling(null);

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
    }
    //触摸抬起时..
    _onScrollTouchUp() {
        let t: any = this;
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
    }

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
    }
    //粘附
    adhere() {
        let t: any = this;
        if (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0)
            return;
        t.adhering = true;
        t._calcNearestItem();
        let offset: number = (t._sizeType ? t._topGap : t._leftGap) / (t._sizeType ? t.node.height : t.node.width);
        let timeInSecond: number = .7;
        t.scrollTo(t.nearestListId, timeInSecond, offset);
    }
    //Update..
    update(dt) {
        if (this.frameByFrameRenderNum <= 0 || this._updateDone)
            return;
        // cc.log(this.displayData.length, this._updateCounter, this.displayData[this._updateCounter]);
        if (this._virtual) {
            let len: number = (this._updateCounter + this.frameByFrameRenderNum) > this.actualNumItems ? this.actualNumItems : (this._updateCounter + this.frameByFrameRenderNum);
            for (let n: number = this._updateCounter; n < len; n++) {
                let data: any = this.displayData[n];
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
                let len: number = (this._updateCounter + this.frameByFrameRenderNum) > this._numItems ? this._numItems : (this._updateCounter + this.frameByFrameRenderNum);
                for (let n: number = this._updateCounter; n < len; n++) {
                    this._createOrUpdateItem2(n);
                }
                this._updateCounter += this.frameByFrameRenderNum;
            } else {
                this._updateDone = true;
                this._calcNearestItem();
            }
        }
    }
    /**
     * 创建或更新Item（虚拟列表用）
     * @param {Object} data 数据
     */
    _createOrUpdateItem(data: any) {
        let item: any = this.getItemByListId(data.id);
        let listItem: ListItem;
        if (!item) { //如果不存在
            item = this._pool.shift();
            if (item)
                listItem = item.getComponent(ListItem);
            //判断取出的item是否当前正在显示（滑动太快的情况下就会有这种情况，所以这里必须做这一步）
            while (item && this.firstListId <= listItem.listId && listItem.listId <= this.displayData[this.actualNumItems - 1].id) {
                item = this._pool.shift();
                if (item)
                    listItem = item.getComponent(ListItem);
            }
            if (!item) {
                item = cc.instantiate(this._itemTmp);
                // cc.log('新建::', data.id, item);
            } else {
                // cc.log('从池中取出::   旧id =', listItem.listId, '，新id =', data.id, item);
            }
            item.setPosition(cc.v2(data.x, data.y));
            this._resetItemSize(item);
            this.content.addChild(item);
            item.setSiblingIndex(this.content.childrenCount - 1);
            listItem = item.getComponent(ListItem);
            listItem.listId = data.id;
            listItem.list = this;
            listItem._registerEvent();
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, data.id);
            }
        } else if (this._forceUpdate && this.renderEvent) { //强制更新
            item.setPosition(cc.v2(data.x, data.y));
            this._resetItemSize(item);
            // cc.log('ADD::', data.id, item);
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, data.id);
            }
        }
        this._resetItemSize(item);

        this._updateListItem(listItem);
        if (this._lastDisplayData.indexOf(data.id) < 0) {
            this._lastDisplayData.push(data.id);
        }
    }
    //创建或更新Item（非虚拟列表用）
    _createOrUpdateItem2(listId: number) {
        let item: any = this.content.children[listId];
        let listItem: ListItem;
        if (!item) { //如果不存在
            item = cc.instantiate(this._itemTmp);
            this.content.addChild(item);
            listItem = item.getComponent(ListItem);
            listItem.listId = listId;
            listItem.list = this;
            listItem._registerEvent();
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
            }
        } else if (this._forceUpdate && this.renderEvent) { //强制更新
            listItem = item.getComponent(ListItem);
            listItem.listId = listId;
            if (this.renderEvent) {
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
            }
        }
        this._updateListItem(listItem);
        if (this._lastDisplayData.indexOf(listId) < 0) {
            this._lastDisplayData.push(listId);
        }
    }

    _updateListItem(listItem: ListItem) {
        if (!listItem)
            return;
        if (this.selectedMode > SelectedType.NONE) {
            switch (this.selectedMode) {
                case SelectedType.SINGLE:
                    listItem.selected = this.selectedId == listItem.listId;
                    break;
                case SelectedType.MULT:
                    listItem.selected = this.multSelected.indexOf(listItem.listId) >= 0;
                    break;
            }
        }
    }
    //仅虚拟列表用
    _resetItemSize(item: any) {
        let listItem: ListItem = item.getComponent(ListItem);
        if (!this.customSize || !this.customSize[listItem.listId]) {
            item.setContentSize(this._itemSize);
            return;
        }
        let size: number = this.customSize[listItem.listId];
        if (this._align == cc.Layout.Type.HORIZONTAL) {
            item.width = size;
        } else if (this._align == cc.Layout.Type.VERTICAL) {
            item.height = size;
        }
    }
    /**
     * 设置多选
     * @param {Array} args 可以是单个listId，也可是个listId数组
     * @param {Boolean} bool 值，如果为null的话，则直接用args覆盖
     */
    setMultSelected(args: any, bool: boolean) {
        let t: any = this;
        if (!Array.isArray(args)) {
            args = [args];
        }
        if (bool == null) {
            t.multSelected = null;
            t.multSelected = args;
        } else {
            let listId: number, sub: number;
            if (bool) {
                for (let n: number = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub < 0) {
                        t.multSelected.push(listId);
                    }
                }
            } else {
                for (let n: number = args.length - 1; n >= 0; n--) {
                    listId = args[n];
                    sub = t.multSelected.indexOf(listId);
                    if (sub >= 0) {
                        t.multSelected.splice(sub, 1);
                    }
                }
            }
        }
        t._forceUpdate = true;
        t._onScrolling(null);
    }
    /**
     * 更新指定的Item
     * @param {Array} args 单个listId，或者数组
     * @returns
     */
    updateAppointed(args: any) {
        if (!Array.isArray(args)) {
            args = [args];
        }
        let len: number = args.length;
        for (let n: number = 0; n < len; n++) {
            let listId: number = args[n];
            let item: any = this.getItemByListId(listId);
            if (item)
                cc.Component.EventHandler.emitEvents([this.renderEvent], item, listId);
        }
    }
    /**
     * 根据ListID获取Item
     * @param {Number} listId
     * @returns
     */
    getItemByListId(listId: number) {
        for (let n: number = this.content.childrenCount - 1; n >= 0; n--) {
            if (this.content.children[n].getComponent(ListItem).listId == listId)
                return this.content.children[n];
        }
        return null;
    }
    /**
     * 获取在显示区域外的Item
     * @returns
     */
    _getOutsideItem() {
        let item: any, isOutside: boolean;
        let result: any[] = [];
        for (let n: number = this.content.childrenCount - 1; n >= 0; n--) {
            item = this.content.children[n];
            isOutside = true;
            for (let n: number = this._pool.length; n >= 0; n--) {
                if (item == this._pool[n]) {
                    isOutside = false;
                    break;
                }
            }
            if (isOutside) {
                for (let c: number = this.actualNumItems - 1; c >= 0; c--) {
                    let listId: number = this.displayData[c].id;
                    if (item.getComponent(ListItem).listId == listId) {
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
    }
    //删除显示区域以外的Item
    _delRedundantItem() {
        if (this._virtual) {
            let arr: any[] = this._getOutsideItem();
            for (let n: number = arr.length - 1; n >= 0; n--) {
                arr[n].removeFromParent();
                this._pool.push(arr[n]);
            }
            if (arr.length) {
                let item: any, listItem: ListItem;
                for (let n: number = this._pool.length - 1; n >= 0; n--) {
                    item = this._pool[n];
                    listItem = item.getComponent(ListItem);
                    if (listItem.listId < this.firstListId - this._colLineNum || listItem.listId > this.firstListId + this.actualNumItems + this._colLineNum) {
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
    }
    //删除单个Item
    _delSingleItem(item: any) {
        // cc.log('DEL::', item.getComponent(ListItem).listId, item);
        item.removeFromParent();
        if (item.destroy)
            item.destroy();
        item = null;
    }
    /** 
     * 动效删除Item（此方法只适用于虚拟列表，即_virtual=true）
     * 一定要在回调函数里重新设置新的numItems进行刷新，毕竟本List是靠数据驱动的。
     */
    aniDelItem(listId: number, callFunc: Function, aniType: number) {
        let t: any = this;
        let item: any = t.getItemByListId(listId);
        let listItem: ListItem;
        if (t._aniDelRuning || !t._virtual) {
            return;
        }
        if (!item) {
            callFunc(listId);
            return;
        } else {
            listItem = item.getComponent(ListItem);
        }
        t._aniDelRuning = true;
        let curLastId: number = t.displayData[t.displayData.length - 1].id;
        let resetSelectedId: boolean = listItem.selected;
        listItem.showAni(aniType, () => {
            //判断有没有下一个，如果有的话，创建粗来
            let newId: number;
            if (curLastId < t._numItems - 2) {
                newId = curLastId + 1;
            }
            if (newId != null) {
                let newData: any = t._calcItemPos(newId);
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
                let sub: number = t.multSelected.indexOf(listId);
                if (sub >= 0) {
                    t.multSelected.splice(sub, 1);
                }
                //多选的数据，在其后的全部减一
                for (let n: number = t.multSelected.length - 1; n >= 0; n--) {
                    let id: number = t.multSelected[n];
                    if (id >= listId)
                        t.multSelected[n]--;
                }
            }
            if (t.customSize) {
                if (t.customSize[listId])
                    delete t.customSize[listId];
                let newCustomSize: any = {};
                let size: number;
                for (let id in t.customSize) {
                    size = t.customSize[id];
                    let idNumber: number = parseInt(id);
                    newCustomSize[idNumber - (idNumber >= listId ? 1 : 0)] = size;
                }
                t.customSize = newCustomSize;
            }
            //后面的Item向前怼的动效
            let sec: number = .2333;
            let acts: any[], haveCB: boolean;
            for (let n: number = newId != null ? newId : curLastId; n >= listId + 1; n--) {
                item = t.getItemByListId(n);
                if (item) {
                    let posData: any = t._calcItemPos(n - 1);
                    acts = [
                        cc.moveTo(sec, cc.v2(posData.x, posData.y)),
                    ];
                    if (n <= listId + 1) {
                        haveCB = true;
                        acts.push(cc.callFunc(() => {
                            t._aniDelRuning = false;
                            callFunc(listId);
                        }));
                    }
                    if (acts.length > 1)
                        item.runAction(cc.sequence(acts));
                    else
                        item.runAction(acts[0]);
                }
            }
            if (!haveCB) {
                t._aniDelRuning = false;
                callFunc(listId);
            }
        }, true);
    }
    /**
     * 滚动到..
     * @param {Number} listId 索引（如果<0，则滚到首个Item位置，如果>=_numItems，则滚到最末Item位置）
     * @param {Number} timeInSecond 时间
     * @param {Number} offset 索引目标位置偏移，0-1
     * @param {Boolean} overStress 滚动后是否强调该Item（这只是个实验功能）
     */
    scrollTo(listId: number, timeInSecond: number, offset: number, overStress: boolean) {
        let t = this;
        if (!t.checkInited(false))
            return;
        t._scrollView.stopAutoScroll();
        if (timeInSecond == null || timeInSecond < 0)
            timeInSecond = 0;
        if (listId < 0)
            listId = 0;
        else if (listId >= t._numItems)
            listId = t._numItems - 1;
        let pos: any = t._calcItemPos(listId); //嗯...不管virtual=true还是false，都自己算，反正结果都一样，懒得去遍历content.children了。
        let targetX: number, targetY: number;
        switch (t._alignCalcType) {
            case 1://单行HORIZONTAL（LEFT_TO_RIGHT）、网格VERTICAL（LEFT_TO_RIGHT）
                targetX = pos.left;
                if (offset != null)
                    targetX -= t.node.width * offset;
                else
                    targetX -= t._leftGap;
                pos = cc.v2(targetX, 0);
                break;
            case 2://单行HORIZONTAL（RIGHT_TO_LEFT）、网格VERTICAL（RIGHT_TO_LEFT）
                targetX = pos.right - t.node.width;
                if (offset != null)
                    targetX += t.node.width * offset;
                else
                    targetX += t._rightGap;
                pos = cc.v2(targetX + t.content.width, 0);
                break;
            case 3://单列VERTICAL（TOP_TO_BOTTOM）、网格HORIZONTAL（TOP_TO_BOTTOM）
                targetY = pos.top;
                if (offset != null)
                    targetY += t.node.height * offset;
                else
                    targetY += t._topGap;
                pos = cc.v2(0, -targetY);
                break;
            case 4://单列VERTICAL（BOTTOM_TO_TOP）、网格HORIZONTAL（BOTTOM_TO_TOP）
                targetY = pos.bottom + t.node.height;
                if (offset != null)
                    targetY -= t.node.height * offset;
                else
                    targetY -= t._bottomGap;
                pos = cc.v2(0, -targetY + t.content.height);
                break;
        }

        let viewPos: any = t.content.getPosition();
        viewPos = Math.abs(t._sizeType ? viewPos.y : viewPos.x);

        let comparePos = t._sizeType ? pos.y : pos.x;
        let runScroll = Math.abs((t._scrollPos != null ? t._scrollPos : viewPos) - comparePos) > .5;
        // cc.log(runScroll, t._scrollPos, viewPos, comparePos)

        t._scrollView.stopAutoScroll();
        if (runScroll) {
            t._scrollView.scrollToOffset(pos, timeInSecond);
            // cc.log(listId, t.content.width, t.content.getPosition(), pos);
            t.scheduleOnce(() => {
                if (!t._adheringBarrier) {
                    t.adhering = t._adheringBarrier = false;
                }
                //cc.log('2222222222', t._adheringBarrier)
                if (overStress) {
                    // t.scrollToListId = listId;
                    let item = t.getItemByListId(listId);
                    if (item) {
                        item.runAction(cc.sequence(
                            cc.scaleTo(.1, 1.05),
                            cc.scaleTo(.1, 1),
                        ));
                    }
                }
            }, timeInSecond + .1);

            if (timeInSecond <= 0) {
                t._onScrolling(null);
            }
        }
    }
    /**
     * 计算当前滚动窗最近的Item
     */
    _calcNearestItem() {
        this.nearestListId = null;
        let data: any, item: any, center: number;

        if (this._virtual)
            this._calcViewPos();

        let breakFor: boolean = false;
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
    }
    //计算已存在的Item的位置
    _calcExistItemPos(id: number) {
        let item: any = this.getItemByListId(id);
        if (!item)
            return null;
        let data: any = {
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
    }
    //上一页
    prePage(timeInSecond: number) {
        this.skipPage(this.curPageNum - 1, timeInSecond);
    }
    //下一页
    nextPage(timeInSecond: number) {
        this.skipPage(this.curPageNum + 1, timeInSecond);
    }
    //跳转到第几页
    skipPage(pageNum: number, timeInSecond: number) {
        let t: any = this;
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

}
