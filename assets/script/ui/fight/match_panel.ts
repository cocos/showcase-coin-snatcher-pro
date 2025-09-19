import { _decorator, Component, Label } from 'cc';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'
import { Constant } from '../../framework/constant';

const { ccclass, property } = _decorator;

@ccclass('MatchPanel')
export class MatchPanel extends Component {
    @property(Label)
    txtTip: Label = null!;

    private _matchTime: number = 0;
    private _lbList: Array<string> = [];

    show () {
        i18n.updateSceneRenderers();

        if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
            this._lbList[0] = "当前等待时长为";
            this._lbList[1] = "秒"
        } else {
            this._lbList[0] = "The current wait duration is";
            this._lbList[1] = "s"
        }
        this._matchTime = 0;
    }

    protected update (dt: number): void {
        this._matchTime += dt;



        this.txtTip.string = this._lbList[0] + Math.floor(this._matchTime) + this._lbList[1]
    }

}

