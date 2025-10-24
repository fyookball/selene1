package com.selene.torboar;
import com.selene.torboar.TorControlWorker;

import android.util.Log;
import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;
//import com.getcapacitor.JSArray;  //possibly unused.

import java.net.Authenticator;
import java.net.PasswordAuthentication;


import java.io.File;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.net.Socket;
import java.util.Map;
import java.util.HashMap; 
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.SocketException;
import java.net.SocketTimeoutException;
import java.net.SocketAddress;

import net.freehaven.tor.control.TorControlConnection;
import net.freehaven.tor.control.TorControlCommands;  //  possibly unsused.

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory; 

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.Callable;
import java.io.PrintWriter;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.net.InetAddress;

import android.os.Handler;
import android.os.HandlerThread;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;


@CapacitorPlugin(name = "Torboar")
public class TorboarPlugin extends Plugin {
    
    private Secp256k1Bridge secpBridge;

    private final ExecutorService circuitExecutor = Executors.newFixedThreadPool(6);

    // --- Tor Control Worker System ---
    private static final BlockingQueue<Callable<JSObject>> controlQueue = new LinkedBlockingQueue<>();
    private static volatile boolean controlWorkerRunning = false;
    
    private TorControlConnection torControlConn;
    private static final String TAG = "Torboar";
    private static final String TOR_SOCKS_PORT = "9050";
    private static final String TOR_CONTROL_PORT = "9051";
     
    private File torDataDir;
 
 
    // --- Persistent control connection --- 
    private BufferedReader controlReader;
    private OutputStream controlWriter; 

    private static Socket controlSocket = null;
    private static PrintWriter controlOut = null;
    private static BufferedReader controlIn = null;
    private static final Object controlLock = new Object();


 
    // Persistent (non-Tor) TCP connection used across fusion phases
    private Socket tcpSocketPersistent;
    private OutputStream tcpOutPersistent;
    private InputStream tcpInPersistent;

    
    private final Map<String, Socket> circuitSockets = new HashMap<>();
    private final Map<String, OutputStream> circuitOuts = new HashMap<>();
    private final Map<String, InputStream> circuitIns = new HashMap<>();

    
    // --- Worker pool fields ---
    private static final int NUM_WORKERS = 6;
    private final List<TorControlWorker> workers = new ArrayList<>();
    private final AtomicInteger nextWorker = new AtomicInteger(0);
    //-------
  
    
// Plugin Method handlers for SECP.  Pass onto the secp class.

@PluginMethod
public void secp256k1EcPubkeyCreate(PluginCall call) {
    secpBridge.secp256k1EcPubkeyCreate(call);
}

@PluginMethod
public void secp256k1EcPubkeyParse(PluginCall call) {
    secpBridge.secp256k1EcPubkeyParse(call);
}

@PluginMethod
public void secp256k1EcPubkeyCombine(PluginCall call) {
    secpBridge.secp256k1EcPubkeyCombine(call);
}

@PluginMethod
public void secp256k1EcPubkeyNegate(PluginCall call) {
    secpBridge.secp256k1EcPubkeyNegate(call);
}

@PluginMethod
public void secp256k1EcPubkeyTweakMul(PluginCall call) {
    secpBridge.secp256k1EcPubkeyTweakMul(call);
}

@PluginMethod
public void secp256k1EcPubkeySerialize(PluginCall call) {
    secpBridge.secp256k1EcPubkeySerialize(call);
}

@PluginMethod
public void secp256k1SchnorrSign32(PluginCall call) {
    secpBridge.secp256k1SchnorrSign32(call);
}

@PluginMethod
public void createSecp256k1Context(PluginCall call) {
    secpBridge.createSecp256k1Context(call);
}




    private synchronized void ensureWorkerPool() {
    if (workers.isEmpty()) {
        for (int i = 0; i < NUM_WORKERS; i++) {
            TorControlWorker w = new TorControlWorker(i);
            workers.add(w);
            new Thread(w, "TorControlWorker-" + i).start();
        }
        Log.i("FusionService", "[Torboar] Started " + NUM_WORKERS + " control workers");
        }
    }   



