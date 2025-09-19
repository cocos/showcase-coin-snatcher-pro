import { _decorator, Component, Label } from 'cc';
import { UIManager } from '../../framework/uiManager';
import { Constant } from '../../framework/constant';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

@ccclass('TipPanel')
export class TipPanel extends Component {
    @property(Label)
    txtTip: Label = null!;

    private _callback: Function = null!;


    show (tip: string, callback: Function) {
        i18n.updateSceneRenderers();

        this.txtTip.string = tip;
        this._callback = callback;
    }

    onOk () {
        if (this._callback) {
            this._callback();
        }

        UIManager.instance.hideDialog(Constant.PANEL_NAME.TIP_PANEL);
    }

    onCancel () {
        UIManager.instance.hideDialog(Constant.PANEL_NAME.TIP_PANEL);
    }
}

