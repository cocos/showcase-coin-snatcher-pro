package com.cocos.service;

import org.cocos2dx.okhttp3.Call;
import org.cocos2dx.okhttp3.Callback;
import org.cocos2dx.okhttp3.MediaType;
import org.cocos2dx.okhttp3.OkHttpClient;
import org.cocos2dx.okhttp3.Request;
import org.cocos2dx.okhttp3.RequestBody;
import org.cocos2dx.okhttp3.Response;
import org.json.JSONObject;


import java.io.IOException;
import java.util.Date;

public class Statistics {
    private static final String URL = "https://k.cocos.org/";
    private static final String APP_TYPE_KEY = "appType";
    private static final String APP_TYPE_VALUE = "hwsdk";
    private static final String REPORT_TYPE_KEY = "reportType";
    private static final String REPORT_TYPE_VALUE = "Start";
    private static final String SDK_NAME_KEY = "sdkName";
    private static final String APP_ID_KEY = "appId";
    private static final String TIME_KEY = "time";

    private static final String VERSION_KEY = "version";

    private static final MediaType JSON_MEDIA_TYPE = MediaType.parse("application/json; charset=utf-8");

    /**
     * Executes an asynchronous POST request.
     *
     * @param url  the URL to post to
     * @param json the JSON object to post
     * @param callback the callback to handle the response or failure
     */
    public static void executePostRequest(String url, JSONObject json, Callback callback) {
        OkHttpClient client = new OkHttpClient();

        // Convert JSON object to string
        String jsonString = json.toString();

        // Create request body with the JSON payload
        RequestBody requestBody = RequestBody.create(JSON_MEDIA_TYPE, jsonString);

        // Build the request
        Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();

        // Asynchronously send the request and notify callback with the response or if an error occurred
        client.newCall(request).enqueue(callback);
    }

    public static void report(String sdkName,String version, String appId) {
        try {
            // 创建 JSON 对象
            JSONObject json = new JSONObject();
            json.put(APP_TYPE_KEY, APP_TYPE_VALUE);
            json.put(REPORT_TYPE_KEY, REPORT_TYPE_VALUE);
            json.put(SDK_NAME_KEY, sdkName);
            json.put(APP_ID_KEY, appId);
            json.put(VERSION_KEY, version);
            json.put(TIME_KEY, System.currentTimeMillis());
            executePostRequest(URL, json, new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    // Handle the error
                    e.printStackTrace();
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (response.isSuccessful()) {
                        // Handle the successful response
                        String responseBody = response.body().string();
                        // System.out.println(responseBody);
                    } else {
                        // Handle the error
                        System.out.println("Unexpected response code: " + response.code());
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}