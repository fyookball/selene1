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

import java.net.Socket;

import java.util.List; 
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;


import net.freehaven.tor.control.TorControlConnection;
import net.freehaven.tor.control.TorControlCommands;

@CapacitorPlugin(name = "Torboar")
public class TorboarPlugin extends Plugin {

    private TorControlConnection torControlConn;
    private static final String TAG = "Torboar";
    private static final String TOR_SOCKS_PORT = "9050";
    private static final String TOR_CONTROL_PORT = "9051";
    private Socket controlSocket;

    private File torDataDir;
    
    
    private void initTorControl() throws IOException {
    
    // Connect if not already initialized
    if (torControlConn != null) return;

    // Create socket
    controlSocket = new Socket("127.0.0.1", Integer.parseInt(TOR_CONTROL_PORT));
    
    // Create instance for Tor Control object
    torControlConn = new TorControlConnection(controlSocket);
    torControlConn.launchThread(true);
    torControlConn.authenticate(new byte[0]); // Uses no password
}


   
private void waitForTorBootstrap(Process torProcess) throws IOException {
  
    // Get stdout from tor
    BufferedReader reader = new BufferedReader(new InputStreamReader(torProcess.getInputStream()));
    String line;
    while ((line = reader.readLine()) != null) {
        Log.d(TAG, "Tor output: " + line);
        // Look for bootstrap completed message
        if (line.contains("Bootstrapped 100%")) {
            Log.d(TAG, "Tor bootstrapped successfully.");
            break;
        }
    }
}


@PluginMethod
public void createNewCircuit(PluginCall call) {
    try {
        initTorControl();

        OutputStream out = controlSocket.getOutputStream();
        InputStream in = controlSocket.getInputStream();

        // Send EXTENDCIRCUIT command with 0 to create new circuit.
        String cmd = "EXTENDCIRCUIT 0\r\n";
        out.write(cmd.getBytes());
        out.flush();

        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        String line;
        String circuitId = null;

        while ((line = reader.readLine()) != null) {
            Log.d(TAG, "Tor response: " + line);

            if (line.startsWith("250 EXTENDED")) {
                // Expected: 250 EXTENDED <CircuitID>
                String[] parts = line.split(" ");
                if (parts.length >= 3) {
                    circuitId = parts[2];
                    break;
                }
            } else if (line.startsWith("5") || line.startsWith("51") || line.startsWith("552")) {
                throw new IOException("Error from Tor control: " + line);
            }
        }

        if (circuitId == null) {
            call.reject("Failed to receive circuit ID");
            return;
        }

        Log.d(TAG, "Created new circuit: " + circuitId);
        JSObject ret = new JSObject();
        ret.put("circuitId", circuitId);
        call.resolve(ret);

    } catch (Exception e) {
        Log.e(TAG, "Failed to create circuit", e);
        call.reject("Circuit creation failed: " + e.getMessage());
    }
}



@PluginMethod
public void makeRequestThroughCircuit(PluginCall call) {
    String circuitKey = call.getString("circuitKey", "default");
    String url = call.getString("url", "http://check.torproject.org/");

    Log.d(TAG, "Making request using circuitKey: " + circuitKey + " to URL: " + url);

    new Thread(() -> {
        try {
            // Use SOCKS5 proxy with custom auth for circuit isolation
            Proxy proxy = new Proxy(Proxy.Type.SOCKS,
                    new InetSocketAddress("127.0.0.1", Integer.parseInt(TOR_SOCKS_PORT)));

            // Circuit setup via SOCKS credentials
            System.setProperty("socksProxyHost", "127.0.0.1");
            System.setProperty("socksProxyPort", TOR_SOCKS_PORT);
            System.setProperty("java.net.socks.username", circuitKey);
            System.setProperty("java.net.socks.password", "pass_" + circuitKey);

            OkHttpClient client = new OkHttpClient.Builder()
                    .proxy(proxy)
                    .build();

            Request request = new Request.Builder()
                    .url(url)
                    .build();

            Response response = client.newCall(request).execute();
            String body = response.body().string();

            Log.d(TAG, "Circuit request response:\n" + body);

            JSObject ret = new JSObject();
            ret.put("response", body);
            call.resolve(ret);

        } catch (Exception e) {
            Log.e(TAG, "Circuit request failed", e);
            call.reject("Request through circuit failed: " + e.getMessage());

        } finally {
            System.clearProperty("java.net.socks.username");
            System.clearProperty("java.net.socks.password");
        }
    }).start();
}



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
                    "--SocksPort", TOR_SOCKS_PORT + " IsolateSOCKSAuth",
                    "--ControlPort", TOR_CONTROL_PORT,
                    "--DataDirectory", torDataDir.getAbsolutePath(),
                    "--Log", "notice stdout"
            );

            processBuilder.redirectErrorStream(true);
            Process torProcess = processBuilder.start();

            Log.d(TAG, "Tor process started, waiting for bootstrap...");
            waitForTorBootstrap(torProcess);
            JSObject ret = new JSObject();
            ret.put("message", "Tor started and bootstrapped");
            call.resolve(ret);


        } catch (Exception e) {
            Log.e(TAG, "Error starting Tor", e);
            call.reject("Tor startup failed: " + e.getMessage());
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
        String responseBody = response.body().string();

        Log.d(TAG, "Response from Tor HTTP request:\n" + responseBody);

        return responseBody;
        
        } catch (IOException e) {
            Log.e(TAG, "Tor request failed", e);
            return "Failed to fetch data through Tor: " + e.getMessage();
        }
    }
}

