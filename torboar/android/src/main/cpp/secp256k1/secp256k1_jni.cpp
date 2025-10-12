#include <jni.h>
#include <string>
#include <secp256k1.h>
#include <android/log.h>

#include <cstring>  // for memset, sprintf
// ============================================================
// Global Context
// ============================================================ 
secp256k1_context* ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN);

extern "C"
JNIEXPORT jobject JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeyTweakMul(
    JNIEnv *env,
    jclass clazz,
    jlong ctxPtr,
    jbyteArray inputPubkey,   // [IN]  64-byte pubkey struct
    jbyteArray scalar         // [IN]  32-byte tweak
) {
    secp256k1_context *ctx = reinterpret_cast<secp256k1_context *>(ctxPtr);
    jbyte *pubkeyBytes = env->GetByteArrayElements(inputPubkey, nullptr);
    jbyte *scalarBytes = env->GetByteArrayElements(scalar, nullptr);

    int result = 0;
    jbyteArray pubkeyOut = env->NewByteArray(64);

    if (ctx && pubkeyBytes && scalarBytes) {
        // Copy input pubkey into working buffer
        unsigned char pubkeyTmp[64];
        memcpy(pubkeyTmp, pubkeyBytes, 64);

        // Perform tweak multiply
        result = secp256k1_ec_pubkey_tweak_mul(
            ctx,
            reinterpret_cast<secp256k1_pubkey *>(pubkeyTmp),
            reinterpret_cast<const unsigned char *>(scalarBytes)
        );

        // If successful, copy result to output array
        if (result) {
            env->SetByteArrayRegion(pubkeyOut, 0, 64, reinterpret_cast<jbyte *>(pubkeyTmp));
        }
    }

    env->ReleaseByteArrayElements(inputPubkey, pubkeyBytes, JNI_ABORT);
    env->ReleaseByteArrayElements(scalar, scalarBytes, JNI_ABORT);

    // --- Prepare return map ---
    jclass mapClass = env->FindClass("java/util/HashMap");
    jmethodID init = env->GetMethodID(mapClass, "<init>", "()V");
    jobject mapObj = env->NewObject(mapClass, init);
    jmethodID put = env->GetMethodID(
        mapClass,
        "put",
        "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;"
    );

    // Add "res"
    jclass integerClass = env->FindClass("java/lang/Integer");
    jmethodID intCtor = env->GetMethodID(integerClass, "<init>", "(I)V");
    jobject resObj = env->NewObject(integerClass, intCtor, result);
    env->CallObjectMethod(mapObj, put, env->NewStringUTF("res"), resObj);

    // Add "pubkey"
    env->CallObjectMethod(mapObj, put, env->NewStringUTF("pubkey"), pubkeyOut);

    return mapObj;
}

 
 extern "C"
