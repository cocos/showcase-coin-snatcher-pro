import { _decorator, Node, Component, Animation, sp, Label, Color } from 'cc';
import { UIManager } from '../../framework/uiManager';
import { Constant } from '../../framework/constant';
import { GobeUtil, WIFI_TYPE } from '../../core/gobeUtil';
import { PlayerData } from '../../framework/playerData';
import { ClientEvent } from '../../framework/clientEvent';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
import { Util } from '../../framework/util';

const { ccclass, property } = _decorator;
const LANGUAGE_LABEL_COLOR = {
    NONE: new Color(255, 255, 255),
    CHOOSE: new Color(0, 0, 0),
}
@ccclass('StartPanel')
export class StartPanel extends Component {
    @property(Node)
    loadingNodeEn: Node = null!;

    @property(Node)
    loadingNodeZh: Node = null!;

    // @property(sp.Skeleton)

    @property(Node)
    btnNode: Node = null!;

    @property(Node)
    btnNodeHw: Node = null!;

    @property(Animation)
    loadAni: Animation = null!;

    @property(Node)
    dotNode: Node = null!;

    @property(Node)
    changeLanguageNode: Node = null!;

    @property(Label)
    public languageZhLabel: Label = null!;

    @property(Label)
    public languageEnLabel: Label = null!;

    startSk: sp.Skeleton = null!;
    private _isClick: boolean = false;

    show () {
        this._initLanguage();

        this.loadAni.node.active = false;
        this.loadAni.stop();

        this.startSk.setAnimation(0, 'start', false);
        this.startSk.addAnimation(0, 'idle', true);

        this.btnNode.active = false;
        this.btnNodeHw.active = false;
        this.changeLanguageNode.active = false;

        setTimeout(() => {
            this.changeLanguageNode.active = true;
            this.btnNode.active = true;

            if (GobeUtil.instance.isHwInit) {
                this.btnNodeHw.active = true;
            }
        }, 1500);

        if (!GobeUtil.instance.isHwInit) {
            GobeUtil.instance.initHuawei();
        }
    }

    protected onEnable (): void {
        ClientEvent.on(Constant.EVENT_NAME.HUAWEI_LOGIN_MSG, this._initSuccess, this);
    }

    protected onDisable (): void {
        ClientEvent.off(Constant.EVENT_NAME.HUAWEI_LOGIN_MSG, this._initSuccess, this);
    }

    private _initSuccess (code: number, msg: string) {
        // 账号登录
        if (code == Constant.HUAWEI_LOGIN.SIGN_IN_SUCCESS) {
            GobeUtil.instance.isHwLogin = true;
            this._loginGame();
        } else if (code == Constant.HUAWEI_LOGIN.INIT_SUCCESS) {
            // 华为初始化
            this.btnNodeHw.active = true;
        }
        else if (code == Constant.HUAWEI_LOGIN.INIT_UNDER_AGE) {
        }
        else if (code == Constant.HUAWEI_LOGIN.INIT_ERROR) {
        }
        else if (code == Constant.HUAWEI_LOGIN.SIGN_IN_ERROR) {
            UIManager.instance.showTips(Constant.ROOM_TIPS.HUA_WEI_LOAGIN_ERROR);
            this.loadAni.node.active = false;
            this.loadAni.stop();
            this._isClick = false;
        }
    }

    /**
     * 开始游戏
     * 
     * @returns 
     */
    public onStartGameHW () {
        if (this._isClick) {
            return;
        }

        this._isClick = true;

        this.loadAni.node.active = true;
        this.loadAni.play();

        GobeUtil.instance.hwSignIn();
    }

    /**
     * 开始游戏
     * 
     * @returns 
     */
    public onStartGame () {
        if (this._isClick) {
            return;
        }

        this._isClick = true;

        this.loadAni.node.active = true;
        this.loadAni.play();
        this._loginGame();
    }

    /**
     * 登录游戏
     */
    private _loginGame () {
        if (!GobeUtil.instance.isChangeWifiType) {
            GobeUtil.instance.createRoomAI(() => {
                UIManager.instance.showDialog(Constant.PANEL_NAME.READY);
            }, () => {
                UIManager.instance.showTips(Constant.ROOM_TIPS.CREATE_ROOM_ERROR);
            });
        } else {
            // 登录
            var playerId: string = PlayerData.instance.playerInfo['playerId'];
            GobeUtil.instance.initSDK(playerId, (successInit: boolean) => {
                if (successInit) {
                    UIManager.instance.showDialog(Constant.PANEL_NAME.SELECT_GAME);
                    UIManager.instance.hideDialog(Constant.PANEL_NAME.START_GAME);
                } else {
                    UIManager.instance.showTips(Constant.ROOM_TIPS.LOGIN_GAME_ERROR);
                }

                this.loadAni.node.active = false;
                this.loadAni.stop();
                this._isClick = false;
            });
        }
    }

    private _initLanguage () {
        let ndDotPos = this.dotNode.position;
        if (i18n._language === Constant.I18_LANGUAGE.ENGLISH) {
            this.dotNode.setPosition(27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.NONE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;

            this.loadingNodeEn.active = true;
            this.loadingNodeZh.active = false;
            //@ts-ignore
            this.startSk = this.loadingNodeEn.getComponent(sp.Skeleton);
        } else {
            this.dotNode.setPosition(-27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.NONE;

            this.loadingNodeEn.active = false;
            this.loadingNodeZh.active = true;
            //@ts-ignore
            this.startSk = this.loadingNodeZh.getComponent(sp.Skeleton);
        }

    }

    public changeLanguage () {
        let ndDotPos = this.dotNode.position;
        let nowLanguage;
        if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
            nowLanguage = Constant.I18_LANGUAGE.ENGLISH;

            this.dotNode.setPosition(27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.NONE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;

            this.loadingNodeEn.active = true;
            this.loadingNodeZh.active = false;
            //@ts-ignore
            this.startSk = this.loadingNodeEn.getComponent(sp.Skeleton);
            this.startSk.addAnimation(0, 'idle', true);
        } else {
            nowLanguage = Constant.I18_LANGUAGE.CHINESE;

            this.dotNode.setPosition(-27, ndDotPos.y, ndDotPos.z);

            this.languageZhLabel.color = LANGUAGE_LABEL_COLOR.CHOOSE;
            this.languageEnLabel.color = LANGUAGE_LABEL_COLOR.NONE;

            this.loadingNodeEn.active = false;
            this.loadingNodeZh.active = true;
            //@ts-ignore
            this.startSk = this.loadingNodeZh.getComponent(sp.Skeleton);
            this.startSk.addAnimation(0, 'idle', true);
        }

        i18n.init(nowLanguage);
        i18n.updateSceneRenderers();
        var staticId = PlayerData.instance.playerInfo["playerName"];
        Util.randomName(staticId).then((playerName: string) => {
            PlayerData.instance.updatePlayerInfo("playerName", playerName);
        })
    }
}

