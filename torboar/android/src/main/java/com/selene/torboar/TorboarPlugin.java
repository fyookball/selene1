package com.selene.torboar;

import android.util.Log;
import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;


import net.freehaven.tor.control.TorControlConnection;
import net.freehaven.tor.control.TorControlCommands;

@CapacitorPlugin(name = "Torboar")
public class TorboarPlugin extends Plugin {

    private static final String TAG = "Torboar";
    private static final String TOR_SOCKS_PORT = "9050";
    private static final String TOR_CONTROL_PORT = "9051";

    private File torDataDir;

    @Override
    public void load() {
        super.load();
        Log.d(TAG, "TorboarPlugin.load() called");

        torDataDir = new File(getContext().getFilesDir(), "tor_data");

        try {
            System.loadLibrary("tor"); // Explicitly load libtor.so
            Log.d(TAG, "Successfully loaded libtor.so");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load libtor.so: " + e.getMessage());
        }
    }

    @PluginMethod
    public void startTor(PluginCall call) {
        Log.d(TAG, "startTor() method called");

        new Thread(() -> {
            try {
                File torBinary = new File(getContext().getApplicationInfo().nativeLibraryDir, "libtor.so");
                Log.d(TAG, "Looking for Tor binary at: " + torBinary.getAbsolutePath());

                if (!torBinary.exists()) {
                    Log.e(TAG, "Tor binary NOT found at: " + torBinary.getAbsolutePath());
                    call.reject("Tor binary not found.");
                    return;
                } else {
                    Log.d(TAG, "Tor binary FOUND at: " + torBinary.getAbsolutePath());
                }

                ProcessBuilder processBuilder = new ProcessBuilder(
                        torBinary.getAbsolutePath(),
                        "--RunAsDaemon", "1",
                        "--SocksPort", TOR_SOCKS_PORT,
                        "--ControlPort", TOR_CONTROL_PORT,
                        "--DataDirectory", torDataDir.getAbsolutePath()
                );

                processBuilder.redirectErrorStream(true);
                processBuilder.start();

                Log.d(TAG, "Tor process started, waiting...");
                Thread.sleep(5000); // Wait for Tor to spin up

                String result = makeTorRequest();
                JSObject ret = new JSObject();
                ret.put("message", result);
                call.resolve(ret);

            } catch (Exception e) {
                Log.e(TAG, "Error starting Tor", e);
                call.reject("Tor startup failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        Log.d(TAG, "Echo called with value: " + value);
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
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
        String responseBody = response.body().string();

        Log.d(TAG, "Response from Tor HTTP request:\n" + responseBody);

        return responseBody;
        
        } catch (IOException e) {
            Log.e(TAG, "Tor request failed", e);
            return "Failed to fetch data through Tor: " + e.getMessage();
        }
    }
}