JNIEXPORT void JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeySerialize(
    JNIEnv *env,
    jobject thiz,
    jlong ctxPtr,
    jbyteArray inputPubkey,   // [IN] 64-byte secp256k1_pubkey struct
    jint flags,               // [IN] flags (2 = uncompressed, 258 = compressed)
    jintArray resultOut,      // [OUT] int[1] result code (0 or 1)
    jintArray outputLenOut,   // [IN/OUT] int[1], initially desired size (33 or 65), becomes actual written size
    jbyteArray outputOut      // [OUT] serialized bytes
) {
    secp256k1_context* ctx = reinterpret_cast<secp256k1_context*>(ctxPtr);

    jbyte* inputBytes = env->GetByteArrayElements(inputPubkey, nullptr);
    jbyte* outputBytes = env->GetByteArrayElements(outputOut, nullptr);
    jint* resultPtr = env->GetIntArrayElements(resultOut, nullptr);
    jint* outputLenPtr = env->GetIntArrayElements(outputLenOut, nullptr);

    size_t outputLen = static_cast<size_t>(outputLenPtr[0]);

    int ret = secp256k1_ec_pubkey_serialize(
        ctx,
        reinterpret_cast<unsigned char*>(outputBytes),
        &outputLen,
        reinterpret_cast<const secp256k1_pubkey*>(inputBytes),
        flags
    );

    resultPtr[0] = ret;
    outputLenPtr[0] = static_cast<jint>(outputLen);

    // Commit changes to Java side
    env->ReleaseByteArrayElements(outputOut, outputBytes, 0);
    env->ReleaseByteArrayElements(inputPubkey, inputBytes, JNI_ABORT);
    env->ReleaseIntArrayElements(resultOut, resultPtr, 0);
    env->ReleaseIntArrayElements(outputLenOut, outputLenPtr, 0);
}

 
/* 

DEBUG SECOND TRY....

extern "C"
JNIEXPORT jobject JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeySerialize(
    JNIEnv *env,
    jclass clazz,
    jlong ctxPtr,
    jbyteArray inputPubkey,   // [IN] 64-byte internal pubkey struct
    jint flags                // [IN] compression flags (0x02 = uncompressed, 0x04 = compressed)
) {
    secp256k1_context *ctx = reinterpret_cast<secp256k1_context *>(ctxPtr);
    jsize inputLen = env->GetArrayLength(inputPubkey);
    jbyte *inputBytes = env->GetByteArrayElements(inputPubkey, nullptr);

    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "🧩 secp256k1EcPubkeySerialize called");
    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "  ctxPtr = %p", ctx);
    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "  flags = 0x%X", flags);
    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "  inputPubkey length = %d", inputLen);

    // Print first 32 bytes of input for sanity
    char inHex[3 * 32 + 1] = {0};
    for (int i = 0; i < inputLen && i < 32; i++) {
        sprintf(&inHex[i * 3], "%02X ", ((unsigned char *)inputBytes)[i]);
    }
    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "  inputPubkey (first 32 bytes): %s", inHex);

    unsigned char output[65];
    memset(output, 0, sizeof(output));
    size_t outputLen = (flags == 0x04) ? 33 : 65;

    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "  Initial outputLen guess = %zu", outputLen);

    int ret = 0;
    if (ctx && inputBytes) {
        ret = secp256k1_ec_pubkey_serialize(
            ctx,
            output,
            &outputLen,
            reinterpret_cast<const secp256k1_pubkey *>(inputBytes),
            flags
        );
    } else {
        __android_log_print(ANDROID_LOG_ERROR, "Torboar", "  ❌ ctx or inputBytes is null!");
    }

    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", 
        "  ✅ secp256k1_ec_pubkey_serialize ret = %d, final outputLen = %zu", ret, outputLen);

    if (ret == 1) {
        char outHex[3 * 33 + 1] = {0};
        for (size_t i = 0; i < outputLen && i < sizeof(output); i++) {
            sprintf(&outHex[i * 3], "%02X ", output[i]);
        }
        __android_log_print(ANDROID_LOG_DEBUG, "Torboar", 
            "  Serialized pubkey (%zu bytes): %s", outputLen, outHex);
    } else {
        __android_log_print(ANDROID_LOG_ERROR, "Torboar", "  ❌ secp256k1_ec_pubkey_serialize failed");
    }

    // --- Prepare return map ---
    jclass hashMapClass = env->FindClass("java/util/HashMap");
    jmethodID init = env->GetMethodID(hashMapClass, "<init>", "()V");
    jmethodID put = env->GetMethodID(
        hashMapClass,
        "put",
        "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;"
    );
    jobject map = env->NewObject(hashMapClass, init);

    // res field
    jclass integerClass = env->FindClass("java/lang/Integer");
    jmethodID integerInit = env->GetMethodID(integerClass, "<init>", "(I)V");
    jobject jRes = env->NewObject(integerClass, integerInit, ret);
    env->CallObjectMethod(map, put, env->NewStringUTF("res"), jRes);

    // pubkey field
    jbyteArray outputArray = env->NewByteArray(outputLen);
    env->SetByteArrayRegion(outputArray, 0, outputLen, reinterpret_cast<jbyte *>(output));
    env->CallObjectMethod(map, put, env->NewStringUTF("pubkey"), outputArray);

    env->ReleaseByteArrayElements(inputPubkey, inputBytes, JNI_ABORT);

    __android_log_print(ANDROID_LOG_DEBUG, "Torboar", "✅ Returning map from secp256k1EcPubkeySerialize");
    return map;
}
*/
/*
 
 extern "C"
JNIEXPORT jobject JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeySerialize(
    JNIEnv *env,
    jclass clazz,
    jlong ctxPtr,
    jbyteArray inputPubkey,   // [IN] 64-byte internal pubkey struct
    jint flags                // [IN] compression flags (33 or 65)
) {
    secp256k1_context *ctx = reinterpret_cast<secp256k1_context *>(ctxPtr);
    jbyte *inputBytes = env->GetByteArrayElements(inputPubkey, nullptr);

    unsigned char output[65]; 
    size_t outputLen = (flags == 0x04) ? 33 : 65;

    int ret = 0;
    if (ctx && inputBytes) {
        ret = secp256k1_ec_pubkey_serialize(
            ctx,
            output,
            &outputLen,
            reinterpret_cast<const secp256k1_pubkey *>(inputBytes),
            flags
        );
    }

    // prepare return map
    jclass hashMapClass = env->FindClass("java/util/HashMap");
    jmethodID init = env->GetMethodID(hashMapClass, "<init>", "()V");
    jmethodID put = env->GetMethodID(
        hashMapClass,
        "put",
        "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;"
    );
    jobject map = env->NewObject(hashMapClass, init);

    env->CallObjectMethod(
        map, put,
        env->NewStringUTF("res"),
        env->NewObject(env->FindClass("java/lang/Integer"), 
                       env->GetMethodID(env->FindClass("java/lang/Integer"), "<init>", "(I)V"), 
                       ret)
    );

    jbyteArray outputArray = env->NewByteArray(outputLen);
    env->SetByteArrayRegion(outputArray, 0, outputLen, reinterpret_cast<jbyte *>(output));
    env->CallObjectMethod(map, put, env->NewStringUTF("pubkey"), outputArray);

    env->ReleaseByteArrayElements(inputPubkey, inputBytes, JNI_ABORT);
    return map;
}

 
 */
 
