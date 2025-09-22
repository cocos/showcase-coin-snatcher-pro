import { MathBase, MeshRenderer, Node, Vec2, Vec3 } from "cc";
import { QuadNode, QuadRectNode, Quadtree } from "./quad_tree";

let _tempVec3 = new Vec3
/**
 * 碰撞管理器 
 */
export class ColliderManager {
    private static _instance: ColliderManager;

    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new ColliderManager();
        return this._instance;
    }

    private _quadTree: Quadtree;
    private _playersNode: Node[] = [];
    private _itemCollider: Function | null = null;

    constructor () {
        this._quadTree = new Quadtree({ x: 0, y: 0, width: 160, height: 120 });
    }

    /**
     * 构造四叉树
     * @param node 
     */
    buildCollider (node: Node) {
        this._quadTree.clear();
        let colliders = node.getComponentsInChildren(MeshRenderer);
        colliders.forEach((collider) => {
            if (collider.node.active) {
                let quadNode = new QuadRectNode(collider.node);
                this._quadTree.insert(quadNode);
            }
        });
    }

    /**
     * 插入道具
     * @param nodes 
     */
    public insertItem (node: QuadNode) {
        this._quadTree.insert(node);
    }

    public removeItem (node: QuadNode | undefined) {
        if (!node) {
            return;
        }
        this._quadTree.remove(node);
    }

    /**
     * 如果玩家需要相互碰撞，需要添加到这里
     */
    public addPlayer (node: Node) {
        this._playersNode.push(node);
    }


    /**
     * 绑定物品碰撞回掉（应该写派发事件，这里简单处理一下
     */
    public bindItemCollider (callBack: Function) {
        this._itemCollider = callBack;
    }

    /**
     * 判断区域是否为空
     * @param circle 
     * @returns 
     */
    public checkRectIsEmpty (circle: { x: number, y: number, radius: number }) {
        let rect = { x: circle.x, y: circle.y, width: circle.radius, height: circle.radius };
        let colliders = this._quadTree.retrieve(rect);

        for (let i = 0; i < colliders.length; i++) {
            if (colliders[i].type == 1) {
                let result = this.circleWithCircel(rect, colliders[i]);
                if (result.collided) {
                    return false;
                }
            } else {
                let result = this.circleWithRect(rect, colliders[i]);
                if (result.collided) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 更新玩家坐标并检测碰撞
     * @param node 
     * @param radius 
     */
    public updatePlayerCollider (node: Node, radius: number, info: any) {
        node.getWorldPosition(_tempVec3);

        let quadNode = new QuadRectNode(node);
        quadNode.width = radius;

        // 处理静态物体的碰撞
        let colliders = this._quadTree.retrieve(quadNode);

        // 需要排序一下，离玩家最近的排在前面
        colliders.sort((o1: any, o2: any) => {
            return Math.pow(o1.x - quadNode.x, 2)
                + Math.pow(o1.y - quadNode.y, 2)
                - Math.pow(o2.x - quadNode.x, 2)
                - Math.pow(o2.y - quadNode.y, 2);
        });

        for (let i = 0; i < colliders.length; i++) {
            if (colliders[i].type == 1) {
                let result = this.circleWithCircel(quadNode, colliders[i]);

                // 派发道具碰撞消息
                if (result.collided && this._itemCollider) {
                    this._itemCollider(colliders[i], node, info);
                }
            } else {
                let result = this.circleWithBoxNode(quadNode, colliders[i].node);
                if (result.collided) {
                    quadNode.y += result.penetrationY!;
                    quadNode.x += result.penetrationX!;
                }
            }
        }

        // 处理玩家之间的碰撞(玩家会频繁修改位置，不进入八叉树)
        for (let i = 0; i < this._playersNode.length; i++) {
            if (node == this._playersNode[i]) {
                continue;
            }
            let circle2 = { x: this._playersNode[i].worldPosition.x, y: this._playersNode[i].worldPosition.z, width: radius };
            let result = this.circleWithCircel(quadNode, circle2);
            if (result.collided) {
                quadNode.x += result.penetrationX!;
                quadNode.y += result.penetrationY!;

                // 派发人物碰撞消息
            }
        }

        // 设置人物新坐标
        node.setWorldPosition(quadNode.x, _tempVec3.y, quadNode.y);
    }

    /**
     * 判断圆和有方向的矩形的碰撞
     * @param circle 
     * @param node 
     * @returns 
     */
    public circleWithBoxNode (circle: { x: number, y: number, width: number }, node: Node) {
        let rect = { x: node.worldPosition.x, y: node.worldPosition.z, width: node.worldScale.x, height: node.worldScale.z };

        // 如果有方向
        if (node.eulerAngles.y != 0) {
            let out = new Vec2(circle.x - rect.x, circle.y - rect.y);
            let radians = node.eulerAngles.y * (Math.PI / 180);
            out.rotate(radians);

            let result = this.circleWithRect({ x: out.x, y: out.y, width: circle.width }, { x: 0, y: 0, width: rect.width, height: rect.height });
            if (result.collided) {
                out.set(result.penetrationX, result.penetrationY);
                out.rotate(-radians)
                return { collided: true, penetrationX: out.x, penetrationY: out.y };
            }
        } else {
            return this.circleWithRect(circle, rect);
        }

        return { collided: false }

    }

    // 判断圆和矩形是否碰撞，并计算渗入向量
    public circleWithRect (circle: { x: number, y: number, width: number }, rect: { x: number, y: number, width: number, height: number }) {
        const radius = circle.width;
        // 计算矩形半宽和半高
        const halfRectWidth = rect.width / 2;
        const halfRectHeight = rect.height / 2;

        // 计算矩形的中心点
        const rectCenterX = rect.x;
        const rectCenterY = rect.y;

        // 计算圆心到矩形中心的向量
        const deltaX = circle.x - rectCenterX;
        const deltaY = circle.y - rectCenterY;

        // 计算圆心到矩形中心的距离
        const distanceX = Math.abs(deltaX) - halfRectWidth;
        const distanceY = Math.abs(deltaY) - halfRectHeight;

        if (distanceX <= radius && distanceY <= radius) {
            // 发生碰撞

            // 计算渗入向量 
            let penetrationX = radius - distanceX;
            let penetrationY = radius - distanceY;
            if (deltaX < 0) {
                penetrationX = -penetrationX;
            }
            if (deltaY < 0) {
                penetrationY = -penetrationY;
            }

            if (Math.abs(penetrationX) >= Math.abs(penetrationY)) {
                penetrationX = 0
            } else {
                penetrationY = 0;
            }

            return { collided: true, penetrationX, penetrationY };
        }

        return { collided: false };
    }

    // 判断两个圆是否碰撞，并计算渗入向量
    public circleWithCircel (circle1: { x: number, y: number, width: number }, circle2: { x: number, y: number, width: number }) {
        // 计算两个圆心之间的距离
        const deltaX = circle2.x - circle1.x;
        const deltaY = circle2.y - circle1.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 如果圆心距离小于两个圆的半径之和，发生碰撞
        if (distance < circle1.width + circle2.width) {

            // 计算碰撞点的坐标
            const collisionX = circle1.x + (deltaX / distance) * circle1.width;
            const collisionY = circle1.y + (deltaY / distance) * circle1.width;

            // 计算渗入向量
            const penetrationX = (circle1.x - collisionX) + (circle2.x - collisionX);
            const penetrationY = (circle1.y - collisionY) + (circle2.y - collisionY);

            return { collided: true, collisionX, collisionY, penetrationX, penetrationY };
        }

        return { collided: false };
    }

}