    private static String toHex(byte[] data) {  
    StringBuilder sb = new StringBuilder();
    for (byte b : data) {
        sb.append(String.format("%02x", b & 0xFF));
    }
    return sb.toString();
}
 
  

private void storeSocket(String key, Socket socket) throws IOException {
    circuitSockets.put(key, socket);
    circuitOuts.put(key, socket.getOutputStream());
    circuitIns.put(key, socket.getInputStream());
}

private void closeSocket(String key) {
    Socket socket = circuitSockets.get(key);
    if (socket != null) {
        try {
            socket.close();
        } catch (IOException ignored) {}
    }
    circuitSockets.remove(key);
    circuitOuts.remove(key);
    circuitIns.remove(key);
}

 
 
private void initTorControl() throws IOException {
    //Log.i("FusionService", "[Torboar]   initTorControl() starting");

    //   Always create a fresh control socket each time.
    //    This prevents stale or locked Tor control streams from re‑use.
    controlSocket = new Socket("127.0.0.1", Integer.parseInt(TOR_CONTROL_PORT));

    //   Prevent blocking reads forever (helps debug “stuck” AUTH / EXTENDCIRCUIT)
    controlSocket.setSoTimeout(5000);

    //Log.i("FusionService", "[Torboar]   Set control socket timeout to 5 seconds");

    // Create new Tor control connection
    torControlConn = new TorControlConnection(controlSocket);

    // Start background I/O thread (this allows asynchronous reads)
    torControlConn.launchThread(true);
    //Log.i("FusionService", "[Torboar]   Launched Tor control thread");

    // Perform authentication (no password for IsolateSOCKSAuth mode)
    //Log.i("FusionService", "[Torboar]  Sending AUTHENTICATE (empty password)");
    torControlConn.authenticate(new byte[0]);
    //Log.i("FusionService", "[Torboar]   AUTHENTICATE success");
}



private void waitForTorBootstrap(Process torProcess) throws IOException {
  
    // Get stdout from tor
    BufferedReader reader = new BufferedReader(new InputStreamReader(torProcess.getInputStream()));
    String line;
    while ((line = reader.readLine()) != null) {
        //Log.d(TAG, "Tor output: " + line);
        // Look for bootstrap completed message
        if (line.contains("Bootstrapped 100%")) {
            //Log.d(TAG, "Tor bootstrapped successfully.");
            break;
        }
    }
}

    
    
    
     @PluginMethod
public void openConnectionThroughCircuit(PluginCall call) {
    String host = call.getString("host");
    int port = call.getInt("port");
    boolean ssl = call.getBoolean("ssl", false);
    String circuitKey = call.getString("circuitKey", "default");
    String socksUser = call.getString("socksUser", circuitKey);
    int socksPort = Integer.parseInt(TOR_SOCKS_PORT); // default to Tor's local SOCKS port

    new HandlerThread("TorboarSocketThread-" + circuitKey) {{
        start();
        new Handler(getLooper()).post(() -> {
            long startTime = System.currentTimeMillis();
            try {
                Log.i(TAG, "  [Torboar] Opening connection — circuitKey=" + circuitKey +
                        " host=" + host + " port=" + port +
                        " ssl=" + ssl + " socksUser=" + socksUser);

                // --- SOCKS5 handshake setup ---
                Socket socket = new Socket();
                socket.connect(new InetSocketAddress("127.0.0.1", socksPort), 15000);
                OutputStream out = socket.getOutputStream();
                InputStream in = socket.getInputStream();

                // --- SOCKS5 greeting ---
                out.write(new byte[]{0x05, 0x01, 0x00});
                out.flush();
                int ver = in.read();
                int method = in.read();
                Log.i(TAG, "  [Torboar] SOCKS handshake version=" + ver + " method=" + method);

                // --- SOCKS5 connect request ---
                ByteArrayOutputStream req = new ByteArrayOutputStream();
                req.write(0x05); // version
                req.write(0x01); // CONNECT
                req.write(0x00); // reserved

                boolean isIPv4 = host.matches("^\\d+\\.\\d+\\.\\d+\\.\\d+$");
                if (isIPv4) {
                    Log.i(TAG, "  [Torboar] Detected IPv4 literal " + host + " — encoding as domain (ATYP=0x03)");
                    byte[] hostBytes = host.getBytes(StandardCharsets.UTF_8);
                    req.write(0x03); // ATYP = domain name
                    req.write(hostBytes.length);
                    req.write(hostBytes);
                } else {
                    Log.i(TAG, "  [Torboar] Domain target: " + host);
                    byte[] hostBytes = host.getBytes(StandardCharsets.UTF_8);
                    req.write(0x03);
                    req.write(hostBytes.length);
                    req.write(hostBytes);
                }

                req.write((port >> 8) & 0xFF);
                req.write(port & 0xFF);
                out.write(req.toByteArray());
                out.flush();

                // --- SOCKS5 reply ---
                byte[] resp = new byte[10];
                int read = in.read(resp);
                Log.i(TAG, "  [Torboar] SOCKS reply length=" + read + " data=" + bytesToHex(resp));

                if (resp[1] != 0x00) {
                    throw new SocketException("SOCKS server returned error code: " + String.format("0x%02X", resp[1]));
                }

                Log.i(TAG, "  [Torboar] TCP connect   — circuitKey=" + circuitKey);
                Log.i(TAG, "  [Torboar] Connection READY — circuitKey=" + circuitKey +
                        "   " + (System.currentTimeMillis() - startTime) + " ms");

                // --- Wrap with SSL if requested ---
                if (ssl) {
                    SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
                    SSLSocket sslSocket = (SSLSocket) factory.createSocket(socket, host, port, true);
                    sslSocket.startHandshake();
                    socket = sslSocket;
                    Log.i(TAG, "  [Torboar] SSL handshake complete — circuitKey=" + circuitKey);
                }

                synchronized (circuitSockets) {
                    circuitSockets.put(circuitKey, socket);
                    circuitOuts.put(circuitKey, socket.getOutputStream());
                    circuitIns.put(circuitKey, socket.getInputStream());
                }

                call.resolve(); //   notify JS that it succeeded

            } catch (Exception e) {
                Log.e(TAG, "  [Torboar] Connection   FAILED — circuitKey=" + circuitKey +
                        "   " + (System.currentTimeMillis() - startTime) + " ms", e);
                call.reject("Connection failed for " + circuitKey + ": " + e.getMessage());
            }
        });
    }};
}

  	
   
