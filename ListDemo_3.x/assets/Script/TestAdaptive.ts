/******************************************
 * @author kL <klk0@qq.com>
 * @date 2020/12/9
 * @doc TestAdaptive.
 * @end
 ******************************************/
import { _decorator, Node, Component, Label, SpriteFrame, RichText, Layout, Sprite, Vec3, UITransform } from 'cc';
import List from './List';
const { ccclass, property } = _decorator;

@ccclass('TestAdaptive')
export class TestAdaptive extends Component {
    //列表
    @property(List)
    list: List = null;
    @property(SpriteFrame)
    avatar1SF: SpriteFrame = null;
    @property(SpriteFrame)
    avatar2SF: SpriteFrame = null;
    @property(SpriteFrame)
    bubble1SF: SpriteFrame = null;
    @property(SpriteFrame)
    bubble2SF: SpriteFrame = null;
    data: any;

    onLoad() {
        this.data = [
            {
                type: 3,
                text: '8月30日 1:37'
            },
            {
                type: 1,
                text: '烧吧，升起<color=#cc6600>糜烂</color>的烟。\n抽吧，吐出全身的疲惫。'
            },
            {
                type: 2,
                text: '遗忘，那些琐碎的一切。\n迷惘，在自己<color=#cc6600>虚空</color>的世界。'
            },
            {
                type: 3,
                text: '昨天 3:17'
            },
            {
                type: 1,
                text: '一起做个<color=#cc6600>拜金主义</color>的毒虫。'
            },
            {
                type: 2,
                text: '用<color=#cc6600>消费</color>麻醉自己。'
            },
            {
                type: 1,
                text: '用称作<color=#cc6600>物质欲望</color>的<color=#cc6600>针头</color>。'
            },
            {
                type: 2,
                text: '注射<color=#cc6600>贪婪</color>和<color=#cc6600>权力</color>。'
            },
            {
                type: 3,
                text: '14:55'
            },
            {
                type: 1,
                text: '<color=#cc6600>磨碎中下阶级的粉末，\n化成高纯度的上流。</color>'
            },
            {
                type: 1,
                text: '渴望金字塔顶端的堕落<color=#cc6600>失心疯</color>，\n的你和我。'
            },
            {
                type: 2,
                text: '的你和我。'
            },
            {
                type: 3,
                text: '23:56'
            },
            {
                type: 2,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 1,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 2,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 1,
                text: '<color=#cc6600>拜金主义</color>的毒虫——！'
            },
            {
                type: 1,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 2,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 1,
                text: '<color=#cc6600>拜金主义</color>——！'
            },
            {
                type: 2,
                text: '<color=#cc6600>拜金主义</color>的<color=#ff0000><size=28>毒虫</size></color>——！'
            },
            {
                type: 1,
                text: '烧吧，升起<color=#cc6600>糜烂</color>的烟。\n抽吧，吐出全身的疲惫。'
            },
            {
                type: 3,
                text: '老破麻 - 毒虫'
            },
            {
                type: 2,
                text: '谢谢观赏<img src="37"/><img src="37"/><img src="37"/>'
            },
            {
                type: 2,
                text: '上面的文字摘自一首摇滚歌曲——<color=#cc6600>《毒虫》</color>，创作乐队：<color=#cc6600>老破麻</color>。'
            },
            {
                type: 2,
                text: 'emmmm...我觉得写的很好，唱的也很好。'
            },
            {
                type: 2,
                text: '<color=#ff0000><size=28>墙裂推荐</size></color>！！！'
            },
            {
                type: 1,
                text: '嗯，<color=#cc6600>老破麻</color>是一支台湾乐队，目前还很小众。'
            },
            {
                type: 1,
                text: '但绝对是<color=#ff0000><size=28>宝藏乐队</size></color>！<img src="42"/><img src="42"/><img src="42"/>'
            },
            {
                type: 2,
                text: '是的没错，他们的风格囊括了<color=#cc6600>摇滚</color>、<color=#cc6600>金属</color>、<color=#cc6600>核</color>，甚至是<color=#cc6600>BossaNova</color>。'
            },
            {
                type: 2,
                text: '借用<color=#cc6600>张亚东</color>老师的一句经典台词：非常好——<img src="15"/><img src="15"/><img src="15"/>'
            },
            {
                type: 2,
                text: '好了，我们说一下这个组件<img src="22"/><img src="22"/>'
            },
            {
                type: 1,
                text: '说毛线，有毛线好说啊，那么简单谁不会用啊！<img src="20"/><img src="20"/>'
            },
            {
                type: 2,
                text: 'okok...<img src="53"/><img src="53"/>'
            },
            {
                type: 2,
                text: '有问题可以去我们团队的Github提Issues。<img src="39"/><img src="39"/><img src="39"/>'
            },
            {
                type: 2,
                text: '链接：\n<u><color=#cc6600>https://github.com/gh-kL/cocoscreator-list</color></u>'
            },
            {
                type: 1,
                text: '团你妹夫！就一破组件<img src="20"/><img src="20"/>还团队呢我去'
            },
            {
                type: 2,
                text: '。。。'
            },
            {
                type: 2,
                text: '别戳穿我嘛<img src="27"/><img src="27"/>'
            },
            {
                type: 1,
                text: '我tm<img src="39"/><img src="39"/>'
            },
            {
                type: 2,
                text: '我希望这个组件大家用了之后会觉得<color=#cc6600>真香</color>，而不是<color=#cc6600>真臭</color><img src="37"/><img src="37"/><img src="37"/>'
            },
            {
                type: 1,
                text: '我跟你说就你这破组件吃枣药丸<img src="32"/><img src="32"/>'
            },
            {
                type: 2,
                text: '狗头保命<img src="58"/><img src="58"/><img src="58"/>'
            },
            {
                type: 1,
                text: '走你！<img src="55"/><img src="55"/><img src="55"/>'
            },
            {
                type: 2,
                text: '再见了您嘞~<img src="29"/><img src="29"/><img src="29"/>'
            },
        ];

        this.list.numItems = this.data.length;
    }

