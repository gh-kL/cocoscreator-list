window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ListItem: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5a969vN49tNAbdnwfe6dffE", "ListItem");
    "use strict";
    var SelectedType = cc.Enum({
      NONE: 0,
      TOGGLE: 1,
      SWITCH: 2
    });
    cc.Class({
      editor: {
        disallowMultiple: false,
        menu: "\u81ea\u5b9a\u4e49\u7ec4\u4ef6/List Item",
        executionOrder: -5001
      },
      extends: cc.Component,
      properties: {
        icon: {
          default: null,
          type: cc.Sprite
        },
        title: cc.Node,
        selectedMode: {
          default: SelectedType.NONE,
          type: SelectedType,
          tooltip: false
        },
        selectedFlag: {
          default: null,
          type: cc.Node,
          visible: function visible() {
            var bool = this.selectedMode > 0;
            bool || (this.selectedFlag = null);
            return bool;
          }
        },
        selectedSpriteFrame: {
          default: null,
          type: cc.SpriteFrame,
          visible: function visible() {
            var bool = this.selectedMode == SelectedType.SWITCH;
            bool || (this.selectedSpriteFrame = null);
            return bool;
          }
        },
        adaptiveSize: {
          default: false,
          tooltip: false
        },
        _selected: false,
        selected: {
          visible: false,
          get: function get() {
            return this._selected;
          },
          set: function set(val) {
            this._selected = val;
            if (!this.selectedFlag) return;
            switch (this.selectedMode) {
             case SelectedType.TOGGLE:
              this.selectedFlag.active = val;
              break;

             case SelectedType.SWITCH:
              this.selectedFlag.spriteFrame = val ? this.selectedSpriteFrame : this._unselectedSpriteFrame;
            }
          }
        },
        _btnCom: null,
        btnCom: {
          visible: false,
          get: function get() {
            this._btnCom || (this._btnCom = this.node.getComponent(cc.Button));
            return this._btnCom;
          }
        }
      },
      onLoad: function onLoad() {
        if (this.title) {
          var com = this.title.getComponent(cc.Label);
          com || (com = this.title.getComponent(cc.RichText));
          this.title = com;
        }
        if (this.selectedMode == SelectedType.SWITCH) {
          var _com = this.selectedFlag.getComponent(cc.Sprite);
          this.selectedFlag = _com;
          this._unselectedSpriteFrame = _com.spriteFrame;
        }
      },
      onDestroy: function onDestroy() {
        this.node.off(cc.Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
      },
      _registerEvent: function _registerEvent() {
        if (!this.eventReg) {
          this.btnCom && this._list.selectedMode > 0 && this.btnCom.clickEvents.unshift(this.createEvt(this, "onClickThis"));
          this.adaptiveSize && this.node.on(cc.Node.EventType.SIZE_CHANGED, this._onSizeChange, this);
          this.eventReg = true;
        }
      },
      _onSizeChange: function _onSizeChange() {
        this._list._onItemAdaptive(this.node);
      },
      createEvt: function createEvt(component, handlerName, node) {
        if (!component.isValid) return;
        component.comName = component.comName || component.name.match(/\<(.*?)\>/g).pop().replace(/\<|>/g, "");
        var evt = new cc.Component.EventHandler();
        evt.target = node || component.node;
        evt.component = component.comName;
        evt.handler = handlerName;
        return evt;
      },
      showAni: function showAni(aniType, callFunc, del) {
        var _this = this;
        var acts;
        switch (aniType) {
         case 0:
          acts = [ new cc.scaleTo(.2, .7), new cc.moveBy(.3, 0, 2 * this.node.height) ];
          break;

         case 1:
          acts = [ new cc.scaleTo(.2, .7), new cc.moveBy(.3, 2 * this.node.width, 0) ];
          break;

         case 2:
          acts = [ new cc.scaleTo(.2, .7), new cc.moveBy(.3, 0, -2 * this.node.height) ];
          break;

         case 3:
          acts = [ new cc.scaleTo(.2, .7), new cc.moveBy(.3, -2 * this.node.width, 0) ];
          break;

         default:
          acts = [ new cc.scaleTo(.3, .1) ];
        }
        (callFunc || del) && acts.push(new cc.CallFunc(function() {
          if (del) {
            _this._list._delSingleItem(_this.node);
            for (var n = _this._list.displayData.length - 1; n >= 0; n--) if (_this._list.displayData[n].listId == _this.node._listId) {
              _this._list.displayData.splice(n, 1);
              break;
            }
          }
          callFunc();
        }));
        this.node.runAction(new cc.Sequence(acts));
      },
      onClickThis: function onClickThis() {
        this._list.selectedId = this.node._listId;
      }
    });
    cc._RF.pop();
  }, {} ],
  List: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5132c1xKI5En6Qjk/W16Qt+", "List");
    "use strict";
    var TemplateType = cc.Enum({
      NODE: 1,
      PREFAB: 2
    });
    var SlideType = cc.Enum({
      NORMAL: 1,
      ADHERING: 2,
      PAGE: 3
    });
    var SelectedType = cc.Enum({
      NONE: 0,
      SINGLE: 1,
      MULT: 2
    });
    var ListItem = require("ListItem");
    cc.Class({
      extends: cc.Component,
      editor: {
        disallowMultiple: false,
        menu: "\u81ea\u5b9a\u4e49\u7ec4\u4ef6/List",
        requireComponent: cc.ScrollView,
        executionOrder: -5e3
      },
      properties: {
        templateType: {
          default: TemplateType.NODE,
          type: TemplateType
        },
        tmpNode: {
          default: null,
          type: cc.Node,
          tooltip: false,
          visible: function visible() {
            var bool = this.templateType == TemplateType.NODE;
            bool || (this.tmpNode = null);
            return bool;
          }
        },
        tmpPrefab: {
          default: null,
          type: cc.Prefab,
          tooltip: false,
          visible: function visible() {
            var bool = this.templateType == TemplateType.PREFAB;
            bool || (this.tmpPrefab = null);
            return bool;
          }
        },
        _slideMode: 1,
        slideMode: {
          type: SlideType,
          tooltip: false,
          get: function get() {
            return this._slideMode;
          },
          set: function set(val) {
            null != val && (this._slideMode = val);
          }
        },
        pageDistance: {
          default: .3,
          type: cc.Float,
          range: [ 0, 1, .1 ],
          tooltip: false,
          slide: true,
          visible: function visible() {
            return this._slideMode == SlideType.PAGE;
          }
        },
        pageChangeEvent: {
          default: null,
          type: cc.Component.EventHandler,
          tooltip: false,
          visible: function visible() {
            var bool = this._slideMode == SlideType.PAGE;
            bool || (this.pageChangeEvent = null);
            return bool;
          }
        },
        _virtual: true,
        virtual: {
          tooltip: false,
          get: function get() {
            return this._virtual;
          },
          set: function set(val) {
            null != val && (this._virtual = val);
            (true, 0 != this._numItems) && this._onScrolling();
          }
        },
        cyclic: {
          default: false,
          tooltip: false,
          visible: function visible() {
            var val = this.virtual && this.slideMode == SlideType.NORMAL;
            val || (this.cyclic = false);
            return val;
          }
        },
        lackCenter: {
          default: false,
          tooltip: false,
          visible: function visible() {
            return this.virtual;
          }
        },
        lackSlide: {
          default: false,
          tooltip: false,
          visible: function visible() {
            var val = this.virtual && !this.lackCenter;
            val || (this.lackSlide = false);
            return val;
          }
        },
        _updateRate: 0,
        updateRate: {
          type: cc.Integer,
          range: [ 0, 6, 1 ],
          tooltip: false,
          slide: true,
          get: function get() {
            return this._updateRate;
          },
          set: function set(val) {
            val >= 0 && val <= 6 && (this._updateRate = val);
          }
        },
        frameByFrameRenderNum: {
          default: 0,
          type: cc.Integer,
          range: [ 0, 12, 1 ],
          tooltip: false,
          slide: true
        },
        renderEvent: {
          default: null,
          type: cc.Component.EventHandler,
          tooltip: false
        },
        selectedMode: {
          default: SelectedType.NONE,
          type: SelectedType,
          tooltip: false
        },
        repeatEventSingle: {
          default: false,
          tooltip: false,
          visible: function visible() {
            return this.selectedMode == SelectedType.SINGLE;
          }
        },
        selectedEvent: {
          default: null,
          type: cc.Component.EventHandler,
          tooltip: false,
          visible: function visible() {
            var bool = this.selectedMode > 0;
            bool || (this.selectedEvent = null);
            return bool;
          }
        },
        _selectedId: -1,
        selectedId: {
          visible: false,
          get: function get() {
            return this._selectedId;
          },
          set: function set(val) {
            var t = this;
            var item;
            switch (t.selectedMode) {
             case SelectedType.SINGLE:
              if (!t.repeatEventSingle && val == t._selectedId) return;
              item = t.getItemByListId(val);
              t._selectedId >= 0 ? t._lastSelectedId = t._selectedId : t._lastSelectedId = null;
              t._selectedId = val;
              item && (item.listItem.selected = true);
              if (t._lastSelectedId >= 0 && t._lastSelectedId != t._selectedId) {
                var lastItem = t.getItemByListId(t._lastSelectedId);
                lastItem && (lastItem.listItem.selected = false);
              }
              t.selectedEvent && cc.Component.EventHandler.emitEvents([ t.selectedEvent ], item, val % this._actualNumItems, null == t._lastSelectedId ? null : t._lastSelectedId % this._actualNumItems);
              break;

             case SelectedType.MULT:
              item = t.getItemByListId(val);
              if (!item) return;
              t._selectedId >= 0 && (t._lastSelectedId = t._selectedId);
              t._selectedId = val;
              var bool = !item.listItem.selected;
              item.listItem.selected = bool;
              var sub = t.multSelected.indexOf(val);
              bool && sub < 0 ? t.multSelected.push(val) : !bool && sub >= 0 && t.multSelected.splice(sub, 1);
              t.selectedEvent && cc.Component.EventHandler.emitEvents([ t.selectedEvent ], item, val % this._actualNumItems, null == t._lastSelectedId ? null : t._lastSelectedId % this._actualNumItems, bool);
            }
          }
        },
        _numItems: {
          default: 0,
          serializable: false
        },
        numItems: {
          visible: false,
          get: function get() {
            return this._actualNumItems;
          },
          set: function set(val) {
            var t = this;
            if (!t.checkInited()) return;
            if (null == val || val < 0) {
              cc.error("numItems set the wrong::", val);
              return;
            }
            t._actualNumItems = t._numItems = val;
            t._forceUpdate = true;
            if (t._virtual) {
              t._resizeContent();
              t.cyclic && (t._numItems = t._cyclicNum * t._numItems);
              t._onScrolling();
              t.frameByFrameRenderNum || t.slideMode != SlideType.PAGE || (t.curPageNum = t.nearestListId);
            } else {
              var layout = t.content.getComponent(cc.Layout);
              layout && (layout.enabled = true);
              t._delRedundantItem();
              t.firstListId = 0;
              if (t.frameByFrameRenderNum > 0) {
                var len = t.frameByFrameRenderNum > t._numItems ? t._numItems : t.frameByFrameRenderNum;
                for (var n = 0; n < len; n++) t._createOrUpdateItem2(n);
                if (t.frameByFrameRenderNum < t._numItems) {
                  t._updateCounter = t.frameByFrameRenderNum;
                  t._updateDone = false;
                }
              } else {
                for (var _n = 0; _n < val; _n++) t._createOrUpdateItem2(_n);
                t.displayItemNum = val;
              }
            }
          }
        }
      },
      onLoad: function onLoad() {
        this._init();
      },
      onDestroy: function onDestroy() {
        var t = this;
        t._itemTmp && t._itemTmp.isValid && t._itemTmp.destroy();
        t.tmpNode && t.tmpNode.isValid && t.tmpNode.destroy();
        while (t._pool.size()) {
          var node = t._pool.get();
          node.destroy();
        }
      },
      onEnable: function onEnable() {
        this._registerEvent();
        this._init();
      },
      onDisable: function onDisable() {
        this._unregisterEvent();
      },
      _registerEvent: function _registerEvent() {
        var t = this;
        t.node.on(cc.Node.EventType.TOUCH_START, t._onTouchStart, t, true);
        t.node.on("touch-up", t._onTouchUp, t, true);
        t.node.on(cc.Node.EventType.TOUCH_CANCEL, t._onTouchCancelled, t, true);
        t.node.on("scroll-began", t._onScrollBegan, t, true);
        t.node.on("scroll-ended", t._onScrollEnded, t, true);
        t.node.on("scrolling", t._onScrolling, t, true);
        t.node.on(cc.Node.EventType.SIZE_CHANGED, t._onSizeChanged, t);
      },
      _unregisterEvent: function _unregisterEvent() {
        var t = this;
        t.node.off(cc.Node.EventType.TOUCH_START, t._onTouchStart, t, true);
        t.node.off("touch-up", t._onTouchUp, t, true);
        t.node.off(cc.Node.EventType.TOUCH_CANCEL, t._onTouchCancelled, t, true);
        t.node.off("scroll-began", t._onScrollBegan, t, true);
        t.node.off("scroll-ended", t._onScrollEnded, t, true);
        t.node.off("scrolling", t._onScrolling, t, true);
        t.node.off(cc.Node.EventType.SIZE_CHANGED, t._onSizeChanged, t);
      },
      _init: function _init() {
        var t = this;
        if (t._inited) return;
        t._scrollView = t.node.getComponent(cc.ScrollView);
        t.content = t._scrollView.content;
        if (!t.content) {
          cc.error(t.node.name + "'s cc.ScrollView unset content!");
          return;
        }
        t._layout = t.content.getComponent(cc.Layout);
        t._align = t._layout.type;
        t._resizeMode = t._layout.resizeMode;
        t._startAxis = t._layout.startAxis;
        t._topGap = t._layout.paddingTop;
        t._rightGap = t._layout.paddingRight;
        t._bottomGap = t._layout.paddingBottom;
        t._leftGap = t._layout.paddingLeft;
        t._columnGap = t._layout.spacingX;
        t._lineGap = t._layout.spacingY;
        t._colLineNum;
        t._verticalDir = t._layout.verticalDirection;
        t._horizontalDir = t._layout.horizontalDirection;
        t.setTemplateItem(cc.instantiate(t.templateType == TemplateType.PREFAB ? t.tmpPrefab : t.tmpNode));
        if (t._slideMode == SlideType.ADHERING || t._slideMode == SlideType.PAGE) {
          t._scrollView.inertia = false;
          t._scrollView._onMouseWheel = function() {
            return;
          };
        }
        t.virtual || (t.lackCenter = false);
        t._lastDisplayData = [];
        t.displayData = [];
        t._pool = new cc.NodePool();
        t._forceUpdate = false;
        t._updateCounter = 0;
        t._updateDone = true;
        t.curPageNum = 0;
        if (t.cyclic) {
          t._scrollView._processAutoScrolling = this._processAutoScrolling.bind(t);
          t._scrollView._startBounceBackIfNeeded = function() {
            return false;
          };
        }
        switch (t._align) {
         case cc.Layout.Type.HORIZONTAL:
          switch (t._horizontalDir) {
           case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
            t._alignCalcType = 1;
            break;

           case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
            t._alignCalcType = 2;
          }
          break;

         case cc.Layout.Type.VERTICAL:
          switch (t._verticalDir) {
           case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
            t._alignCalcType = 3;
            break;

           case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
            t._alignCalcType = 4;
          }
          break;

         case cc.Layout.Type.GRID:
          switch (t._startAxis) {
           case cc.Layout.AxisDirection.HORIZONTAL:
            switch (t._verticalDir) {
             case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
              t._alignCalcType = 3;
              break;

             case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
              t._alignCalcType = 4;
            }
            break;

           case cc.Layout.AxisDirection.VERTICAL:
            switch (t._horizontalDir) {
             case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
              t._alignCalcType = 1;
              break;

             case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
              t._alignCalcType = 2;
            }
          }
        }
        t.content.removeAllChildren();
        t._inited = true;
      },
      _processAutoScrolling: function _processAutoScrolling(dt) {
        var brakingFactor = 1;
        this._scrollView._autoScrollAccumulatedTime += dt * (1 / brakingFactor);
        var percentage = Math.min(1, this._scrollView._autoScrollAccumulatedTime / this._scrollView._autoScrollTotalTime);
        if (this._scrollView._autoScrollAttenuate) {
          var time = percentage - 1;
          percentage = time * time * time * time * time + 1;
        }
        var newPosition = this._scrollView._autoScrollStartPosition.add(this._scrollView._autoScrollTargetDelta.mul(percentage));
        var EPSILON = this._scrollView.getScrollEndedEventTiming();
        var reachedEnd = Math.abs(percentage - 1) <= EPSILON;
        var fireEvent = Math.abs(percentage - 1) <= this._scrollView.getScrollEndedEventTiming();
        if (fireEvent && !this._scrollView._isScrollEndedWithThresholdEventFired) {
          this._scrollView._dispatchEvent("scroll-ended-with-threshold");
          this._scrollView._isScrollEndedWithThresholdEventFired = true;
        }
        reachedEnd && (this._scrollView._autoScrolling = false);
        var deltaMove = newPosition.sub(this._scrollView.getContentPosition());
        this._scrollView._moveContent(this._scrollView._clampDelta(deltaMove), reachedEnd);
        this._scrollView._dispatchEvent("scrolling");
        if (!this._scrollView._autoScrolling) {
          this._scrollView._isBouncing = false;
          this._scrollView._scrolling = false;
          this._scrollView._dispatchEvent("scroll-ended");
        }
      },
      setTemplateItem: function setTemplateItem(item) {
        if (!item) return;
        var t = this;
        t._itemTmp = item;
        t._resizeMode == cc.Layout.ResizeMode.CHILDREN ? t._itemSize = t._layout.cellSize : t._itemSize = new cc.size(item.width, item.height);
        var com = item.getComponent(ListItem);
        var remove = false;
        com || (remove = true);
        remove && (t.selectedMode = SelectedType.NONE);
        com = item.getComponent(cc.Widget);
        com && com.enabled && (t._needUpdateWidget = true);
        t.selectedMode == SelectedType.MULT && (t.multSelected = []);
        switch (t._align) {
         case cc.Layout.Type.HORIZONTAL:
          t._colLineNum = 1;
          t._sizeType = false;
          break;

         case cc.Layout.Type.VERTICAL:
          t._colLineNum = 1;
          t._sizeType = true;
          break;

         case cc.Layout.Type.GRID:
          switch (t._startAxis) {
           case cc.Layout.AxisDirection.HORIZONTAL:
            var trimW = t.content.width - t._leftGap - t._rightGap;
            t._colLineNum = Math.floor((trimW + t._columnGap) / (t._itemSize.width + t._columnGap));
            t._sizeType = true;
            break;

           case cc.Layout.AxisDirection.VERTICAL:
            var trimH = t.content.height - t._topGap - t._bottomGap;
            t._colLineNum = Math.floor((trimH + t._lineGap) / (t._itemSize.height + t._lineGap));
            t._sizeType = false;
          }
        }
      },
      checkInited: function checkInited(printLog) {
        printLog = null == printLog || printLog;
        if (!this._inited) {
          printLog && cc.error("List initialization not completed!");
          return false;
        }
        return true;
      },
      _resizeContent: function _resizeContent() {
        var t = this;
        var result;
        switch (t._align) {
         case cc.Layout.Type.HORIZONTAL:
          if (t._customSize) {
            var fixed = t._getFixedSize();
            result = t._leftGap + fixed.val + t._itemSize.width * (t._numItems - fixed.count) + t._columnGap * (t._numItems - 1) + t._rightGap;
          } else result = t._leftGap + t._itemSize.width * t._numItems + t._columnGap * (t._numItems - 1) + t._rightGap;
          break;

         case cc.Layout.Type.VERTICAL:
          if (t._customSize) {
            var _fixed = t._getFixedSize();
            result = t._topGap + _fixed.val + t._itemSize.height * (t._numItems - _fixed.count) + t._lineGap * (t._numItems - 1) + t._bottomGap;
          } else result = t._topGap + t._itemSize.height * t._numItems + t._lineGap * (t._numItems - 1) + t._bottomGap;
          break;

         case cc.Layout.Type.GRID:
          t.lackCenter && (t.lackCenter = false);
          switch (t._startAxis) {
           case cc.Layout.AxisDirection.HORIZONTAL:
            var lineNum = Math.ceil(t._numItems / t._colLineNum);
            result = t._topGap + t._itemSize.height * lineNum + t._lineGap * (lineNum - 1) + t._bottomGap;
            break;

           case cc.Layout.AxisDirection.VERTICAL:
            var colNum = Math.ceil(t._numItems / t._colLineNum);
            result = t._leftGap + t._itemSize.width * colNum + t._columnGap * (colNum - 1) + t._rightGap;
          }
        }
        var layout = t.content.getComponent(cc.Layout);
        layout && (layout.enabled = false);
        t._allItemSize = result;
        t._allItemSizeNoEdge = t._allItemSize - (t._sizeType ? t._topGap + t._bottomGap : t._leftGap + t._rightGap);
        if (t.cyclic) {
          var totalSize = t._sizeType ? t.node.height : t.node.width;
          t._cyclicPos1 = 0;
          totalSize -= t._cyclicPos1;
          t._cyclicNum = Math.ceil(totalSize / t._allItemSizeNoEdge) + 1;
          var spacing = t._sizeType ? t._lineGap : t._columnGap;
          t._cyclicPos2 = t._cyclicPos1 + t._allItemSizeNoEdge + spacing;
          t._cyclicAllItemSize = t._allItemSize + t._allItemSizeNoEdge * (t._cyclicNum - 1) + spacing * (t._cyclicNum - 1);
          t._cycilcAllItemSizeNoEdge = t._allItemSizeNoEdge * t._cyclicNum;
          t._cycilcAllItemSizeNoEdge += spacing * (t._cyclicNum - 1);
        }
        t._lack = !t.cyclic && t._allItemSize < (t._sizeType ? t.node.height : t.node.width);
        var slideOffset = t._lack && t.lackCenter || !t.lackSlide ? .1 : 0;
        var targetWH = t._lack ? (t._sizeType ? t.node.height : t.node.width) - slideOffset : t.cyclic ? t._cyclicAllItemSize : t._allItemSize;
        targetWH < 0 && (targetWH = 0);
        t._sizeType ? t.content.height = targetWH : t.content.width = targetWH;
      },
      _onScrolling: function _onScrolling(ev) {
        null == this.frameCount && (this.frameCount = this._updateRate);
        if (!this._forceUpdate && ev && "scroll-ended" != ev.type && this.frameCount > 0) {
          this.frameCount--;
          return;
        }
        this.frameCount = this._updateRate;
        if (this._aniDelRuning) return;
        if (this.cyclic) {
          var scrollPos = this.content.getPosition();
          scrollPos = this._sizeType ? scrollPos.y : scrollPos.x;
          var addVal = this._allItemSizeNoEdge + (this._sizeType ? this._lineGap : this._columnGap);
          var add = this._sizeType ? cc.v2(0, addVal) : cc.v2(addVal, 0);
          switch (this._alignCalcType) {
           case 1:
            if (scrollPos > -this._cyclicPos1) {
              this.content.x = -this._cyclicPos2;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.sub(add));
            } else if (scrollPos < -this._cyclicPos2) {
              this.content.x = -this._cyclicPos1;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.add(add));
            }
            break;

           case 2:
            if (scrollPos < this._cyclicPos1) {
              this.content.x = this._cyclicPos2;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.add(add));
            } else if (scrollPos > this._cyclicPos2) {
              this.content.x = this._cyclicPos1;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.sub(add));
            }
            break;

           case 3:
            if (scrollPos < this._cyclicPos1) {
              this.content.y = this._cyclicPos2;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.add(add));
            } else if (scrollPos > this._cyclicPos2) {
              this.content.y = this._cyclicPos1;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.sub(add));
            }
            break;

           case 4:
            if (scrollPos > -this._cyclicPos1) {
              this.content.y = -this._cyclicPos2;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.sub(add));
            } else if (scrollPos < -this._cyclicPos2) {
              this.content.y = -this._cyclicPos1;
              this._scrollView.isAutoScrolling() && (this._scrollView._autoScrollStartPosition = this._scrollView._autoScrollStartPosition.add(add));
            }
          }
        }
        this._calcViewPos();
        var vTop, vRight, vBottom, vLeft;
        if (this._sizeType) {
          vTop = this.viewTop;
          vBottom = this.viewBottom;
        } else {
          vRight = this.viewRight;
          vLeft = this.viewLeft;
        }
        if (this._virtual) {
          this.displayData = [];
          var itemPos;
          var curId = 0;
          var endId = this._numItems - 1;
          if (this._customSize) {
            var breakFor = false;
            for (;curId <= endId && !breakFor; curId++) {
              itemPos = this._calcItemPos(curId);
              switch (this._align) {
               case cc.Layout.Type.HORIZONTAL:
                itemPos.right >= vLeft && itemPos.left <= vRight ? this.displayData.push(itemPos) : 0 != curId && this.displayData.length > 0 && (breakFor = true);
                break;

               case cc.Layout.Type.VERTICAL:
                itemPos.bottom <= vTop && itemPos.top >= vBottom ? this.displayData.push(itemPos) : 0 != curId && this.displayData.length > 0 && (breakFor = true);
                break;

               case cc.Layout.Type.GRID:
                switch (this._startAxis) {
                 case cc.Layout.AxisDirection.HORIZONTAL:
                  itemPos.bottom <= vTop && itemPos.top >= vBottom ? this.displayData.push(itemPos) : 0 != curId && this.displayData.length > 0 && (breakFor = true);
                  break;

                 case cc.Layout.AxisDirection.VERTICAL:
                  itemPos.right >= vLeft && itemPos.left <= vRight ? this.displayData.push(itemPos) : 0 != curId && this.displayData.length > 0 && (breakFor = true);
                }
              }
            }
          } else {
            var ww = this._itemSize.width + this._columnGap;
            var hh = this._itemSize.height + this._lineGap;
            switch (this._alignCalcType) {
             case 1:
              curId = (vLeft + this._leftGap) / ww;
              endId = (vRight + this._rightGap) / ww;
              break;

             case 2:
              curId = (-vRight - this._rightGap) / ww;
              endId = (-vLeft - this._leftGap) / ww;
              break;

             case 3:
              curId = (-vTop - this._topGap) / hh;
              endId = (-vBottom - this._bottomGap) / hh;
              break;

             case 4:
              curId = (vBottom + this._bottomGap) / hh;
              endId = (vTop + this._topGap) / hh;
            }
            curId = Math.floor(curId) * this._colLineNum;
            endId = Math.ceil(endId) * this._colLineNum;
            endId--;
            curId < 0 && (curId = 0);
            endId >= this._numItems && (endId = this._numItems - 1);
            for (;curId <= endId; curId++) this.displayData.push(this._calcItemPos(curId));
          }
          this._delRedundantItem();
          if (this.displayData.length <= 0 || !this._numItems) {
            this._lastDisplayData = [];
            return;
          }
          this.firstListId = this.displayData[0].id;
          this.displayItemNum = this.displayData.length;
          var len = this._lastDisplayData.length;
          var haveDataChange = this.displayItemNum != len;
          if (haveDataChange) {
            this.frameByFrameRenderNum > 0 && this._lastDisplayData.sort(function(a, b) {
              return a - b;
            });
            haveDataChange = this.firstListId != this._lastDisplayData[0] || this.displayData[this.displayItemNum - 1].id != this._lastDisplayData[len - 1];
          }
          if (this._forceUpdate || haveDataChange) if (this.frameByFrameRenderNum > 0) if (this._numItems > 0) {
            this._updateDone ? this._updateCounter = 0 : this._doneAfterUpdate = true;
            this._updateDone = false;
          } else {
            this._updateCounter = 0;
            this._updateDone = true;
          } else {
            this._lastDisplayData = [];
            for (var c = 0; c < this.displayItemNum; c++) this._createOrUpdateItem(this.displayData[c]);
            this._forceUpdate = false;
          }
          this._calcNearestItem();
        }
      },
      _calcViewPos: function _calcViewPos() {
        var scrollPos = this.content.getPosition();
        switch (this._alignCalcType) {
         case 1:
          this.elasticLeft = scrollPos.x > 0 ? scrollPos.x : 0;
          this.viewLeft = (scrollPos.x < 0 ? -scrollPos.x : 0) - this.elasticLeft;
          this.viewRight = this.viewLeft + this.node.width;
          this.elasticRight = this.viewRight > this.content.width ? Math.abs(this.viewRight - this.content.width) : 0;
          this.viewRight += this.elasticRight;
          break;

         case 2:
          this.elasticRight = scrollPos.x < 0 ? -scrollPos.x : 0;
          this.viewRight = (scrollPos.x > 0 ? -scrollPos.x : 0) + this.elasticRight;
          this.viewLeft = this.viewRight - this.node.width;
          this.elasticLeft = this.viewLeft < -this.content.width ? Math.abs(this.viewLeft + this.content.width) : 0;
          this.viewLeft -= this.elasticLeft;
          break;

         case 3:
          this.elasticTop = scrollPos.y < 0 ? Math.abs(scrollPos.y) : 0;
          this.viewTop = (scrollPos.y > 0 ? -scrollPos.y : 0) + this.elasticTop;
          this.viewBottom = this.viewTop - this.node.height;
          this.elasticBottom = this.viewBottom < -this.content.height ? Math.abs(this.viewBottom + this.content.height) : 0;
          this.viewBottom += this.elasticBottom;
          break;

         case 4:
          this.elasticBottom = scrollPos.y > 0 ? Math.abs(scrollPos.y) : 0;
          this.viewBottom = (scrollPos.y < 0 ? -scrollPos.y : 0) - this.elasticBottom;
          this.viewTop = this.viewBottom + this.node.height;
          this.elasticTop = this.viewTop > this.content.height ? Math.abs(this.viewTop - this.content.height) : 0;
          this.viewTop -= this.elasticTop;
        }
      },
      _calcItemPos: function _calcItemPos(id) {
        var width, height, top, bottom, left, right, itemX, itemY;
        switch (this._align) {
         case cc.Layout.Type.HORIZONTAL:
          switch (this._horizontalDir) {
           case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
            if (this._customSize) {
              var fixed = this._getFixedSize(id);
              left = this._leftGap + (this._itemSize.width + this._columnGap) * (id - fixed.count) + (fixed.val + this._columnGap * fixed.count);
              var cs = this._customSize[id];
              width = cs > 0 ? cs : this._itemSize.width;
            } else {
              left = this._leftGap + (this._itemSize.width + this._columnGap) * id;
              width = this._itemSize.width;
            }
            right = left + width;
            if (this.lackCenter) {
              var offset = this.content.width / 2 - this._allItemSizeNoEdge / 2;
              left += offset;
              right += offset;
            }
            return {
              id: id,
              left: left,
              right: right,
              x: left + this._itemTmp.anchorX * width,
              y: this._itemTmp.y
            };

           case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
            if (this._customSize) {
              var _fixed2 = this._getFixedSize(id);
              right = -this._rightGap - (this._itemSize.width + this._columnGap) * (id - _fixed2.count) - (_fixed2.val + this._columnGap * _fixed2.count);
              var _cs = this._customSize[id];
              width = _cs > 0 ? _cs : this._itemSize.width;
            } else {
              right = -this._rightGap - (this._itemSize.width + this._columnGap) * id;
              width = this._itemSize.width;
            }
            left = right - width;
            if (this.lackCenter) {
              var _offset = this.content.width / 2 - this._allItemSizeNoEdge / 2;
              left -= _offset;
              right -= _offset;
            }
            return {
              id: id,
              right: right,
              left: left,
              x: left + this._itemTmp.anchorX * width,
              y: this._itemTmp.y
            };
          }
          break;

         case cc.Layout.Type.VERTICAL:
          switch (this._verticalDir) {
           case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
            if (this._customSize) {
              var _fixed3 = this._getFixedSize(id);
              top = -this._topGap - (this._itemSize.height + this._lineGap) * (id - _fixed3.count) - (_fixed3.val + this._lineGap * _fixed3.count);
              var _cs2 = this._customSize[id];
              height = _cs2 > 0 ? _cs2 : this._itemSize.height;
              bottom = top - height;
            } else {
              top = -this._topGap - (this._itemSize.height + this._lineGap) * id;
              height = this._itemSize.height;
            }
            bottom = top - height;
            if (this.lackCenter) {
              var _offset2 = this.content.height / 2 - this._allItemSizeNoEdge / 2;
              top -= _offset2;
              bottom -= _offset2;
            }
            return {
              id: id,
              top: top,
              bottom: bottom,
              x: this._itemTmp.x,
              y: bottom + this._itemTmp.anchorY * height
            };

           case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
            if (this._customSize) {
              var _fixed4 = this._getFixedSize(id);
              bottom = this._bottomGap + (this._itemSize.height + this._lineGap) * (id - _fixed4.count) + (_fixed4.val + this._lineGap * _fixed4.count);
              var _cs3 = this._customSize[id];
              height = _cs3 > 0 ? _cs3 : this._itemSize.height;
            } else {
              bottom = this._bottomGap + (this._itemSize.height + this._lineGap) * id;
              height = this._itemSize.height;
            }
            top = bottom + height;
            if (this.lackCenter) {
              var _offset3 = this.content.height / 2 - this._allItemSizeNoEdge / 2;
              top += _offset3;
              bottom += _offset3;
            }
            return {
              id: id,
              top: top,
              bottom: bottom,
              x: this._itemTmp.x,
              y: bottom + this._itemTmp.anchorY * height
            };
          }

         case cc.Layout.Type.GRID:
          var colLine = Math.floor(id / this._colLineNum);
          switch (this._startAxis) {
           case cc.Layout.AxisDirection.HORIZONTAL:
            switch (this._verticalDir) {
             case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
              top = -this._topGap - (this._itemSize.height + this._lineGap) * colLine;
              bottom = top - this._itemSize.height;
              itemY = bottom + this._itemTmp.anchorY * this._itemSize.height;
              break;

             case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
              bottom = this._bottomGap + (this._itemSize.height + this._lineGap) * colLine;
              top = bottom + this._itemSize.height;
              itemY = bottom + this._itemTmp.anchorY * this._itemSize.height;
            }
            itemX = this._leftGap + id % this._colLineNum * (this._itemSize.width + this._columnGap);
            switch (this._horizontalDir) {
             case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
              itemX += this._itemTmp.anchorX * this._itemSize.width;
              itemX -= this.content.anchorX * this.content.width;
              break;

             case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
              itemX += (1 - this._itemTmp.anchorX) * this._itemSize.width;
              itemX -= (1 - this.content.anchorX) * this.content.width;
              itemX *= -1;
            }
            return {
              id: id,
              top: top,
              bottom: bottom,
              x: itemX,
              y: itemY
            };

           case cc.Layout.AxisDirection.VERTICAL:
            switch (this._horizontalDir) {
             case cc.Layout.HorizontalDirection.LEFT_TO_RIGHT:
              left = this._leftGap + (this._itemSize.width + this._columnGap) * colLine;
              right = left + this._itemSize.width;
              itemX = left + this._itemTmp.anchorX * this._itemSize.width;
              itemX -= this.content.anchorX * this.content.width;
              break;

             case cc.Layout.HorizontalDirection.RIGHT_TO_LEFT:
              right = -this._rightGap - (this._itemSize.width + this._columnGap) * colLine;
              left = right - this._itemSize.width;
              itemX = left + this._itemTmp.anchorX * this._itemSize.width;
              itemX += (1 - this.content.anchorX) * this.content.width;
            }
            itemY = -this._topGap - id % this._colLineNum * (this._itemSize.height + this._lineGap);
            switch (this._verticalDir) {
             case cc.Layout.VerticalDirection.TOP_TO_BOTTOM:
              itemY -= (1 - this._itemTmp.anchorY) * this._itemSize.height;
              itemY += (1 - this.content.anchorY) * this.content.height;
              break;

             case cc.Layout.VerticalDirection.BOTTOM_TO_TOP:
              itemY -= this._itemTmp.anchorY * this._itemSize.height;
              itemY += this.content.anchorY * this.content.height;
              itemY *= -1;
            }
            return {
              id: id,
              left: left,
              right: right,
              x: itemX,
              y: itemY
            };
          }
        }
      },
      _calcExistItemPos: function _calcExistItemPos(id) {
        var item = this.getItemByListId(id);
        if (!item) return null;
        var data = {
          id: id,
          x: item.x,
          y: item.y
        };
        if (this._sizeType) {
          data.top = item.y + item.height * (1 - item.anchorY);
          data.bottom = item.y - item.height * item.anchorY;
        } else {
          data.left = item.x - item.width * item.anchorX;
          data.right = item.x + item.width * (1 - item.anchorX);
        }
        return data;
      },
      getItemPos: function getItemPos(id) {
        return this._virtual ? this._calcItemPos(id) : this.frameByFrameRenderNum ? this._calcItemPos(id) : this._calcExistItemPos(id);
      },
      _getFixedSize: function _getFixedSize(listId) {
        if (!this._customSize) return null;
        null == listId && (listId = this._numItems);
        var fixed = 0;
        var count = 0;
        for (var id in this._customSize) if (parseInt(id) < listId) {
          fixed += this._customSize[id];
          count++;
        }
        return {
          val: fixed,
          count: count
        };
      },
      _onScrollBegan: function _onScrollBegan() {
        this._beganPos = this._sizeType ? this.viewTop : this.viewLeft;
      },
      _onScrollEnded: function _onScrollEnded() {
        var t = this;
        if (null != t.scrollToListId) {
          var item = t.getItemByListId(t.scrollToListId);
          t.scrollToListId = null;
          item && item.runAction(new cc.sequence(new cc.scaleTo(.1, 1.06), new cc.scaleTo(.1, 1)));
        }
        t._onScrolling();
        t._slideMode != SlideType.ADHERING || t.adhering ? t._slideMode == SlideType.PAGE && (null != t._beganPos ? this._pageAdhere() : t.adhere()) : t.adhere();
      },
      _onTouchStart: function _onTouchStart(ev, captureListeners) {
        if (this._scrollView._hasNestedViewGroup(ev, captureListeners)) return;
        var isMe = ev.eventPhase === cc.Event.AT_TARGET && ev.target === this.node;
        if (!isMe) {
          var itemNode = ev.target;
          while (null == itemNode._listId && itemNode.parent) itemNode = itemNode.parent;
          this._scrollItem = null != itemNode._listId ? itemNode : ev.target;
        }
      },
      _onTouchUp: function _onTouchUp() {
        var t = this;
        t._scrollPos = null;
        if (t._slideMode == SlideType.ADHERING) {
          t.adhering && (t._adheringBarrier = true);
          t.adhere();
        } else t._slideMode == SlideType.PAGE && (null != t._beganPos ? t._pageAdhere() : t.adhere());
        this._scrollItem = null;
      },
      _onTouchCancelled: function _onTouchCancelled(ev, captureListeners) {
        var t = this;
        if (t._scrollView._hasNestedViewGroup(ev, captureListeners) || ev.simulate) return;
        t._scrollPos = null;
        if (t._slideMode == SlideType.ADHERING) {
          t.adhering && (t._adheringBarrier = true);
          t.adhere();
        } else t._slideMode == SlideType.PAGE && (null != t._beganPos ? t._pageAdhere() : t.adhere());
        this._scrollItem = null;
      },
      _onSizeChanged: function _onSizeChanged() {
        this.checkInited(false) && this._onScrolling();
      },
      _onItemAdaptive: function _onItemAdaptive(item) {
        if (!this._sizeType && item.width != this._itemSize.width || this._sizeType && item.height != this._itemSize.height) {
          this._customSize || (this._customSize = {});
          var val = this._sizeType ? item.height : item.width;
          if (this._customSize[item._listId] != val) {
            this._customSize[item._listId] = val;
            this._resizeContent();
            this.updateAll();
            if (null != this._scrollToListId) {
              this._scrollPos = null;
              this.unschedule(this._scrollToSo);
              this.scrollTo(this._scrollToListId, Math.max(0, this._scrollToEndTime - new Date().getTime() / 1e3));
            }
          }
        }
      },
      _pageAdhere: function _pageAdhere() {
        var t = this;
        if (!t.cyclic && (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0)) return;
        var curPos = t._sizeType ? t.viewTop : t.viewLeft;
        var dis = (t._sizeType ? t.node.height : t.node.width) * t.pageDistance;
        var canSkip = Math.abs(t._beganPos - curPos) > dis;
        if (canSkip) {
          var timeInSecond = .5;
          switch (t._alignCalcType) {
           case 1:
           case 4:
            t._beganPos > curPos ? t.prePage(timeInSecond) : t.nextPage(timeInSecond);
            break;

           case 2:
           case 3:
            t._beganPos < curPos ? t.prePage(timeInSecond) : t.nextPage(timeInSecond);
          }
        } else t.elasticTop <= 0 && t.elasticRight <= 0 && t.elasticBottom <= 0 && t.elasticLeft <= 0 && t.adhere();
        t._beganPos = null;
      },
      adhere: function adhere() {
        var t = this;
        if (!t.checkInited()) return;
        if (t.elasticTop > 0 || t.elasticRight > 0 || t.elasticBottom > 0 || t.elasticLeft > 0) return;
        t.adhering = true;
        t._calcNearestItem();
        var offset = (t._sizeType ? t._topGap : t._leftGap) / (t._sizeType ? t.node.height : t.node.width);
        var timeInSecond = .7;
        t.scrollTo(t.nearestListId, timeInSecond, offset);
      },
      update: function update() {
        if (this.frameByFrameRenderNum <= 0 || this._updateDone) return;
        if (this._virtual) {
          var len = this._updateCounter + this.frameByFrameRenderNum > this.displayItemNum ? this.displayItemNum : this._updateCounter + this.frameByFrameRenderNum;
          for (var n = this._updateCounter; n < len; n++) {
            var data = this.displayData[n];
            data && this._createOrUpdateItem(data);
          }
          if (this._updateCounter >= this.displayItemNum - 1) if (this._doneAfterUpdate) {
            this._updateCounter = 0;
            this._updateDone = false;
            this._doneAfterUpdate = false;
          } else {
            this._updateDone = true;
            this._delRedundantItem();
            this._forceUpdate = false;
            this._calcNearestItem();
            this.slideMode == SlideType.PAGE && (this.curPageNum = this.nearestListId);
          } else this._updateCounter += this.frameByFrameRenderNum;
        } else if (this._updateCounter < this._numItems) {
          var _len = this._updateCounter + this.frameByFrameRenderNum > this._numItems ? this._numItems : this._updateCounter + this.frameByFrameRenderNum;
          for (var _n2 = this._updateCounter; _n2 < _len; _n2++) this._createOrUpdateItem2(_n2);
          this._updateCounter += this.frameByFrameRenderNum;
        } else {
          this._updateDone = true;
          this._calcNearestItem();
          this.slideMode == SlideType.PAGE && (this.curPageNum = this.nearestListId);
        }
      },
      _createOrUpdateItem: function _createOrUpdateItem(data) {
        var item = this.getItemByListId(data.id);
        if (item) {
          if (this._forceUpdate && this.renderEvent) {
            item.setPosition(new cc.v2(data.x, data.y));
            this._resetItemSize(item);
            this.renderEvent && cc.Component.EventHandler.emitEvents([ this.renderEvent ], item, data.id % this._actualNumItems);
          }
        } else {
          var canGet = this._pool.size() > 0;
          item = canGet ? this._pool.get() : cc.instantiate(this._itemTmp);
          if (item._listId != data.id) {
            item._listId = data.id;
            item.setContentSize(this._itemSize);
          }
          item.setPosition(new cc.v2(data.x, data.y));
          this._resetItemSize(item);
          this.content.addChild(item);
          if (canGet && this._needUpdateWidget) {
            var widget = item.getComponent(cc.Widget);
            widget && widget.updateAlignment();
          }
          item.setSiblingIndex(this.content.childrenCount - 1);
          var listItem = item.getComponent(ListItem);
          item.listItem = listItem;
          if (listItem) {
            listItem._list = this;
            listItem._registerEvent();
          }
          this.renderEvent && cc.Component.EventHandler.emitEvents([ this.renderEvent ], item, data.id % this._actualNumItems);
        }
        this._resetItemSize(item);
        this._updateListItem(item.listItem);
        this._lastDisplayData.indexOf(data.id) < 0 && this._lastDisplayData.push(data.id);
      },
      _createOrUpdateItem2: function _createOrUpdateItem2(listId) {
        var item = this.content.children[listId];
        if (item) {
          if (this._forceUpdate && this.renderEvent) {
            item._listId = listId;
            this.renderEvent && cc.Component.EventHandler.emitEvents([ this.renderEvent ], item, listId);
          }
        } else {
          item = cc.instantiate(this._itemTmp);
          item._listId = listId;
          this.content.addChild(item);
          var listItem = item.getComponent(ListItem);
          item.listItem = listItem;
          if (listItem) {
            listItem._list = this;
            listItem._registerEvent();
          }
          this.renderEvent && cc.Component.EventHandler.emitEvents([ this.renderEvent ], item, listId);
        }
        this._updateListItem(item.listItem);
        this._lastDisplayData.indexOf(listId) < 0 && this._lastDisplayData.push(listId);
      },
      _updateListItem: function _updateListItem(listItem) {
        if (!listItem) return;
        if (this.selectedMode > SelectedType.NONE) switch (this.selectedMode) {
         case SelectedType.SINGLE:
          listItem.selected = this.selectedId == listItem.node._listId;
          break;

         case SelectedType.MULT:
          listItem.selected = this.multSelected.indexOf(listItem.node._listId) >= 0;
        }
      },
      _resetItemSize: function _resetItemSize(item) {
        return;
        var size;
      },
      _updateItemPos: function _updateItemPos(listIdOrItem) {
        var item = isNaN(listIdOrItem) ? listIdOrItem : this.getItemByListId(listIdOrItem);
        var pos = this.getItemPos(item._listId);
        item.setPosition(pos.x, pos.y);
      },
      setMultSelected: function setMultSelected(args, bool) {
        var t = this;
        if (!t.checkInited()) return;
        Array.isArray(args) || (args = [ args ]);
        if (null == bool) t.multSelected = args; else {
          var listId, sub;
          if (bool) for (var n = args.length - 1; n >= 0; n--) {
            listId = args[n];
            sub = t.multSelected.indexOf(listId);
            sub < 0 && t.multSelected.push(listId);
          } else for (var _n3 = args.length - 1; _n3 >= 0; _n3--) {
            listId = args[_n3];
            sub = t.multSelected.indexOf(listId);
            sub >= 0 && t.multSelected.splice(sub, 1);
          }
        }
        t._forceUpdate = true;
        t._onScrolling();
      },
      updateItem: function updateItem(args) {
        if (!this.checkInited()) return;
        Array.isArray(args) || (args = [ args ]);
        for (var n = 0, len = args.length; n < len; n++) {
          var listId = args[n];
          var item = this.getItemByListId(listId);
          item && cc.Component.EventHandler.emitEvents([ this.renderEvent ], item, listId % this._actualNumItems);
        }
      },
      updateAll: function updateAll() {
        if (!this.checkInited()) return;
        this.numItems = this.numItems;
      },
      getItemByListId: function getItemByListId(listId) {
        for (var n = this.content.childrenCount - 1; n >= 0; n--) if (this.content.children[n]._listId == listId) return this.content.children[n];
      },
      _getOutsideItem: function _getOutsideItem() {
        var item;
        var result = [];
        for (var n = this.content.childrenCount - 1; n >= 0; n--) {
          item = this.content.children[n];
          this.displayData.find(function(d) {
            return d.id == item._listId;
          }) || result.push(item);
        }
        return result;
      },
      _delRedundantItem: function _delRedundantItem() {
        if (this._virtual) {
          var arr = this._getOutsideItem();
          for (var n = arr.length - 1; n >= 0; n--) {
            var item = arr[n];
            if (this._scrollItem && item._listId == this._scrollItem._listId) continue;
            this._pool.put(item);
            for (var m = this._lastDisplayData.length - 1; m >= 0; m--) if (this._lastDisplayData[m] == item._listId) {
              this._lastDisplayData.splice(m, 1);
              break;
            }
          }
        } else while (this.content.childrenCount > this._numItems) this._delSingleItem(this.content.children[this.content.childrenCount - 1]);
      },
      _delSingleItem: function _delSingleItem(item) {
        item.removeFromParent();
        item.destroy && item.destroy();
        item = null;
      },
      aniDelItem: function aniDelItem(listId, callFunc, aniType) {
        var t = this;
        if (!t.checkInited() || t.cyclic || !t._virtual) return cc.error("This function is not allowed to be called!");
        if (t._aniDelRuning) return cc.warn("Please wait for the current deletion to finish!");
        var item = t.getItemByListId(listId);
        if (!item) {
          callFunc(listId);
          return;
        }
        t._aniDelRuning = true;
        var curLastId = t.displayData[t.displayData.length - 1].id;
        var resetSelectedId = item.listItem.selected;
        item.listItem.showAni(aniType, function() {
          var newId;
          curLastId < t._numItems - 2 && (newId = curLastId + 1);
          if (null != newId) {
            var newData = t._calcItemPos(newId);
            t.displayData.push(newData);
            t._virtual ? t._createOrUpdateItem(newData) : t._createOrUpdateItem2(newId);
          } else t._numItems--;
          if (t.selectedMode == SelectedType.SINGLE) resetSelectedId ? t._selectedId = -1 : t._selectedId - 1 >= 0 && t._selectedId--; else if (t.selectedMode == SelectedType.MULT && t.multSelected.length) {
            var sub = t.multSelected.indexOf(listId);
            sub >= 0 && t.multSelected.splice(sub, 1);
            for (var n = t.multSelected.length - 1; n >= 0; n--) {
              var id = t.multSelected[n];
              id >= listId && t.multSelected[n]--;
            }
          }
          if (t._customSize) {
            t._customSize[listId] && delete t._customSize[listId];
            var newCustomSize = {};
            var size;
            for (var _id in t._customSize) {
              size = t._customSize[_id];
              _id = parseInt(_id);
              newCustomSize[_id - (_id >= listId ? 1 : 0)] = size;
            }
            t._customSize = newCustomSize;
          }
          var sec = .2333;
          var acts, haveCB;
          for (var _n4 = null != newId ? newId : curLastId; _n4 >= listId + 1; _n4--) {
            item = t.getItemByListId(_n4);
            if (item) {
              var posData = t._calcItemPos(_n4 - 1);
              acts = [ new cc.moveTo(sec, new cc.v2(posData.x, posData.y)) ];
              if (_n4 <= listId + 1) {
                haveCB = true;
                acts.push(new cc.CallFunc(function() {
                  t._aniDelRuning = false;
                  callFunc(listId);
                }));
              }
              acts.length > 1 ? item.runAction(new cc.Sequence(acts)) : item.runAction(acts[0]);
            }
          }
          if (!haveCB) {
            t._aniDelRuning = false;
            callFunc(listId);
          }
        }, true);
      },
      scrollTo: function scrollTo(listId, timeInSecond, offset, overStress) {
        var t = this;
        if (!t.checkInited()) return;
        null == timeInSecond ? timeInSecond = .5 : timeInSecond < 0 && (timeInSecond = 0);
        listId < 0 ? listId = 0 : listId >= t._numItems && (listId = t._numItems - 1);
        !t._virtual && t._layout && t._layout.enabled && t._layout.updateLayout();
        var pos = t.getItemPos(listId);
        var targetX, targetY;
        switch (t._alignCalcType) {
         case 1:
          targetX = pos.left;
          targetX -= null != offset ? t.node.width * offset : t._leftGap;
          pos = new cc.v2(targetX, 0);
          break;

         case 2:
          targetX = pos.right - t.node.width;
          targetX += null != offset ? t.node.width * offset : t._rightGap;
          pos = new cc.v2(targetX + t.content.width, 0);
          break;

         case 3:
          targetY = pos.top;
          targetY += null != offset ? t.node.height * offset : t._topGap;
          pos = new cc.v2(0, -targetY);
          break;

         case 4:
          targetY = pos.bottom + t.node.height;
          targetY -= null != offset ? t.node.height * offset : t._bottomGap;
          pos = new cc.v2(0, -targetY + t.content.height);
        }
        var viewPos = t.content.getPosition();
        viewPos = Math.abs(t._sizeType ? viewPos.y : viewPos.x);
        var comparePos = t._sizeType ? pos.y : pos.x;
        var runScroll = Math.abs((null != t._scrollPos ? t._scrollPos : viewPos) - comparePos) > .5;
        if (runScroll) {
          t._scrollPos = comparePos;
          t._scrollToListId = listId;
          t._scrollToEndTime = new Date().getTime() / 1e3 + timeInSecond;
          t._scrollView.scrollToOffset(pos, timeInSecond);
          t._scrollToSo = t.scheduleOnce(function() {
            t._adheringBarrier || (t.adhering = t._adheringBarrier = false);
            t._scrollPos = t._scrollToListId = t._scrollToEndTime = t._scrollToSo = null;
            if (overStress) {
              var item = t.getItemByListId(listId);
              item && item.runAction(new cc.sequence(new cc.scaleTo(.1, 1.05), new cc.scaleTo(.1, 1)));
            }
          }, timeInSecond + .1);
          timeInSecond <= 0 && t._onScrolling();
        }
      },
      _calcNearestItem: function _calcNearestItem() {
        var t = this;
        t.nearestListId = null;
        var data, center;
        t._virtual && t._calcViewPos();
        var vTop, vRight, vBottom, vLeft;
        vTop = t.viewTop;
        vRight = t.viewRight;
        vBottom = t.viewBottom;
        vLeft = t.viewLeft;
        var breakFor = false;
        for (var n = 0; n < t.content.childrenCount && !breakFor; n += t._colLineNum) {
          data = this._virtual ? this.displayData[n] : this._calcExistItemPos(n);
          center = this._sizeType ? (data.top + data.bottom) / 2 : center = (data.left + data.right) / 2;
          switch (this._alignCalcType) {
           case 1:
            if (data.right >= vLeft) {
              this.nearestListId = data.id;
              vLeft > center && (this.nearestListId += this._colLineNum);
              breakFor = true;
            }
            break;

           case 2:
            if (data.left <= vRight) {
              this.nearestListId = data.id;
              vRight < center && (this.nearestListId += this._colLineNum);
              breakFor = true;
            }
            break;

           case 3:
            if (data.bottom <= vTop) {
              this.nearestListId = data.id;
              vTop < center && (this.nearestListId += this._colLineNum);
              breakFor = true;
            }
            break;

           case 4:
            if (data.top >= vBottom) {
              this.nearestListId = data.id;
              vBottom > center && (this.nearestListId += this._colLineNum);
              breakFor = true;
            }
          }
        }
        data = this._virtual ? this.displayData[this.displayItemNum - 1] : this._calcExistItemPos(this._numItems - 1);
        if (data && data.id == t._numItems - 1) {
          center = t._sizeType ? (data.top + data.bottom) / 2 : center = (data.left + data.right) / 2;
          switch (t._alignCalcType) {
           case 1:
            vRight > center && (t.nearestListId = data.id);
            break;

           case 2:
            vLeft < center && (t.nearestListId = data.id);
            break;

           case 3:
            vBottom < center && (t.nearestListId = data.id);
            break;

           case 4:
            vTop > center && (t.nearestListId = data.id);
          }
        }
      },
      prePage: function prePage(timeInSecond) {
        if (!this.checkInited()) return;
        null == timeInSecond && (timeInSecond = .5);
        this.skipPage(this.curPageNum - 1, timeInSecond);
      },
      nextPage: function nextPage(timeInSecond) {
        if (!this.checkInited()) return;
        null == timeInSecond && (timeInSecond = .5);
        this.skipPage(this.curPageNum + 1, timeInSecond);
      },
      skipPage: function skipPage(pageNum, timeInSecond) {
        var t = this;
        if (!t.checkInited()) return;
        if (t._slideMode != SlideType.PAGE) return cc.error("This function is not allowed to be called, Must SlideMode = PAGE!");
        if (pageNum < 0 || pageNum >= t._numItems) return;
        if (t.curPageNum == pageNum) return;
        t.curPageNum = pageNum;
        t.pageChangeEvent && cc.Component.EventHandler.emitEvents([ t.pageChangeEvent ], pageNum);
        t.scrollTo(pageNum, timeInSecond);
      },
      calcCustomSize: function calcCustomSize(numItems) {
        var t = this;
        if (!t.checkInited()) return;
        if (!t._itemTmp) return cc.error("Unset template item!");
        if (!t.renderEvent) return cc.error("Unset Render-Event!");
        t._customSize = {};
        var temp = cc.instantiate(t._itemTmp);
        t.content.addChild(temp);
        for (var n = 0; n < numItems; n++) {
          cc.Component.EventHandler.emitEvents([ t.renderEvent ], temp, n);
          temp.height == t._itemSize.height && temp.width == t._itemSize.width || (t._customSize[n] = t._sizeType ? temp.height : temp.width);
        }
        Object.keys(t._customSize).length || (t._customSize = null);
        temp.removeFromParent();
        temp.destroy && temp.destroy();
        return t._customSize;
      }
    });
    cc._RF.pop();
  }, {
    ListItem: "ListItem"
  } ],
  Main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "909f1lfF59IwKwOGAXybpgj", "Main");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        listV: List,
        listH: List,
        listG: List,
        listG2: List,
        input: cc.EditBox,
        info: cc.Label
      },
      onLoad: function onLoad() {
        this.data = [];
        for (var n = 0; n < 999; n++) this.data.push(n);
        this.listV.numItems = this.data.length;
        this.listH.numItems = this.data.length;
        this.listG.numItems = this.data.length;
        this.listG2.numItems = this.data.length;
      },
      onListVRender: function onListVRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = "ListV\u5f53\u524d\u6e32\u67d3\u603b\u6570 = " + this.listV.displayItemNum;
      },
      onListHRender: function onListHRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = "ListH\u5f53\u524d\u6e32\u67d3\u603b\u6570 = " + this.listH.displayItemNum;
      },
      onListGridRender: function onListGridRender(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = "ListG\u5f53\u524d\u6e32\u67d3\u603b\u6570 = " + this.listG.displayItemNum;
      },
      onListGrid2Render: function onListGrid2Render(item, idx) {
        item.listItem.title.string = this.data[idx];
        this.info.string = "ListG2\u5f53\u524d\u6e32\u67d3\u603b\u6570 = " + this.listG2.displayItemNum;
      },
      onListSelected: function onListSelected(item, selectedId, lastSelectedId, val) {
        if (!item) return;
        var list = item.listItem._list;
        var str = "\u5f53\u524d\u64cd\u4f5cList\u4e3a\uff1a" + list.node.name + "\uff0c\u5f53\u524d\u9009\u62e9\u7684\u662f\uff1a" + selectedId + "\uff0c\u4e0a\u4e00\u6b21\u9009\u62e9\u7684\u662f\uff1a" + lastSelectedId;
        2 == list.selectedMode && (str += "\uff0c\u5f53\u524d\u503c\u4e3a\uff1a" + val);
        console.log(str);
      },
      btnEvent: function btnEvent(ev) {
        var name = ev.target.name;
        var t = this;
        var callFunc = function callFunc(idx) {
          if (null != idx) {
            t.data.splice(idx, 1);
            console.log("------\u5220\u9664\u5b8c\u6bd5\uff01", idx);
            t.listV.numItems = t.data.length;
            t.listH.numItems = t.data.length;
            t.listG.numItems = t.data.length;
            t.listG2.numItems = t.data.length;
          }
        };
        switch (name) {
         case "btn1":
          t.listV.aniDelItem(1, callFunc, 3);
          break;

         case "btn2":
          t.listH.aniDelItem(t.listH.selectedId, callFunc, 0);
          break;

         case "btn3":
          t.listG.aniDelItem(1, callFunc);
          break;

         case "btn4":
          t.listV.scrollTo(parseInt(t.input.string), .5);
          t.listH.scrollTo(parseInt(t.input.string), .5);
          t.listG.scrollTo(parseInt(t.input.string), .5);
          t.listG2.scrollTo(parseInt(t.input.string), .5);
        }
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestAdaptive: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3991bTH395GAJ1iMr9cYFxx", "TestAdaptive");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        list: List,
        avatar1SF: cc.SpriteFrame,
        avatar2SF: cc.SpriteFrame,
        bubble1SF: cc.SpriteFrame,
        bubble2SF: cc.SpriteFrame
      },
      onLoad: function onLoad() {
        this.data = [ {
          type: 3,
          text: "8\u670830\u65e5 1:37"
        }, {
          type: 1,
          text: "\u70e7\u5427\uff0c\u5347\u8d77<color=#cc6600>\u7cdc\u70c2</color>\u7684\u70df\u3002\n\u62bd\u5427\uff0c\u5410\u51fa\u5168\u8eab\u7684\u75b2\u60eb\u3002"
        }, {
          type: 2,
          text: "\u9057\u5fd8\uff0c\u90a3\u4e9b\u7410\u788e\u7684\u4e00\u5207\u3002\n\u8ff7\u60d8\uff0c\u5728\u81ea\u5df1<color=#cc6600>\u865a\u7a7a</color>\u7684\u4e16\u754c\u3002"
        }, {
          type: 3,
          text: "\u6628\u5929 3:17"
        }, {
          type: 1,
          text: "\u4e00\u8d77\u505a\u4e2a<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u7684\u6bd2\u866b\u3002"
        }, {
          type: 2,
          text: "\u7528<color=#cc6600>\u6d88\u8d39</color>\u9ebb\u9189\u81ea\u5df1\u3002"
        }, {
          type: 1,
          text: "\u7528\u79f0\u4f5c<color=#cc6600>\u7269\u8d28\u6b32\u671b</color>\u7684<color=#cc6600>\u9488\u5934</color>\u3002"
        }, {
          type: 2,
          text: "\u6ce8\u5c04<color=#cc6600>\u8d2a\u5a6a</color>\u548c<color=#cc6600>\u6743\u529b</color>\u3002"
        }, {
          type: 3,
          text: "14:55"
        }, {
          type: 1,
          text: "<color=#cc6600>\u78e8\u788e\u4e2d\u4e0b\u9636\u7ea7\u7684\u7c89\u672b\uff0c\n\u5316\u6210\u9ad8\u7eaf\u5ea6\u7684\u4e0a\u6d41\u3002</color>"
        }, {
          type: 1,
          text: "\u6e34\u671b\u91d1\u5b57\u5854\u9876\u7aef\u7684\u5815\u843d<color=#cc6600>\u5931\u5fc3\u75af</color>\uff0c\n\u7684\u4f60\u548c\u6211\u3002"
        }, {
          type: 2,
          text: "\u7684\u4f60\u548c\u6211\u3002"
        }, {
          type: 3,
          text: "23:56"
        }, {
          type: 2,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 1,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 2,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 1,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u7684\u6bd2\u866b\u2014\u2014\uff01"
        }, {
          type: 1,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 2,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 1,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u2014\u2014\uff01"
        }, {
          type: 2,
          text: "<color=#cc6600>\u62dc\u91d1\u4e3b\u4e49</color>\u7684<color=#ff0000><size=28>\u6bd2\u866b</size></color>\u2014\u2014\uff01"
        }, {
          type: 1,
          text: "\u70e7\u5427\uff0c\u5347\u8d77<color=#cc6600>\u7cdc\u70c2</color>\u7684\u70df\u3002\n\u62bd\u5427\uff0c\u5410\u51fa\u5168\u8eab\u7684\u75b2\u60eb\u3002"
        }, {
          type: 3,
          text: "\u8001\u7834\u9ebb - \u6bd2\u866b"
        }, {
          type: 2,
          text: '\u8c22\u8c22\u89c2\u8d4f<img src="37"/><img src="37"/><img src="37"/>'
        }, {
          type: 2,
          text: "\u4e0a\u9762\u7684\u6587\u5b57\u6458\u81ea\u4e00\u9996\u6447\u6eda\u6b4c\u66f2\u2014\u2014<color=#cc6600>\u300a\u6bd2\u866b\u300b</color>\uff0c\u521b\u4f5c\u4e50\u961f\uff1a<color=#cc6600>\u8001\u7834\u9ebb</color>\u3002"
        }, {
          type: 2,
          text: "emmmm...\u6211\u89c9\u5f97\u5199\u7684\u5f88\u597d\uff0c\u5531\u7684\u4e5f\u5f88\u597d\u3002"
        }, {
          type: 2,
          text: "<color=#ff0000><size=28>\u5899\u88c2\u63a8\u8350</size></color>\uff01\uff01\uff01"
        }, {
          type: 1,
          text: "\u55ef\uff0c<color=#cc6600>\u8001\u7834\u9ebb</color>\u662f\u4e00\u652f\u53f0\u6e7e\u4e50\u961f\uff0c\u76ee\u524d\u8fd8\u5f88\u5c0f\u4f17\u3002"
        }, {
          type: 1,
          text: '\u4f46\u7edd\u5bf9\u662f<color=#ff0000><size=28>\u5b9d\u85cf\u4e50\u961f</size></color>\uff01<img src="42"/><img src="42"/><img src="42"/>'
        }, {
          type: 2,
          text: "\u662f\u7684\u6ca1\u9519\uff0c\u4ed6\u4eec\u7684\u98ce\u683c\u56ca\u62ec\u4e86<color=#cc6600>\u6447\u6eda</color>\u3001<color=#cc6600>\u91d1\u5c5e</color>\u3001<color=#cc6600>\u6838</color>\uff0c\u751a\u81f3\u662f<color=#cc6600>BossaNova</color>\u3002"
        }, {
          type: 2,
          text: '\u501f\u7528<color=#cc6600>\u5f20\u4e9a\u4e1c</color>\u8001\u5e08\u7684\u4e00\u53e5\u7ecf\u5178\u53f0\u8bcd\uff1a\u975e\u5e38\u597d\u2014\u2014<img src="15"/><img src="15"/><img src="15"/>'
        }, {
          type: 2,
          text: '\u597d\u4e86\uff0c\u6211\u4eec\u8bf4\u4e00\u4e0b\u8fd9\u4e2a\u7ec4\u4ef6<img src="22"/><img src="22"/>'
        }, {
          type: 1,
          text: '\u8bf4\u6bdb\u7ebf\uff0c\u6709\u6bdb\u7ebf\u597d\u8bf4\u554a\uff0c\u90a3\u4e48\u7b80\u5355\u8c01\u4e0d\u4f1a\u7528\u554a\uff01<img src="20"/><img src="20"/>'
        }, {
          type: 2,
          text: 'okok...<img src="53"/><img src="53"/>'
        }, {
          type: 2,
          text: '\u6709\u95ee\u9898\u53ef\u4ee5\u53bb\u6211\u4eec\u56e2\u961f\u7684Github\u63d0Issues\u3002<img src="39"/><img src="39"/><img src="39"/>'
        }, {
          type: 2,
          text: "\u94fe\u63a5\uff1a\n<u><color=#cc6600>https://github.com/gh-kL/cocoscreator-list</color></u>"
        }, {
          type: 1,
          text: '\u56e2\u4f60\u59b9\u592b\uff01\u5c31\u4e00\u7834\u7ec4\u4ef6<img src="20"/><img src="20"/>\u8fd8\u56e2\u961f\u5462\u6211\u53bb'
        }, {
          type: 2,
          text: "\u3002\u3002\u3002"
        }, {
          type: 2,
          text: '\u522b\u6233\u7a7f\u6211\u561b<img src="27"/><img src="27"/>'
        }, {
          type: 1,
          text: '\u6211tm<img src="39"/><img src="39"/>'
        }, {
          type: 2,
          text: '\u6211\u5e0c\u671b\u8fd9\u4e2a\u7ec4\u4ef6\u5927\u5bb6\u7528\u4e86\u4e4b\u540e\u4f1a\u89c9\u5f97<color=#cc6600>\u771f\u9999</color>\uff0c\u800c\u4e0d\u662f<color=#cc6600>\u771f\u81ed</color><img src="37"/><img src="37"/><img src="37"/>'
        }, {
          type: 1,
          text: '\u6211\u8ddf\u4f60\u8bf4\u5c31\u4f60\u8fd9\u7834\u7ec4\u4ef6\u5403\u67a3\u836f\u4e38<img src="32"/><img src="32"/>'
        }, {
          type: 2,
          text: '\u72d7\u5934\u4fdd\u547d<img src="58"/><img src="58"/><img src="58"/>'
        }, {
          type: 1,
          text: '\u8d70\u4f60\uff01<img src="55"/><img src="55"/><img src="55"/>'
        }, {
          type: 2,
          text: '\u518d\u89c1\u4e86\u60a8\u561e~<img src="29"/><img src="29"/><img src="29"/>'
        } ];
        this.list.numItems = this.data.length;
      },
      onListRender: function onListRender(item, idx) {
        var avatarNode = item.getChildByName("avatarNode");
        var avatar = avatarNode.getComponentInChildren(cc.Sprite);
        var timeNode = item.getChildByName("timeNode");
        var time = timeNode.getComponentInChildren(cc.Label);
        var chatBg = item.getChildByName("chatBg").getComponent(cc.Sprite);
        var chatBgLayout = chatBg.node.getComponent(cc.Layout);
        var richtext = chatBg.node.getComponentInChildren(cc.RichText);
        var data = this.data[idx];
        avatarNode.active = chatBg.node.active = 3 != data.type;
        timeNode.active = 3 == data.type;
        var h;
        var minH = 80;
        var offset = 43;
        switch (data.type) {
         case 1:
          avatarNode.x = -170;
          avatar.spriteFrame = this.avatar1SF;
          chatBg.spriteFrame = this.bubble1SF;
          richtext.node.x = -108;
          richtext.string = data.text;
          chatBgLayout.updateLayout();
          h = chatBg.node.y + chatBg.node.height + offset;
          item.height = h < minH ? minH : h;
          break;

         case 2:
          avatarNode.x = 170;
          avatar.spriteFrame = this.avatar2SF;
          chatBg.spriteFrame = this.bubble2SF;
          richtext.node.x = -122;
          richtext.string = data.text;
          chatBgLayout.updateLayout();
          h = chatBg.node.y + chatBg.node.height + offset;
          item.height = h < minH ? minH : h;
          break;

         case 3:
          time.string = data.text;
          item.height = 60;
        }
      },
      btnPlusEv: function btnPlusEv(ev, data) {
        var times = +data || 1;
        for (var n = 0; n < times; n++) {
          this.data.push(this.data[Math.round(Math.random() * (this.data.length - 1))]);
          this.list.numItems = this.data.length;
        }
        this.list.scrollTo(this.data.length - 1);
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestBag: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f9e8dSA4rFKIYLHZnrxJ36j", "TestBag");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        list: List,
        bagItem: cc.Prefab,
        curPage: cc.Label
      },
      onLoad: function onLoad() {
        this.totalItemNum = 90;
        this.pagePreNum = 16;
        this.pageTotalNum = Math.ceil(this.totalItemNum / this.pagePreNum);
        this.list.numItems = this.pageTotalNum;
        this.onPageChange();
      },
      onListRender: function onListRender(item, idx) {
        if (item.childrenCount) for (var n = 0; n < item.childrenCount; n++) {
          var bi = item.children[n];
          var exactIdx = idx * this.pagePreNum + n;
          bi.getComponentInChildren(cc.Label).string = exactIdx < this.totalItemNum ? exactIdx + 1 : "";
        } else for (var _n = 0; _n < this.pagePreNum; _n++) {
          var _bi = cc.instantiate(this.bagItem);
          item.addChild(_bi);
          var _exactIdx = idx * this.pagePreNum + _n;
          _bi.getComponentInChildren(cc.Label).string = _exactIdx < this.totalItemNum ? _exactIdx + 1 : "";
        }
      },
      onPageChange: function onPageChange(pageNum) {
        var pageN = null == pageNum ? this.list.curPageNum : pageNum;
        this.curPage.string = "\u5f53\u524d\u9875\u6570\uff1a" + (pageN + 1);
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestCyclic: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cf9d05u6sdN8rlYzMX04cDo", "TestCyclic");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        listV: List,
        listV2: List,
        listH: List,
        listH2: List
      },
      onLoad: function onLoad() {
        this.listV.numItems = this.listV2.numItems = this.listH.numItems = this.listH2.numItems = 3;
      },
      onListRender: function onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = idx;
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestFrameByFrame: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "31322F1dwZOVITr8sFd+D7N", "TestFrameByFrame");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        list: List
      },
      onLoad: function onLoad() {
        this.data = [];
        for (var n = 0; n < 20; n++) this.data.push(n);
        this.list.numItems = this.data.length;
      },
      onListRender: function onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = this.data[idx];
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestLack: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "94cd9mzTXdKF4KEA1q+QJff", "TestLack");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        listH: List,
        listV: List
      },
      onLoad: function onLoad() {
        this.data = [];
        for (var n = 0; n < 3; n++) this.data.push(n);
        this.listH.numItems = this.data.length;
        this.listV.numItems = this.data.length;
      },
      onListRender: function onListRender(item, idx) {
        item.listItem.title.string = this.data[idx];
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestPage: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "49ed1UIr7tD8oTfwKSyh6O8", "TestPage");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        list: List,
        input: cc.EditBox
      },
      onLoad: function onLoad() {
        this.data = [];
        for (var n = 0; n < 20; n++) this.data.push(n);
        this.list.numItems = this.data.length;
      },
      onListRender: function onListRender(item, idx) {
        item.listItem.title.string = this.data[idx];
      },
      onListPageNumChange: function onListPageNumChange(pageNum) {
        cc.log("\u5f53\u524d\u662f\u7b2c" + pageNum + "\u9875");
      },
      btnEvent: function btnEvent(ev) {
        var name = ev.target.name;
        var t = this;
        switch (name) {
         case "btn1":
          t.list.prePage(.5);
          break;

         case "btn2":
          t.list.nextPage(.5);
          break;

         case "btn3":
          t.list.skipPage(parseInt(t.input.string), .5);
        }
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ],
  TestWidget: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7fe91UYE/NC3q2E2g83JCEw", "TestWidget");
    "use strict";
    var List = require("List");
    cc.Class({
      extends: cc.Component,
      properties: {
        list: List
      },
      onLoad: function onLoad() {
        this.data = [];
        for (var n = 0; n < 100; n++) this.data.push(n);
        this.list.numItems = this.data.length;
      },
      onListRender: function onListRender(item, idx) {
        item.getComponentInChildren(cc.Label).string = this.data[idx];
      }
    });
    cc._RF.pop();
  }, {
    List: "List"
  } ]
}, {}, [ "List", "ListItem", "Main", "TestAdaptive", "TestBag", "TestCyclic", "TestFrameByFrame", "TestLack", "TestPage", "TestWidget" ]);