   @PluginMethod
public void createNewCircuit(PluginCall call) {
    ensureWorkerPool(); // start workers if not already running

    int workerIndex = nextWorker.getAndIncrement() % workers.size();
    TorControlWorker worker = workers.get(workerIndex);
 
    worker.enqueue(call);
}

   
//DEPRECATED -- was used early in the development before we added full circuit management.
@PluginMethod
public void makeRequestThroughCircuit(PluginCall call) {
    String circuitKey = call.getString("circuitKey", "default");
    String url = call.getString("url", "http://check.torproject.org/");

    //Log.d(TAG, "Making request using circuitKey: " + circuitKey + " to URL: " + url);

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

            //Log.d(TAG, "Circuit request response:\n" + body);

            JSObject ret = new JSObject();
            ret.put("response", body);
            call.resolve(ret);

        } catch (Exception e) {
            //Log.e(TAG, "Circuit request failed", e);
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
            SSLSocketFactory factory = (SSLSocketFactory) SSLSocketFactory.getDefault();
            SSLSocket sslSocket = (SSLSocket) factory.createSocket(host, port);
            sslSocket.setSoTimeout(5000);       // Read timeout: 95 seconds
            sslSocket.setKeepAlive(true);
            sslSocket.startHandshake();          // Perform TLS handshake now
            tcpSocketPersistent = sslSocket;
        } else {
            // Plain TCP
            tcpSocketPersistent = new Socket(host, port);
            tcpSocketPersistent.setSoTimeout(95000);
            tcpSocketPersistent.setKeepAlive(true);
        }

        tcpOutPersistent = tcpSocketPersistent.getOutputStream();
        tcpInPersistent = tcpSocketPersistent.getInputStream();

