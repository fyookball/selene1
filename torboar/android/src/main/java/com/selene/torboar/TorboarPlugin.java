package com.selene.torboar;

import android.util.Log;
import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSArray;


import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.net.Socket;

import java.util.HashMap;
import java.util.List; 
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.SocketException;


import net.freehaven.tor.control.TorControlConnection;
import net.freehaven.tor.control.TorControlCommands;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
  


@CapacitorPlugin(name = "Torboar")
public class TorboarPlugin extends Plugin {

    // Global "context" for secp
    private static long secpCtx;
    
    private TorControlConnection torControlConn;
    private static final String TAG = "Torboar";
    private static final String TOR_SOCKS_PORT = "9050";
    private static final String TOR_CONTROL_PORT = "9051";
    private Socket controlSocket;

    private File torDataDir;

    // These are for TCP stuff (not TOR)
    private Socket tcpSocket;
    private OutputStream tcpOut;
    private InputStream tcpIn;
    //-------
  
    static {
    System.loadLibrary("secp256k1"); // This matches libsecp256k1.so
    }

    private static String toHex(byte[] data) {  
    StringBuilder sb = new StringBuilder();
    for (byte b : data) {
        sb.append(String.format("%02x", b & 0xFF));
    }
    return sb.toString();
}
 
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


// Declare the native methods 
private native long createSecp256k1Context();

public native HashMap<String, Object> secp256k1EcPubkeyParse(
    long ctx,
    byte[] pubkeyOut,
    byte[] input,
    int inputLen
);

public native HashMap<String, Object> secp256k1EcPubkeyCombine(
    long ctx,
    byte[] outputBuf,
    byte[] inputBuf1,
    byte[] inputBuf2
);

private native void secp256k1EcPubkeySerialize(
    long ctx,
    byte[] inputBytes,
    int flags,
    int[] result,
    int[] outputLen,
    byte[] output
);


 public native HashMap<String, Object> secp256k1EcPubkeyTweakMul(
    long ctx,
    byte[] inputPubkey,
    byte[] scalar
);

 
 @PluginMethod
public void createSecp256k1Context(PluginCall call) {
    try {
        long ctx = this.createSecp256k1Context();  // calls native
        JSObject ret = new JSObject();
        ret.put("ctx", ctx);
        call.resolve(ret);
    } catch (Exception e) {
        call.reject("Failed to create secp256k1 context: " + e.getMessage());
    }
}
 
  
  