extern "C"
JNIEXPORT jobject JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeyCombine(
    JNIEnv *env,
    jclass clazz,
    jlong ctxPtr,
    jbyteArray outputBuf,   // [OUT] combined result (64 bytes)
    jbyteArray inputBuf1,   // [IN] first pubkey (64 bytes)
    jbyteArray inputBuf2    // [IN] second pubkey (64 bytes)
) {
    secp256k1_context *ctx = reinterpret_cast<secp256k1_context *>(ctxPtr);
    if (!ctx) return nullptr;

    // Access bytes
    jbyte *outBytes = env->GetByteArrayElements(outputBuf, nullptr);
    jbyte *inBytes1 = env->GetByteArrayElements(inputBuf1, nullptr);
    jbyte *inBytes2 = env->GetByteArrayElements(inputBuf2, nullptr);

    int result = 0;

    if (outBytes && inBytes1 && inBytes2) {
        // Prepare pubkey pointers array
        const secp256k1_pubkey *pubkeys[2];
        pubkeys[0] = reinterpret_cast<const secp256k1_pubkey *>(inBytes1);
        pubkeys[1] = reinterpret_cast<const secp256k1_pubkey *>(inBytes2);

        // Perform combine
        result = secp256k1_ec_pubkey_combine(
            ctx,
            reinterpret_cast<secp256k1_pubkey *>(outBytes),
            pubkeys,
            2
        );
    }

    // Release JNI buffers
    env->ReleaseByteArrayElements(outputBuf, outBytes, 0);
    env->ReleaseByteArrayElements(inputBuf1, inBytes1, JNI_ABORT);
    env->ReleaseByteArrayElements(inputBuf2, inBytes2, JNI_ABORT);

    // Build HashMap<String,Object> { "res": int, "pubkey": byte[] }
    jclass mapClass = env->FindClass("java/util/HashMap");
    jmethodID mapInit = env->GetMethodID(mapClass, "<init>", "()V");
    jmethodID mapPut = env->GetMethodID(mapClass, "put",
        "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");
    jobject resultMap = env->NewObject(mapClass, mapInit);

    jclass integerClass = env->FindClass("java/lang/Integer");
    jmethodID integerInit = env->GetMethodID(integerClass, "<init>", "(I)V");
    jobject resObj = env->NewObject(integerClass, integerInit, result);

    jstring keyRes = env->NewStringUTF("res");
    env->CallObjectMethod(resultMap, mapPut, keyRes, resObj);

    jstring keyPubkey = env->NewStringUTF("pubkey");
    env->CallObjectMethod(resultMap, mapPut, keyPubkey, outputBuf);

    return resultMap;
}




