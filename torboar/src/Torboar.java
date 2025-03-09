package com.selene.torboar;

import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@CapacitorPlugin(name = "Torboar")
public class Torboar extends Plugin {

    private static final String TAG = "Torboar";
    private static final String TOR_SOCKS_PORT = "9050";
    private static final String TOR_CONTROL_PORT = "9051";

    private File torDataDir;

    @Override
    public void load() {
        super.load();
        // Optional: Initialize your Tor data directory here if needed
        torDataDir = new File(getContext().getFilesDir(), "tor_data");

        try {
            System.loadLibrary("tor"); // Explicitly load libtor.so
            Log.d(TAG, "successfully loaded libtor.so");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "failed to load libtor.so: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startTor(PluginCall call) {
        // Start the Tor process in the background
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    File torBinary = new File(getContext().getApplicationInfo().nativeLibraryDir, "libtor.so");
                    Log.d(TAG, "looking for Tor binary at: " + torBinary.getAbsolutePath());

                    if (!torBinary.exists()) {
                        Log.e(TAG, "tor binary NOT found at: " + torBinary.getAbsolutePath());
                        call.reject("tor binary not found.");
                        return;
                    } else {
                        Log.d(TAG, "tor binary FOUND at: " + torBinary.getAbsolutePath());
                    }

                    // Start the Tor process
                    ProcessBuilder processBuilder = new ProcessBuilder(
                            torBinary.getAbsolutePath(),
                            "--RunAsDaemon", "1",
                            "--SocksPort", TOR_SOCKS_PORT,
                            "--ControlPort", TOR_CONTROL_PORT,
                            "--DataDirectory", torDataDir.getAbsolutePath()
                    );

                    processBuilder.redirectErrorStream(true);
                    processBuilder.start();

                    // Wait a few seconds  
                    Thread.sleep(5000);  // maybe wait more?

                    // Make a request through Tor
                    String result = makeTorRequest();

                    // Return result to JavaScript
                    JSObject ret = new JSObject();
                    ret.put("message", result);
                    call.resolve(ret);

                } catch (Exception e) {
                    Log.e(TAG, "error starting tor", e);
                    call.reject("tor startup failed: " + e.getMessage());
                }
            }
        }).start();
    }

    private String makeTorRequest() {
        try {
            OkHttpClient client = new OkHttpClient.Builder()
                    .proxy(new Proxy(Proxy.Type.SOCKS, new InetSocketAddress("127.0.0.1", Integer.parseInt(TOR_SOCKS_PORT))))
                    .build();

            Request request = new Request.Builder()
                    .url("http://check.torproject.org")
                    .build();

            Response response = client.newCall(request).execute();
            return response.body().string();

        } catch (IOException e) {
            Log.e(TAG, "tor request failed", e);
            return "failed to fetch data through Tor: " + e.getMessage();
        }
    }
}

