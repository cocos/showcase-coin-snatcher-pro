
const win = window as any;

export const languages = {
    "downOffPanel": {
        "title": "重新登录",
        "tip": "已掉线请重新登录",
    },
    "joinRoomPanel": {
        "title": "加入房间",
        "input": "请输入房间号"
    },
    "matchPanel": {
        "title": "自由匹配",
    },
    "messagePanel": {
        "voiceTxt": "语音录入中",
    },
    "tipPanel": {
        "title": "确认退出房间？",
    },
};

if (!win.languages) {
    win.languages = {};
}

win.languages.zh = languages;