# List

这是一个基于**Cocos Creator**写的**虚拟列表**组件。本组件是配合 Cocos Creator 本身的**滚动窗结构**去写的，所以在编辑器中操作会很方便，**所见即所得**。

在线 DEMO：

[主示例](https://gh-kl.github.io/cocoscreator-list/web-mobile/index.html "主DEMO")
[页面模式示例](https://gh-kl.github.io/cocoscreator-list/web-mobile-page/index.html "页面模式示例")
[背包示例](https://gh-kl.github.io/cocoscreator-list/web-mobile-bag/index.html "背包示例")
[聊天列表示例](https://gh-kl.github.io/cocoscreator-list/web-mobile-chat-list/index.html "聊天列表示例")

Cocos 论坛帖子链接：

> https://forum.cocos.com/t/dc/79055

## 本组件支持：

- 所有类型布局。（单列、单行、网格，甚至各种花式 RIGHT_TO_LEFT、BOTTOM_TO_TOP）
- 分帧渲染。
- 循环列表。
- 选择模式。（单选、多选）
- 滑动模式。（普通、粘附、分页）
- 自定义 Item 的宽/高。（用来做**聊天列表**再适合不过）
- 动态删除 Item 项。
- ...

Last test by ccc_v2.2.1

我的邮箱：klk0@qq.com

## 使用说明

1. 在编辑器中，创建一个**ScrollView**（也就是**ScrollView->Mask->Content**这样层级结构的节点！）。
2. 将 `List` 组件挂载到**ScrollView**节点上。
3. 设置**模板 Item**，选择 `TemplateType` ，可切换**模板类型**，请按需选择。
4. 设置**滑动模式（ `SlideMode` ）**， `NORMAL=通常` ， `ADHERING=粘附` ， `PAGE=分页` ，三选一。
5. 设置是否为**虚拟列表（ `Virtual` ）**，默认为 `true` ，意思是仅在可视范围内渲染 `Item` 。反之，如果为 `false` ，则会渲染所有数量的 Item，一般不推荐这么做，但凡事总有个万一，所以预留了。
6. 可选设置**逐帧渲染（ `FrameByFrameRenderNum` ）**，该数量为**每帧渲染的数量**。
7. 设置**渲染器（ `RenderEvent` ）**，在**View**中写一个函数，将该函数指向**RenderEvent**，运行时，设置 List 数量，Item 将会**通过该函数进行回调**，开发者在该函数中实现**Item 的刷新**。
8. 可选设置**选择模式（ `SelectedMode` ）**，选择模式有 `SINGLE（单选）` 、 `MULT（多选）` 两种模式，须与 `ListItem` 组件搭配使用， `ListItem` 组件需要拖拽到**模板 Item**上。在**View**中写一个函数，将该函数指向 `SelectedEvent` ，运行时，当**选择变更**，将会通过该函数**回调**。

> 在**View**中，若是**单选**模式，用 `list.selectedId=Number` 来改变**当前选择**。若是**多选**模式，则调用 `list.setMultSelected(args, boolean)` 接口来设置多选数据。

9. 完成以上设置后，在**View**中调用 `list.numItems=Number` 设置列表数量，本组件就会通过**渲染器（即 `RenderEvent` ）**进行**回调**了！

## 小贴士

1. 每一个 `Item-Node` 都会被赋值一个 `_listId` ，即该 `Item` 在 `List` 中的 `下标` 。假如你的 `Item` 是个 `按钮` ，在该 `按钮` 的 `回调事件` 中，通过 `event.currentTarget._listId` 就能取得该 `Item的下标` 了，这非常方便。（ `TS版` 比较特殊， 通过 `event.currentTarget['_listId']` 来获得。）
2. 在**View**中设置 `list.customSize` 以达到**每个 Item 宽度或高度不一样**的**虚拟列表**效果，简直美滋滋！但这个会**耗费更多性能！仅支持虚拟列表！仅支持单列或单行**！

## 注意

1. 本组件所依赖的**ScrollView 节点**、**Mask 节点**以及**Content 节点**，这三个节点的**锚点**需要**按方向**去设置。比如**从顶到底单列排列**，就需要设置锚点为（0.5, 1）。如果是**从左到右网格排列**，就需要设置锚点为（0, 1）。始终将锚点设置到**首个 Item**那一边。
2. 理论上**设为虚拟列表后不可再设回普通列表**（即 `virtual` 属性）。
3. SlideMode 设为 `ADHERING（粘附）` 或 `PAGE（页面）` 后，组件将**强行屏蔽惯性滚动**。
4. 设为`循环列表`时，`Content`的`cc.Layout`的`边缘距离（top/bottom/left/right）`要设置成与`spacingX/Y（间距）`一样。`（因为在循环列表中，边距=间距）`。

## 新功能预告

- 下拉刷新。
- 循环列表`PAGE`版。

## 已知问题

- `PAGE`模式下，目前是靠`pageDistance`变量来控制`翻页响应距离`，如果滚动窗口很小，玩家拖动时一次性能拖（翻）1 页以上，那就会存在问题。

## 更新日志

### 2019/12/23

- 修复使用`循环列表+单/多选模式`时，`选择回调事件`的参数可能会超过`numItems（或数据数组长度）`的 BUG。
- 修复示例项目`Main.scene`的报错。

### 2019/12/16

示例项目升级至 ccc_v2.2.1。

- 适配`cc.Widget`。
- 新增`TestWidget.scene`示例场景。
- 新增`循环列表`功能，即`cyclic`属性。（目前仅支持单行/单列）
  > 设为循环列表时，Content 的 cc.Layout 边缘距离（top/bottom/left/right）要设置成与 spacingX/Y（间距）一样。（因为在循环列表中，边距=间距）。
- 新增`TestCyclic.scene`示例场景。

### 2019/11/21

- 新增`LakeSlide` 属性。当该属性为 `true` ，Item 数量不足以填满`Content`时，也可以滑动。（默认为`false`，与`LakeCenter`属性相斥）

### 2019/11/18

- 修复`ListItem`可能会丢失事件的 BUG。

### 2019/11/9

示例项目升级至 ccc_v2.2.0。

- 修复`List`销毁时，`对象池中的Item`未执行销毁的 BUG。
- 修复`PAGE`模式下，滑动翻页可能会跳页异常的 BUG。
- 修复`模板Item`可能被误销毁的 BUG。
- 修复当`List`节点的`Size`改变时，`List`未刷新的 BUG。

> - ccc_v2.2.0 的 cc.ScrollView 有个 BUG，就是滑动时，惯性滚动到边缘没有回弹效果，这不是本组件的问题，等待官方更新修复。
> - 这个组件我也是佛系更新，只要官方的新版本不魔改，一般来说都是向上兼容的。

### 2019/9/27

- 新增`背包`示例场景（`TestBag.scene`）。

### 2019/9/24

- TS 版， `模板Item` 取消强制挂载 `ListItem` ，现可通过 `item['_listId']` 来获取 `Item下标` 。
- 新增`单选模式`下 `repeatEventSingle` 属性，为 `true` 时，可重复触发相同的单选事件。
- 修复滑动 `ScollView` 时，鼠标拖到 `ScollView` 之外，会中止滚动的 BUG。
- 修复 `SlideMode` 为 `PAGE` 或 `ADHERING` 时，滚动 `ScollView` 容易卡住的 BUG。

### 2019/8/31

- 新增 `TestCustomSize` 场景例子，着重演示如何用本组件实现 `聊天列表` 。
- 优化局部代码，提升一丁点效率。
- 将 `updateAppointed` 接口更名为 `updateItem` 。
- 新增 `updateAll()` 接口。

### 2019/7/20

- 新增 `LakeCenter` 属性。当该属性为 `true` ，Item 数量不足以填满`Content`时，会居中显示所有 Item。（不支持 `GRID` 布局）
- 新增 `calcCustomSize` 接口，方便开发者计算 `CustomSize` 。（如果模板 Item 的结构较复杂，建议还是在外部自行计算）
- 修复反方向布局，Item 数量过少时，会向正方向对齐的 BUG。

### 2019/6/15

- 滑动模式新增 `PAGE` 模式，用来做分页效果，可自定义翻页滑动响应距离（ `pageDistance` ）。建议不要再用 `ADHERING` 模式去实现分页效果。关于 `PAGE` 模式下的接口： `list.prePage(timeInSecond)` 、 `list.nextPage(timeInSecond)` 、 `list.skipPage(pageNum, timeInSecond)` ，分别是上一页、下一页、跳转到指定页数。
- 优化效率。

### 2019/6/7

- 新增 TS 版本。

### 2019/5/28

- 优化效率。

### 2019/5/27

- 修复滑动模式为吸附（ADHERING）时，还未吸附到目标点时，点击滚动窗，再松开，会吸附失败的 BUG。
- 独立吸附接口 `list.adhere()` ，可外部调用，不限滑动模式。

### 2019/5/23

- 支持 `BOTTOM_TO_TOP` ， `RIGHT_TO_LEFT` 布局。需要注意：各种反方向排列的布局（ `BOTTOM_TO_TOP` 、 `RIGHT_TO_LEFT` ）都会有问题（item 数量过少，就会导致 Content 错位），这个是官方问题。而本组件是配合 `cc.ScrollView` 去写的，所以也不支持，待官方后续优化（Last test by Creator_v2.1.1）。如果 Item 数量很多，那么可以使用。

### 2019/5/21

- 单列布局时支持自定义指定 Item 的 height。单行布局时支持自定义指定 Item 的 width。通过 `list.customSize = {0:100, 1:130, 5:120, ...}` 来设置，其中 key 为 Item 的 ID，value 为 height/width，没有找到该 Item 的 customSize 将会与模板 ItemSize 一致。

### 2019/5/16

- 新增 List 的配套组件---- `ListItem` 。
- 新增选择模式。

### 2019/5/13

- 新增带动画删除 Item 接口 `list.aniDelItem(id, callFunc, aniType)` ，因本组件毕竟还是数据驱动，所以请务必在 callFunc 中删除数据数组中相应下标的数据，然后手动更新该 list（即 `list.numItems=Number` ）。