    onListRender(item: any, idx: number) {
        let itemUt: UITransform = item.getComponent(UITransform);
        let avatarNode: Node = item.getChildByName('avatarNode');
        let avatar: Sprite = avatarNode.getComponentInChildren(Sprite);
        let timeNode: Node = item.getChildByName('timeNode');
        let timeLayout: Layout = timeNode.getComponent(Layout);
        let time: Label = timeNode.getComponentInChildren(Label);
        let chatBg: Sprite = item.getChildByName('chatBg').getComponent(Sprite);
        let chatBgUt: UITransform = chatBg.node.getComponent(UITransform);
        let chatBgLayout: Layout = chatBg.node.getComponent(Layout);
        let richtext: RichText = chatBg.node.getComponentInChildren(RichText);

        let data = this.data[idx];

        avatarNode.active = chatBg.node.active = data.type != 3;
        timeNode.active = data.type == 3;

        let h: number;
        let minH: number = 80;
        let offset: number = 43;

        switch (data.type) {
            case 1://对方
                avatarNode.setPosition(new Vec3(-170, -40));
                avatar.spriteFrame = this.avatar1SF;
                chatBg.spriteFrame = this.bubble1SF;
                richtext.node.setPosition(new Vec3(-108, -7));
                richtext.string = `<color=#030303>${data.text}</c>`;
                chatBgLayout.updateLayout();
                h = chatBg.node.getPosition().y + chatBgUt.height + offset;
                itemUt.height = h < minH ? minH : h;
                break;
            case 2://我方
                avatarNode.setPosition(new Vec3(170, -40));
                avatar.spriteFrame = this.avatar2SF;
                chatBg.spriteFrame = this.bubble2SF;
                richtext.node.setPosition(new Vec3(-122, -7));
                richtext.string = `<color=#030303>${data.text}</c>`;
                chatBgLayout.updateLayout();
                h = chatBg.node.getPosition().y + chatBgUt.height + offset;
                itemUt.height = h < minH ? minH : h;
                break;
            case 3://时间 或 其他啥的
                time.string = data.text;
                itemUt.height = 60;
                // 下面这两行，因为3.0.0Preview的缺陷，逼不得已才加的，等到正式版出来，应该就不用了
                time.updateRenderData(true);
                timeLayout['_doLayout']();
                break;
        }
    }
    //按钮事件
    btnPlusEv(ev: Event, data: any) {
        let times: number = +data || 1;
        for (let n: number = 0; n < times; n++) {
            this.data.push(this.data[Math.round(Math.random() * (this.data.length - 1))]);
            this.list.numItems = this.data.length;
        }
        this.list.scrollTo(this.data.length - 1);
    }

}