  @PluginMethod
public void secp256k1EcPubkeyParse(PluginCall call) {
    try {
    
        Log.d(TAG, "fusionservice torboar secp parse");
        long ctx = secpCtx;

        JSArray inputArray = call.getArray("input");
        JSArray outputArray = call.getArray("output");
        Integer inputLen = call.getInt("inputLen");

        if (inputArray == null || outputArray == null || inputLen == null) {
            call.reject("Missing 'input', 'output', or 'inputLen'");
            return;
        }

        // Convert JS arrays to byte[]
        byte[] inputBytes = new byte[inputArray.length()];
        for (int i = 0; i < inputArray.length(); i++) {
            inputBytes[i] = (byte) inputArray.getInt(i);
        }

        byte[] pubkeyOut = new byte[outputArray.length()];
        for (int i = 0; i < outputArray.length(); i++) {
            pubkeyOut[i] = (byte) outputArray.getInt(i);
        }

        // Call native JNI function that returns both values
        @SuppressWarnings("unchecked")
        HashMap<String, Object> result =
            this.secp256k1EcPubkeyParse(ctx, pubkeyOut, inputBytes, inputLen);

        if (result == null) {
            call.reject("Native parse returned null");
            return;
        }

        int res = (Integer) result.get("res");
        byte[] pubkey = (byte[]) result.get("pubkey");

        // Convert to JS-friendly types
        JSArray pubkeyArray = new JSArray();
        for (byte b : pubkey) {
            pubkeyArray.put(b & 0xFF);
        }

        JSObject ret = new JSObject();
        ret.put("res", res);
        ret.put("pubkey", pubkeyArray);

        call.resolve(ret);

    } catch (Exception e) {
        call.reject("Exception in parse: " + e.getMessage());
    }
}

@PluginMethod
public void secp256k1EcPubkeyCombine(PluginCall call) {
    try {
        
        Log.d(TAG, "fusionservice torboar secp combine");
        long ctx = secpCtx;

        JSArray outputArray = call.getArray("output");
        JSArray input1Array = call.getArray("input1");
        JSArray input2Array = call.getArray("input2");

        if (outputArray == null || input1Array == null || input2Array == null) {
            call.reject("Missing 'output', 'input1', or 'input2'");
            return;
        }

        byte[] outputBuf = new byte[outputArray.length()];
        for (int i = 0; i < outputArray.length(); i++) {
            outputBuf[i] = (byte) outputArray.getInt(i);
        }

        byte[] inputBuf1 = new byte[input1Array.length()];
        for (int i = 0; i < input1Array.length(); i++) {
            inputBuf1[i] = (byte) input1Array.getInt(i);
        }

        byte[] inputBuf2 = new byte[input2Array.length()];
        for (int i = 0; i < input2Array.length(); i++) {
            inputBuf2[i] = (byte) input2Array.getInt(i);
        }

        @SuppressWarnings("unchecked")
        HashMap<String, Object> result =
            this.secp256k1EcPubkeyCombine(ctx, outputBuf, inputBuf1, inputBuf2);

        if (result == null) {
            call.reject("Native combine returned null");
            return;
        }

        int res = (Integer) result.get("res");
        byte[] pubkey = (byte[]) result.get("pubkey");

        JSArray pubkeyArray = new JSArray();
        for (byte b : pubkey) {
            pubkeyArray.put(b & 0xFF);
        }

        JSObject ret = new JSObject();
        ret.put("res", res);
        ret.put("pubkey", pubkeyArray);

        call.resolve(ret);

    } catch (Exception e) {
        call.reject("Exception in combine: " + e.getMessage());
    }
}
 
