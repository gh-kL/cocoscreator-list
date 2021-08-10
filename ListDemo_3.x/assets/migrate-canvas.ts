/**
 * UI 的渲染在 v3.0 变为使用 node.layer 来判断可见性，为了保证老版本项目升级后表现一致，
 * Creator 会在运行时动态分配一个未使用的 layer 给常驻节点的 UI，避免常驻节点的 UI 与场景中
 * 的其他 UI 的 layer 发生冲突，当你确定不会发生冲突时，你可以移除此脚本.
 * 
 * UI rendering has changed in v3.0 to use node.layer to determine visibility. 
 * To ensure consistent performance after upgrading old projects. 
 * Creator will dynamically assign an unused layer to the UI node in the persist node at 
 * runtime to avoid conflicts between the layer of UI in the persist node and the 
 * layer of other UI in the scene. You can remove this script when you 
 * are sure there is no conflict
 */

import { _decorator, Node, director, Director, game, BaseNode, Canvas, Camera } from 'cc';
import { EDITOR } from 'cc/env';

const customLayerMask = 0x000fffff;
const builtinLayerMask = 0xfff00000;

director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    const roots = director.getScene()?.children as BaseNode[];
    let allCanvases = director.getScene()?.getComponentsInChildren(Canvas) as Canvas[];
    if (allCanvases.length <= 1) return;
    allCanvases = allCanvases.filter(x => !!x.cameraComponent);
    
    let allCameras = director.getScene()?.getComponentsInChildren(Camera) as Camera[];
    let usedLayer = 0;
    allCameras.forEach(x => usedLayer |= (x.visibility & customLayerMask));

    const persistCanvas: Canvas[] = [];
    for (let i = 0, l = roots.length; i < l; i++) {
        const root = roots[i];
        if (!game.isPersistRootNode(root)) continue;
        const canvases = root.getComponentsInChildren(Canvas);
        if (canvases.length === 0) continue;
        persistCanvas.push(...canvases.filter(x => !!x.cameraComponent));
    }

    persistCanvas.forEach((val) => {
        const isLayerCollided = allCanvases.find(x => x !== val && (x.cameraComponent!.visibility & val.cameraComponent!.visibility & customLayerMask));
        if (isLayerCollided) {
            const availableLayers = ~usedLayer;
            const lastAvailableLayer = availableLayers & ~(availableLayers - 1);
            val.cameraComponent!.visibility = lastAvailableLayer | (val.cameraComponent!.visibility & builtinLayerMask);
            setChildrenLayer(val.node, lastAvailableLayer);
            usedLayer |= availableLayers;
        }
    });
});

function setChildrenLayer (node: Node, layer: number) {
    for (let i = 0, l = node.children.length; i < l; i++) {
        node.children[i].layer = layer;
        setChildrenLayer(node.children[i], layer);
    }
}

let setParentEngine = Node.prototype.setParent;

if(!EDITOR) {
    Node.prototype.setParent = function(value, keepWorldTransform) {
        setParentEngine.call(this, value, keepWorldTransform);
        if (!value) return;
        // find canvas
        let layer = getCanvasCameraLayer(this);
        if (layer) {
            this.layer = layer;
            setChildrenLayer(this, layer);
        }
    }
}

function getCanvasCameraLayer (node: Node) {
    let layer = 0;
    let canvas = node.getComponent(Canvas);
    if (canvas && canvas.cameraComponent) {
        if (canvas.cameraComponent.visibility & canvas.node.layer) {
            layer = canvas.node.layer;
        } else {
            layer = canvas.cameraComponent.visibility & ~(canvas.cameraComponent.visibility - 1);
        }
        return layer;
    }
    if (node.parent) {
        layer = getCanvasCameraLayer(node.parent);
    }
    return layer;
}