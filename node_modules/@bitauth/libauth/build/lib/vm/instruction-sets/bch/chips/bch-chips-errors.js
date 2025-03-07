export var AuthenticationErrorBCHCHIPs;
(function (AuthenticationErrorBCHCHIPs) {
    AuthenticationErrorBCHCHIPs["invalidBoolean"] = "Invalid input: this operation requires a valid boolean (VM Number 0 or VM Number 1).";
    AuthenticationErrorBCHCHIPs["unexpectedUntil"] = "Encountered an OP_UNTIL that is not following a matching OP_BEGIN.";
    AuthenticationErrorBCHCHIPs["excessiveHashing"] = "Program attempted a hashing operation that would exceed the hashing limit (660 hash digest iterations).";
    AuthenticationErrorBCHCHIPs["excessiveLooping"] = "Program attempted an OP_UNTIL operation that would exceed the limit of repeated bytes (10,000 bytes minus active bytecode length).";
})(AuthenticationErrorBCHCHIPs || (AuthenticationErrorBCHCHIPs = {}));
//# sourceMappingURL=bch-chips-errors.js.map