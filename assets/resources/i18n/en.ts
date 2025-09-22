
const win = window as any;

export const languages = {
    "downOffPanel": {
        "title": "log in again",
        "tip": "Disconnected please log in again",
    },
    "joinRoomPanel": {
        "title": "Join the room",
        "input": "Please enter the room number"
    },
    "matchPanel": {
        "title": "Free matching",
    },
    "messagePanel": {
        "voiceTxt": "Voice input",
    },
    "tipPanel": {
        "title": "Check out of the room?"
    },
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;