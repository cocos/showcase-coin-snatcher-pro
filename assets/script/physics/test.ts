import { _decorator, Component, director, EventKeyboard, Input, input, KeyCode, Node, Quat, Vec2, Vec3 } from 'cc';
import { ColliderManager } from './collider_manager';
const { ccclass, property } = _decorator;

let _tempQuat = new Quat
let _tempVec3 = new Vec3;
let _halfPI = Math.PI * 0.5;

@ccclass('test')
export class test extends Component {
    @property(Node)
    buildNode: Node = null!;

    @property(Node)
    playerNode: Node = null!;

    _moveDir: Vec2 = new Vec2(0, 0);
    _moveSpeed: number = 10;
    _movementVector: Vec3 = new Vec3;

    start () {
        ColliderManager.instance.buildCollider(this.buildNode);
    }


    protected onEnable (): void {
        input.on(Input.EventType.KEY_DOWN, this.keyDown.bind(this));
        input.on(Input.EventType.KEY_UP, this.keyUp.bind(this));
    }

    protected onDisable (): void {
        input.off(Input.EventType.KEY_DOWN, this.keyDown.bind(this));
        input.off(Input.EventType.KEY_UP, this.keyUp.bind(this));
    }

    update (deltaTime: number) {
        this.movePlayer(deltaTime);
        ColliderManager.instance.updatePlayerCollider(this.playerNode, 0.5, null);
    }

    movePlayer (deltaTime: number) {
        if (this._moveDir.equals(Vec2.ZERO)) {
            return;
        }
        this._moveDir.normalize();

        let camera = director.getScene()?.renderScene?.cameras[0];
        if (!camera) {
            return;
        }

        // 根据摄像机的旋转来计算移动方向
        camera.node.getRotation(_tempQuat);
        Vec3.transformQuat(_tempVec3, new Vec3(0, 0, 1), _tempQuat);
        _tempVec3.multiplyScalar(-1);

        let deg = Math.atan2(this._moveDir.y, this._moveDir.x) - _halfPI;
        _tempVec3.y = 0;
        _tempVec3.normalize();

        Vec3.rotateY(this._movementVector, _tempVec3, Vec3.ZERO, deg);

        let moveSpeed = this._moveSpeed * deltaTime;
        this.playerNode.setPosition(this.playerNode.position.x + this._movementVector.x * moveSpeed, this.playerNode.position.y, this.playerNode.position.z + this._movementVector.z * moveSpeed);
    }

    keyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this._moveDir.y = 1;
                break;
            case KeyCode.KEY_S:
                this._moveDir.y = -1;
                break;
            case KeyCode.KEY_A:
                this._moveDir.x = -1;
                break;
            case KeyCode.KEY_D:
                this._moveDir.x = 1;
                break;
        }
    }

    keyUp (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this._moveDir.y = 0;
                break;
            case KeyCode.KEY_S:
                this._moveDir.y = 0;
                break;
            case KeyCode.KEY_A:
                this._moveDir.x = 0;
                break;
            case KeyCode.KEY_D:
                this._moveDir.x = 0;
                break;
        }
    }
}

