/*
 * ============================================================
 *  TorControlWorker — Asynchronous Tor Circuit Manager
 * ============================================================
 *
 * This class manages communication with the Tor ControlPort (default 9051)
 * to create and monitor Tor circuits.  Each worker runs in its own thread and processes
 * circuit-creation requests queued from the main plugin layer.
 *
 * The purpose is to isolate Tor command handling from the main thread, so
 * that TOR commands like EXTENDCIRCUIT and GETINFO do not bottleneck the app.
 *
 * This class listens for queued requests and handles them sequentially.
 * It sends commands to create a new circuit and poll until "BUILT" state.
 * Each woerk is identified by 'id' so multiple circuits can be built
 * concurrently without blocking. 
 */


package com.selene.torboar;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.PluginCall;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class TorControlWorker implements Runnable {

    private final int id;
    private final BlockingQueue<PluginCall> queue = new LinkedBlockingQueue<>();
    private Socket controlSocket;
    private PrintWriter controlOut;
    private BufferedReader controlIn;
    private volatile boolean running = true;

    public TorControlWorker(int id) {
        this.id = id;
    }

    public void enqueue(PluginCall call) {
        queue.add(call);
    }

    @Override
    public void run() {
        try {
            initControlSocket();
            while (running) {
                PluginCall call = queue.take();
                processCreateCircuit(call);
            }
        } catch (Exception e) {
            Log.e("FusionService", "[Worker " + id + "] Fatal worker error", e);
        }
    }

    private void initControlSocket() throws IOException {
        controlSocket = new Socket("127.0.0.1", 9051); // adjust if using a different port
        controlSocket.setSoTimeout(15000);
        controlOut = new PrintWriter(controlSocket.getOutputStream(), true);
        controlIn = new BufferedReader(new InputStreamReader(controlSocket.getInputStream()));

        controlOut.print("AUTHENTICATE\r\n");
        controlOut.flush();
        controlIn.readLine(); // expect "250 OK"
        Log.i("FusionService", "[Worker " + id + "] Control socket authenticated");
    }

    private void processCreateCircuit(PluginCall call) {
        //Log.i("FusionService", "[Worker " + id + "] Starting createNewCircuit()");
        JSObject ret = new JSObject();

        int timeoutMs = call.getInt("timeoutMs", 15000);
        int pollIntervalMs = call.getInt("pollIntervalMs", 250);
        boolean logAllLines = call.getBoolean("logAllLines", false);

        //  For retries 
        int maxRetries = 1;
        int attempt = 0;

        while (attempt <= maxRetries) {
            attempt++;
            long startTime = System.currentTimeMillis();
            String circuitId = null;
            boolean built = false;
            String line = null; 

            try {
                // Verify Tor bootstrap status 
                controlOut.print("GETINFO status/bootstrap-phase\r\n");
                controlOut.flush();
                while ((line = controlIn.readLine()) != null) {
                    //Log.i("FusionService", "[Worker " + id + "] bootstrap-phase: " + line);
                    if (line.equals("250 OK")) break;
                }

                // Ask Tor to create a new circuit 
                String cmd = "EXTENDCIRCUIT 0\r\n";
                controlOut.print(cmd);
                controlOut.flush();
                //Log.i("FusionService", "[Worker " + id + "] Sent: " + cmd.trim());

                // Read EXTENDCIRCUIT response 
                while ((line = controlIn.readLine()) != null) {
                    //Log.i("FusionService", "[Worker " + id + "] EXTENDCIRCUIT response: " + line);
                    if (line.startsWith("250 EXTENDED")) {
                        String[] parts = line.split(" ");
                        if (parts.length >= 3) circuitId = parts[2];
                        break;
                    } else if (line.startsWith("5")) {
                        throw new IOException("Tor error: " + line);
                    } else if (line.equals("250 OK")) {
                        throw new IOException("Failed to obtain circuit ID from Tor response");
                    }
                }
                if (circuitId == null)
                    throw new IOException("Failed to obtain circuit ID from Tor response");

                //Log.i("FusionService", "[Worker " + id + "] Waiting for circuit " + circuitId + " to reach BUILT...");

                // Poll for BUILT state 
                long startWait = System.currentTimeMillis();
                while (System.currentTimeMillis() - startWait < timeoutMs && !built) {
                    controlOut.print("GETINFO circuit-status\r\n");
                    controlOut.flush();

                    String matchingLine = null;
                    while ((line = controlIn.readLine()) != null) {
                        if (line.equals("250 OK")) break;
                        if (logAllLines)
                            Log.d("FusionService", "[Worker " + id + "] [ALL] " + line);
                        String target = circuitId + " BUILT";
                        if (line.contains(target)) {
                            matchingLine = line;
                            built = true;
                        }
                    }

                    if (matchingLine != null) {
                       // Log.i("FusionService", "[Worker " + id + "] Circuit " + circuitId + " status: " + matchingLine);
                    } else {
                        //Log.d("FusionService", "[Worker " + id + "] (poll) circuit " + circuitId + " not yet built...");
                    }

                    if (!built) Thread.sleep(pollIntervalMs);
                }

                if (!built)
                    throw new IOException("Circuit " + circuitId + " did not reach BUILT state within timeout");

                // Success path
                Log.i("FusionService", "[Worker " + id + "] Circuit " + circuitId + " is BUILT");
                ret.put("circuitId", circuitId);
                Handler mainHandler = new Handler(Looper.getMainLooper());
                mainHandler.post(() -> call.resolve(ret));
                return; // Done successfully

            } catch (Exception e) {
                //Log.e("FusionService", "[Worker " + id + "] Attempt " + attempt + " failed: " + e.getMessage());
                if (attempt > maxRetries) {
                    Handler mainHandler = new Handler(Looper.getMainLooper());
                    mainHandler.post(() -> call.reject("Circuit creation failed after retries: " + e.getMessage()));
                    return;
                }

                // Retry Ntoice
                long elapsed = System.currentTimeMillis() - startTime;
                Log.w("FusionService", "[Worker " + id + "] Retrying circuit build (elapsed=" + elapsed + "ms)...");
                try {
                    Thread.sleep(500);
                } catch (InterruptedException ignored) {
                }
            }
        }
    }
}

