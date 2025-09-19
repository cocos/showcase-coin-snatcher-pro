import { MeshRenderer, Node, Vec3 } from "cc";

let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;

const MaxObjects = 10;
const MaxLevel = 8;

/**
 *  转换节点
 */

export class QuadNode {
    type: number = 0;
    node: Node = null!;

    x: number = 0;
    y: number = 0;
    width: number = 0;
    height: number = 0;

    constructor (node: Node) {
        this.node = node;
    }
}

export class QuadRectNode extends QuadNode {
    constructor (node: Node) {
        super(node);

        node.getWorldPosition(_tempVec3);
        node.getWorldScale(_tempVec3_2);

        // 旋转的话需要反转xz的scale
        if (node.eulerAngles.y == 90) {
            let sx = _tempVec3_2.x;
            _tempVec3_2.x = _tempVec3_2.z;
            _tempVec3_2.z = sx;
        }

        this.x = _tempVec3.x;
        this.y = _tempVec3.z;
        this.width = _tempVec3_2.x;
        this.height = _tempVec3_2.z;
    }
}

export class QuadCircleNode extends QuadNode {
    constructor (node: Node) {
        super(node);
        this.type = 1;
        node.getWorldPosition(_tempVec3);

        this.x = _tempVec3.x;
        this.y = _tempVec3.z;
        this.width = node.worldScale.x / 2;
        this.height = node.worldScale.x / 2;
    }

}

/**
 * 四叉树，如果是3维的话，可以使用八叉树
 */
export class Quadtree {
    constructor (bounds: { x: number, y: number, width: number, height: number }, level = 0) {
        this.bounds = bounds;
        this.level = level;
    }
    bounds: { x: number, y: number, width: number, height: number };   // [minX, minZ, maxX, maxZ]
    children: Quadtree[] = [];
    objects: QuadRectNode[] = [];
    level: number = 0;

    public buildRectNode (root: Node) {
        // 如果没有collider的话，则使用meshRender来计算aabb
        let colliders = root.getComponentsInChildren(MeshRenderer);
        colliders.forEach((collider) => {
            if (collider.node.active) {
                let quadNode = new QuadRectNode(collider.node);
                this.insert(quadNode, this);
            }
        });
    }

    /**
     * 分割包围盒
     * @param root 
     * @returns 
     */
    public splitQuadBox (root: Quadtree) {
        var nextLevel = root.level + 1,
            subWidth = root.bounds.width / 2,
            subHeight = root.bounds.height / 2,
            x = root.bounds.x,
            y = root.bounds.y;

        //top right node
        root.children[0] = new Quadtree({
            x: x + subWidth / 2,
            y: y - subHeight / 2,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //top left node
        root.children[1] = new Quadtree({
            x: x - subWidth / 2,
            y: y - subHeight / 2,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //bottom left node
        root.children[2] = new Quadtree({
            x: x - subWidth / 2,
            y: y + subHeight / 2,
            width: subWidth,
            height: subHeight
        }, nextLevel);

        //bottom right node
        root.children[3] = new Quadtree({
            x: x + subWidth / 2,
            y: y + subHeight / 2,
            width: subWidth,
            height: subHeight
        }, nextLevel);
    }

    /**
     * 检索
     * @param rect 
     * @param root 
     * @returns 
     */
    public retrieve (rect: { x: number, y: number, width: number, height: number }, root: Quadtree = this) {
        var indexes = this.getIndex(rect, root),
            returnObjects = root.objects;

        //if we have subnodes, retrieve their objects
        if (root.children.length) {
            for (var i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(root.children[indexes[i]].retrieve(rect));
            }
        }

        //remove duplicates
        returnObjects = returnObjects.filter(function (item, index) {
            return returnObjects.indexOf(item) >= index;
        });

        return returnObjects;
    }


    /**
     * 动态插入节点
     * @param node 
     * @param type 
     * @param root 
     */
    public insert (quadNode: QuadNode, root: Quadtree = this) {
        var i = 0,
            indexes;

        //if we have subnodes, call insert on matching subnodes
        if (root.children.length) {
            indexes = this.getIndex(quadNode, root);

            for (i = 0; i < indexes.length; i++) {
                this.insert(quadNode, root.children[indexes[i]]);
            }
            return;
        }

        //otherwise, store object here
        root.objects.push(quadNode);

        //max_objects reached
        if (root.objects.length > MaxObjects && root.level < MaxLevel) {

            //split if we don't already have subnodes
            if (!root.children.length) {
                this.splitQuadBox(root);
            }

            //add all objects to their corresponding subnode
            for (i = 0; i < root.objects.length; i++) {
                indexes = this.getIndex(root.objects[i], root);
                for (var k = 0; k < indexes.length; k++) {
                    this.insert(root.objects[i], root.children[indexes[k]]);
                }
            }

            //clean up this node
            root.objects = [];
        }
    }

    /**
     * 动态删除节点
     * @param node 
     * @param root 
     */
    public remove (node: QuadNode, root: Quadtree = this) {
        let index = root.objects.indexOf(node)
        if (index != -1) {
            root.objects.splice(index, 1);
        }

        root.children.forEach((quatTreeBox) => {
            this.remove(node, quatTreeBox);
        })
    }

    /**
     * 清除所有节点
     * @param root 
     */
    public clear (root: Quadtree = this) {
        root.objects = [];
        for (var i = 0; i < root.children.length; i++) {
            if (root.children.length) {
                this.clear(root.children[i]);
            }
        }
        root.children = [];
    };

    /**
     * 获取节点所在的区域索引
     * @param pRect 
     * @param root 
     * @returns 
     */
    public getIndex (pRect: { x: number, y: number, width: number, height: number }, root: Quadtree = this) {
        var indexes = [],
            verticalMidpoint = root.bounds.x,
            horizontalMidpoint = root.bounds.y;

        var startIsNorth = pRect.y - pRect.height / 2 < horizontalMidpoint,
            startIsWest = pRect.x - pRect.width / 2 < verticalMidpoint,
            endIsEast = pRect.x + pRect.width / 2 > verticalMidpoint,
            endIsSouth = pRect.y + pRect.height / 2 > horizontalMidpoint;

        //top-right quad
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }

        //top-left quad
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }

        //bottom-left quad
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }

        //bottom-right quad
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }

        return indexes;
    };
}