        //Log.d(TAG, "Connected persistent " + (ssl ? "TLS" : "TCP") + " socket to " + host + ":" + port);
        call.resolve();

    } catch (IOException e) {
        //Log.e(TAG, (ssl ? "TLS" : "TCP") + " persistent connection failed", e);
        call.reject((ssl ? "TLS" : "TCP") + " persistent connection failed: " + e.getMessage());
    }
}




@PluginMethod
public void sendTcpDataPersistent(PluginCall call) {
    String hex = call.getString("data");

    if (tcpOutPersistent == null) {
        call.reject("No persistent TCP connection found");
        return;
    }

    try {
        byte[] bytes = hexStringToByteArray(hex);
        tcpOutPersistent.write(bytes);
        tcpOutPersistent.flush();
        call.resolve();
    } catch (IOException e) {
        Log.e(TAG, "fusionservce.Persistent TCP send failed", e);
        call.reject("Persistent TCP send failed: " + e.getMessage());
    }
}

@PluginMethod
public void receiveTcpDataPersistent(PluginCall call) {
    if (tcpInPersistent == null) {
        call.reject("No persistent TCP connection found");
        return;
    }

    try {
        byte[] header = new byte[12];
        int read = tcpInPersistent.read(header);
        if (read != 12) {
            call.reject("Incomplete header read: " + read);
            return;
        }

        int len = ((header[8] & 0xFF) << 24)
                | ((header[9] & 0xFF) << 16)
                | ((header[10] & 0xFF) << 8)
                | (header[11] & 0xFF);

        byte[] payload = new byte[len];
        int totalRead = 0;
        while (totalRead < len) {
            int r = tcpInPersistent.read(payload, totalRead, len - totalRead);
            if (r == -1) break;
            totalRead += r;
        }

        byte[] full = new byte[12 + len];
        System.arraycopy(header, 0, full, 0, 12);
        System.arraycopy(payload, 0, full, 12, len);

        String hex = toHex(full);
        JSObject ret = new JSObject();
        ret.put("data", hex);
        call.resolve(ret);
    } catch (IOException e) {
        Log.e(TAG, "fusionservice.Persistent TCP receive failed", e);
        call.reject("Persistent TCP receive failed: " + e.getMessage());
    }
}


@PluginMethod
public void sendTcpData(PluginCall call) {
    String hex = call.getString("data");
    String circuitKey = call.getString("circuitKey", "default");

    OutputStream out = circuitOuts.get(circuitKey);
    if (out == null) {
        call.reject("No TCP connection found for circuitKey: " + circuitKey);
        return;
    }

    try {
        byte[] bytes = hexStringToByteArray(hex);
        out.write(bytes);
        out.flush();
        call.resolve();
    } catch (IOException e) {
        Log.e(TAG, "fusionservice.Send failed for circuitKey: " + circuitKey, e);
        call.reject("TCP send failed for " + circuitKey + ": " + e.getMessage());
    }
}

    
    
    
    @PluginMethod
