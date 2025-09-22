package com.cocos.game;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.util.Log;

import androidx.annotation.NonNull;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;
import com.huawei.game.dev.gdp.android.sdk.api.PgsMoment;
import com.huawei.game.dev.gdp.android.sdk.api.bean.InstantPublishBean;
import com.huawei.game.dev.gdp.android.sdk.api.bean.MomentInitParam;
import com.huawei.game.dev.gdp.android.sdk.api.bean.Response;
import com.huawei.game.dev.gdp.android.sdk.api.callback.CheckSceneIdCallback;
import com.huawei.game.dev.gdp.android.sdk.api.callback.InstantPublishCallback;
import com.huawei.game.dev.gdp.android.sdk.api.callback.PgsInitCallback;
import com.huawei.game.dev.gdp.android.sdk.api.callback.PgsOpenCallback;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;

public class ForumPage {

    private static Activity _activity = null;

    private static String TAG = "ForumPage";

    private static ForumPage _instanse = null;

    private static String SCENE_ID = "SCENE_ID"; // 需要手动更改

    public static ForumPage getInstanse(){
        if(_instanse == null){
            _instanse = new ForumPage();
        }

        return _instanse;
    }

    public void init(Activity activity){
        this._activity = activity;
    }

    /**
     * 初始化社区
     */
    public static void startPgs(){
        // 应用APP ID
        String appId = "appId"; // 需要手动更改
        // 游戏应用在AGC项目中的客户端ID
        String clientId = "clientId"; // 需要手动更改
        // 游戏应用在AGC项目中的客户端密钥
        String clientSecret = "clientSecret"; // 需要手动更改
        // 内嵌社区的打开方向，此处以竖屏方向为例
        int orientation = ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE;
        PgsMoment.init(new MomentInitParam(_activity, appId, clientId, clientSecret, "", orientation),
                new PgsInitCallback() {
                    @Override
                    public void onSuccess(Response rsp) {
                        // 初始化成功
                        Log.e(TAG, "RtnCode: " + rsp.getRtnCode() + "; Msg: " + rsp.getMsg());

                        CocosHelper.runOnGameThread(new Runnable() {
                            @Override
                            public void run() {
                                CocosJavascriptJavaBridge.evalString("window.callbackToStartPgs()");
                            }
                        });
                    }
                    @Override
                    public void onFailure(Response rsp) {
                        // 初始化失败
                        Log.e(TAG, "RtnCode: " + rsp.getRtnCode() + "; Msg: " + rsp.getMsg());
                    }
                });
    }

    /**
     * 打开内嵌社区
     */
    public static void openForumPage() {
        PgsMoment.open(new PgsOpenCallback() {
            @Override
            public void onSuccess(Response rsp) {
                // 成功打开内嵌社区
                Log.e(TAG, "RtnCode: " + rsp.getRtnCode() + "; Msg: " + rsp.getMsg());
            }
            @Override
            public void onFailure(Response rsp) {
                // 打开内嵌社区失败
                Log.e(TAG, "RtnCode: " + rsp.getRtnCode() + "; Msg: " + rsp.getMsg());
            }
        });
    }

    /**
     * 检查入口： 攻略
     */
    public static void checkScene(){
        // 检查入口ID
        PgsMoment.checkScene(SCENE_ID, new CheckSceneIdCallback() {
            @Override
            public void onSuccess(String s, int i) {
                if (i == CheckSceneIdCallback.CHECK_STATUS_VALID) {
                    // 场景有效
                    openScene(SCENE_ID);
                } else {
                    // 场景无效, 请检查管理台数据
                    Log.e(TAG, "RtnCode: " + i);
                }
            }

            @Override
            public void onFailure(String s, Response response) {
                // 获取场景状态失败
                Log.e(TAG, "RtnCode: " + response.getRtnCode() + "; Msg: " + response.getMsg());
            }
        });
    }

    /**
     * 打开： 攻略
     */
    public static void openScene(String sceneId){
        // 跳转场景
        PgsMoment.openScene(sceneId, new PgsOpenCallback() {
            @Override
            public void onSuccess(Response response) {
                // 场景跳转成功
            }

            @Override
            public void onFailure(Response response) {
                // 场景跳转失败
                Log.e(TAG, "RtnCode: " + response.getRtnCode() + "; Msg: " + response.getMsg());
            }
        });
    }

    /**
     * 分享
     */
    public static void publish(){
        String[] paths = new String[]{};
        String content = "moment content";
        InstantPublishBean bean = new InstantPublishBean(paths, content);
        PgsMoment.publish(bean, new InstantPublishCallback() {
            @Override
            public void onSuccess(Response response) {
                // 发布成功
            }

            @Override
            public void onFailure(Response response) {
                // 发布失败
                Log.e(TAG, "RtnCode: " + response.getRtnCode() + "; Msg: " + response.getMsg());
            }
        });
    }


}