 @PluginMethod
public void secp256k1EcPubkeySerialize(PluginCall call) {
    try {
        long ctx = secpCtx;

        JSArray inputArray = call.getArray("input");
        Integer flags = call.getInt("flags");

        if (inputArray == null || flags == null) {
            call.reject("Missing 'input' or 'flags'");
            return;
        }

        byte[] inputBytes = new byte[inputArray.length()];
        for (int i = 0; i < inputArray.length(); i++) {
            inputBytes[i] = (byte) inputArray.getInt(i);
        }

        // Prepare out parameters
        int[] result = new int[1];
        int[] outputLen = new int[1];
        outputLen[0] = (flags == 258) ? 33 : 65; 
        byte[] output = new byte[outputLen[0]];

        // Call into JNI
        secp256k1EcPubkeySerialize(ctx, inputBytes, flags, result, outputLen, output);

        // Convert result to JS-friendly format
        JSArray pubkeyArray = new JSArray();
        for (int i = 0; i < outputLen[0]; i++) {
            pubkeyArray.put(output[i] & 0xFF);
        }

        JSObject ret = new JSObject();
        ret.put("res", result[0]);
        ret.put("pubkey", pubkeyArray);

        call.resolve(ret);

    } catch (Exception e) {
        call.reject("Exception in secp256k1EcPubkeySerialize: " + e.getMessage());
    }
}



@PluginMethod
public void secp256k1EcPubkeyTweakMul(PluginCall call) {
    try {
        long ctx = secpCtx;

        JSArray inputPubkeyArray = call.getArray("inputPubkey");
        JSArray scalarArray = call.getArray("scalar");

        if (inputPubkeyArray == null || scalarArray == null) {
            call.reject("Missing 'inputPubkey' or 'scalar'");
            return;
        }

        byte[] inputPubkey = new byte[inputPubkeyArray.length()];
        for (int i = 0; i < inputPubkeyArray.length(); i++) {
            inputPubkey[i] = (byte) inputPubkeyArray.getInt(i);
        }

        byte[] scalar = new byte[scalarArray.length()];
        for (int i = 0; i < scalarArray.length(); i++) {
            scalar[i] = (byte) scalarArray.getInt(i);
        }

        @SuppressWarnings("unchecked")
        HashMap<String, Object> result =
            this.secp256k1EcPubkeyTweakMul(ctx, inputPubkey, scalar);

        if (result == null) {
            call.reject("Native tweak_mul returned null");
            return;
        }

        int res = (Integer) result.get("res");
        byte[] pubkey = (byte[]) result.get("pubkey");

        JSArray pubkeyArray = new JSArray();
        for (byte b : pubkey) {
            pubkeyArray.put(b & 0xFF);
        }

        JSObject ret = new JSObject();
        ret.put("res", res);
        ret.put("pubkey", pubkeyArray);

        call.resolve(ret);

    } catch (Exception e) {
        call.reject("Exception in tweak_mul: " + e.getMessage());
    }
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
public void closeConnection(PluginCall call) {
    try {
        if (tcpSocket != null) {
            tcpSocket.close();
            tcpSocket = null;
        }
        tcpOut = null;
        tcpIn = null;
        Log.d(TAG, "Tor socket connection closed");
        call.resolve();
    } catch (IOException e) {
        Log.e(TAG, "Error closing socket", e);
        call.reject("Failed to close socket: " + e.getMessage());
    }
}


 
 @PluginMethod
public void openConnectionThroughCircuit(PluginCall call) {
    String host = call.getString("host");
    int port = call.getInt("port");
    boolean ssl = call.getBoolean("ssl", false);
    String circuitKey = call.getString("circuitKey", "default");

    getBridge().execute(() -> {
        try {
            // Set SOCKS authentication for circuit isolation
            System.setProperty("java.net.socks.username", circuitKey);
            System.setProperty("java.net.socks.password", "pass_" + circuitKey);

            // Create SOCKS proxy
            Proxy proxy = new Proxy(Proxy.Type.SOCKS,
                    new InetSocketAddress("127.0.0.1", Integer.parseInt(TOR_SOCKS_PORT)));

            if (ssl) {
                // Step 1: Create socket via proxy
                Socket proxySocket = new Socket(proxy);
                proxySocket.connect(new InetSocketAddress(host, port));

                // Step 2: Wrap in SSL
                SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
                SSLSocket sslSocket = (SSLSocket) factory.createSocket(
                        proxySocket, host, port, true);  // true = auto-close proxy socket
                sslSocket.startHandshake();
                tcpSocket = sslSocket;
            } else {
                // Plain TCP via proxy
                tcpSocket = new Socket(proxy);
                tcpSocket.connect(new InetSocketAddress(host, port));
            }

            tcpOut = tcpSocket.getOutputStream();
            tcpIn = tcpSocket.getInputStream();

            Log.d(TAG, "Persistent Tor socket connected to " + host + ":" + port + " over circuitKey " + circuitKey);
            call.resolve();
        } catch (IOException e) {
            Log.e(TAG, "Failed to open Tor socket connection", e);
            call.reject("Tor socket connection failed: " + e.getMessage());
        } finally {
            System.clearProperty("java.net.socks.username");
            System.clearProperty("java.net.socks.password");
        }
    });
}

 

 
 @PluginMethod
public void createNewCircuit(PluginCall call) {
    getBridge().execute(() -> {
        try {
            initTorControl();

            OutputStream out = controlSocket.getOutputStream();
            InputStream in = controlSocket.getInputStream();

            String cmd = "EXTENDCIRCUIT 0\r\n";
            out.write(cmd.getBytes());
            out.flush();

            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            String line;
            String circuitId = null;

            while ((line = reader.readLine()) != null) {
                Log.d(TAG, "Tor response: " + line);

                if (line.startsWith("250 EXTENDED")) {
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
    });
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
 
 
@PluginMethod
public void connectTcp(PluginCall call) {
    String host = call.getString("host");
    int port = call.getInt("port");
    boolean ssl = call.getBoolean("ssl", false);

    try {
        if (ssl) {
            // Create SSL socket
            SSLSocketFactory factory =
                (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket sslSocket =
                (SSLSocket) factory.createSocket(host, port);
                sslSocket.setSoTimeout(95000);       // Read timeout: 45 seconds
    sslSocket.setKeepAlive(true); 
            sslSocket.startHandshake(); // do TLS handshake now
            tcpSocket = sslSocket;
        } else {
            // Plain TCP
            tcpSocket = new Socket(host, port);
        }

        tcpOut = tcpSocket.getOutputStream();
        tcpIn = tcpSocket.getInputStream();

        Log.d(TAG, "Connected to " + (ssl ? "TLS" : "TCP") + " " + host + ":" + port);
        call.resolve();
    } catch (IOException e) {
        Log.e(TAG, (ssl ? "TLS" : "TCP") + " connection failed", e);
        call.reject((ssl ? "TLS" : "TCP") + " connection failed: " + e.getMessage());
    }
}


@PluginMethod
public void sendTcpData(PluginCall call) {
    String hex = call.getString("data");
    if (tcpOut == null) {
        call.reject("TCP socket not connected.");
        return;
    }

    try {
        byte[] bytes = hexStringToByteArray(hex);
        tcpOut.write(bytes);
        tcpOut.flush();
        call.resolve();
    } catch (IOException e) {
        Log.e(TAG, "Send failed", e);
        call.reject("TCP send failed: " + e.getMessage());
    }
}
 
   
   
   @PluginMethod
public void receiveTcpData(PluginCall call) {

    final boolean LOGGING = false; 
    if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: receiveTcpData() called");

    if (!isSocketAlive(tcpSocket)) {
        if (LOGGING) Log.e(TAG, "[FusionService]RECVTCPX: Socket is not alive at start");
        call.reject("[FusionService]Socket not alive");
        return;
    }

    // ✅ Get timeout from JS, default to 5000 ms if not provided
    int timeoutMs = call.getInt("timeoutMs", 5000);
    try {
        tcpSocket.setSoTimeout(timeoutMs);
    } catch (SocketException e) {
        call.reject("[FusionService] Failed to set socket timeout: " + e.getMessage());
        return;
    }

    try {
        InputStream input = tcpSocket.getInputStream();
        byte[] header = new byte[12];

        int availableBefore = input.available();
        if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Bytes available before header read = " + availableBefore);

        if (availableBefore > 0) {
            byte[] peek = new byte[Math.min(availableBefore, 32)];
            input.mark(32);
            input.read(peek);
            input.reset();
            if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Peek at buffer before header read = " + toHex(peek));
        }

        long readStart = System.currentTimeMillis();
        if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Waiting for 12-byte header... @ " + readStart);

        int read;
        try {
            read = input.read(header);
        } catch (Exception e) {
            if (LOGGING) Log.e(TAG, "[FusionService] Timeout or other exception during header read", e);
            call.reject("[FusionService] Failed to read header: " + e.getMessage());
            return;
        }

        if (read == -1) {
            if (LOGGING) Log.e(TAG, "[FusionService]RECVTCPX: Socket closed (read == -1)");
            call.reject("[FusionService]Socket closed");
            return;
        } else if (read != 12) {
            if (LOGGING) Log.e(TAG, "[FusionService]RECVTCPX: Incomplete header read: " + read + " bytes");
            call.reject("[FusionService]Incomplete header");
            return;
        }

        int len = ((header[8] & 0xFF) << 24) | ((header[9] & 0xFF) << 16) |
                  ((header[10] & 0xFF) << 8) | (header[11] & 0xFF);
        if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Parsed payload length = " + len);

        byte[] payload = new byte[len];
        int totalRead = 0;
        long payloadStartTime = System.currentTimeMillis();

        while (totalRead < len) {
            int r;
            try {
                r = input.read(payload, totalRead, len - totalRead);
            } catch (Exception e) {
                if (LOGGING) Log.e(TAG, "[FusionService] Timeout or other exception during payload read", e);
                call.reject("[FusionService] Failed to read payload: " + e.getMessage());
                return;
            }

            if (r == -1) {
                if (LOGGING) Log.e(TAG, "[FusionService]RECVTCPX: Socket closed mid-payload");
                call.reject("[FusionService]Socket closed mid-payload");
                return;
            }

            totalRead += r;
            if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Payload read progress: " + totalRead + "/" + len);
        }

        long payloadElapsed = System.currentTimeMillis() - payloadStartTime;
        if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Payload read completed in " + payloadElapsed + " ms");

        byte[] fullResponse = new byte[12 + len];
        System.arraycopy(header, 0, fullResponse, 0, 12);
        System.arraycopy(payload, 0, fullResponse, 12, len);

        String hex = toHex(fullResponse);
        if (LOGGING) {
            Log.d(TAG, "[FusionService]RECVTCPX: Final response hex length = " + hex.length());
            Log.d(TAG, "[FusionService]RECVTCPX: Response hex preview: " + hex.substring(0, Math.min(24, hex.length())));
        }

        if (!isSocketAlive(tcpSocket)) {
            if (LOGGING) Log.w(TAG, "[FusionService]RECVTCPX: Warning — socket became not alive after read!");
        } else {
            if (LOGGING) Log.d(TAG, "[FusionService]RECVTCPX: Socket still alive after full read");
        }

        JSObject ret = new JSObject();
        ret.put("data", hex);
        call.resolve(ret);

    } catch (Exception e) {
        if (LOGGING) Log.e(TAG, "[FusionService]RECVTCPX: Exception during read", e);
        call.reject("[FusionService]Failed to read data: " + e.getMessage());
    }
}

    

 
@PluginMethod
public void checkTcpStatus(PluginCall call) {
    JSObject ret = new JSObject();
    boolean alive = isSocketAlive(tcpSocket);

    // Report more detailed state too
    ret.put("alive", alive);
    ret.put("connected", tcpSocket != null && tcpSocket.isConnected());
    ret.put("closed", tcpSocket == null || tcpSocket.isClosed());
    ret.put("inputShutdown", tcpSocket != null && tcpSocket.isInputShutdown());
    ret.put("outputShutdown", tcpSocket != null && tcpSocket.isOutputShutdown());

    if (tcpSocket != null) {
        try {
            ret.put("remoteAddress", tcpSocket.getInetAddress().toString());
            ret.put("remotePort", tcpSocket.getPort());
        } catch (Exception e) {
            ret.put("remoteAddress", "unknown");
        }
    }

    Log.d(TAG, "[FusionService] checkTcpStatus() called, alive=" + alive);
    call.resolve(ret);
}


private boolean isSocketAlive(Socket socket) {
    if (socket == null) return false;
    if (socket.isClosed()) return false;
    if (!socket.isConnected()) return false;
    if (socket.isInputShutdown() || socket.isOutputShutdown()) return false;
    return true;
}

private static byte[] hexStringToByteArray(String s) {
    int len = s.length();
    byte[] data = new byte[len / 2];
    for (int i = 0; i < len; i += 2) {
        data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                            + Character.digit(s.charAt(i+1), 16));
    }
    return data;
}

private static String bytesToHex(byte[] bytes) {
    StringBuilder sb = new StringBuilder();
    for (byte b : bytes) {
        sb.append(String.format("%02x", b));
    }
    return sb.toString();
}


@Override
    public void load() {
        super.load();
        Log.d(TAG, "TorboarPlugin.load() called");
        
        // Get secp context for our secp functions.
        secpCtx = this.createSecp256k1Context();

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