extern "C"
JNIEXPORT jlong JNICALL
Java_com_selene_torboar_TorboarPlugin_createSecp256k1Context(JNIEnv *env, jclass clazz) {
    secp256k1_context* ctx = secp256k1_context_create(SECP256K1_CONTEXT_SIGN | SECP256K1_CONTEXT_VERIFY);
    return reinterpret_cast<jlong>(ctx);
}
 

//This maps to the cpp function but we have to return a jobject since we can't do out-params directy.
 
 extern "C"
JNIEXPORT jobject JNICALL
Java_com_selene_torboar_TorboarPlugin_secp256k1EcPubkeyParse(
    JNIEnv *env,
    jclass clazz,
    jlong ctxPtr,
    jbyteArray pubkeyOut,  // [OUT] provided by Java
    jbyteArray input,      // [IN]
    jint inputLen          // [IN]
) {
    secp256k1_context *ctx = reinterpret_cast<secp256k1_context *>(ctxPtr);
    if (!ctx) return nullptr;

    jbyte *inputBytes = env->GetByteArrayElements(input, nullptr);
    jbyte *outputBytes = env->GetByteArrayElements(pubkeyOut, nullptr);

    int result = 0;
    if (inputBytes && outputBytes) {
        result = secp256k1_ec_pubkey_parse(
            ctx,
            reinterpret_cast<secp256k1_pubkey *>(outputBytes),
            reinterpret_cast<const unsigned char *>(inputBytes),
            static_cast<size_t>(inputLen)
        );
    }

    env->ReleaseByteArrayElements(input, inputBytes, JNI_ABORT);
    env->ReleaseByteArrayElements(pubkeyOut, outputBytes, 0);

    // --- Build HashMap<String,Object> { "res": int, "pubkey": byte[] } ---
    jclass mapClass = env->FindClass("java/util/HashMap");
    jmethodID mapInit = env->GetMethodID(mapClass, "<init>", "()V");
    jmethodID mapPut = env->GetMethodID(mapClass, "put",
        "(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;");
    jobject resultMap = env->NewObject(mapClass, mapInit);

    // Add "res" -> Integer(result)
    jclass integerClass = env->FindClass("java/lang/Integer");
    jmethodID integerInit = env->GetMethodID(integerClass, "<init>", "(I)V");
    jobject resObj = env->NewObject(integerClass, integerInit, result);
    jstring keyRes = env->NewStringUTF("res");
    env->CallObjectMethod(resultMap, mapPut, keyRes, resObj);

    // Add "pubkey" -> pubkeyOut (the same array, now filled)
    jstring keyPubkey = env->NewStringUTF("pubkey");
    env->CallObjectMethod(resultMap, mapPut, keyPubkey, pubkeyOut);

    return resultMap;
}


 
