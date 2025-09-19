import { _decorator, Component } from 'cc';
import { UIManager } from '../../framework/uiManager';
import { Constant } from '../../framework/constant';
import { GobeUtil } from '../../core/gobeUtil';
import * as i18n from '../../../../extensions/i18n/assets/LanguageData'

const { ccclass, property } = _decorator;

@ccclass('DownOffPanel')
export class DownOffPanel extends Component {

    show () {
        i18n.updateSceneRenderers();
    }

    onCancel () {
        GobeUtil.instance.leaveGame();
        UIManager.instance.showTransition(Constant.SCENE_NAME.SLECT)
    }
}