public void receiveTcpData(PluginCall call) {
    final boolean LOGGING = false;
    final int MAX_LEN = 1_048_576; // 1 MB hard cap

    String circuitKey = call.getString("circuitKey", "default");
    Socket socket = circuitSockets.get(circuitKey);
    InputStream input = circuitIns.get(circuitKey);

    if (socket == null || input == null) {
        call.reject("No TCP connection found for circuitKey: " + circuitKey);
        return;
    }
    if (!isSocketAlive(circuitKey)) {
        call.reject("[FusionService] Socket not alive for: " + circuitKey);
        return;
    }

    int timeoutMs = call.getInt("timeoutMs", 5000);
    try {
        socket.setSoTimeout(timeoutMs);
    } catch (SocketException e) {
        call.reject("[FusionService] Failed to set socket timeout: " + e.getMessage());
        return;
    }

    if (LOGGING)
        Log.d(TAG, "[FusionService] (" + circuitKey + ")   Starting receiveTcpData, timeout=" + timeoutMs + " ms");

    try {
        // --- Read 12-byte header safely ---
        byte[] header = new byte[12];
        int totalHeader = 0;
        long startTime = System.currentTimeMillis();

        while (totalHeader < 12) {
            if (System.currentTimeMillis() - startTime > timeoutMs) {
                call.reject("Timeout reading header (" + timeoutMs + " ms)");
                return;
            }
            int r = input.read(header, totalHeader, 12 - totalHeader);
            if (r == -1) {
                call.reject("Socket closed while reading header for " + circuitKey);
                return;
            }
            totalHeader += r;
        }

        // --- Parse and validate payload length ---
        int len;
        try {
            len = ((header[8] & 0xFF) << 24)
                | ((header[9] & 0xFF) << 16)
                | ((header[10] & 0xFF) << 8)
                | (header[11] & 0xFF);
        } catch (Exception ex) {
            call.reject("Malformed header bytes (cannot parse length)");
            return;
        }

        if (len <= 0 || len > MAX_LEN) {
            Log.w(TAG, "[FusionService] (" + circuitKey + ") ⚠ Suspicious payload length=" + len);
            byte[] snippet = new byte[Math.min(2048, input.available())];
            int bytes = input.read(snippet);
            JSObject ret = new JSObject();
            ret.put("data", bytes > 0 ? toHex(Arrays.copyOf(snippet, bytes)) : "");
            call.resolve(ret);
            return;
        }

        // --- Read payload with global timeout guard ---
        byte[] payload = new byte[len];
        int totalRead = 0;
        startTime = System.currentTimeMillis();

        while (totalRead < len) {
            if (System.currentTimeMillis() - startTime > timeoutMs) {
                call.reject("Global timeout (" + timeoutMs + " ms) while reading payload for " + circuitKey);
                return;
            }
            int r = input.read(payload, totalRead, len - totalRead);
            if (r == -1) {
                call.reject("Socket closed mid-payload for " + circuitKey);
                return;
            }
            totalRead += r;
        }

        // --- Combine header + payload ---
        byte[] fullResponse = new byte[12 + len];
        System.arraycopy(header, 0, fullResponse, 0, 12);
        System.arraycopy(payload, 0, fullResponse, 12, len);

        JSObject ret = new JSObject();
        ret.put("data", toHex(fullResponse));
        call.resolve(ret);

        if (LOGGING)
            Log.d(TAG, "[FusionService] (" + circuitKey + ") Completed receiveTcpData — total=" + totalRead + " bytes");

    } catch (SocketTimeoutException e) {
        Log.w(TAG, "[FusionService] (" + circuitKey + ") Socket timeout after " + timeoutMs + " ms");
        call.reject("Socket timeout after " + timeoutMs + " ms: " + e.getMessage());
    } catch (IOException e) {
        Log.e(TAG, "[FusionService] (" + circuitKey + ") I/O error", e);
        call.reject("I/O error while reading from " + circuitKey + ": " + e.getMessage());
    } catch (Exception e) {
        Log.e(TAG, "[FusionService] (" + circuitKey + ") Unexpected exception", e);
        call.reject("Receive failed: " + e.getMessage());
    }
}


    
    
@PluginMethod
public void checkTcpStatus(PluginCall call) {
    String circuitKey = call.getString("circuitKey", "default");

    JSObject ret = new JSObject();
    Socket socket = circuitSockets.get(circuitKey);

    boolean alive = isSocketAlive(circuitKey);
    ret.put("alive", alive);
    ret.put("connected", socket != null && socket.isConnected());
    ret.put("closed", socket == null || socket.isClosed());
    ret.put("inputShutdown", socket != null && socket.isInputShutdown());
    ret.put("outputShutdown", socket != null && socket.isOutputShutdown());

    if (socket != null) {
        try {
            ret.put("remoteAddress", socket.getInetAddress().toString());
            ret.put("remotePort", socket.getPort());
        } catch (Exception e) {
            ret.put("remoteAddress", "unknown");
        }
    }

    Log.d(TAG, "[FusionService] checkTcpStatus(" + circuitKey + ") alive=" + alive);
    call.resolve(ret);
}


 
 // Test method for debugging.
 @PluginMethod
public void foobar(PluginCall call) {	
  Log.i("FusionService.Torboar", "This is a test. Reached the Torboar layer.");
    JSObject ret = new JSObject();   
    ret.put("test", "foo");        
    Log.i("FusionService", "test foo");  
    call.resolve(ret);                  
}


 @PluginMethod
