var capacitorCapacitorBiometric = (function (exports, core) {
    'use strict';

    exports.BiometryType = void 0;
    (function (BiometryType) {
        // Android, iOS
        BiometryType[BiometryType["NONE"] = 0] = "NONE";
        // iOS
        BiometryType[BiometryType["TOUCH_ID"] = 1] = "TOUCH_ID";
        // iOS
        BiometryType[BiometryType["FACE_ID"] = 2] = "FACE_ID";
        // Android
        BiometryType[BiometryType["FINGERPRINT"] = 3] = "FINGERPRINT";
        // Android
        BiometryType[BiometryType["FACE_AUTHENTICATION"] = 4] = "FACE_AUTHENTICATION";
        // Android
        BiometryType[BiometryType["IRIS_AUTHENTICATION"] = 5] = "IRIS_AUTHENTICATION";
        // Android
        BiometryType[BiometryType["MULTIPLE"] = 6] = "MULTIPLE";
    })(exports.BiometryType || (exports.BiometryType = {}));
    /**
     * Keep this in sync with BiometricAuthError in README.md
     * Update whenever `convertToPluginErrorCode` functions are modified
     */
    exports.BiometricAuthError = void 0;
    (function (BiometricAuthError) {
        BiometricAuthError[BiometricAuthError["UNKNOWN_ERROR"] = 0] = "UNKNOWN_ERROR";
        BiometricAuthError[BiometricAuthError["BIOMETRICS_UNAVAILABLE"] = 1] = "BIOMETRICS_UNAVAILABLE";
        BiometricAuthError[BiometricAuthError["USER_LOCKOUT"] = 2] = "USER_LOCKOUT";
        BiometricAuthError[BiometricAuthError["BIOMETRICS_NOT_ENROLLED"] = 3] = "BIOMETRICS_NOT_ENROLLED";
        BiometricAuthError[BiometricAuthError["USER_TEMPORARY_LOCKOUT"] = 4] = "USER_TEMPORARY_LOCKOUT";
        BiometricAuthError[BiometricAuthError["AUTHENTICATION_FAILED"] = 10] = "AUTHENTICATION_FAILED";
        BiometricAuthError[BiometricAuthError["APP_CANCEL"] = 11] = "APP_CANCEL";
        BiometricAuthError[BiometricAuthError["INVALID_CONTEXT"] = 12] = "INVALID_CONTEXT";
        BiometricAuthError[BiometricAuthError["NOT_INTERACTIVE"] = 13] = "NOT_INTERACTIVE";
        BiometricAuthError[BiometricAuthError["PASSCODE_NOT_SET"] = 14] = "PASSCODE_NOT_SET";
        BiometricAuthError[BiometricAuthError["SYSTEM_CANCEL"] = 15] = "SYSTEM_CANCEL";
        BiometricAuthError[BiometricAuthError["USER_CANCEL"] = 16] = "USER_CANCEL";
        BiometricAuthError[BiometricAuthError["USER_FALLBACK"] = 17] = "USER_FALLBACK";
    })(exports.BiometricAuthError || (exports.BiometricAuthError = {}));

    const NativeBiometric = core.registerPlugin("NativeBiometric", {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.NativeBiometricWeb()),
    });

    class NativeBiometricWeb extends core.WebPlugin {
        constructor() {
            super();
        }
        isAvailable() {
            throw new Error("Method not implemented.");
        }
        verifyIdentity(_options) {
            throw new Error("Method not implemented.");
        }
        getCredentials(_options) {
            throw new Error("Method not implemented.");
        }
        setCredentials(_options) {
            throw new Error("Method not implemented.");
        }
        deleteCredentials(_options) {
            throw new Error("Method not implemented.");
        }
    }

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        NativeBiometricWeb: NativeBiometricWeb
    });

    exports.NativeBiometric = NativeBiometric;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
