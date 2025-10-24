
/**
 * ============================================================
 *  Secp256k1Bridge — Java connection to JNI layer
 * ============================================================
 *
 *  This class isolates all JNI-based secp256k1 operations from the
 *  main TorboarPlugin. These methods primarily support schnorr 
 *  signing and operations and Pedersen methods.
 */
 
 
package com.selene.torboar;

import android.util.Log;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import java.util.HashMap;





public class Secp256k1Bridge {

    private static long secpCtx;

    static {
        System.loadLibrary("secp256k1");
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

public native HashMap<String, Object> secp256k1EcPubkeyCreate(
    long ctx,
    byte[] scalar
);

public native HashMap<String, Object> secp256k1EcPubkeyNegate(
    long ctx,
    byte[] input
);

public native HashMap<String, Object> secp256k1SchnorrSign32(
    long ctx,
    byte[] msg32,
    byte[] seckey32,
    byte[] auxRand32
);

public void initialize() {
    secpCtx = this.createSecp256k1Context();
    Log.i("Secp256k1Bridge", "Initialized secp256k1 context: " + secpCtx);
}


 
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


@PluginMethod
public void secp256k1EcPubkeyCreate(PluginCall call) {
    try {
        long ctx = secpCtx;

        JSArray scalarArray = call.getArray("scalar");
        if (scalarArray == null) {
            call.reject("Missing 'scalar'");
            return;
        }

        byte[] scalar = new byte[scalarArray.length()];
        for (int i = 0; i < scalarArray.length(); i++) {
            scalar[i] = (byte) scalarArray.getInt(i);
        }

        @SuppressWarnings("unchecked")
        HashMap<String, Object> result =
            this.secp256k1EcPubkeyCreate(ctx, scalar);

        if (result == null) {
            call.reject("Native create returned null");
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
        call.reject("Exception in pubkey_create: " + e.getMessage());
    }
}


@PluginMethod
public void secp256k1EcPubkeyNegate(PluginCall call) {
    try {
        long ctx = secpCtx;

        JSArray inputArray = call.getArray("input");
        if (inputArray == null) {
            call.reject("Missing 'input'");
            return;
        }

        byte[] input = new byte[inputArray.length()];
        for (int i = 0; i < inputArray.length(); i++) {
            input[i] = (byte) inputArray.getInt(i);
        }

        @SuppressWarnings("unchecked")
        HashMap<String, Object> result =
            this.secp256k1EcPubkeyNegate(ctx, input);

        if (result == null) {
            call.reject("Native negate returned null");
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
        call.reject("Exception in pubkey_negate: " + e.getMessage());
    }
}

@PluginMethod
public void secp256k1SchnorrSign32(PluginCall call) {
    try {
        long ctx = secpCtx;
        JSArray msgArray = call.getArray("msg");
        JSArray seckeyArray = call.getArray("seckey");
        JSArray auxArray = call.getArray("aux");

        if (msgArray == null || seckeyArray == null) {
            call.reject("Missing 'msg' or 'seckey'");
            return;
        }

        byte[] msgBytes = new byte[msgArray.length()];
        for (int i = 0; i < msgArray.length(); i++) msgBytes[i] = (byte) msgArray.getInt(i);

        byte[] seckeyBytes = new byte[seckeyArray.length()];
        for (int i = 0; i < seckeyArray.length(); i++) seckeyBytes[i] = (byte) seckeyArray.getInt(i);

        byte[] auxBytes = null;
        if (auxArray != null) {
            auxBytes = new byte[auxArray.length()];
            for (int i = 0; i < auxArray.length(); i++) auxBytes[i] = (byte) auxArray.getInt(i);
        }

        HashMap<String, Object> result = this.secp256k1SchnorrSign32(ctx, msgBytes, seckeyBytes, auxBytes);

        int res = (Integer) result.get("res");
        JSObject ret = new JSObject();
        ret.put("res", res);

        if (res != 0 && result.containsKey("sig")) {
            byte[] sig = (byte[]) result.get("sig");
            JSArray sigArray = new JSArray();
            for (byte b : sig) sigArray.put(b & 0xFF);
            ret.put("sig", sigArray);
        }

        call.resolve(ret);

    } catch (Exception e) {
        call.reject("Exception in schnorrsign32: " + e.getMessage());
    }
}  

} // end of class