public void checkTcpStatusPersistent(PluginCall call) {
    //Log.i("FusionService.Torboar", "[checkTcpStatusPersistent] called");

    JSObject ret = new JSObject();

    boolean connected = (tcpSocketPersistent != null && tcpSocketPersistent.isConnected());
    boolean closed = (tcpSocketPersistent == null || tcpSocketPersistent.isClosed());
    boolean inputShutdown = (tcpSocketPersistent != null && tcpSocketPersistent.isInputShutdown());
    boolean outputShutdown = (tcpSocketPersistent != null && tcpSocketPersistent.isOutputShutdown());
    boolean alive = (tcpSocketPersistent != null && connected && !closed && !inputShutdown && !outputShutdown);

    ret.put("alive", alive);
    ret.put("connected", connected);
    ret.put("closed", closed);
    ret.put("inputShutdown", inputShutdown);
    ret.put("outputShutdown", outputShutdown);

    if (tcpSocketPersistent != null) {
        //Log.i("FusionService.Torboar", "[checkTcpStatusPersistent] Waiting to inspect remote address...");

        try {
            ret.put("remoteAddress", tcpSocketPersistent.getInetAddress().toString());
            ret.put("remotePort", tcpSocketPersistent.getPort());
        } catch (Exception e) {
            //Log.i("FusionService.Torboar", "❗ Failed to get remote address");
            ret.put("remoteAddress", "unknown");
        }
    } else {
        //Log.w("FusionService.Torboar", "[checkTcpStatusPersistent] tcpSocketPersistent is null!");
        ret.put("remoteAddress", "none");
        ret.put("remotePort", -1);
    }

    //Log.d("FusionService.Torboar", "[checkTcpStatusPersistent] Final status: " + ret.toString());
    call.resolve(ret);  //   always resolve!
}



 private boolean isSocketAlive(String key) {
    Socket s = circuitSockets.get(key);
    return s != null && s.isConnected() && !s.isClosed()
           && !s.isInputShutdown() && !s.isOutputShutdown();

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
protected void handleOnDestroy() {
    super.handleOnDestroy();

    // Stop any background thread pools
    circuitExecutor.shutdownNow();

    // Stop the Tor control queue worker
    controlWorkerRunning = false;

    // Close persistent control socket
    try {
        if (controlSocket != null) {
            controlSocket.close();
            controlSocket = null;
        }
    } catch (IOException ignored) {}
}


@Override
public void load() {
    super.load();
    Log.d(TAG, "TorboarPlugin.load() called");

  
     secpBridge = new Secp256k1Bridge();
     secpBridge.initialize();


    torDataDir = new File(getContext().getFilesDir(), "tor_data");

    try {
        System.loadLibrary("tor"); // Explicitly load libtor.so
        Log.d(TAG, "Successfully loaded libtor.so");
    } catch (UnsatisfiedLinkError e) {
        Log.e(TAG, "Failed to load libtor.so: " + e.getMessage());
    }

    // --- Start Tor control worker thread ---
    try {
        ensureControlWorker();  // <-- start our queue-based control thread
        Log.i("FusionService", "[Torboar]   Control worker initialized");
    } catch (Exception e) {
        Log.e("FusionService", "[Torboar]   Failed to start control worker", e);
    }
}

    
@PluginMethod
public void startTor(PluginCall call) {
    //Log.d(TAG, "startTor() method called");

    new Thread(() -> {
        try {
            File torBinary = new File(getContext().getApplicationInfo().nativeLibraryDir, "libtor.so");
            //Log.d(TAG, "Looking for Tor binary at: " + torBinary.getAbsolutePath());

            if (!torBinary.exists()) {
                //Log.e(TAG, "Tor binary NOT found at: " + torBinary.getAbsolutePath());
                call.reject("Tor binary not found.");
                return;
            } else {
               // Log.d(TAG, "Tor binary FOUND at: " + torBinary.getAbsolutePath());
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

            //Log.d(TAG, "Tor process started, waiting for bootstrap...");
            waitForTorBootstrap(torProcess);
            JSObject ret = new JSObject();
            ret.put("message", "Tor started and bootstrapped");
            call.resolve(ret);


        } catch (Exception e) {
            //Log.e(TAG, "Error starting Tor", e);
            call.reject("Tor startup failed: " + e.getMessage());
        }
    }).start();
}
 
  
   private void drainControlReplies() {
    try {
        while (controlIn != null && controlIn.ready()) {
            String skip = controlIn.readLine();
            if (skip == null || skip.equals("250 OK") || skip.equals(".")) break;
        }
    } catch (IOException ignored) {}
}



   
   private void waitForCircuitBuilt(String circuitId, int timeoutMs) throws IOException {
    if (circuitId == null || circuitId.isEmpty()) return;

    Log.i("FusionService", "[Torboar]   Waiting for circuit " + circuitId + " to reach BUILT");

    long start = System.currentTimeMillis();
    boolean built = false;

    while (!built && (System.currentTimeMillis() - start) < timeoutMs) {
        controlOut.print("GETINFO circuit-status\r\n");
        controlOut.flush();

        String line;
        while ((line = controlIn.readLine()) != null) {
            if (line == null) break;
            if (line.startsWith("250 OK")) break;

            if (line != null && circuitId != null && line.contains(circuitId)) {
                Log.i("FusionService", "[Torboar]   Circuit " + circuitId + " status line: " + line);
                if (line.contains("BUILT")) {
                    built = true;
                    break;
                }
            }
        }

        if (!built) {
            try {
                Thread.sleep(200);
            } catch (InterruptedException ignored) {}
        }
    }

    if (built) {
        Log.i("FusionService", "[Torboar]   Circuit " + circuitId + " is BUILT");
    } else {
        throw new IOException("Circuit " + circuitId + " not built within timeout");
    }
}

  
  
private void ensureControlWorker() {
    if (controlWorkerRunning) return;
    controlWorkerRunning = true;

    new Thread(() -> {
        while (true) {
            try {
                Callable<JSObject> task = controlQueue.take(); // waits for a queued task
                try {
                    task.call();
                } catch (Exception e) {
                    Log.e("FusionService", "[Torboar]   Control task failed", e);
                }
            } catch (InterruptedException e) {
                Log.e("FusionService", "[Torboar] Control worker interrupted", e);
                Thread.currentThread().interrupt();
                break;
            }
        }
    }, "TorControlWorker").start();

    Log.i("FusionService", "[Torboar]   Control worker thread started");
}

private void authenticateControlSocket() throws IOException {
    if (controlOut == null || controlIn == null) {
        throw new IOException("Control streams not initialized");
    }

    Log.i("FusionService", "[Torboar]  Sending AUTHENTICATE \"\"");
    controlOut.print("AUTHENTICATE \"\"\r\n");
    controlOut.flush();

    String line;
    boolean success = false;
    while ((line = controlIn.readLine()) != null) {
        if (line.startsWith("250 OK")) {
            success = true;
            break;
        } else if (line.startsWith("5")) {
            throw new IOException("Tor AUTHENTICATE failed: " + line);
        }
    }

    if (!success) {
        throw new IOException("AUTHENTICATE timeout or no response");
    }

    Log.i("FusionService", "[Torboar]   AUTHENTICATE success");
}


/**
 * Initializes or reuses a single persistent control socket.
 */
private void initPersistentControl() throws IOException {
    synchronized (controlLock) {
        if (controlSocket != null && controlSocket.isConnected() && !controlSocket.isClosed()) {
            Log.i("FusionService", "[Torboar]   Reusing existing control socket");
            return;
        }

        Log.i("FusionService", "[Torboar]   Creating new Tor control socket..."); 
        controlSocket = new Socket("127.0.0.1", Integer.parseInt(TOR_CONTROL_PORT));

        controlSocket.setSoTimeout(10000); // 10s read timeout
        controlOut = new PrintWriter(controlSocket.getOutputStream(), true);
        controlIn = new BufferedReader(new InputStreamReader(controlSocket.getInputStream()));

        authenticateControlSocket();
        Log.i("FusionService", "[Torboar]   Persistent control socket ready");
    }
}

/**
 * Queue a control-port operation, ensuring serialized execution.
 */
private void queueControlTask(Callable<JSObject> task) {
    controlQueue.offer(task);

}
}
