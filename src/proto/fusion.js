/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader,
  $Writer = $protobuf.Writer,
  $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const fusion = ($root.fusion = (() => {
  /**
   * Namespace fusion.
   * @exports fusion
   * @namespace
   */
  const fusion = {};

  fusion.InputComponent = (function () {
    /**
     * Properties of an InputComponent.
     * @memberof fusion
     * @interface IInputComponent
     * @property {Uint8Array} prevTxid InputComponent prevTxid
     * @property {number} prevIndex InputComponent prevIndex
     * @property {Uint8Array} pubkey InputComponent pubkey
     * @property {number|Long} amount InputComponent amount
     */

    /**
     * Constructs a new InputComponent.
     * @memberof fusion
     * @classdesc Represents an InputComponent.
     * @implements IInputComponent
     * @constructor
     * @param {fusion.IInputComponent=} [properties] Properties to set
     */
    function InputComponent(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * InputComponent prevTxid.
     * @member {Uint8Array} prevTxid
     * @memberof fusion.InputComponent
     * @instance
     */
    InputComponent.prototype.prevTxid = $util.newBuffer([]);

    /**
     * InputComponent prevIndex.
     * @member {number} prevIndex
     * @memberof fusion.InputComponent
     * @instance
     */
    InputComponent.prototype.prevIndex = 0;

    /**
     * InputComponent pubkey.
     * @member {Uint8Array} pubkey
     * @memberof fusion.InputComponent
     * @instance
     */
    InputComponent.prototype.pubkey = $util.newBuffer([]);

    /**
     * InputComponent amount.
     * @member {number|Long} amount
     * @memberof fusion.InputComponent
     * @instance
     */
    InputComponent.prototype.amount = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * Creates a new InputComponent instance using the specified properties.
     * @function create
     * @memberof fusion.InputComponent
     * @static
     * @param {fusion.IInputComponent=} [properties] Properties to set
     * @returns {fusion.InputComponent} InputComponent instance
     */
    InputComponent.create = function create(properties) {
      return new InputComponent(properties);
    };

    /**
     * Encodes the specified InputComponent message. Does not implicitly {@link fusion.InputComponent.verify|verify} messages.
     * @function encode
     * @memberof fusion.InputComponent
     * @static
     * @param {fusion.IInputComponent} message InputComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    InputComponent.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.prevTxid);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.prevIndex);
      writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.pubkey);
      writer.uint32(/* id 4, wireType 0 =*/ 32).uint64(message.amount);
      return writer;
    };

    /**
     * Encodes the specified InputComponent message, length delimited. Does not implicitly {@link fusion.InputComponent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.InputComponent
     * @static
     * @param {fusion.IInputComponent} message InputComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    InputComponent.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an InputComponent message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.InputComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.InputComponent} InputComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    InputComponent.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.InputComponent();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.prevTxid = reader.bytes();
            break;
          }
          case 2: {
            message.prevIndex = reader.uint32();
            break;
          }
          case 3: {
            message.pubkey = reader.bytes();
            break;
          }
          case 4: {
            message.amount = reader.uint64();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("prevTxid"))
        throw $util.ProtocolError("missing required 'prevTxid'", {
          instance: message,
        });
      if (!message.hasOwnProperty("prevIndex"))
        throw $util.ProtocolError("missing required 'prevIndex'", {
          instance: message,
        });
      if (!message.hasOwnProperty("pubkey"))
        throw $util.ProtocolError("missing required 'pubkey'", {
          instance: message,
        });
      if (!message.hasOwnProperty("amount"))
        throw $util.ProtocolError("missing required 'amount'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes an InputComponent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.InputComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.InputComponent} InputComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    InputComponent.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an InputComponent message.
     * @function verify
     * @memberof fusion.InputComponent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    InputComponent.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !(
          (message.prevTxid && typeof message.prevTxid.length === "number") ||
          $util.isString(message.prevTxid)
        )
      )
        return "prevTxid: buffer expected";
      if (!$util.isInteger(message.prevIndex))
        return "prevIndex: integer expected";
      if (
        !(
          (message.pubkey && typeof message.pubkey.length === "number") ||
          $util.isString(message.pubkey)
        )
      )
        return "pubkey: buffer expected";
      if (
        !$util.isInteger(message.amount) &&
        !(
          message.amount &&
          $util.isInteger(message.amount.low) &&
          $util.isInteger(message.amount.high)
        )
      )
        return "amount: integer|Long expected";
      return null;
    };

    /**
     * Creates an InputComponent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.InputComponent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.InputComponent} InputComponent
     */
    InputComponent.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.InputComponent) return object;
      let message = new $root.fusion.InputComponent();
      if (object.prevTxid != null)
        if (typeof object.prevTxid === "string")
          $util.base64.decode(
            object.prevTxid,
            (message.prevTxid = $util.newBuffer(
              $util.base64.length(object.prevTxid)
            )),
            0
          );
        else if (object.prevTxid.length >= 0)
          message.prevTxid = object.prevTxid;
      if (object.prevIndex != null) message.prevIndex = object.prevIndex >>> 0;
      if (object.pubkey != null)
        if (typeof object.pubkey === "string")
          $util.base64.decode(
            object.pubkey,
            (message.pubkey = $util.newBuffer(
              $util.base64.length(object.pubkey)
            )),
            0
          );
        else if (object.pubkey.length >= 0) message.pubkey = object.pubkey;
      if (object.amount != null)
        if ($util.Long)
          (message.amount = $util.Long.fromValue(object.amount)).unsigned =
            true;
        else if (typeof object.amount === "string")
          message.amount = parseInt(object.amount, 10);
        else if (typeof object.amount === "number")
          message.amount = object.amount;
        else if (typeof object.amount === "object")
          message.amount = new $util.LongBits(
            object.amount.low >>> 0,
            object.amount.high >>> 0
          ).toNumber(true);
      return message;
    };

    /**
     * Creates a plain object from an InputComponent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.InputComponent
     * @static
     * @param {fusion.InputComponent} message InputComponent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    InputComponent.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.prevTxid = "";
        else {
          object.prevTxid = [];
          if (options.bytes !== Array)
            object.prevTxid = $util.newBuffer(object.prevTxid);
        }
        object.prevIndex = 0;
        if (options.bytes === String) object.pubkey = "";
        else {
          object.pubkey = [];
          if (options.bytes !== Array)
            object.pubkey = $util.newBuffer(object.pubkey);
        }
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.amount =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.amount = options.longs === String ? "0" : 0;
      }
      if (message.prevTxid != null && message.hasOwnProperty("prevTxid"))
        object.prevTxid =
          options.bytes === String
            ? $util.base64.encode(message.prevTxid, 0, message.prevTxid.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.prevTxid)
              : message.prevTxid;
      if (message.prevIndex != null && message.hasOwnProperty("prevIndex"))
        object.prevIndex = message.prevIndex;
      if (message.pubkey != null && message.hasOwnProperty("pubkey"))
        object.pubkey =
          options.bytes === String
            ? $util.base64.encode(message.pubkey, 0, message.pubkey.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.pubkey)
              : message.pubkey;
      if (message.amount != null && message.hasOwnProperty("amount"))
        if (typeof message.amount === "number")
          object.amount =
            options.longs === String ? String(message.amount) : message.amount;
        else
          object.amount =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.amount)
              : options.longs === Number
                ? new $util.LongBits(
                    message.amount.low >>> 0,
                    message.amount.high >>> 0
                  ).toNumber(true)
                : message.amount;
      return object;
    };

    /**
     * Converts this InputComponent to JSON.
     * @function toJSON
     * @memberof fusion.InputComponent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    InputComponent.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for InputComponent
     * @function getTypeUrl
     * @memberof fusion.InputComponent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    InputComponent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.InputComponent";
    };

    return InputComponent;
  })();

  fusion.OutputComponent = (function () {
    /**
     * Properties of an OutputComponent.
     * @memberof fusion
     * @interface IOutputComponent
     * @property {Uint8Array} scriptpubkey OutputComponent scriptpubkey
     * @property {number|Long} amount OutputComponent amount
     */

    /**
     * Constructs a new OutputComponent.
     * @memberof fusion
     * @classdesc Represents an OutputComponent.
     * @implements IOutputComponent
     * @constructor
     * @param {fusion.IOutputComponent=} [properties] Properties to set
     */
    function OutputComponent(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * OutputComponent scriptpubkey.
     * @member {Uint8Array} scriptpubkey
     * @memberof fusion.OutputComponent
     * @instance
     */
    OutputComponent.prototype.scriptpubkey = $util.newBuffer([]);

    /**
     * OutputComponent amount.
     * @member {number|Long} amount
     * @memberof fusion.OutputComponent
     * @instance
     */
    OutputComponent.prototype.amount = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * Creates a new OutputComponent instance using the specified properties.
     * @function create
     * @memberof fusion.OutputComponent
     * @static
     * @param {fusion.IOutputComponent=} [properties] Properties to set
     * @returns {fusion.OutputComponent} OutputComponent instance
     */
    OutputComponent.create = function create(properties) {
      return new OutputComponent(properties);
    };

    /**
     * Encodes the specified OutputComponent message. Does not implicitly {@link fusion.OutputComponent.verify|verify} messages.
     * @function encode
     * @memberof fusion.OutputComponent
     * @static
     * @param {fusion.IOutputComponent} message OutputComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OutputComponent.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.scriptpubkey);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint64(message.amount);
      return writer;
    };

    /**
     * Encodes the specified OutputComponent message, length delimited. Does not implicitly {@link fusion.OutputComponent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.OutputComponent
     * @static
     * @param {fusion.IOutputComponent} message OutputComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OutputComponent.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an OutputComponent message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.OutputComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.OutputComponent} OutputComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OutputComponent.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.OutputComponent();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.scriptpubkey = reader.bytes();
            break;
          }
          case 2: {
            message.amount = reader.uint64();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("scriptpubkey"))
        throw $util.ProtocolError("missing required 'scriptpubkey'", {
          instance: message,
        });
      if (!message.hasOwnProperty("amount"))
        throw $util.ProtocolError("missing required 'amount'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes an OutputComponent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.OutputComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.OutputComponent} OutputComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OutputComponent.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an OutputComponent message.
     * @function verify
     * @memberof fusion.OutputComponent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    OutputComponent.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !(
          (message.scriptpubkey &&
            typeof message.scriptpubkey.length === "number") ||
          $util.isString(message.scriptpubkey)
        )
      )
        return "scriptpubkey: buffer expected";
      if (
        !$util.isInteger(message.amount) &&
        !(
          message.amount &&
          $util.isInteger(message.amount.low) &&
          $util.isInteger(message.amount.high)
        )
      )
        return "amount: integer|Long expected";
      return null;
    };

    /**
     * Creates an OutputComponent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.OutputComponent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.OutputComponent} OutputComponent
     */
    OutputComponent.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.OutputComponent) return object;
      let message = new $root.fusion.OutputComponent();
      if (object.scriptpubkey != null)
        if (typeof object.scriptpubkey === "string")
          $util.base64.decode(
            object.scriptpubkey,
            (message.scriptpubkey = $util.newBuffer(
              $util.base64.length(object.scriptpubkey)
            )),
            0
          );
        else if (object.scriptpubkey.length >= 0)
          message.scriptpubkey = object.scriptpubkey;
      if (object.amount != null)
        if ($util.Long)
          (message.amount = $util.Long.fromValue(object.amount)).unsigned =
            true;
        else if (typeof object.amount === "string")
          message.amount = parseInt(object.amount, 10);
        else if (typeof object.amount === "number")
          message.amount = object.amount;
        else if (typeof object.amount === "object")
          message.amount = new $util.LongBits(
            object.amount.low >>> 0,
            object.amount.high >>> 0
          ).toNumber(true);
      return message;
    };

    /**
     * Creates a plain object from an OutputComponent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.OutputComponent
     * @static
     * @param {fusion.OutputComponent} message OutputComponent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    OutputComponent.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.scriptpubkey = "";
        else {
          object.scriptpubkey = [];
          if (options.bytes !== Array)
            object.scriptpubkey = $util.newBuffer(object.scriptpubkey);
        }
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.amount =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.amount = options.longs === String ? "0" : 0;
      }
      if (
        message.scriptpubkey != null &&
        message.hasOwnProperty("scriptpubkey")
      )
        object.scriptpubkey =
          options.bytes === String
            ? $util.base64.encode(
                message.scriptpubkey,
                0,
                message.scriptpubkey.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.scriptpubkey)
              : message.scriptpubkey;
      if (message.amount != null && message.hasOwnProperty("amount"))
        if (typeof message.amount === "number")
          object.amount =
            options.longs === String ? String(message.amount) : message.amount;
        else
          object.amount =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.amount)
              : options.longs === Number
                ? new $util.LongBits(
                    message.amount.low >>> 0,
                    message.amount.high >>> 0
                  ).toNumber(true)
                : message.amount;
      return object;
    };

    /**
     * Converts this OutputComponent to JSON.
     * @function toJSON
     * @memberof fusion.OutputComponent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    OutputComponent.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for OutputComponent
     * @function getTypeUrl
     * @memberof fusion.OutputComponent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    OutputComponent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.OutputComponent";
    };

    return OutputComponent;
  })();

  fusion.BlankComponent = (function () {
    /**
     * Properties of a BlankComponent.
     * @memberof fusion
     * @interface IBlankComponent
     */

    /**
     * Constructs a new BlankComponent.
     * @memberof fusion
     * @classdesc Represents a BlankComponent.
     * @implements IBlankComponent
     * @constructor
     * @param {fusion.IBlankComponent=} [properties] Properties to set
     */
    function BlankComponent(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new BlankComponent instance using the specified properties.
     * @function create
     * @memberof fusion.BlankComponent
     * @static
     * @param {fusion.IBlankComponent=} [properties] Properties to set
     * @returns {fusion.BlankComponent} BlankComponent instance
     */
    BlankComponent.create = function create(properties) {
      return new BlankComponent(properties);
    };

    /**
     * Encodes the specified BlankComponent message. Does not implicitly {@link fusion.BlankComponent.verify|verify} messages.
     * @function encode
     * @memberof fusion.BlankComponent
     * @static
     * @param {fusion.IBlankComponent} message BlankComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlankComponent.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      return writer;
    };

    /**
     * Encodes the specified BlankComponent message, length delimited. Does not implicitly {@link fusion.BlankComponent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.BlankComponent
     * @static
     * @param {fusion.IBlankComponent} message BlankComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlankComponent.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlankComponent message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.BlankComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.BlankComponent} BlankComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlankComponent.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.BlankComponent();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a BlankComponent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.BlankComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.BlankComponent} BlankComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlankComponent.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlankComponent message.
     * @function verify
     * @memberof fusion.BlankComponent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlankComponent.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      return null;
    };

    /**
     * Creates a BlankComponent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.BlankComponent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.BlankComponent} BlankComponent
     */
    BlankComponent.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.BlankComponent) return object;
      return new $root.fusion.BlankComponent();
    };

    /**
     * Creates a plain object from a BlankComponent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.BlankComponent
     * @static
     * @param {fusion.BlankComponent} message BlankComponent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlankComponent.toObject = function toObject() {
      return {};
    };

    /**
     * Converts this BlankComponent to JSON.
     * @function toJSON
     * @memberof fusion.BlankComponent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlankComponent.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for BlankComponent
     * @function getTypeUrl
     * @memberof fusion.BlankComponent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    BlankComponent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.BlankComponent";
    };

    return BlankComponent;
  })();

  fusion.Component = (function () {
    /**
     * Properties of a Component.
     * @memberof fusion
     * @interface IComponent
     * @property {Uint8Array} saltCommitment Component saltCommitment
     * @property {fusion.IInputComponent|null} [input] Component input
     * @property {fusion.IOutputComponent|null} [output] Component output
     * @property {fusion.IBlankComponent|null} [blank] Component blank
     */

    /**
     * Constructs a new Component.
     * @memberof fusion
     * @classdesc Represents a Component.
     * @implements IComponent
     * @constructor
     * @param {fusion.IComponent=} [properties] Properties to set
     */
    function Component(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Component saltCommitment.
     * @member {Uint8Array} saltCommitment
     * @memberof fusion.Component
     * @instance
     */
    Component.prototype.saltCommitment = $util.newBuffer([]);

    /**
     * Component input.
     * @member {fusion.IInputComponent|null|undefined} input
     * @memberof fusion.Component
     * @instance
     */
    Component.prototype.input = null;

    /**
     * Component output.
     * @member {fusion.IOutputComponent|null|undefined} output
     * @memberof fusion.Component
     * @instance
     */
    Component.prototype.output = null;

    /**
     * Component blank.
     * @member {fusion.IBlankComponent|null|undefined} blank
     * @memberof fusion.Component
     * @instance
     */
    Component.prototype.blank = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * Component component.
     * @member {"input"|"output"|"blank"|undefined} component
     * @memberof fusion.Component
     * @instance
     */
    Object.defineProperty(Component.prototype, "component", {
      get: $util.oneOfGetter(($oneOfFields = ["input", "output", "blank"])),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new Component instance using the specified properties.
     * @function create
     * @memberof fusion.Component
     * @static
     * @param {fusion.IComponent=} [properties] Properties to set
     * @returns {fusion.Component} Component instance
     */
    Component.create = function create(properties) {
      return new Component(properties);
    };

    /**
     * Encodes the specified Component message. Does not implicitly {@link fusion.Component.verify|verify} messages.
     * @function encode
     * @memberof fusion.Component
     * @static
     * @param {fusion.IComponent} message Component message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Component.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.saltCommitment);
      if (message.input != null && Object.hasOwnProperty.call(message, "input"))
        $root.fusion.InputComponent.encode(
          message.input,
          writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
        ).ldelim();
      if (
        message.output != null &&
        Object.hasOwnProperty.call(message, "output")
      )
        $root.fusion.OutputComponent.encode(
          message.output,
          writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
        ).ldelim();
      if (message.blank != null && Object.hasOwnProperty.call(message, "blank"))
        $root.fusion.BlankComponent.encode(
          message.blank,
          writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
        ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified Component message, length delimited. Does not implicitly {@link fusion.Component.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.Component
     * @static
     * @param {fusion.IComponent} message Component message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Component.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Component message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.Component
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.Component} Component
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Component.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.Component();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.saltCommitment = reader.bytes();
            break;
          }
          case 2: {
            message.input = $root.fusion.InputComponent.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 3: {
            message.output = $root.fusion.OutputComponent.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 4: {
            message.blank = $root.fusion.BlankComponent.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("saltCommitment"))
        throw $util.ProtocolError("missing required 'saltCommitment'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a Component message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.Component
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.Component} Component
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Component.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Component message.
     * @function verify
     * @memberof fusion.Component
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Component.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      let properties = {};
      if (
        !(
          (message.saltCommitment &&
            typeof message.saltCommitment.length === "number") ||
          $util.isString(message.saltCommitment)
        )
      )
        return "saltCommitment: buffer expected";
      if (message.input != null && message.hasOwnProperty("input")) {
        properties.component = 1;
        {
          let error = $root.fusion.InputComponent.verify(message.input);
          if (error) return "input." + error;
        }
      }
      if (message.output != null && message.hasOwnProperty("output")) {
        if (properties.component === 1) return "component: multiple values";
        properties.component = 1;
        {
          let error = $root.fusion.OutputComponent.verify(message.output);
          if (error) return "output." + error;
        }
      }
      if (message.blank != null && message.hasOwnProperty("blank")) {
        if (properties.component === 1) return "component: multiple values";
        properties.component = 1;
        {
          let error = $root.fusion.BlankComponent.verify(message.blank);
          if (error) return "blank." + error;
        }
      }
      return null;
    };

    /**
     * Creates a Component message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.Component
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.Component} Component
     */
    Component.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.Component) return object;
      let message = new $root.fusion.Component();
      if (object.saltCommitment != null)
        if (typeof object.saltCommitment === "string")
          $util.base64.decode(
            object.saltCommitment,
            (message.saltCommitment = $util.newBuffer(
              $util.base64.length(object.saltCommitment)
            )),
            0
          );
        else if (object.saltCommitment.length >= 0)
          message.saltCommitment = object.saltCommitment;
      if (object.input != null) {
        if (typeof object.input !== "object")
          throw TypeError(".fusion.Component.input: object expected");
        message.input = $root.fusion.InputComponent.fromObject(object.input);
      }
      if (object.output != null) {
        if (typeof object.output !== "object")
          throw TypeError(".fusion.Component.output: object expected");
        message.output = $root.fusion.OutputComponent.fromObject(object.output);
      }
      if (object.blank != null) {
        if (typeof object.blank !== "object")
          throw TypeError(".fusion.Component.blank: object expected");
        message.blank = $root.fusion.BlankComponent.fromObject(object.blank);
      }
      return message;
    };

    /**
     * Creates a plain object from a Component message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.Component
     * @static
     * @param {fusion.Component} message Component
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Component.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults)
        if (options.bytes === String) object.saltCommitment = "";
        else {
          object.saltCommitment = [];
          if (options.bytes !== Array)
            object.saltCommitment = $util.newBuffer(object.saltCommitment);
        }
      if (
        message.saltCommitment != null &&
        message.hasOwnProperty("saltCommitment")
      )
        object.saltCommitment =
          options.bytes === String
            ? $util.base64.encode(
                message.saltCommitment,
                0,
                message.saltCommitment.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.saltCommitment)
              : message.saltCommitment;
      if (message.input != null && message.hasOwnProperty("input")) {
        object.input = $root.fusion.InputComponent.toObject(
          message.input,
          options
        );
        if (options.oneofs) object.component = "input";
      }
      if (message.output != null && message.hasOwnProperty("output")) {
        object.output = $root.fusion.OutputComponent.toObject(
          message.output,
          options
        );
        if (options.oneofs) object.component = "output";
      }
      if (message.blank != null && message.hasOwnProperty("blank")) {
        object.blank = $root.fusion.BlankComponent.toObject(
          message.blank,
          options
        );
        if (options.oneofs) object.component = "blank";
      }
      return object;
    };

    /**
     * Converts this Component to JSON.
     * @function toJSON
     * @memberof fusion.Component
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Component.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Component
     * @function getTypeUrl
     * @memberof fusion.Component
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Component.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.Component";
    };

    return Component;
  })();

  fusion.InitialCommitment = (function () {
    /**
     * Properties of an InitialCommitment.
     * @memberof fusion
     * @interface IInitialCommitment
     * @property {Uint8Array} saltedComponentHash InitialCommitment saltedComponentHash
     * @property {Uint8Array} amountCommitment InitialCommitment amountCommitment
     * @property {Uint8Array} communicationKey InitialCommitment communicationKey
     */

    /**
     * Constructs a new InitialCommitment.
     * @memberof fusion
     * @classdesc Represents an InitialCommitment.
     * @implements IInitialCommitment
     * @constructor
     * @param {fusion.IInitialCommitment=} [properties] Properties to set
     */
    function InitialCommitment(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * InitialCommitment saltedComponentHash.
     * @member {Uint8Array} saltedComponentHash
     * @memberof fusion.InitialCommitment
     * @instance
     */
    InitialCommitment.prototype.saltedComponentHash = $util.newBuffer([]);

    /**
     * InitialCommitment amountCommitment.
     * @member {Uint8Array} amountCommitment
     * @memberof fusion.InitialCommitment
     * @instance
     */
    InitialCommitment.prototype.amountCommitment = $util.newBuffer([]);

    /**
     * InitialCommitment communicationKey.
     * @member {Uint8Array} communicationKey
     * @memberof fusion.InitialCommitment
     * @instance
     */
    InitialCommitment.prototype.communicationKey = $util.newBuffer([]);

    /**
     * Creates a new InitialCommitment instance using the specified properties.
     * @function create
     * @memberof fusion.InitialCommitment
     * @static
     * @param {fusion.IInitialCommitment=} [properties] Properties to set
     * @returns {fusion.InitialCommitment} InitialCommitment instance
     */
    InitialCommitment.create = function create(properties) {
      return new InitialCommitment(properties);
    };

    /**
     * Encodes the specified InitialCommitment message. Does not implicitly {@link fusion.InitialCommitment.verify|verify} messages.
     * @function encode
     * @memberof fusion.InitialCommitment
     * @static
     * @param {fusion.IInitialCommitment} message InitialCommitment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    InitialCommitment.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer
        .uint32(/* id 1, wireType 2 =*/ 10)
        .bytes(message.saltedComponentHash);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.amountCommitment);
      writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.communicationKey);
      return writer;
    };

    /**
     * Encodes the specified InitialCommitment message, length delimited. Does not implicitly {@link fusion.InitialCommitment.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.InitialCommitment
     * @static
     * @param {fusion.IInitialCommitment} message InitialCommitment message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    InitialCommitment.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an InitialCommitment message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.InitialCommitment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.InitialCommitment} InitialCommitment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    InitialCommitment.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.InitialCommitment();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.saltedComponentHash = reader.bytes();
            break;
          }
          case 2: {
            message.amountCommitment = reader.bytes();
            break;
          }
          case 3: {
            message.communicationKey = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("saltedComponentHash"))
        throw $util.ProtocolError("missing required 'saltedComponentHash'", {
          instance: message,
        });
      if (!message.hasOwnProperty("amountCommitment"))
        throw $util.ProtocolError("missing required 'amountCommitment'", {
          instance: message,
        });
      if (!message.hasOwnProperty("communicationKey"))
        throw $util.ProtocolError("missing required 'communicationKey'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes an InitialCommitment message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.InitialCommitment
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.InitialCommitment} InitialCommitment
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    InitialCommitment.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an InitialCommitment message.
     * @function verify
     * @memberof fusion.InitialCommitment
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    InitialCommitment.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !(
          (message.saltedComponentHash &&
            typeof message.saltedComponentHash.length === "number") ||
          $util.isString(message.saltedComponentHash)
        )
      )
        return "saltedComponentHash: buffer expected";
      if (
        !(
          (message.amountCommitment &&
            typeof message.amountCommitment.length === "number") ||
          $util.isString(message.amountCommitment)
        )
      )
        return "amountCommitment: buffer expected";
      if (
        !(
          (message.communicationKey &&
            typeof message.communicationKey.length === "number") ||
          $util.isString(message.communicationKey)
        )
      )
        return "communicationKey: buffer expected";
      return null;
    };

    /**
     * Creates an InitialCommitment message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.InitialCommitment
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.InitialCommitment} InitialCommitment
     */
    InitialCommitment.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.InitialCommitment) return object;
      let message = new $root.fusion.InitialCommitment();
      if (object.saltedComponentHash != null)
        if (typeof object.saltedComponentHash === "string")
          $util.base64.decode(
            object.saltedComponentHash,
            (message.saltedComponentHash = $util.newBuffer(
              $util.base64.length(object.saltedComponentHash)
            )),
            0
          );
        else if (object.saltedComponentHash.length >= 0)
          message.saltedComponentHash = object.saltedComponentHash;
      if (object.amountCommitment != null)
        if (typeof object.amountCommitment === "string")
          $util.base64.decode(
            object.amountCommitment,
            (message.amountCommitment = $util.newBuffer(
              $util.base64.length(object.amountCommitment)
            )),
            0
          );
        else if (object.amountCommitment.length >= 0)
          message.amountCommitment = object.amountCommitment;
      if (object.communicationKey != null)
        if (typeof object.communicationKey === "string")
          $util.base64.decode(
            object.communicationKey,
            (message.communicationKey = $util.newBuffer(
              $util.base64.length(object.communicationKey)
            )),
            0
          );
        else if (object.communicationKey.length >= 0)
          message.communicationKey = object.communicationKey;
      return message;
    };

    /**
     * Creates a plain object from an InitialCommitment message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.InitialCommitment
     * @static
     * @param {fusion.InitialCommitment} message InitialCommitment
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    InitialCommitment.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.saltedComponentHash = "";
        else {
          object.saltedComponentHash = [];
          if (options.bytes !== Array)
            object.saltedComponentHash = $util.newBuffer(
              object.saltedComponentHash
            );
        }
        if (options.bytes === String) object.amountCommitment = "";
        else {
          object.amountCommitment = [];
          if (options.bytes !== Array)
            object.amountCommitment = $util.newBuffer(object.amountCommitment);
        }
        if (options.bytes === String) object.communicationKey = "";
        else {
          object.communicationKey = [];
          if (options.bytes !== Array)
            object.communicationKey = $util.newBuffer(object.communicationKey);
        }
      }
      if (
        message.saltedComponentHash != null &&
        message.hasOwnProperty("saltedComponentHash")
      )
        object.saltedComponentHash =
          options.bytes === String
            ? $util.base64.encode(
                message.saltedComponentHash,
                0,
                message.saltedComponentHash.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.saltedComponentHash)
              : message.saltedComponentHash;
      if (
        message.amountCommitment != null &&
        message.hasOwnProperty("amountCommitment")
      )
        object.amountCommitment =
          options.bytes === String
            ? $util.base64.encode(
                message.amountCommitment,
                0,
                message.amountCommitment.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.amountCommitment)
              : message.amountCommitment;
      if (
        message.communicationKey != null &&
        message.hasOwnProperty("communicationKey")
      )
        object.communicationKey =
          options.bytes === String
            ? $util.base64.encode(
                message.communicationKey,
                0,
                message.communicationKey.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.communicationKey)
              : message.communicationKey;
      return object;
    };

    /**
     * Converts this InitialCommitment to JSON.
     * @function toJSON
     * @memberof fusion.InitialCommitment
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    InitialCommitment.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for InitialCommitment
     * @function getTypeUrl
     * @memberof fusion.InitialCommitment
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    InitialCommitment.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.InitialCommitment";
    };

    return InitialCommitment;
  })();

  fusion.Proof = (function () {
    /**
     * Properties of a Proof.
     * @memberof fusion
     * @interface IProof
     * @property {number} componentIdx Proof componentIdx
     * @property {Uint8Array} salt Proof salt
     * @property {Uint8Array} pedersenNonce Proof pedersenNonce
     */

    /**
     * Constructs a new Proof.
     * @memberof fusion
     * @classdesc Represents a Proof.
     * @implements IProof
     * @constructor
     * @param {fusion.IProof=} [properties] Properties to set
     */
    function Proof(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Proof componentIdx.
     * @member {number} componentIdx
     * @memberof fusion.Proof
     * @instance
     */
    Proof.prototype.componentIdx = 0;

    /**
     * Proof salt.
     * @member {Uint8Array} salt
     * @memberof fusion.Proof
     * @instance
     */
    Proof.prototype.salt = $util.newBuffer([]);

    /**
     * Proof pedersenNonce.
     * @member {Uint8Array} pedersenNonce
     * @memberof fusion.Proof
     * @instance
     */
    Proof.prototype.pedersenNonce = $util.newBuffer([]);

    /**
     * Creates a new Proof instance using the specified properties.
     * @function create
     * @memberof fusion.Proof
     * @static
     * @param {fusion.IProof=} [properties] Properties to set
     * @returns {fusion.Proof} Proof instance
     */
    Proof.create = function create(properties) {
      return new Proof(properties);
    };

    /**
     * Encodes the specified Proof message. Does not implicitly {@link fusion.Proof.verify|verify} messages.
     * @function encode
     * @memberof fusion.Proof
     * @static
     * @param {fusion.IProof} message Proof message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Proof.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 5 =*/ 13).fixed32(message.componentIdx);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.salt);
      writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.pedersenNonce);
      return writer;
    };

    /**
     * Encodes the specified Proof message, length delimited. Does not implicitly {@link fusion.Proof.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.Proof
     * @static
     * @param {fusion.IProof} message Proof message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Proof.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Proof message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.Proof
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.Proof} Proof
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Proof.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.Proof();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.componentIdx = reader.fixed32();
            break;
          }
          case 2: {
            message.salt = reader.bytes();
            break;
          }
          case 3: {
            message.pedersenNonce = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("componentIdx"))
        throw $util.ProtocolError("missing required 'componentIdx'", {
          instance: message,
        });
      if (!message.hasOwnProperty("salt"))
        throw $util.ProtocolError("missing required 'salt'", {
          instance: message,
        });
      if (!message.hasOwnProperty("pedersenNonce"))
        throw $util.ProtocolError("missing required 'pedersenNonce'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a Proof message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.Proof
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.Proof} Proof
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Proof.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Proof message.
     * @function verify
     * @memberof fusion.Proof
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Proof.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (!$util.isInteger(message.componentIdx))
        return "componentIdx: integer expected";
      if (
        !(
          (message.salt && typeof message.salt.length === "number") ||
          $util.isString(message.salt)
        )
      )
        return "salt: buffer expected";
      if (
        !(
          (message.pedersenNonce &&
            typeof message.pedersenNonce.length === "number") ||
          $util.isString(message.pedersenNonce)
        )
      )
        return "pedersenNonce: buffer expected";
      return null;
    };

    /**
     * Creates a Proof message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.Proof
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.Proof} Proof
     */
    Proof.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.Proof) return object;
      let message = new $root.fusion.Proof();
      if (object.componentIdx != null)
        message.componentIdx = object.componentIdx >>> 0;
      if (object.salt != null)
        if (typeof object.salt === "string")
          $util.base64.decode(
            object.salt,
            (message.salt = $util.newBuffer($util.base64.length(object.salt))),
            0
          );
        else if (object.salt.length >= 0) message.salt = object.salt;
      if (object.pedersenNonce != null)
        if (typeof object.pedersenNonce === "string")
          $util.base64.decode(
            object.pedersenNonce,
            (message.pedersenNonce = $util.newBuffer(
              $util.base64.length(object.pedersenNonce)
            )),
            0
          );
        else if (object.pedersenNonce.length >= 0)
          message.pedersenNonce = object.pedersenNonce;
      return message;
    };

    /**
     * Creates a plain object from a Proof message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.Proof
     * @static
     * @param {fusion.Proof} message Proof
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Proof.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        object.componentIdx = 0;
        if (options.bytes === String) object.salt = "";
        else {
          object.salt = [];
          if (options.bytes !== Array)
            object.salt = $util.newBuffer(object.salt);
        }
        if (options.bytes === String) object.pedersenNonce = "";
        else {
          object.pedersenNonce = [];
          if (options.bytes !== Array)
            object.pedersenNonce = $util.newBuffer(object.pedersenNonce);
        }
      }
      if (
        message.componentIdx != null &&
        message.hasOwnProperty("componentIdx")
      )
        object.componentIdx = message.componentIdx;
      if (message.salt != null && message.hasOwnProperty("salt"))
        object.salt =
          options.bytes === String
            ? $util.base64.encode(message.salt, 0, message.salt.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.salt)
              : message.salt;
      if (
        message.pedersenNonce != null &&
        message.hasOwnProperty("pedersenNonce")
      )
        object.pedersenNonce =
          options.bytes === String
            ? $util.base64.encode(
                message.pedersenNonce,
                0,
                message.pedersenNonce.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.pedersenNonce)
              : message.pedersenNonce;
      return object;
    };

    /**
     * Converts this Proof to JSON.
     * @function toJSON
     * @memberof fusion.Proof
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Proof.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Proof
     * @function getTypeUrl
     * @memberof fusion.Proof
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Proof.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.Proof";
    };

    return Proof;
  })();

  fusion.ClientHello = (function () {
    /**
     * Properties of a ClientHello.
     * @memberof fusion
     * @interface IClientHello
     * @property {Uint8Array} version ClientHello version
     * @property {Uint8Array|null} [genesisHash] ClientHello genesisHash
     */

    /**
     * Constructs a new ClientHello.
     * @memberof fusion
     * @classdesc Represents a ClientHello.
     * @implements IClientHello
     * @constructor
     * @param {fusion.IClientHello=} [properties] Properties to set
     */
    function ClientHello(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * ClientHello version.
     * @member {Uint8Array} version
     * @memberof fusion.ClientHello
     * @instance
     */
    ClientHello.prototype.version = $util.newBuffer([]);

    /**
     * ClientHello genesisHash.
     * @member {Uint8Array} genesisHash
     * @memberof fusion.ClientHello
     * @instance
     */
    ClientHello.prototype.genesisHash = $util.newBuffer([]);

    /**
     * Creates a new ClientHello instance using the specified properties.
     * @function create
     * @memberof fusion.ClientHello
     * @static
     * @param {fusion.IClientHello=} [properties] Properties to set
     * @returns {fusion.ClientHello} ClientHello instance
     */
    ClientHello.create = function create(properties) {
      return new ClientHello(properties);
    };

    /**
     * Encodes the specified ClientHello message. Does not implicitly {@link fusion.ClientHello.verify|verify} messages.
     * @function encode
     * @memberof fusion.ClientHello
     * @static
     * @param {fusion.IClientHello} message ClientHello message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientHello.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.version);
      if (
        message.genesisHash != null &&
        Object.hasOwnProperty.call(message, "genesisHash")
      )
        writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.genesisHash);
      return writer;
    };

    /**
     * Encodes the specified ClientHello message, length delimited. Does not implicitly {@link fusion.ClientHello.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.ClientHello
     * @static
     * @param {fusion.IClientHello} message ClientHello message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientHello.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ClientHello message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.ClientHello
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.ClientHello} ClientHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientHello.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.ClientHello();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.version = reader.bytes();
            break;
          }
          case 2: {
            message.genesisHash = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("version"))
        throw $util.ProtocolError("missing required 'version'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a ClientHello message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.ClientHello
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.ClientHello} ClientHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientHello.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ClientHello message.
     * @function verify
     * @memberof fusion.ClientHello
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ClientHello.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !(
          (message.version && typeof message.version.length === "number") ||
          $util.isString(message.version)
        )
      )
        return "version: buffer expected";
      if (message.genesisHash != null && message.hasOwnProperty("genesisHash"))
        if (
          !(
            (message.genesisHash &&
              typeof message.genesisHash.length === "number") ||
            $util.isString(message.genesisHash)
          )
        )
          return "genesisHash: buffer expected";
      return null;
    };

    /**
     * Creates a ClientHello message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.ClientHello
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.ClientHello} ClientHello
     */
    ClientHello.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.ClientHello) return object;
      let message = new $root.fusion.ClientHello();
      if (object.version != null)
        if (typeof object.version === "string")
          $util.base64.decode(
            object.version,
            (message.version = $util.newBuffer(
              $util.base64.length(object.version)
            )),
            0
          );
        else if (object.version.length >= 0) message.version = object.version;
      if (object.genesisHash != null)
        if (typeof object.genesisHash === "string")
          $util.base64.decode(
            object.genesisHash,
            (message.genesisHash = $util.newBuffer(
              $util.base64.length(object.genesisHash)
            )),
            0
          );
        else if (object.genesisHash.length >= 0)
          message.genesisHash = object.genesisHash;
      return message;
    };

    /**
     * Creates a plain object from a ClientHello message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.ClientHello
     * @static
     * @param {fusion.ClientHello} message ClientHello
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ClientHello.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.version = "";
        else {
          object.version = [];
          if (options.bytes !== Array)
            object.version = $util.newBuffer(object.version);
        }
        if (options.bytes === String) object.genesisHash = "";
        else {
          object.genesisHash = [];
          if (options.bytes !== Array)
            object.genesisHash = $util.newBuffer(object.genesisHash);
        }
      }
      if (message.version != null && message.hasOwnProperty("version"))
        object.version =
          options.bytes === String
            ? $util.base64.encode(message.version, 0, message.version.length)
            : options.bytes === Array
              ? Array.prototype.slice.call(message.version)
              : message.version;
      if (message.genesisHash != null && message.hasOwnProperty("genesisHash"))
        object.genesisHash =
          options.bytes === String
            ? $util.base64.encode(
                message.genesisHash,
                0,
                message.genesisHash.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.genesisHash)
              : message.genesisHash;
      return object;
    };

    /**
     * Converts this ClientHello to JSON.
     * @function toJSON
     * @memberof fusion.ClientHello
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ClientHello.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ClientHello
     * @function getTypeUrl
     * @memberof fusion.ClientHello
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ClientHello.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.ClientHello";
    };

    return ClientHello;
  })();

  fusion.ServerHello = (function () {
    /**
     * Properties of a ServerHello.
     * @memberof fusion
     * @interface IServerHello
     * @property {Array.<number|Long>|null} [tiers] ServerHello tiers
     * @property {number} numComponents ServerHello numComponents
     * @property {number|Long} componentFeerate ServerHello componentFeerate
     * @property {number|Long} minExcessFee ServerHello minExcessFee
     * @property {number|Long} maxExcessFee ServerHello maxExcessFee
     * @property {string|null} [donationAddress] ServerHello donationAddress
     */

    /**
     * Constructs a new ServerHello.
     * @memberof fusion
     * @classdesc Represents a ServerHello.
     * @implements IServerHello
     * @constructor
     * @param {fusion.IServerHello=} [properties] Properties to set
     */
    function ServerHello(properties) {
      this.tiers = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * ServerHello tiers.
     * @member {Array.<number|Long>} tiers
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.tiers = $util.emptyArray;

    /**
     * ServerHello numComponents.
     * @member {number} numComponents
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.numComponents = 0;

    /**
     * ServerHello componentFeerate.
     * @member {number|Long} componentFeerate
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.componentFeerate = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * ServerHello minExcessFee.
     * @member {number|Long} minExcessFee
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.minExcessFee = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * ServerHello maxExcessFee.
     * @member {number|Long} maxExcessFee
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.maxExcessFee = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * ServerHello donationAddress.
     * @member {string} donationAddress
     * @memberof fusion.ServerHello
     * @instance
     */
    ServerHello.prototype.donationAddress = "";

    /**
     * Creates a new ServerHello instance using the specified properties.
     * @function create
     * @memberof fusion.ServerHello
     * @static
     * @param {fusion.IServerHello=} [properties] Properties to set
     * @returns {fusion.ServerHello} ServerHello instance
     */
    ServerHello.create = function create(properties) {
      return new ServerHello(properties);
    };

    /**
     * Encodes the specified ServerHello message. Does not implicitly {@link fusion.ServerHello.verify|verify} messages.
     * @function encode
     * @memberof fusion.ServerHello
     * @static
     * @param {fusion.IServerHello} message ServerHello message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ServerHello.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.tiers != null && message.tiers.length)
        for (let i = 0; i < message.tiers.length; ++i)
          writer.uint32(/* id 1, wireType 0 =*/ 8).uint64(message.tiers[i]);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.numComponents);
      writer
        .uint32(/* id 4, wireType 0 =*/ 32)
        .uint64(message.componentFeerate);
      writer.uint32(/* id 5, wireType 0 =*/ 40).uint64(message.minExcessFee);
      writer.uint32(/* id 6, wireType 0 =*/ 48).uint64(message.maxExcessFee);
      if (
        message.donationAddress != null &&
        Object.hasOwnProperty.call(message, "donationAddress")
      )
        writer
          .uint32(/* id 15, wireType 2 =*/ 122)
          .string(message.donationAddress);
      return writer;
    };

    /**
     * Encodes the specified ServerHello message, length delimited. Does not implicitly {@link fusion.ServerHello.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.ServerHello
     * @static
     * @param {fusion.IServerHello} message ServerHello message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ServerHello.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ServerHello message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.ServerHello
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.ServerHello} ServerHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ServerHello.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.ServerHello();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.tiers && message.tiers.length)) message.tiers = [];
            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2) message.tiers.push(reader.uint64());
            } else message.tiers.push(reader.uint64());
            break;
          }
          case 2: {
            message.numComponents = reader.uint32();
            break;
          }
          case 4: {
            message.componentFeerate = reader.uint64();
            break;
          }
          case 5: {
            message.minExcessFee = reader.uint64();
            break;
          }
          case 6: {
            message.maxExcessFee = reader.uint64();
            break;
          }
          case 15: {
            message.donationAddress = reader.string();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("numComponents"))
        throw $util.ProtocolError("missing required 'numComponents'", {
          instance: message,
        });
      if (!message.hasOwnProperty("componentFeerate"))
        throw $util.ProtocolError("missing required 'componentFeerate'", {
          instance: message,
        });
      if (!message.hasOwnProperty("minExcessFee"))
        throw $util.ProtocolError("missing required 'minExcessFee'", {
          instance: message,
        });
      if (!message.hasOwnProperty("maxExcessFee"))
        throw $util.ProtocolError("missing required 'maxExcessFee'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a ServerHello message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.ServerHello
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.ServerHello} ServerHello
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ServerHello.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ServerHello message.
     * @function verify
     * @memberof fusion.ServerHello
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ServerHello.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.tiers != null && message.hasOwnProperty("tiers")) {
        if (!Array.isArray(message.tiers)) return "tiers: array expected";
        for (let i = 0; i < message.tiers.length; ++i)
          if (
            !$util.isInteger(message.tiers[i]) &&
            !(
              message.tiers[i] &&
              $util.isInteger(message.tiers[i].low) &&
              $util.isInteger(message.tiers[i].high)
            )
          )
            return "tiers: integer|Long[] expected";
      }
      if (!$util.isInteger(message.numComponents))
        return "numComponents: integer expected";
      if (
        !$util.isInteger(message.componentFeerate) &&
        !(
          message.componentFeerate &&
          $util.isInteger(message.componentFeerate.low) &&
          $util.isInteger(message.componentFeerate.high)
        )
      )
        return "componentFeerate: integer|Long expected";
      if (
        !$util.isInteger(message.minExcessFee) &&
        !(
          message.minExcessFee &&
          $util.isInteger(message.minExcessFee.low) &&
          $util.isInteger(message.minExcessFee.high)
        )
      )
        return "minExcessFee: integer|Long expected";
      if (
        !$util.isInteger(message.maxExcessFee) &&
        !(
          message.maxExcessFee &&
          $util.isInteger(message.maxExcessFee.low) &&
          $util.isInteger(message.maxExcessFee.high)
        )
      )
        return "maxExcessFee: integer|Long expected";
      if (
        message.donationAddress != null &&
        message.hasOwnProperty("donationAddress")
      )
        if (!$util.isString(message.donationAddress))
          return "donationAddress: string expected";
      return null;
    };

    /**
     * Creates a ServerHello message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.ServerHello
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.ServerHello} ServerHello
     */
    ServerHello.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.ServerHello) return object;
      let message = new $root.fusion.ServerHello();
      if (object.tiers) {
        if (!Array.isArray(object.tiers))
          throw TypeError(".fusion.ServerHello.tiers: array expected");
        message.tiers = [];
        for (let i = 0; i < object.tiers.length; ++i)
          if ($util.Long)
            (message.tiers[i] = $util.Long.fromValue(
              object.tiers[i]
            )).unsigned = true;
          else if (typeof object.tiers[i] === "string")
            message.tiers[i] = parseInt(object.tiers[i], 10);
          else if (typeof object.tiers[i] === "number")
            message.tiers[i] = object.tiers[i];
          else if (typeof object.tiers[i] === "object")
            message.tiers[i] = new $util.LongBits(
              object.tiers[i].low >>> 0,
              object.tiers[i].high >>> 0
            ).toNumber(true);
      }
      if (object.numComponents != null)
        message.numComponents = object.numComponents >>> 0;
      if (object.componentFeerate != null)
        if ($util.Long)
          (message.componentFeerate = $util.Long.fromValue(
            object.componentFeerate
          )).unsigned = true;
        else if (typeof object.componentFeerate === "string")
          message.componentFeerate = parseInt(object.componentFeerate, 10);
        else if (typeof object.componentFeerate === "number")
          message.componentFeerate = object.componentFeerate;
        else if (typeof object.componentFeerate === "object")
          message.componentFeerate = new $util.LongBits(
            object.componentFeerate.low >>> 0,
            object.componentFeerate.high >>> 0
          ).toNumber(true);
      if (object.minExcessFee != null)
        if ($util.Long)
          (message.minExcessFee = $util.Long.fromValue(
            object.minExcessFee
          )).unsigned = true;
        else if (typeof object.minExcessFee === "string")
          message.minExcessFee = parseInt(object.minExcessFee, 10);
        else if (typeof object.minExcessFee === "number")
          message.minExcessFee = object.minExcessFee;
        else if (typeof object.minExcessFee === "object")
          message.minExcessFee = new $util.LongBits(
            object.minExcessFee.low >>> 0,
            object.minExcessFee.high >>> 0
          ).toNumber(true);
      if (object.maxExcessFee != null)
        if ($util.Long)
          (message.maxExcessFee = $util.Long.fromValue(
            object.maxExcessFee
          )).unsigned = true;
        else if (typeof object.maxExcessFee === "string")
          message.maxExcessFee = parseInt(object.maxExcessFee, 10);
        else if (typeof object.maxExcessFee === "number")
          message.maxExcessFee = object.maxExcessFee;
        else if (typeof object.maxExcessFee === "object")
          message.maxExcessFee = new $util.LongBits(
            object.maxExcessFee.low >>> 0,
            object.maxExcessFee.high >>> 0
          ).toNumber(true);
      if (object.donationAddress != null)
        message.donationAddress = String(object.donationAddress);
      return message;
    };

    /**
     * Creates a plain object from a ServerHello message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.ServerHello
     * @static
     * @param {fusion.ServerHello} message ServerHello
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ServerHello.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.tiers = [];
      if (options.defaults) {
        object.numComponents = 0;
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.componentFeerate =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.componentFeerate = options.longs === String ? "0" : 0;
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.minExcessFee =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.minExcessFee = options.longs === String ? "0" : 0;
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.maxExcessFee =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.maxExcessFee = options.longs === String ? "0" : 0;
        object.donationAddress = "";
      }
      if (message.tiers && message.tiers.length) {
        object.tiers = [];
        for (let j = 0; j < message.tiers.length; ++j)
          if (typeof message.tiers[j] === "number")
            object.tiers[j] =
              options.longs === String
                ? String(message.tiers[j])
                : message.tiers[j];
          else
            object.tiers[j] =
              options.longs === String
                ? $util.Long.prototype.toString.call(message.tiers[j])
                : options.longs === Number
                  ? new $util.LongBits(
                      message.tiers[j].low >>> 0,
                      message.tiers[j].high >>> 0
                    ).toNumber(true)
                  : message.tiers[j];
      }
      if (
        message.numComponents != null &&
        message.hasOwnProperty("numComponents")
      )
        object.numComponents = message.numComponents;
      if (
        message.componentFeerate != null &&
        message.hasOwnProperty("componentFeerate")
      )
        if (typeof message.componentFeerate === "number")
          object.componentFeerate =
            options.longs === String
              ? String(message.componentFeerate)
              : message.componentFeerate;
        else
          object.componentFeerate =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.componentFeerate)
              : options.longs === Number
                ? new $util.LongBits(
                    message.componentFeerate.low >>> 0,
                    message.componentFeerate.high >>> 0
                  ).toNumber(true)
                : message.componentFeerate;
      if (
        message.minExcessFee != null &&
        message.hasOwnProperty("minExcessFee")
      )
        if (typeof message.minExcessFee === "number")
          object.minExcessFee =
            options.longs === String
              ? String(message.minExcessFee)
              : message.minExcessFee;
        else
          object.minExcessFee =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.minExcessFee)
              : options.longs === Number
                ? new $util.LongBits(
                    message.minExcessFee.low >>> 0,
                    message.minExcessFee.high >>> 0
                  ).toNumber(true)
                : message.minExcessFee;
      if (
        message.maxExcessFee != null &&
        message.hasOwnProperty("maxExcessFee")
      )
        if (typeof message.maxExcessFee === "number")
          object.maxExcessFee =
            options.longs === String
              ? String(message.maxExcessFee)
              : message.maxExcessFee;
        else
          object.maxExcessFee =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.maxExcessFee)
              : options.longs === Number
                ? new $util.LongBits(
                    message.maxExcessFee.low >>> 0,
                    message.maxExcessFee.high >>> 0
                  ).toNumber(true)
                : message.maxExcessFee;
      if (
        message.donationAddress != null &&
        message.hasOwnProperty("donationAddress")
      )
        object.donationAddress = message.donationAddress;
      return object;
    };

    /**
     * Converts this ServerHello to JSON.
     * @function toJSON
     * @memberof fusion.ServerHello
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ServerHello.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ServerHello
     * @function getTypeUrl
     * @memberof fusion.ServerHello
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ServerHello.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.ServerHello";
    };

    return ServerHello;
  })();

  fusion.JoinPools = (function () {
    /**
     * Properties of a JoinPools.
     * @memberof fusion
     * @interface IJoinPools
     * @property {Array.<number|Long>|null} [tiers] JoinPools tiers
     * @property {Array.<fusion.JoinPools.IPoolTag>|null} [tags] JoinPools tags
     */

    /**
     * Constructs a new JoinPools.
     * @memberof fusion
     * @classdesc Represents a JoinPools.
     * @implements IJoinPools
     * @constructor
     * @param {fusion.IJoinPools=} [properties] Properties to set
     */
    function JoinPools(properties) {
      this.tiers = [];
      this.tags = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * JoinPools tiers.
     * @member {Array.<number|Long>} tiers
     * @memberof fusion.JoinPools
     * @instance
     */
    JoinPools.prototype.tiers = $util.emptyArray;

    /**
     * JoinPools tags.
     * @member {Array.<fusion.JoinPools.IPoolTag>} tags
     * @memberof fusion.JoinPools
     * @instance
     */
    JoinPools.prototype.tags = $util.emptyArray;

    /**
     * Creates a new JoinPools instance using the specified properties.
     * @function create
     * @memberof fusion.JoinPools
     * @static
     * @param {fusion.IJoinPools=} [properties] Properties to set
     * @returns {fusion.JoinPools} JoinPools instance
     */
    JoinPools.create = function create(properties) {
      return new JoinPools(properties);
    };

    /**
     * Encodes the specified JoinPools message. Does not implicitly {@link fusion.JoinPools.verify|verify} messages.
     * @function encode
     * @memberof fusion.JoinPools
     * @static
     * @param {fusion.IJoinPools} message JoinPools message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    JoinPools.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.tiers != null && message.tiers.length)
        for (let i = 0; i < message.tiers.length; ++i)
          writer.uint32(/* id 1, wireType 0 =*/ 8).uint64(message.tiers[i]);
      if (message.tags != null && message.tags.length)
        for (let i = 0; i < message.tags.length; ++i)
          $root.fusion.JoinPools.PoolTag.encode(
            message.tags[i],
            writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
          ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified JoinPools message, length delimited. Does not implicitly {@link fusion.JoinPools.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.JoinPools
     * @static
     * @param {fusion.IJoinPools} message JoinPools message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    JoinPools.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a JoinPools message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.JoinPools
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.JoinPools} JoinPools
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    JoinPools.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.JoinPools();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.tiers && message.tiers.length)) message.tiers = [];
            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2) message.tiers.push(reader.uint64());
            } else message.tiers.push(reader.uint64());
            break;
          }
          case 2: {
            if (!(message.tags && message.tags.length)) message.tags = [];
            message.tags.push(
              $root.fusion.JoinPools.PoolTag.decode(reader, reader.uint32())
            );
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a JoinPools message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.JoinPools
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.JoinPools} JoinPools
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    JoinPools.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a JoinPools message.
     * @function verify
     * @memberof fusion.JoinPools
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    JoinPools.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.tiers != null && message.hasOwnProperty("tiers")) {
        if (!Array.isArray(message.tiers)) return "tiers: array expected";
        for (let i = 0; i < message.tiers.length; ++i)
          if (
            !$util.isInteger(message.tiers[i]) &&
            !(
              message.tiers[i] &&
              $util.isInteger(message.tiers[i].low) &&
              $util.isInteger(message.tiers[i].high)
            )
          )
            return "tiers: integer|Long[] expected";
      }
      if (message.tags != null && message.hasOwnProperty("tags")) {
        if (!Array.isArray(message.tags)) return "tags: array expected";
        for (let i = 0; i < message.tags.length; ++i) {
          let error = $root.fusion.JoinPools.PoolTag.verify(message.tags[i]);
          if (error) return "tags." + error;
        }
      }
      return null;
    };

    /**
     * Creates a JoinPools message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.JoinPools
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.JoinPools} JoinPools
     */
    JoinPools.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.JoinPools) return object;
      let message = new $root.fusion.JoinPools();
      if (object.tiers) {
        if (!Array.isArray(object.tiers))
          throw TypeError(".fusion.JoinPools.tiers: array expected");
        message.tiers = [];
        for (let i = 0; i < object.tiers.length; ++i)
          if ($util.Long)
            (message.tiers[i] = $util.Long.fromValue(
              object.tiers[i]
            )).unsigned = true;
          else if (typeof object.tiers[i] === "string")
            message.tiers[i] = parseInt(object.tiers[i], 10);
          else if (typeof object.tiers[i] === "number")
            message.tiers[i] = object.tiers[i];
          else if (typeof object.tiers[i] === "object")
            message.tiers[i] = new $util.LongBits(
              object.tiers[i].low >>> 0,
              object.tiers[i].high >>> 0
            ).toNumber(true);
      }
      if (object.tags) {
        if (!Array.isArray(object.tags))
          throw TypeError(".fusion.JoinPools.tags: array expected");
        message.tags = [];
        for (let i = 0; i < object.tags.length; ++i) {
          if (typeof object.tags[i] !== "object")
            throw TypeError(".fusion.JoinPools.tags: object expected");
          message.tags[i] = $root.fusion.JoinPools.PoolTag.fromObject(
            object.tags[i]
          );
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a JoinPools message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.JoinPools
     * @static
     * @param {fusion.JoinPools} message JoinPools
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    JoinPools.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) {
        object.tiers = [];
        object.tags = [];
      }
      if (message.tiers && message.tiers.length) {
        object.tiers = [];
        for (let j = 0; j < message.tiers.length; ++j)
          if (typeof message.tiers[j] === "number")
            object.tiers[j] =
              options.longs === String
                ? String(message.tiers[j])
                : message.tiers[j];
          else
            object.tiers[j] =
              options.longs === String
                ? $util.Long.prototype.toString.call(message.tiers[j])
                : options.longs === Number
                  ? new $util.LongBits(
                      message.tiers[j].low >>> 0,
                      message.tiers[j].high >>> 0
                    ).toNumber(true)
                  : message.tiers[j];
      }
      if (message.tags && message.tags.length) {
        object.tags = [];
        for (let j = 0; j < message.tags.length; ++j)
          object.tags[j] = $root.fusion.JoinPools.PoolTag.toObject(
            message.tags[j],
            options
          );
      }
      return object;
    };

    /**
     * Converts this JoinPools to JSON.
     * @function toJSON
     * @memberof fusion.JoinPools
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    JoinPools.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for JoinPools
     * @function getTypeUrl
     * @memberof fusion.JoinPools
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    JoinPools.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.JoinPools";
    };

    JoinPools.PoolTag = (function () {
      /**
       * Properties of a PoolTag.
       * @memberof fusion.JoinPools
       * @interface IPoolTag
       * @property {Uint8Array} id PoolTag id
       * @property {number} limit PoolTag limit
       * @property {boolean|null} [noIp] PoolTag noIp
       */

      /**
       * Constructs a new PoolTag.
       * @memberof fusion.JoinPools
       * @classdesc Represents a PoolTag.
       * @implements IPoolTag
       * @constructor
       * @param {fusion.JoinPools.IPoolTag=} [properties] Properties to set
       */
      function PoolTag(properties) {
        if (properties)
          for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            if (properties[keys[i]] != null)
              this[keys[i]] = properties[keys[i]];
      }

      /**
       * PoolTag id.
       * @member {Uint8Array} id
       * @memberof fusion.JoinPools.PoolTag
       * @instance
       */
      PoolTag.prototype.id = $util.newBuffer([]);

      /**
       * PoolTag limit.
       * @member {number} limit
       * @memberof fusion.JoinPools.PoolTag
       * @instance
       */
      PoolTag.prototype.limit = 0;

      /**
       * PoolTag noIp.
       * @member {boolean} noIp
       * @memberof fusion.JoinPools.PoolTag
       * @instance
       */
      PoolTag.prototype.noIp = false;

      /**
       * Creates a new PoolTag instance using the specified properties.
       * @function create
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {fusion.JoinPools.IPoolTag=} [properties] Properties to set
       * @returns {fusion.JoinPools.PoolTag} PoolTag instance
       */
      PoolTag.create = function create(properties) {
        return new PoolTag(properties);
      };

      /**
       * Encodes the specified PoolTag message. Does not implicitly {@link fusion.JoinPools.PoolTag.verify|verify} messages.
       * @function encode
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {fusion.JoinPools.IPoolTag} message PoolTag message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      PoolTag.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.id);
        writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.limit);
        if (message.noIp != null && Object.hasOwnProperty.call(message, "noIp"))
          writer.uint32(/* id 3, wireType 0 =*/ 24).bool(message.noIp);
        return writer;
      };

      /**
       * Encodes the specified PoolTag message, length delimited. Does not implicitly {@link fusion.JoinPools.PoolTag.verify|verify} messages.
       * @function encodeDelimited
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {fusion.JoinPools.IPoolTag} message PoolTag message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      PoolTag.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a PoolTag message from the specified reader or buffer.
       * @function decode
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {fusion.JoinPools.PoolTag} PoolTag
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      PoolTag.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length,
          message = new $root.fusion.JoinPools.PoolTag();
        while (reader.pos < end) {
          let tag = reader.uint32();
          if (tag === error) break;
          switch (tag >>> 3) {
            case 1: {
              message.id = reader.bytes();
              break;
            }
            case 2: {
              message.limit = reader.uint32();
              break;
            }
            case 3: {
              message.noIp = reader.bool();
              break;
            }
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        if (!message.hasOwnProperty("id"))
          throw $util.ProtocolError("missing required 'id'", {
            instance: message,
          });
        if (!message.hasOwnProperty("limit"))
          throw $util.ProtocolError("missing required 'limit'", {
            instance: message,
          });
        return message;
      };

      /**
       * Decodes a PoolTag message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {fusion.JoinPools.PoolTag} PoolTag
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      PoolTag.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Verifies a PoolTag message.
       * @function verify
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */
      PoolTag.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
          return "object expected";
        if (
          !(
            (message.id && typeof message.id.length === "number") ||
            $util.isString(message.id)
          )
        )
          return "id: buffer expected";
        if (!$util.isInteger(message.limit)) return "limit: integer expected";
        if (message.noIp != null && message.hasOwnProperty("noIp"))
          if (typeof message.noIp !== "boolean")
            return "noIp: boolean expected";
        return null;
      };

      /**
       * Creates a PoolTag message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {fusion.JoinPools.PoolTag} PoolTag
       */
      PoolTag.fromObject = function fromObject(object) {
        if (object instanceof $root.fusion.JoinPools.PoolTag) return object;
        let message = new $root.fusion.JoinPools.PoolTag();
        if (object.id != null)
          if (typeof object.id === "string")
            $util.base64.decode(
              object.id,
              (message.id = $util.newBuffer($util.base64.length(object.id))),
              0
            );
          else if (object.id.length >= 0) message.id = object.id;
        if (object.limit != null) message.limit = object.limit >>> 0;
        if (object.noIp != null) message.noIp = Boolean(object.noIp);
        return message;
      };

      /**
       * Creates a plain object from a PoolTag message. Also converts values to other types if specified.
       * @function toObject
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {fusion.JoinPools.PoolTag} message PoolTag
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      PoolTag.toObject = function toObject(message, options) {
        if (!options) options = {};
        let object = {};
        if (options.defaults) {
          if (options.bytes === String) object.id = "";
          else {
            object.id = [];
            if (options.bytes !== Array) object.id = $util.newBuffer(object.id);
          }
          object.limit = 0;
          object.noIp = false;
        }
        if (message.id != null && message.hasOwnProperty("id"))
          object.id =
            options.bytes === String
              ? $util.base64.encode(message.id, 0, message.id.length)
              : options.bytes === Array
                ? Array.prototype.slice.call(message.id)
                : message.id;
        if (message.limit != null && message.hasOwnProperty("limit"))
          object.limit = message.limit;
        if (message.noIp != null && message.hasOwnProperty("noIp"))
          object.noIp = message.noIp;
        return object;
      };

      /**
       * Converts this PoolTag to JSON.
       * @function toJSON
       * @memberof fusion.JoinPools.PoolTag
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      PoolTag.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for PoolTag
       * @function getTypeUrl
       * @memberof fusion.JoinPools.PoolTag
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      PoolTag.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/fusion.JoinPools.PoolTag";
      };

      return PoolTag;
    })();

    return JoinPools;
  })();

  fusion.TierStatusUpdate = (function () {
    /**
     * Properties of a TierStatusUpdate.
     * @memberof fusion
     * @interface ITierStatusUpdate
     * @property {Object.<string,fusion.TierStatusUpdate.ITierStatus>|null} [statuses] TierStatusUpdate statuses
     */

    /**
     * Constructs a new TierStatusUpdate.
     * @memberof fusion
     * @classdesc Represents a TierStatusUpdate.
     * @implements ITierStatusUpdate
     * @constructor
     * @param {fusion.ITierStatusUpdate=} [properties] Properties to set
     */
    function TierStatusUpdate(properties) {
      this.statuses = {};
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * TierStatusUpdate statuses.
     * @member {Object.<string,fusion.TierStatusUpdate.ITierStatus>} statuses
     * @memberof fusion.TierStatusUpdate
     * @instance
     */
    TierStatusUpdate.prototype.statuses = $util.emptyObject;

    /**
     * Creates a new TierStatusUpdate instance using the specified properties.
     * @function create
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {fusion.ITierStatusUpdate=} [properties] Properties to set
     * @returns {fusion.TierStatusUpdate} TierStatusUpdate instance
     */
    TierStatusUpdate.create = function create(properties) {
      return new TierStatusUpdate(properties);
    };

    /**
     * Encodes the specified TierStatusUpdate message. Does not implicitly {@link fusion.TierStatusUpdate.verify|verify} messages.
     * @function encode
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {fusion.ITierStatusUpdate} message TierStatusUpdate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TierStatusUpdate.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.statuses != null &&
        Object.hasOwnProperty.call(message, "statuses")
      )
        for (
          let keys = Object.keys(message.statuses), i = 0;
          i < keys.length;
          ++i
        ) {
          writer
            .uint32(/* id 1, wireType 2 =*/ 10)
            .fork()
            .uint32(/* id 1, wireType 0 =*/ 8)
            .uint64(keys[i]);
          $root.fusion.TierStatusUpdate.TierStatus.encode(
            message.statuses[keys[i]],
            writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
          )
            .ldelim()
            .ldelim();
        }
      return writer;
    };

    /**
     * Encodes the specified TierStatusUpdate message, length delimited. Does not implicitly {@link fusion.TierStatusUpdate.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {fusion.ITierStatusUpdate} message TierStatusUpdate message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TierStatusUpdate.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TierStatusUpdate message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.TierStatusUpdate} TierStatusUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TierStatusUpdate.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.TierStatusUpdate(),
        key,
        value;
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (message.statuses === $util.emptyObject) message.statuses = {};
            let end2 = reader.uint32() + reader.pos;
            key = 0;
            value = null;
            while (reader.pos < end2) {
              let tag2 = reader.uint32();
              switch (tag2 >>> 3) {
                case 1:
                  key = reader.uint64();
                  break;
                case 2:
                  value = $root.fusion.TierStatusUpdate.TierStatus.decode(
                    reader,
                    reader.uint32()
                  );
                  break;
                default:
                  reader.skipType(tag2 & 7);
                  break;
              }
            }
            message.statuses[
              typeof key === "object" ? $util.longToHash(key) : key
            ] = value;
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a TierStatusUpdate message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.TierStatusUpdate} TierStatusUpdate
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TierStatusUpdate.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TierStatusUpdate message.
     * @function verify
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TierStatusUpdate.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.statuses != null && message.hasOwnProperty("statuses")) {
        if (!$util.isObject(message.statuses))
          return "statuses: object expected";
        let key = Object.keys(message.statuses);
        for (let i = 0; i < key.length; ++i) {
          if (!$util.key64Re.test(key[i]))
            return "statuses: integer|Long key{k:uint64} expected";
          {
            let error = $root.fusion.TierStatusUpdate.TierStatus.verify(
              message.statuses[key[i]]
            );
            if (error) return "statuses." + error;
          }
        }
      }
      return null;
    };

    /**
     * Creates a TierStatusUpdate message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.TierStatusUpdate} TierStatusUpdate
     */
    TierStatusUpdate.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.TierStatusUpdate) return object;
      let message = new $root.fusion.TierStatusUpdate();
      if (object.statuses) {
        if (typeof object.statuses !== "object")
          throw TypeError(".fusion.TierStatusUpdate.statuses: object expected");
        message.statuses = {};
        for (
          let keys = Object.keys(object.statuses), i = 0;
          i < keys.length;
          ++i
        ) {
          if (typeof object.statuses[keys[i]] !== "object")
            throw TypeError(
              ".fusion.TierStatusUpdate.statuses: object expected"
            );
          message.statuses[keys[i]] =
            $root.fusion.TierStatusUpdate.TierStatus.fromObject(
              object.statuses[keys[i]]
            );
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a TierStatusUpdate message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {fusion.TierStatusUpdate} message TierStatusUpdate
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TierStatusUpdate.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.objects || options.defaults) object.statuses = {};
      let keys2;
      if (message.statuses && (keys2 = Object.keys(message.statuses)).length) {
        object.statuses = {};
        for (let j = 0; j < keys2.length; ++j)
          object.statuses[keys2[j]] =
            $root.fusion.TierStatusUpdate.TierStatus.toObject(
              message.statuses[keys2[j]],
              options
            );
      }
      return object;
    };

    /**
     * Converts this TierStatusUpdate to JSON.
     * @function toJSON
     * @memberof fusion.TierStatusUpdate
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TierStatusUpdate.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TierStatusUpdate
     * @function getTypeUrl
     * @memberof fusion.TierStatusUpdate
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TierStatusUpdate.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.TierStatusUpdate";
    };

    TierStatusUpdate.TierStatus = (function () {
      /**
       * Properties of a TierStatus.
       * @memberof fusion.TierStatusUpdate
       * @interface ITierStatus
       * @property {number|null} [players] TierStatus players
       * @property {number|null} [minPlayers] TierStatus minPlayers
       * @property {number|null} [maxPlayers] TierStatus maxPlayers
       * @property {number|null} [timeRemaining] TierStatus timeRemaining
       */

      /**
       * Constructs a new TierStatus.
       * @memberof fusion.TierStatusUpdate
       * @classdesc Represents a TierStatus.
       * @implements ITierStatus
       * @constructor
       * @param {fusion.TierStatusUpdate.ITierStatus=} [properties] Properties to set
       */
      function TierStatus(properties) {
        if (properties)
          for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            if (properties[keys[i]] != null)
              this[keys[i]] = properties[keys[i]];
      }

      /**
       * TierStatus players.
       * @member {number} players
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @instance
       */
      TierStatus.prototype.players = 0;

      /**
       * TierStatus minPlayers.
       * @member {number} minPlayers
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @instance
       */
      TierStatus.prototype.minPlayers = 0;

      /**
       * TierStatus maxPlayers.
       * @member {number} maxPlayers
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @instance
       */
      TierStatus.prototype.maxPlayers = 0;

      /**
       * TierStatus timeRemaining.
       * @member {number} timeRemaining
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @instance
       */
      TierStatus.prototype.timeRemaining = 0;

      /**
       * Creates a new TierStatus instance using the specified properties.
       * @function create
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {fusion.TierStatusUpdate.ITierStatus=} [properties] Properties to set
       * @returns {fusion.TierStatusUpdate.TierStatus} TierStatus instance
       */
      TierStatus.create = function create(properties) {
        return new TierStatus(properties);
      };

      /**
       * Encodes the specified TierStatus message. Does not implicitly {@link fusion.TierStatusUpdate.TierStatus.verify|verify} messages.
       * @function encode
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {fusion.TierStatusUpdate.ITierStatus} message TierStatus message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      TierStatus.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        if (
          message.players != null &&
          Object.hasOwnProperty.call(message, "players")
        )
          writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.players);
        if (
          message.minPlayers != null &&
          Object.hasOwnProperty.call(message, "minPlayers")
        )
          writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.minPlayers);
        if (
          message.maxPlayers != null &&
          Object.hasOwnProperty.call(message, "maxPlayers")
        )
          writer.uint32(/* id 3, wireType 0 =*/ 24).uint32(message.maxPlayers);
        if (
          message.timeRemaining != null &&
          Object.hasOwnProperty.call(message, "timeRemaining")
        )
          writer
            .uint32(/* id 4, wireType 0 =*/ 32)
            .uint32(message.timeRemaining);
        return writer;
      };

      /**
       * Encodes the specified TierStatus message, length delimited. Does not implicitly {@link fusion.TierStatusUpdate.TierStatus.verify|verify} messages.
       * @function encodeDelimited
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {fusion.TierStatusUpdate.ITierStatus} message TierStatus message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      TierStatus.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a TierStatus message from the specified reader or buffer.
       * @function decode
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {fusion.TierStatusUpdate.TierStatus} TierStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      TierStatus.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length,
          message = new $root.fusion.TierStatusUpdate.TierStatus();
        while (reader.pos < end) {
          let tag = reader.uint32();
          if (tag === error) break;
          switch (tag >>> 3) {
            case 1: {
              message.players = reader.uint32();
              break;
            }
            case 2: {
              message.minPlayers = reader.uint32();
              break;
            }
            case 3: {
              message.maxPlayers = reader.uint32();
              break;
            }
            case 4: {
              message.timeRemaining = reader.uint32();
              break;
            }
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        return message;
      };

      /**
       * Decodes a TierStatus message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {fusion.TierStatusUpdate.TierStatus} TierStatus
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      TierStatus.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Verifies a TierStatus message.
       * @function verify
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */
      TierStatus.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
          return "object expected";
        if (message.players != null && message.hasOwnProperty("players"))
          if (!$util.isInteger(message.players))
            return "players: integer expected";
        if (message.minPlayers != null && message.hasOwnProperty("minPlayers"))
          if (!$util.isInteger(message.minPlayers))
            return "minPlayers: integer expected";
        if (message.maxPlayers != null && message.hasOwnProperty("maxPlayers"))
          if (!$util.isInteger(message.maxPlayers))
            return "maxPlayers: integer expected";
        if (
          message.timeRemaining != null &&
          message.hasOwnProperty("timeRemaining")
        )
          if (!$util.isInteger(message.timeRemaining))
            return "timeRemaining: integer expected";
        return null;
      };

      /**
       * Creates a TierStatus message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {fusion.TierStatusUpdate.TierStatus} TierStatus
       */
      TierStatus.fromObject = function fromObject(object) {
        if (object instanceof $root.fusion.TierStatusUpdate.TierStatus)
          return object;
        let message = new $root.fusion.TierStatusUpdate.TierStatus();
        if (object.players != null) message.players = object.players >>> 0;
        if (object.minPlayers != null)
          message.minPlayers = object.minPlayers >>> 0;
        if (object.maxPlayers != null)
          message.maxPlayers = object.maxPlayers >>> 0;
        if (object.timeRemaining != null)
          message.timeRemaining = object.timeRemaining >>> 0;
        return message;
      };

      /**
       * Creates a plain object from a TierStatus message. Also converts values to other types if specified.
       * @function toObject
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {fusion.TierStatusUpdate.TierStatus} message TierStatus
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      TierStatus.toObject = function toObject(message, options) {
        if (!options) options = {};
        let object = {};
        if (options.defaults) {
          object.players = 0;
          object.minPlayers = 0;
          object.maxPlayers = 0;
          object.timeRemaining = 0;
        }
        if (message.players != null && message.hasOwnProperty("players"))
          object.players = message.players;
        if (message.minPlayers != null && message.hasOwnProperty("minPlayers"))
          object.minPlayers = message.minPlayers;
        if (message.maxPlayers != null && message.hasOwnProperty("maxPlayers"))
          object.maxPlayers = message.maxPlayers;
        if (
          message.timeRemaining != null &&
          message.hasOwnProperty("timeRemaining")
        )
          object.timeRemaining = message.timeRemaining;
        return object;
      };

      /**
       * Converts this TierStatus to JSON.
       * @function toJSON
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      TierStatus.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for TierStatus
       * @function getTypeUrl
       * @memberof fusion.TierStatusUpdate.TierStatus
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      TierStatus.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/fusion.TierStatusUpdate.TierStatus";
      };

      return TierStatus;
    })();

    return TierStatusUpdate;
  })();

  fusion.FusionBegin = (function () {
    /**
     * Properties of a FusionBegin.
     * @memberof fusion
     * @interface IFusionBegin
     * @property {number|Long} tier FusionBegin tier
     * @property {Uint8Array} covertDomain FusionBegin covertDomain
     * @property {number} covertPort FusionBegin covertPort
     * @property {boolean|null} [covertSsl] FusionBegin covertSsl
     * @property {number|Long} serverTime FusionBegin serverTime
     */

    /**
     * Constructs a new FusionBegin.
     * @memberof fusion
     * @classdesc Represents a FusionBegin.
     * @implements IFusionBegin
     * @constructor
     * @param {fusion.IFusionBegin=} [properties] Properties to set
     */
    function FusionBegin(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * FusionBegin tier.
     * @member {number|Long} tier
     * @memberof fusion.FusionBegin
     * @instance
     */
    FusionBegin.prototype.tier = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * FusionBegin covertDomain.
     * @member {Uint8Array} covertDomain
     * @memberof fusion.FusionBegin
     * @instance
     */
    FusionBegin.prototype.covertDomain = $util.newBuffer([]);

    /**
     * FusionBegin covertPort.
     * @member {number} covertPort
     * @memberof fusion.FusionBegin
     * @instance
     */
    FusionBegin.prototype.covertPort = 0;

    /**
     * FusionBegin covertSsl.
     * @member {boolean} covertSsl
     * @memberof fusion.FusionBegin
     * @instance
     */
    FusionBegin.prototype.covertSsl = false;

    /**
     * FusionBegin serverTime.
     * @member {number|Long} serverTime
     * @memberof fusion.FusionBegin
     * @instance
     */
    FusionBegin.prototype.serverTime = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Creates a new FusionBegin instance using the specified properties.
     * @function create
     * @memberof fusion.FusionBegin
     * @static
     * @param {fusion.IFusionBegin=} [properties] Properties to set
     * @returns {fusion.FusionBegin} FusionBegin instance
     */
    FusionBegin.create = function create(properties) {
      return new FusionBegin(properties);
    };

    /**
     * Encodes the specified FusionBegin message. Does not implicitly {@link fusion.FusionBegin.verify|verify} messages.
     * @function encode
     * @memberof fusion.FusionBegin
     * @static
     * @param {fusion.IFusionBegin} message FusionBegin message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FusionBegin.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 0 =*/ 8).uint64(message.tier);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.covertDomain);
      writer.uint32(/* id 3, wireType 0 =*/ 24).uint32(message.covertPort);
      if (
        message.covertSsl != null &&
        Object.hasOwnProperty.call(message, "covertSsl")
      )
        writer.uint32(/* id 4, wireType 0 =*/ 32).bool(message.covertSsl);
      writer.uint32(/* id 5, wireType 1 =*/ 41).fixed64(message.serverTime);
      return writer;
    };

    /**
     * Encodes the specified FusionBegin message, length delimited. Does not implicitly {@link fusion.FusionBegin.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.FusionBegin
     * @static
     * @param {fusion.IFusionBegin} message FusionBegin message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FusionBegin.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a FusionBegin message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.FusionBegin
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.FusionBegin} FusionBegin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FusionBegin.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.FusionBegin();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.tier = reader.uint64();
            break;
          }
          case 2: {
            message.covertDomain = reader.bytes();
            break;
          }
          case 3: {
            message.covertPort = reader.uint32();
            break;
          }
          case 4: {
            message.covertSsl = reader.bool();
            break;
          }
          case 5: {
            message.serverTime = reader.fixed64();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("tier"))
        throw $util.ProtocolError("missing required 'tier'", {
          instance: message,
        });
      if (!message.hasOwnProperty("covertDomain"))
        throw $util.ProtocolError("missing required 'covertDomain'", {
          instance: message,
        });
      if (!message.hasOwnProperty("covertPort"))
        throw $util.ProtocolError("missing required 'covertPort'", {
          instance: message,
        });
      if (!message.hasOwnProperty("serverTime"))
        throw $util.ProtocolError("missing required 'serverTime'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a FusionBegin message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.FusionBegin
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.FusionBegin} FusionBegin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FusionBegin.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a FusionBegin message.
     * @function verify
     * @memberof fusion.FusionBegin
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    FusionBegin.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !$util.isInteger(message.tier) &&
        !(
          message.tier &&
          $util.isInteger(message.tier.low) &&
          $util.isInteger(message.tier.high)
        )
      )
        return "tier: integer|Long expected";
      if (
        !(
          (message.covertDomain &&
            typeof message.covertDomain.length === "number") ||
          $util.isString(message.covertDomain)
        )
      )
        return "covertDomain: buffer expected";
      if (!$util.isInteger(message.covertPort))
        return "covertPort: integer expected";
      if (message.covertSsl != null && message.hasOwnProperty("covertSsl"))
        if (typeof message.covertSsl !== "boolean")
          return "covertSsl: boolean expected";
      if (
        !$util.isInteger(message.serverTime) &&
        !(
          message.serverTime &&
          $util.isInteger(message.serverTime.low) &&
          $util.isInteger(message.serverTime.high)
        )
      )
        return "serverTime: integer|Long expected";
      return null;
    };

    /**
     * Creates a FusionBegin message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.FusionBegin
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.FusionBegin} FusionBegin
     */
    FusionBegin.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.FusionBegin) return object;
      let message = new $root.fusion.FusionBegin();
      if (object.tier != null)
        if ($util.Long)
          (message.tier = $util.Long.fromValue(object.tier)).unsigned = true;
        else if (typeof object.tier === "string")
          message.tier = parseInt(object.tier, 10);
        else if (typeof object.tier === "number") message.tier = object.tier;
        else if (typeof object.tier === "object")
          message.tier = new $util.LongBits(
            object.tier.low >>> 0,
            object.tier.high >>> 0
          ).toNumber(true);
      if (object.covertDomain != null)
        if (typeof object.covertDomain === "string")
          $util.base64.decode(
            object.covertDomain,
            (message.covertDomain = $util.newBuffer(
              $util.base64.length(object.covertDomain)
            )),
            0
          );
        else if (object.covertDomain.length >= 0)
          message.covertDomain = object.covertDomain;
      if (object.covertPort != null)
        message.covertPort = object.covertPort >>> 0;
      if (object.covertSsl != null)
        message.covertSsl = Boolean(object.covertSsl);
      if (object.serverTime != null)
        if ($util.Long)
          (message.serverTime = $util.Long.fromValue(
            object.serverTime
          )).unsigned = false;
        else if (typeof object.serverTime === "string")
          message.serverTime = parseInt(object.serverTime, 10);
        else if (typeof object.serverTime === "number")
          message.serverTime = object.serverTime;
        else if (typeof object.serverTime === "object")
          message.serverTime = new $util.LongBits(
            object.serverTime.low >>> 0,
            object.serverTime.high >>> 0
          ).toNumber();
      return message;
    };

    /**
     * Creates a plain object from a FusionBegin message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.FusionBegin
     * @static
     * @param {fusion.FusionBegin} message FusionBegin
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    FusionBegin.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.tier =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.tier = options.longs === String ? "0" : 0;
        if (options.bytes === String) object.covertDomain = "";
        else {
          object.covertDomain = [];
          if (options.bytes !== Array)
            object.covertDomain = $util.newBuffer(object.covertDomain);
        }
        object.covertPort = 0;
        object.covertSsl = false;
        if ($util.Long) {
          let long = new $util.Long(0, 0, false);
          object.serverTime =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.serverTime = options.longs === String ? "0" : 0;
      }
      if (message.tier != null && message.hasOwnProperty("tier"))
        if (typeof message.tier === "number")
          object.tier =
            options.longs === String ? String(message.tier) : message.tier;
        else
          object.tier =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.tier)
              : options.longs === Number
                ? new $util.LongBits(
                    message.tier.low >>> 0,
                    message.tier.high >>> 0
                  ).toNumber(true)
                : message.tier;
      if (
        message.covertDomain != null &&
        message.hasOwnProperty("covertDomain")
      )
        object.covertDomain =
          options.bytes === String
            ? $util.base64.encode(
                message.covertDomain,
                0,
                message.covertDomain.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.covertDomain)
              : message.covertDomain;
      if (message.covertPort != null && message.hasOwnProperty("covertPort"))
        object.covertPort = message.covertPort;
      if (message.covertSsl != null && message.hasOwnProperty("covertSsl"))
        object.covertSsl = message.covertSsl;
      if (message.serverTime != null && message.hasOwnProperty("serverTime"))
        if (typeof message.serverTime === "number")
          object.serverTime =
            options.longs === String
              ? String(message.serverTime)
              : message.serverTime;
        else
          object.serverTime =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.serverTime)
              : options.longs === Number
                ? new $util.LongBits(
                    message.serverTime.low >>> 0,
                    message.serverTime.high >>> 0
                  ).toNumber()
                : message.serverTime;
      return object;
    };

    /**
     * Converts this FusionBegin to JSON.
     * @function toJSON
     * @memberof fusion.FusionBegin
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    FusionBegin.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for FusionBegin
     * @function getTypeUrl
     * @memberof fusion.FusionBegin
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    FusionBegin.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.FusionBegin";
    };

    return FusionBegin;
  })();

  fusion.StartRound = (function () {
    /**
     * Properties of a StartRound.
     * @memberof fusion
     * @interface IStartRound
     * @property {Uint8Array} roundPubkey StartRound roundPubkey
     * @property {Array.<Uint8Array>|null} [blindNoncePoints] StartRound blindNoncePoints
     * @property {number|Long} serverTime StartRound serverTime
     */

    /**
     * Constructs a new StartRound.
     * @memberof fusion
     * @classdesc Represents a StartRound.
     * @implements IStartRound
     * @constructor
     * @param {fusion.IStartRound=} [properties] Properties to set
     */
    function StartRound(properties) {
      this.blindNoncePoints = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * StartRound roundPubkey.
     * @member {Uint8Array} roundPubkey
     * @memberof fusion.StartRound
     * @instance
     */
    StartRound.prototype.roundPubkey = $util.newBuffer([]);

    /**
     * StartRound blindNoncePoints.
     * @member {Array.<Uint8Array>} blindNoncePoints
     * @memberof fusion.StartRound
     * @instance
     */
    StartRound.prototype.blindNoncePoints = $util.emptyArray;

    /**
     * StartRound serverTime.
     * @member {number|Long} serverTime
     * @memberof fusion.StartRound
     * @instance
     */
    StartRound.prototype.serverTime = $util.Long
      ? $util.Long.fromBits(0, 0, false)
      : 0;

    /**
     * Creates a new StartRound instance using the specified properties.
     * @function create
     * @memberof fusion.StartRound
     * @static
     * @param {fusion.IStartRound=} [properties] Properties to set
     * @returns {fusion.StartRound} StartRound instance
     */
    StartRound.create = function create(properties) {
      return new StartRound(properties);
    };

    /**
     * Encodes the specified StartRound message. Does not implicitly {@link fusion.StartRound.verify|verify} messages.
     * @function encode
     * @memberof fusion.StartRound
     * @static
     * @param {fusion.IStartRound} message StartRound message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StartRound.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.roundPubkey);
      if (message.blindNoncePoints != null && message.blindNoncePoints.length)
        for (let i = 0; i < message.blindNoncePoints.length; ++i)
          writer
            .uint32(/* id 2, wireType 2 =*/ 18)
            .bytes(message.blindNoncePoints[i]);
      writer.uint32(/* id 5, wireType 1 =*/ 41).fixed64(message.serverTime);
      return writer;
    };

    /**
     * Encodes the specified StartRound message, length delimited. Does not implicitly {@link fusion.StartRound.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.StartRound
     * @static
     * @param {fusion.IStartRound} message StartRound message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    StartRound.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a StartRound message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.StartRound
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.StartRound} StartRound
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StartRound.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.StartRound();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.roundPubkey = reader.bytes();
            break;
          }
          case 2: {
            if (!(message.blindNoncePoints && message.blindNoncePoints.length))
              message.blindNoncePoints = [];
            message.blindNoncePoints.push(reader.bytes());
            break;
          }
          case 5: {
            message.serverTime = reader.fixed64();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("roundPubkey"))
        throw $util.ProtocolError("missing required 'roundPubkey'", {
          instance: message,
        });
      if (!message.hasOwnProperty("serverTime"))
        throw $util.ProtocolError("missing required 'serverTime'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a StartRound message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.StartRound
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.StartRound} StartRound
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    StartRound.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a StartRound message.
     * @function verify
     * @memberof fusion.StartRound
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    StartRound.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        !(
          (message.roundPubkey &&
            typeof message.roundPubkey.length === "number") ||
          $util.isString(message.roundPubkey)
        )
      )
        return "roundPubkey: buffer expected";
      if (
        message.blindNoncePoints != null &&
        message.hasOwnProperty("blindNoncePoints")
      ) {
        if (!Array.isArray(message.blindNoncePoints))
          return "blindNoncePoints: array expected";
        for (let i = 0; i < message.blindNoncePoints.length; ++i)
          if (
            !(
              (message.blindNoncePoints[i] &&
                typeof message.blindNoncePoints[i].length === "number") ||
              $util.isString(message.blindNoncePoints[i])
            )
          )
            return "blindNoncePoints: buffer[] expected";
      }
      if (
        !$util.isInteger(message.serverTime) &&
        !(
          message.serverTime &&
          $util.isInteger(message.serverTime.low) &&
          $util.isInteger(message.serverTime.high)
        )
      )
        return "serverTime: integer|Long expected";
      return null;
    };

    /**
     * Creates a StartRound message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.StartRound
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.StartRound} StartRound
     */
    StartRound.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.StartRound) return object;
      let message = new $root.fusion.StartRound();
      if (object.roundPubkey != null)
        if (typeof object.roundPubkey === "string")
          $util.base64.decode(
            object.roundPubkey,
            (message.roundPubkey = $util.newBuffer(
              $util.base64.length(object.roundPubkey)
            )),
            0
          );
        else if (object.roundPubkey.length >= 0)
          message.roundPubkey = object.roundPubkey;
      if (object.blindNoncePoints) {
        if (!Array.isArray(object.blindNoncePoints))
          throw TypeError(
            ".fusion.StartRound.blindNoncePoints: array expected"
          );
        message.blindNoncePoints = [];
        for (let i = 0; i < object.blindNoncePoints.length; ++i)
          if (typeof object.blindNoncePoints[i] === "string")
            $util.base64.decode(
              object.blindNoncePoints[i],
              (message.blindNoncePoints[i] = $util.newBuffer(
                $util.base64.length(object.blindNoncePoints[i])
              )),
              0
            );
          else if (object.blindNoncePoints[i].length >= 0)
            message.blindNoncePoints[i] = object.blindNoncePoints[i];
      }
      if (object.serverTime != null)
        if ($util.Long)
          (message.serverTime = $util.Long.fromValue(
            object.serverTime
          )).unsigned = false;
        else if (typeof object.serverTime === "string")
          message.serverTime = parseInt(object.serverTime, 10);
        else if (typeof object.serverTime === "number")
          message.serverTime = object.serverTime;
        else if (typeof object.serverTime === "object")
          message.serverTime = new $util.LongBits(
            object.serverTime.low >>> 0,
            object.serverTime.high >>> 0
          ).toNumber();
      return message;
    };

    /**
     * Creates a plain object from a StartRound message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.StartRound
     * @static
     * @param {fusion.StartRound} message StartRound
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    StartRound.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.blindNoncePoints = [];
      if (options.defaults) {
        if (options.bytes === String) object.roundPubkey = "";
        else {
          object.roundPubkey = [];
          if (options.bytes !== Array)
            object.roundPubkey = $util.newBuffer(object.roundPubkey);
        }
        if ($util.Long) {
          let long = new $util.Long(0, 0, false);
          object.serverTime =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.serverTime = options.longs === String ? "0" : 0;
      }
      if (message.roundPubkey != null && message.hasOwnProperty("roundPubkey"))
        object.roundPubkey =
          options.bytes === String
            ? $util.base64.encode(
                message.roundPubkey,
                0,
                message.roundPubkey.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.roundPubkey)
              : message.roundPubkey;
      if (message.blindNoncePoints && message.blindNoncePoints.length) {
        object.blindNoncePoints = [];
        for (let j = 0; j < message.blindNoncePoints.length; ++j)
          object.blindNoncePoints[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.blindNoncePoints[j],
                  0,
                  message.blindNoncePoints[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.blindNoncePoints[j])
                : message.blindNoncePoints[j];
      }
      if (message.serverTime != null && message.hasOwnProperty("serverTime"))
        if (typeof message.serverTime === "number")
          object.serverTime =
            options.longs === String
              ? String(message.serverTime)
              : message.serverTime;
        else
          object.serverTime =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.serverTime)
              : options.longs === Number
                ? new $util.LongBits(
                    message.serverTime.low >>> 0,
                    message.serverTime.high >>> 0
                  ).toNumber()
                : message.serverTime;
      return object;
    };

    /**
     * Converts this StartRound to JSON.
     * @function toJSON
     * @memberof fusion.StartRound
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    StartRound.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for StartRound
     * @function getTypeUrl
     * @memberof fusion.StartRound
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    StartRound.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.StartRound";
    };

    return StartRound;
  })();

  fusion.PlayerCommit = (function () {
    /**
     * Properties of a PlayerCommit.
     * @memberof fusion
     * @interface IPlayerCommit
     * @property {Array.<Uint8Array>|null} [initialCommitments] PlayerCommit initialCommitments
     * @property {number|Long} excessFee PlayerCommit excessFee
     * @property {Uint8Array} pedersenTotalNonce PlayerCommit pedersenTotalNonce
     * @property {Uint8Array} randomNumberCommitment PlayerCommit randomNumberCommitment
     * @property {Array.<Uint8Array>|null} [blindSigRequests] PlayerCommit blindSigRequests
     */

    /**
     * Constructs a new PlayerCommit.
     * @memberof fusion
     * @classdesc Represents a PlayerCommit.
     * @implements IPlayerCommit
     * @constructor
     * @param {fusion.IPlayerCommit=} [properties] Properties to set
     */
    function PlayerCommit(properties) {
      this.initialCommitments = [];
      this.blindSigRequests = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * PlayerCommit initialCommitments.
     * @member {Array.<Uint8Array>} initialCommitments
     * @memberof fusion.PlayerCommit
     * @instance
     */
    PlayerCommit.prototype.initialCommitments = $util.emptyArray;

    /**
     * PlayerCommit excessFee.
     * @member {number|Long} excessFee
     * @memberof fusion.PlayerCommit
     * @instance
     */
    PlayerCommit.prototype.excessFee = $util.Long
      ? $util.Long.fromBits(0, 0, true)
      : 0;

    /**
     * PlayerCommit pedersenTotalNonce.
     * @member {Uint8Array} pedersenTotalNonce
     * @memberof fusion.PlayerCommit
     * @instance
     */
    PlayerCommit.prototype.pedersenTotalNonce = $util.newBuffer([]);

    /**
     * PlayerCommit randomNumberCommitment.
     * @member {Uint8Array} randomNumberCommitment
     * @memberof fusion.PlayerCommit
     * @instance
     */
    PlayerCommit.prototype.randomNumberCommitment = $util.newBuffer([]);

    /**
     * PlayerCommit blindSigRequests.
     * @member {Array.<Uint8Array>} blindSigRequests
     * @memberof fusion.PlayerCommit
     * @instance
     */
    PlayerCommit.prototype.blindSigRequests = $util.emptyArray;

    /**
     * Creates a new PlayerCommit instance using the specified properties.
     * @function create
     * @memberof fusion.PlayerCommit
     * @static
     * @param {fusion.IPlayerCommit=} [properties] Properties to set
     * @returns {fusion.PlayerCommit} PlayerCommit instance
     */
    PlayerCommit.create = function create(properties) {
      return new PlayerCommit(properties);
    };

    /**
     * Encodes the specified PlayerCommit message. Does not implicitly {@link fusion.PlayerCommit.verify|verify} messages.
     * @function encode
     * @memberof fusion.PlayerCommit
     * @static
     * @param {fusion.IPlayerCommit} message PlayerCommit message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PlayerCommit.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.initialCommitments != null &&
        message.initialCommitments.length
      )
        for (let i = 0; i < message.initialCommitments.length; ++i)
          writer
            .uint32(/* id 1, wireType 2 =*/ 10)
            .bytes(message.initialCommitments[i]);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint64(message.excessFee);
      writer
        .uint32(/* id 3, wireType 2 =*/ 26)
        .bytes(message.pedersenTotalNonce);
      writer
        .uint32(/* id 4, wireType 2 =*/ 34)
        .bytes(message.randomNumberCommitment);
      if (message.blindSigRequests != null && message.blindSigRequests.length)
        for (let i = 0; i < message.blindSigRequests.length; ++i)
          writer
            .uint32(/* id 5, wireType 2 =*/ 42)
            .bytes(message.blindSigRequests[i]);
      return writer;
    };

    /**
     * Encodes the specified PlayerCommit message, length delimited. Does not implicitly {@link fusion.PlayerCommit.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.PlayerCommit
     * @static
     * @param {fusion.IPlayerCommit} message PlayerCommit message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PlayerCommit.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PlayerCommit message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.PlayerCommit
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.PlayerCommit} PlayerCommit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PlayerCommit.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.PlayerCommit();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (
              !(message.initialCommitments && message.initialCommitments.length)
            )
              message.initialCommitments = [];
            message.initialCommitments.push(reader.bytes());
            break;
          }
          case 2: {
            message.excessFee = reader.uint64();
            break;
          }
          case 3: {
            message.pedersenTotalNonce = reader.bytes();
            break;
          }
          case 4: {
            message.randomNumberCommitment = reader.bytes();
            break;
          }
          case 5: {
            if (!(message.blindSigRequests && message.blindSigRequests.length))
              message.blindSigRequests = [];
            message.blindSigRequests.push(reader.bytes());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("excessFee"))
        throw $util.ProtocolError("missing required 'excessFee'", {
          instance: message,
        });
      if (!message.hasOwnProperty("pedersenTotalNonce"))
        throw $util.ProtocolError("missing required 'pedersenTotalNonce'", {
          instance: message,
        });
      if (!message.hasOwnProperty("randomNumberCommitment"))
        throw $util.ProtocolError("missing required 'randomNumberCommitment'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a PlayerCommit message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.PlayerCommit
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.PlayerCommit} PlayerCommit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PlayerCommit.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PlayerCommit message.
     * @function verify
     * @memberof fusion.PlayerCommit
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PlayerCommit.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        message.initialCommitments != null &&
        message.hasOwnProperty("initialCommitments")
      ) {
        if (!Array.isArray(message.initialCommitments))
          return "initialCommitments: array expected";
        for (let i = 0; i < message.initialCommitments.length; ++i)
          if (
            !(
              (message.initialCommitments[i] &&
                typeof message.initialCommitments[i].length === "number") ||
              $util.isString(message.initialCommitments[i])
            )
          )
            return "initialCommitments: buffer[] expected";
      }
      if (
        !$util.isInteger(message.excessFee) &&
        !(
          message.excessFee &&
          $util.isInteger(message.excessFee.low) &&
          $util.isInteger(message.excessFee.high)
        )
      )
        return "excessFee: integer|Long expected";
      if (
        !(
          (message.pedersenTotalNonce &&
            typeof message.pedersenTotalNonce.length === "number") ||
          $util.isString(message.pedersenTotalNonce)
        )
      )
        return "pedersenTotalNonce: buffer expected";
      if (
        !(
          (message.randomNumberCommitment &&
            typeof message.randomNumberCommitment.length === "number") ||
          $util.isString(message.randomNumberCommitment)
        )
      )
        return "randomNumberCommitment: buffer expected";
      if (
        message.blindSigRequests != null &&
        message.hasOwnProperty("blindSigRequests")
      ) {
        if (!Array.isArray(message.blindSigRequests))
          return "blindSigRequests: array expected";
        for (let i = 0; i < message.blindSigRequests.length; ++i)
          if (
            !(
              (message.blindSigRequests[i] &&
                typeof message.blindSigRequests[i].length === "number") ||
              $util.isString(message.blindSigRequests[i])
            )
          )
            return "blindSigRequests: buffer[] expected";
      }
      return null;
    };

    /**
     * Creates a PlayerCommit message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.PlayerCommit
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.PlayerCommit} PlayerCommit
     */
    PlayerCommit.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.PlayerCommit) return object;
      let message = new $root.fusion.PlayerCommit();
      if (object.initialCommitments) {
        if (!Array.isArray(object.initialCommitments))
          throw TypeError(
            ".fusion.PlayerCommit.initialCommitments: array expected"
          );
        message.initialCommitments = [];
        for (let i = 0; i < object.initialCommitments.length; ++i)
          if (typeof object.initialCommitments[i] === "string")
            $util.base64.decode(
              object.initialCommitments[i],
              (message.initialCommitments[i] = $util.newBuffer(
                $util.base64.length(object.initialCommitments[i])
              )),
              0
            );
          else if (object.initialCommitments[i].length >= 0)
            message.initialCommitments[i] = object.initialCommitments[i];
      }
      if (object.excessFee != null)
        if ($util.Long)
          (message.excessFee = $util.Long.fromValue(
            object.excessFee
          )).unsigned = true;
        else if (typeof object.excessFee === "string")
          message.excessFee = parseInt(object.excessFee, 10);
        else if (typeof object.excessFee === "number")
          message.excessFee = object.excessFee;
        else if (typeof object.excessFee === "object")
          message.excessFee = new $util.LongBits(
            object.excessFee.low >>> 0,
            object.excessFee.high >>> 0
          ).toNumber(true);
      if (object.pedersenTotalNonce != null)
        if (typeof object.pedersenTotalNonce === "string")
          $util.base64.decode(
            object.pedersenTotalNonce,
            (message.pedersenTotalNonce = $util.newBuffer(
              $util.base64.length(object.pedersenTotalNonce)
            )),
            0
          );
        else if (object.pedersenTotalNonce.length >= 0)
          message.pedersenTotalNonce = object.pedersenTotalNonce;
      if (object.randomNumberCommitment != null)
        if (typeof object.randomNumberCommitment === "string")
          $util.base64.decode(
            object.randomNumberCommitment,
            (message.randomNumberCommitment = $util.newBuffer(
              $util.base64.length(object.randomNumberCommitment)
            )),
            0
          );
        else if (object.randomNumberCommitment.length >= 0)
          message.randomNumberCommitment = object.randomNumberCommitment;
      if (object.blindSigRequests) {
        if (!Array.isArray(object.blindSigRequests))
          throw TypeError(
            ".fusion.PlayerCommit.blindSigRequests: array expected"
          );
        message.blindSigRequests = [];
        for (let i = 0; i < object.blindSigRequests.length; ++i)
          if (typeof object.blindSigRequests[i] === "string")
            $util.base64.decode(
              object.blindSigRequests[i],
              (message.blindSigRequests[i] = $util.newBuffer(
                $util.base64.length(object.blindSigRequests[i])
              )),
              0
            );
          else if (object.blindSigRequests[i].length >= 0)
            message.blindSigRequests[i] = object.blindSigRequests[i];
      }
      return message;
    };

    /**
     * Creates a plain object from a PlayerCommit message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.PlayerCommit
     * @static
     * @param {fusion.PlayerCommit} message PlayerCommit
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PlayerCommit.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) {
        object.initialCommitments = [];
        object.blindSigRequests = [];
      }
      if (options.defaults) {
        if ($util.Long) {
          let long = new $util.Long(0, 0, true);
          object.excessFee =
            options.longs === String
              ? long.toString()
              : options.longs === Number
                ? long.toNumber()
                : long;
        } else object.excessFee = options.longs === String ? "0" : 0;
        if (options.bytes === String) object.pedersenTotalNonce = "";
        else {
          object.pedersenTotalNonce = [];
          if (options.bytes !== Array)
            object.pedersenTotalNonce = $util.newBuffer(
              object.pedersenTotalNonce
            );
        }
        if (options.bytes === String) object.randomNumberCommitment = "";
        else {
          object.randomNumberCommitment = [];
          if (options.bytes !== Array)
            object.randomNumberCommitment = $util.newBuffer(
              object.randomNumberCommitment
            );
        }
      }
      if (message.initialCommitments && message.initialCommitments.length) {
        object.initialCommitments = [];
        for (let j = 0; j < message.initialCommitments.length; ++j)
          object.initialCommitments[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.initialCommitments[j],
                  0,
                  message.initialCommitments[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.initialCommitments[j])
                : message.initialCommitments[j];
      }
      if (message.excessFee != null && message.hasOwnProperty("excessFee"))
        if (typeof message.excessFee === "number")
          object.excessFee =
            options.longs === String
              ? String(message.excessFee)
              : message.excessFee;
        else
          object.excessFee =
            options.longs === String
              ? $util.Long.prototype.toString.call(message.excessFee)
              : options.longs === Number
                ? new $util.LongBits(
                    message.excessFee.low >>> 0,
                    message.excessFee.high >>> 0
                  ).toNumber(true)
                : message.excessFee;
      if (
        message.pedersenTotalNonce != null &&
        message.hasOwnProperty("pedersenTotalNonce")
      )
        object.pedersenTotalNonce =
          options.bytes === String
            ? $util.base64.encode(
                message.pedersenTotalNonce,
                0,
                message.pedersenTotalNonce.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.pedersenTotalNonce)
              : message.pedersenTotalNonce;
      if (
        message.randomNumberCommitment != null &&
        message.hasOwnProperty("randomNumberCommitment")
      )
        object.randomNumberCommitment =
          options.bytes === String
            ? $util.base64.encode(
                message.randomNumberCommitment,
                0,
                message.randomNumberCommitment.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.randomNumberCommitment)
              : message.randomNumberCommitment;
      if (message.blindSigRequests && message.blindSigRequests.length) {
        object.blindSigRequests = [];
        for (let j = 0; j < message.blindSigRequests.length; ++j)
          object.blindSigRequests[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.blindSigRequests[j],
                  0,
                  message.blindSigRequests[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.blindSigRequests[j])
                : message.blindSigRequests[j];
      }
      return object;
    };

    /**
     * Converts this PlayerCommit to JSON.
     * @function toJSON
     * @memberof fusion.PlayerCommit
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PlayerCommit.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for PlayerCommit
     * @function getTypeUrl
     * @memberof fusion.PlayerCommit
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    PlayerCommit.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.PlayerCommit";
    };

    return PlayerCommit;
  })();

  fusion.BlindSigResponses = (function () {
    /**
     * Properties of a BlindSigResponses.
     * @memberof fusion
     * @interface IBlindSigResponses
     * @property {Array.<Uint8Array>|null} [scalars] BlindSigResponses scalars
     */

    /**
     * Constructs a new BlindSigResponses.
     * @memberof fusion
     * @classdesc Represents a BlindSigResponses.
     * @implements IBlindSigResponses
     * @constructor
     * @param {fusion.IBlindSigResponses=} [properties] Properties to set
     */
    function BlindSigResponses(properties) {
      this.scalars = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * BlindSigResponses scalars.
     * @member {Array.<Uint8Array>} scalars
     * @memberof fusion.BlindSigResponses
     * @instance
     */
    BlindSigResponses.prototype.scalars = $util.emptyArray;

    /**
     * Creates a new BlindSigResponses instance using the specified properties.
     * @function create
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {fusion.IBlindSigResponses=} [properties] Properties to set
     * @returns {fusion.BlindSigResponses} BlindSigResponses instance
     */
    BlindSigResponses.create = function create(properties) {
      return new BlindSigResponses(properties);
    };

    /**
     * Encodes the specified BlindSigResponses message. Does not implicitly {@link fusion.BlindSigResponses.verify|verify} messages.
     * @function encode
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {fusion.IBlindSigResponses} message BlindSigResponses message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlindSigResponses.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.scalars != null && message.scalars.length)
        for (let i = 0; i < message.scalars.length; ++i)
          writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.scalars[i]);
      return writer;
    };

    /**
     * Encodes the specified BlindSigResponses message, length delimited. Does not implicitly {@link fusion.BlindSigResponses.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {fusion.IBlindSigResponses} message BlindSigResponses message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    BlindSigResponses.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a BlindSigResponses message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.BlindSigResponses} BlindSigResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlindSigResponses.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.BlindSigResponses();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.scalars && message.scalars.length))
              message.scalars = [];
            message.scalars.push(reader.bytes());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a BlindSigResponses message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.BlindSigResponses} BlindSigResponses
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    BlindSigResponses.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a BlindSigResponses message.
     * @function verify
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    BlindSigResponses.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.scalars != null && message.hasOwnProperty("scalars")) {
        if (!Array.isArray(message.scalars)) return "scalars: array expected";
        for (let i = 0; i < message.scalars.length; ++i)
          if (
            !(
              (message.scalars[i] &&
                typeof message.scalars[i].length === "number") ||
              $util.isString(message.scalars[i])
            )
          )
            return "scalars: buffer[] expected";
      }
      return null;
    };

    /**
     * Creates a BlindSigResponses message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.BlindSigResponses} BlindSigResponses
     */
    BlindSigResponses.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.BlindSigResponses) return object;
      let message = new $root.fusion.BlindSigResponses();
      if (object.scalars) {
        if (!Array.isArray(object.scalars))
          throw TypeError(".fusion.BlindSigResponses.scalars: array expected");
        message.scalars = [];
        for (let i = 0; i < object.scalars.length; ++i)
          if (typeof object.scalars[i] === "string")
            $util.base64.decode(
              object.scalars[i],
              (message.scalars[i] = $util.newBuffer(
                $util.base64.length(object.scalars[i])
              )),
              0
            );
          else if (object.scalars[i].length >= 0)
            message.scalars[i] = object.scalars[i];
      }
      return message;
    };

    /**
     * Creates a plain object from a BlindSigResponses message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {fusion.BlindSigResponses} message BlindSigResponses
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    BlindSigResponses.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.scalars = [];
      if (message.scalars && message.scalars.length) {
        object.scalars = [];
        for (let j = 0; j < message.scalars.length; ++j)
          object.scalars[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.scalars[j],
                  0,
                  message.scalars[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.scalars[j])
                : message.scalars[j];
      }
      return object;
    };

    /**
     * Converts this BlindSigResponses to JSON.
     * @function toJSON
     * @memberof fusion.BlindSigResponses
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    BlindSigResponses.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for BlindSigResponses
     * @function getTypeUrl
     * @memberof fusion.BlindSigResponses
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    BlindSigResponses.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.BlindSigResponses";
    };

    return BlindSigResponses;
  })();

  fusion.AllCommitments = (function () {
    /**
     * Properties of an AllCommitments.
     * @memberof fusion
     * @interface IAllCommitments
     * @property {Array.<Uint8Array>|null} [initialCommitments] AllCommitments initialCommitments
     */

    /**
     * Constructs a new AllCommitments.
     * @memberof fusion
     * @classdesc Represents an AllCommitments.
     * @implements IAllCommitments
     * @constructor
     * @param {fusion.IAllCommitments=} [properties] Properties to set
     */
    function AllCommitments(properties) {
      this.initialCommitments = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * AllCommitments initialCommitments.
     * @member {Array.<Uint8Array>} initialCommitments
     * @memberof fusion.AllCommitments
     * @instance
     */
    AllCommitments.prototype.initialCommitments = $util.emptyArray;

    /**
     * Creates a new AllCommitments instance using the specified properties.
     * @function create
     * @memberof fusion.AllCommitments
     * @static
     * @param {fusion.IAllCommitments=} [properties] Properties to set
     * @returns {fusion.AllCommitments} AllCommitments instance
     */
    AllCommitments.create = function create(properties) {
      return new AllCommitments(properties);
    };

    /**
     * Encodes the specified AllCommitments message. Does not implicitly {@link fusion.AllCommitments.verify|verify} messages.
     * @function encode
     * @memberof fusion.AllCommitments
     * @static
     * @param {fusion.IAllCommitments} message AllCommitments message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AllCommitments.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.initialCommitments != null &&
        message.initialCommitments.length
      )
        for (let i = 0; i < message.initialCommitments.length; ++i)
          writer
            .uint32(/* id 1, wireType 2 =*/ 10)
            .bytes(message.initialCommitments[i]);
      return writer;
    };

    /**
     * Encodes the specified AllCommitments message, length delimited. Does not implicitly {@link fusion.AllCommitments.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.AllCommitments
     * @static
     * @param {fusion.IAllCommitments} message AllCommitments message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AllCommitments.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AllCommitments message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.AllCommitments
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.AllCommitments} AllCommitments
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AllCommitments.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.AllCommitments();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (
              !(message.initialCommitments && message.initialCommitments.length)
            )
              message.initialCommitments = [];
            message.initialCommitments.push(reader.bytes());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes an AllCommitments message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.AllCommitments
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.AllCommitments} AllCommitments
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AllCommitments.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AllCommitments message.
     * @function verify
     * @memberof fusion.AllCommitments
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AllCommitments.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        message.initialCommitments != null &&
        message.hasOwnProperty("initialCommitments")
      ) {
        if (!Array.isArray(message.initialCommitments))
          return "initialCommitments: array expected";
        for (let i = 0; i < message.initialCommitments.length; ++i)
          if (
            !(
              (message.initialCommitments[i] &&
                typeof message.initialCommitments[i].length === "number") ||
              $util.isString(message.initialCommitments[i])
            )
          )
            return "initialCommitments: buffer[] expected";
      }
      return null;
    };

    /**
     * Creates an AllCommitments message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.AllCommitments
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.AllCommitments} AllCommitments
     */
    AllCommitments.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.AllCommitments) return object;
      let message = new $root.fusion.AllCommitments();
      if (object.initialCommitments) {
        if (!Array.isArray(object.initialCommitments))
          throw TypeError(
            ".fusion.AllCommitments.initialCommitments: array expected"
          );
        message.initialCommitments = [];
        for (let i = 0; i < object.initialCommitments.length; ++i)
          if (typeof object.initialCommitments[i] === "string")
            $util.base64.decode(
              object.initialCommitments[i],
              (message.initialCommitments[i] = $util.newBuffer(
                $util.base64.length(object.initialCommitments[i])
              )),
              0
            );
          else if (object.initialCommitments[i].length >= 0)
            message.initialCommitments[i] = object.initialCommitments[i];
      }
      return message;
    };

    /**
     * Creates a plain object from an AllCommitments message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.AllCommitments
     * @static
     * @param {fusion.AllCommitments} message AllCommitments
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AllCommitments.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.initialCommitments = [];
      if (message.initialCommitments && message.initialCommitments.length) {
        object.initialCommitments = [];
        for (let j = 0; j < message.initialCommitments.length; ++j)
          object.initialCommitments[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.initialCommitments[j],
                  0,
                  message.initialCommitments[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.initialCommitments[j])
                : message.initialCommitments[j];
      }
      return object;
    };

    /**
     * Converts this AllCommitments to JSON.
     * @function toJSON
     * @memberof fusion.AllCommitments
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AllCommitments.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AllCommitments
     * @function getTypeUrl
     * @memberof fusion.AllCommitments
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AllCommitments.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.AllCommitments";
    };

    return AllCommitments;
  })();

  fusion.CovertComponent = (function () {
    /**
     * Properties of a CovertComponent.
     * @memberof fusion
     * @interface ICovertComponent
     * @property {Uint8Array|null} [roundPubkey] CovertComponent roundPubkey
     * @property {Uint8Array} signature CovertComponent signature
     * @property {Uint8Array} component CovertComponent component
     */

    /**
     * Constructs a new CovertComponent.
     * @memberof fusion
     * @classdesc Represents a CovertComponent.
     * @implements ICovertComponent
     * @constructor
     * @param {fusion.ICovertComponent=} [properties] Properties to set
     */
    function CovertComponent(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * CovertComponent roundPubkey.
     * @member {Uint8Array} roundPubkey
     * @memberof fusion.CovertComponent
     * @instance
     */
    CovertComponent.prototype.roundPubkey = $util.newBuffer([]);

    /**
     * CovertComponent signature.
     * @member {Uint8Array} signature
     * @memberof fusion.CovertComponent
     * @instance
     */
    CovertComponent.prototype.signature = $util.newBuffer([]);

    /**
     * CovertComponent component.
     * @member {Uint8Array} component
     * @memberof fusion.CovertComponent
     * @instance
     */
    CovertComponent.prototype.component = $util.newBuffer([]);

    /**
     * Creates a new CovertComponent instance using the specified properties.
     * @function create
     * @memberof fusion.CovertComponent
     * @static
     * @param {fusion.ICovertComponent=} [properties] Properties to set
     * @returns {fusion.CovertComponent} CovertComponent instance
     */
    CovertComponent.create = function create(properties) {
      return new CovertComponent(properties);
    };

    /**
     * Encodes the specified CovertComponent message. Does not implicitly {@link fusion.CovertComponent.verify|verify} messages.
     * @function encode
     * @memberof fusion.CovertComponent
     * @static
     * @param {fusion.ICovertComponent} message CovertComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertComponent.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.roundPubkey != null &&
        Object.hasOwnProperty.call(message, "roundPubkey")
      )
        writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.roundPubkey);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.signature);
      writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.component);
      return writer;
    };

    /**
     * Encodes the specified CovertComponent message, length delimited. Does not implicitly {@link fusion.CovertComponent.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.CovertComponent
     * @static
     * @param {fusion.ICovertComponent} message CovertComponent message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertComponent.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CovertComponent message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.CovertComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.CovertComponent} CovertComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertComponent.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.CovertComponent();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.roundPubkey = reader.bytes();
            break;
          }
          case 2: {
            message.signature = reader.bytes();
            break;
          }
          case 3: {
            message.component = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("signature"))
        throw $util.ProtocolError("missing required 'signature'", {
          instance: message,
        });
      if (!message.hasOwnProperty("component"))
        throw $util.ProtocolError("missing required 'component'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a CovertComponent message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.CovertComponent
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.CovertComponent} CovertComponent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertComponent.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CovertComponent message.
     * @function verify
     * @memberof fusion.CovertComponent
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CovertComponent.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.roundPubkey != null && message.hasOwnProperty("roundPubkey"))
        if (
          !(
            (message.roundPubkey &&
              typeof message.roundPubkey.length === "number") ||
            $util.isString(message.roundPubkey)
          )
        )
          return "roundPubkey: buffer expected";
      if (
        !(
          (message.signature && typeof message.signature.length === "number") ||
          $util.isString(message.signature)
        )
      )
        return "signature: buffer expected";
      if (
        !(
          (message.component && typeof message.component.length === "number") ||
          $util.isString(message.component)
        )
      )
        return "component: buffer expected";
      return null;
    };

    /**
     * Creates a CovertComponent message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.CovertComponent
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.CovertComponent} CovertComponent
     */
    CovertComponent.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.CovertComponent) return object;
      let message = new $root.fusion.CovertComponent();
      if (object.roundPubkey != null)
        if (typeof object.roundPubkey === "string")
          $util.base64.decode(
            object.roundPubkey,
            (message.roundPubkey = $util.newBuffer(
              $util.base64.length(object.roundPubkey)
            )),
            0
          );
        else if (object.roundPubkey.length >= 0)
          message.roundPubkey = object.roundPubkey;
      if (object.signature != null)
        if (typeof object.signature === "string")
          $util.base64.decode(
            object.signature,
            (message.signature = $util.newBuffer(
              $util.base64.length(object.signature)
            )),
            0
          );
        else if (object.signature.length >= 0)
          message.signature = object.signature;
      if (object.component != null)
        if (typeof object.component === "string")
          $util.base64.decode(
            object.component,
            (message.component = $util.newBuffer(
              $util.base64.length(object.component)
            )),
            0
          );
        else if (object.component.length >= 0)
          message.component = object.component;
      return message;
    };

    /**
     * Creates a plain object from a CovertComponent message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.CovertComponent
     * @static
     * @param {fusion.CovertComponent} message CovertComponent
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CovertComponent.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.roundPubkey = "";
        else {
          object.roundPubkey = [];
          if (options.bytes !== Array)
            object.roundPubkey = $util.newBuffer(object.roundPubkey);
        }
        if (options.bytes === String) object.signature = "";
        else {
          object.signature = [];
          if (options.bytes !== Array)
            object.signature = $util.newBuffer(object.signature);
        }
        if (options.bytes === String) object.component = "";
        else {
          object.component = [];
          if (options.bytes !== Array)
            object.component = $util.newBuffer(object.component);
        }
      }
      if (message.roundPubkey != null && message.hasOwnProperty("roundPubkey"))
        object.roundPubkey =
          options.bytes === String
            ? $util.base64.encode(
                message.roundPubkey,
                0,
                message.roundPubkey.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.roundPubkey)
              : message.roundPubkey;
      if (message.signature != null && message.hasOwnProperty("signature"))
        object.signature =
          options.bytes === String
            ? $util.base64.encode(
                message.signature,
                0,
                message.signature.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.signature)
              : message.signature;
      if (message.component != null && message.hasOwnProperty("component"))
        object.component =
          options.bytes === String
            ? $util.base64.encode(
                message.component,
                0,
                message.component.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.component)
              : message.component;
      return object;
    };

    /**
     * Converts this CovertComponent to JSON.
     * @function toJSON
     * @memberof fusion.CovertComponent
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CovertComponent.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CovertComponent
     * @function getTypeUrl
     * @memberof fusion.CovertComponent
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CovertComponent.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.CovertComponent";
    };

    return CovertComponent;
  })();

  fusion.ShareCovertComponents = (function () {
    /**
     * Properties of a ShareCovertComponents.
     * @memberof fusion
     * @interface IShareCovertComponents
     * @property {Array.<Uint8Array>|null} [components] ShareCovertComponents components
     * @property {boolean|null} [skipSignatures] ShareCovertComponents skipSignatures
     * @property {Uint8Array|null} [sessionHash] ShareCovertComponents sessionHash
     */

    /**
     * Constructs a new ShareCovertComponents.
     * @memberof fusion
     * @classdesc Represents a ShareCovertComponents.
     * @implements IShareCovertComponents
     * @constructor
     * @param {fusion.IShareCovertComponents=} [properties] Properties to set
     */
    function ShareCovertComponents(properties) {
      this.components = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * ShareCovertComponents components.
     * @member {Array.<Uint8Array>} components
     * @memberof fusion.ShareCovertComponents
     * @instance
     */
    ShareCovertComponents.prototype.components = $util.emptyArray;

    /**
     * ShareCovertComponents skipSignatures.
     * @member {boolean} skipSignatures
     * @memberof fusion.ShareCovertComponents
     * @instance
     */
    ShareCovertComponents.prototype.skipSignatures = false;

    /**
     * ShareCovertComponents sessionHash.
     * @member {Uint8Array} sessionHash
     * @memberof fusion.ShareCovertComponents
     * @instance
     */
    ShareCovertComponents.prototype.sessionHash = $util.newBuffer([]);

    /**
     * Creates a new ShareCovertComponents instance using the specified properties.
     * @function create
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {fusion.IShareCovertComponents=} [properties] Properties to set
     * @returns {fusion.ShareCovertComponents} ShareCovertComponents instance
     */
    ShareCovertComponents.create = function create(properties) {
      return new ShareCovertComponents(properties);
    };

    /**
     * Encodes the specified ShareCovertComponents message. Does not implicitly {@link fusion.ShareCovertComponents.verify|verify} messages.
     * @function encode
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {fusion.IShareCovertComponents} message ShareCovertComponents message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ShareCovertComponents.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.components != null && message.components.length)
        for (let i = 0; i < message.components.length; ++i)
          writer
            .uint32(/* id 4, wireType 2 =*/ 34)
            .bytes(message.components[i]);
      if (
        message.skipSignatures != null &&
        Object.hasOwnProperty.call(message, "skipSignatures")
      )
        writer.uint32(/* id 5, wireType 0 =*/ 40).bool(message.skipSignatures);
      if (
        message.sessionHash != null &&
        Object.hasOwnProperty.call(message, "sessionHash")
      )
        writer.uint32(/* id 6, wireType 2 =*/ 50).bytes(message.sessionHash);
      return writer;
    };

    /**
     * Encodes the specified ShareCovertComponents message, length delimited. Does not implicitly {@link fusion.ShareCovertComponents.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {fusion.IShareCovertComponents} message ShareCovertComponents message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ShareCovertComponents.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ShareCovertComponents message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.ShareCovertComponents} ShareCovertComponents
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ShareCovertComponents.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.ShareCovertComponents();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 4: {
            if (!(message.components && message.components.length))
              message.components = [];
            message.components.push(reader.bytes());
            break;
          }
          case 5: {
            message.skipSignatures = reader.bool();
            break;
          }
          case 6: {
            message.sessionHash = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a ShareCovertComponents message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.ShareCovertComponents} ShareCovertComponents
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ShareCovertComponents.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ShareCovertComponents message.
     * @function verify
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ShareCovertComponents.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.components != null && message.hasOwnProperty("components")) {
        if (!Array.isArray(message.components))
          return "components: array expected";
        for (let i = 0; i < message.components.length; ++i)
          if (
            !(
              (message.components[i] &&
                typeof message.components[i].length === "number") ||
              $util.isString(message.components[i])
            )
          )
            return "components: buffer[] expected";
      }
      if (
        message.skipSignatures != null &&
        message.hasOwnProperty("skipSignatures")
      )
        if (typeof message.skipSignatures !== "boolean")
          return "skipSignatures: boolean expected";
      if (message.sessionHash != null && message.hasOwnProperty("sessionHash"))
        if (
          !(
            (message.sessionHash &&
              typeof message.sessionHash.length === "number") ||
            $util.isString(message.sessionHash)
          )
        )
          return "sessionHash: buffer expected";
      return null;
    };

    /**
     * Creates a ShareCovertComponents message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.ShareCovertComponents} ShareCovertComponents
     */
    ShareCovertComponents.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.ShareCovertComponents) return object;
      let message = new $root.fusion.ShareCovertComponents();
      if (object.components) {
        if (!Array.isArray(object.components))
          throw TypeError(
            ".fusion.ShareCovertComponents.components: array expected"
          );
        message.components = [];
        for (let i = 0; i < object.components.length; ++i)
          if (typeof object.components[i] === "string")
            $util.base64.decode(
              object.components[i],
              (message.components[i] = $util.newBuffer(
                $util.base64.length(object.components[i])
              )),
              0
            );
          else if (object.components[i].length >= 0)
            message.components[i] = object.components[i];
      }
      if (object.skipSignatures != null)
        message.skipSignatures = Boolean(object.skipSignatures);
      if (object.sessionHash != null)
        if (typeof object.sessionHash === "string")
          $util.base64.decode(
            object.sessionHash,
            (message.sessionHash = $util.newBuffer(
              $util.base64.length(object.sessionHash)
            )),
            0
          );
        else if (object.sessionHash.length >= 0)
          message.sessionHash = object.sessionHash;
      return message;
    };

    /**
     * Creates a plain object from a ShareCovertComponents message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {fusion.ShareCovertComponents} message ShareCovertComponents
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ShareCovertComponents.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.components = [];
      if (options.defaults) {
        object.skipSignatures = false;
        if (options.bytes === String) object.sessionHash = "";
        else {
          object.sessionHash = [];
          if (options.bytes !== Array)
            object.sessionHash = $util.newBuffer(object.sessionHash);
        }
      }
      if (message.components && message.components.length) {
        object.components = [];
        for (let j = 0; j < message.components.length; ++j)
          object.components[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.components[j],
                  0,
                  message.components[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.components[j])
                : message.components[j];
      }
      if (
        message.skipSignatures != null &&
        message.hasOwnProperty("skipSignatures")
      )
        object.skipSignatures = message.skipSignatures;
      if (message.sessionHash != null && message.hasOwnProperty("sessionHash"))
        object.sessionHash =
          options.bytes === String
            ? $util.base64.encode(
                message.sessionHash,
                0,
                message.sessionHash.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.sessionHash)
              : message.sessionHash;
      return object;
    };

    /**
     * Converts this ShareCovertComponents to JSON.
     * @function toJSON
     * @memberof fusion.ShareCovertComponents
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ShareCovertComponents.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ShareCovertComponents
     * @function getTypeUrl
     * @memberof fusion.ShareCovertComponents
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ShareCovertComponents.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.ShareCovertComponents";
    };

    return ShareCovertComponents;
  })();

  fusion.CovertTransactionSignature = (function () {
    /**
     * Properties of a CovertTransactionSignature.
     * @memberof fusion
     * @interface ICovertTransactionSignature
     * @property {Uint8Array|null} [roundPubkey] CovertTransactionSignature roundPubkey
     * @property {number} whichInput CovertTransactionSignature whichInput
     * @property {Uint8Array} txsignature CovertTransactionSignature txsignature
     */

    /**
     * Constructs a new CovertTransactionSignature.
     * @memberof fusion
     * @classdesc Represents a CovertTransactionSignature.
     * @implements ICovertTransactionSignature
     * @constructor
     * @param {fusion.ICovertTransactionSignature=} [properties] Properties to set
     */
    function CovertTransactionSignature(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * CovertTransactionSignature roundPubkey.
     * @member {Uint8Array} roundPubkey
     * @memberof fusion.CovertTransactionSignature
     * @instance
     */
    CovertTransactionSignature.prototype.roundPubkey = $util.newBuffer([]);

    /**
     * CovertTransactionSignature whichInput.
     * @member {number} whichInput
     * @memberof fusion.CovertTransactionSignature
     * @instance
     */
    CovertTransactionSignature.prototype.whichInput = 0;

    /**
     * CovertTransactionSignature txsignature.
     * @member {Uint8Array} txsignature
     * @memberof fusion.CovertTransactionSignature
     * @instance
     */
    CovertTransactionSignature.prototype.txsignature = $util.newBuffer([]);

    /**
     * Creates a new CovertTransactionSignature instance using the specified properties.
     * @function create
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {fusion.ICovertTransactionSignature=} [properties] Properties to set
     * @returns {fusion.CovertTransactionSignature} CovertTransactionSignature instance
     */
    CovertTransactionSignature.create = function create(properties) {
      return new CovertTransactionSignature(properties);
    };

    /**
     * Encodes the specified CovertTransactionSignature message. Does not implicitly {@link fusion.CovertTransactionSignature.verify|verify} messages.
     * @function encode
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {fusion.ICovertTransactionSignature} message CovertTransactionSignature message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertTransactionSignature.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.roundPubkey != null &&
        Object.hasOwnProperty.call(message, "roundPubkey")
      )
        writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.roundPubkey);
      writer.uint32(/* id 2, wireType 0 =*/ 16).uint32(message.whichInput);
      writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.txsignature);
      return writer;
    };

    /**
     * Encodes the specified CovertTransactionSignature message, length delimited. Does not implicitly {@link fusion.CovertTransactionSignature.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {fusion.ICovertTransactionSignature} message CovertTransactionSignature message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertTransactionSignature.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CovertTransactionSignature message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.CovertTransactionSignature} CovertTransactionSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertTransactionSignature.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.CovertTransactionSignature();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.roundPubkey = reader.bytes();
            break;
          }
          case 2: {
            message.whichInput = reader.uint32();
            break;
          }
          case 3: {
            message.txsignature = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("whichInput"))
        throw $util.ProtocolError("missing required 'whichInput'", {
          instance: message,
        });
      if (!message.hasOwnProperty("txsignature"))
        throw $util.ProtocolError("missing required 'txsignature'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a CovertTransactionSignature message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.CovertTransactionSignature} CovertTransactionSignature
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertTransactionSignature.decodeDelimited = function decodeDelimited(
      reader
    ) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CovertTransactionSignature message.
     * @function verify
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CovertTransactionSignature.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.roundPubkey != null && message.hasOwnProperty("roundPubkey"))
        if (
          !(
            (message.roundPubkey &&
              typeof message.roundPubkey.length === "number") ||
            $util.isString(message.roundPubkey)
          )
        )
          return "roundPubkey: buffer expected";
      if (!$util.isInteger(message.whichInput))
        return "whichInput: integer expected";
      if (
        !(
          (message.txsignature &&
            typeof message.txsignature.length === "number") ||
          $util.isString(message.txsignature)
        )
      )
        return "txsignature: buffer expected";
      return null;
    };

    /**
     * Creates a CovertTransactionSignature message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.CovertTransactionSignature} CovertTransactionSignature
     */
    CovertTransactionSignature.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.CovertTransactionSignature)
        return object;
      let message = new $root.fusion.CovertTransactionSignature();
      if (object.roundPubkey != null)
        if (typeof object.roundPubkey === "string")
          $util.base64.decode(
            object.roundPubkey,
            (message.roundPubkey = $util.newBuffer(
              $util.base64.length(object.roundPubkey)
            )),
            0
          );
        else if (object.roundPubkey.length >= 0)
          message.roundPubkey = object.roundPubkey;
      if (object.whichInput != null)
        message.whichInput = object.whichInput >>> 0;
      if (object.txsignature != null)
        if (typeof object.txsignature === "string")
          $util.base64.decode(
            object.txsignature,
            (message.txsignature = $util.newBuffer(
              $util.base64.length(object.txsignature)
            )),
            0
          );
        else if (object.txsignature.length >= 0)
          message.txsignature = object.txsignature;
      return message;
    };

    /**
     * Creates a plain object from a CovertTransactionSignature message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {fusion.CovertTransactionSignature} message CovertTransactionSignature
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CovertTransactionSignature.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) {
        if (options.bytes === String) object.roundPubkey = "";
        else {
          object.roundPubkey = [];
          if (options.bytes !== Array)
            object.roundPubkey = $util.newBuffer(object.roundPubkey);
        }
        object.whichInput = 0;
        if (options.bytes === String) object.txsignature = "";
        else {
          object.txsignature = [];
          if (options.bytes !== Array)
            object.txsignature = $util.newBuffer(object.txsignature);
        }
      }
      if (message.roundPubkey != null && message.hasOwnProperty("roundPubkey"))
        object.roundPubkey =
          options.bytes === String
            ? $util.base64.encode(
                message.roundPubkey,
                0,
                message.roundPubkey.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.roundPubkey)
              : message.roundPubkey;
      if (message.whichInput != null && message.hasOwnProperty("whichInput"))
        object.whichInput = message.whichInput;
      if (message.txsignature != null && message.hasOwnProperty("txsignature"))
        object.txsignature =
          options.bytes === String
            ? $util.base64.encode(
                message.txsignature,
                0,
                message.txsignature.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.txsignature)
              : message.txsignature;
      return object;
    };

    /**
     * Converts this CovertTransactionSignature to JSON.
     * @function toJSON
     * @memberof fusion.CovertTransactionSignature
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CovertTransactionSignature.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CovertTransactionSignature
     * @function getTypeUrl
     * @memberof fusion.CovertTransactionSignature
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CovertTransactionSignature.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.CovertTransactionSignature";
    };

    return CovertTransactionSignature;
  })();

  fusion.FusionResult = (function () {
    /**
     * Properties of a FusionResult.
     * @memberof fusion
     * @interface IFusionResult
     * @property {boolean} ok FusionResult ok
     * @property {Array.<Uint8Array>|null} [txsignatures] FusionResult txsignatures
     * @property {Array.<number>|null} [badComponents] FusionResult badComponents
     */

    /**
     * Constructs a new FusionResult.
     * @memberof fusion
     * @classdesc Represents a FusionResult.
     * @implements IFusionResult
     * @constructor
     * @param {fusion.IFusionResult=} [properties] Properties to set
     */
    function FusionResult(properties) {
      this.txsignatures = [];
      this.badComponents = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * FusionResult ok.
     * @member {boolean} ok
     * @memberof fusion.FusionResult
     * @instance
     */
    FusionResult.prototype.ok = false;

    /**
     * FusionResult txsignatures.
     * @member {Array.<Uint8Array>} txsignatures
     * @memberof fusion.FusionResult
     * @instance
     */
    FusionResult.prototype.txsignatures = $util.emptyArray;

    /**
     * FusionResult badComponents.
     * @member {Array.<number>} badComponents
     * @memberof fusion.FusionResult
     * @instance
     */
    FusionResult.prototype.badComponents = $util.emptyArray;

    /**
     * Creates a new FusionResult instance using the specified properties.
     * @function create
     * @memberof fusion.FusionResult
     * @static
     * @param {fusion.IFusionResult=} [properties] Properties to set
     * @returns {fusion.FusionResult} FusionResult instance
     */
    FusionResult.create = function create(properties) {
      return new FusionResult(properties);
    };

    /**
     * Encodes the specified FusionResult message. Does not implicitly {@link fusion.FusionResult.verify|verify} messages.
     * @function encode
     * @memberof fusion.FusionResult
     * @static
     * @param {fusion.IFusionResult} message FusionResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FusionResult.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      writer.uint32(/* id 1, wireType 0 =*/ 8).bool(message.ok);
      if (message.txsignatures != null && message.txsignatures.length)
        for (let i = 0; i < message.txsignatures.length; ++i)
          writer
            .uint32(/* id 2, wireType 2 =*/ 18)
            .bytes(message.txsignatures[i]);
      if (message.badComponents != null && message.badComponents.length)
        for (let i = 0; i < message.badComponents.length; ++i)
          writer
            .uint32(/* id 3, wireType 0 =*/ 24)
            .uint32(message.badComponents[i]);
      return writer;
    };

    /**
     * Encodes the specified FusionResult message, length delimited. Does not implicitly {@link fusion.FusionResult.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.FusionResult
     * @static
     * @param {fusion.IFusionResult} message FusionResult message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    FusionResult.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a FusionResult message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.FusionResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.FusionResult} FusionResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FusionResult.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.FusionResult();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.ok = reader.bool();
            break;
          }
          case 2: {
            if (!(message.txsignatures && message.txsignatures.length))
              message.txsignatures = [];
            message.txsignatures.push(reader.bytes());
            break;
          }
          case 3: {
            if (!(message.badComponents && message.badComponents.length))
              message.badComponents = [];
            if ((tag & 7) === 2) {
              let end2 = reader.uint32() + reader.pos;
              while (reader.pos < end2)
                message.badComponents.push(reader.uint32());
            } else message.badComponents.push(reader.uint32());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("ok"))
        throw $util.ProtocolError("missing required 'ok'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a FusionResult message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.FusionResult
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.FusionResult} FusionResult
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    FusionResult.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a FusionResult message.
     * @function verify
     * @memberof fusion.FusionResult
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    FusionResult.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (typeof message.ok !== "boolean") return "ok: boolean expected";
      if (
        message.txsignatures != null &&
        message.hasOwnProperty("txsignatures")
      ) {
        if (!Array.isArray(message.txsignatures))
          return "txsignatures: array expected";
        for (let i = 0; i < message.txsignatures.length; ++i)
          if (
            !(
              (message.txsignatures[i] &&
                typeof message.txsignatures[i].length === "number") ||
              $util.isString(message.txsignatures[i])
            )
          )
            return "txsignatures: buffer[] expected";
      }
      if (
        message.badComponents != null &&
        message.hasOwnProperty("badComponents")
      ) {
        if (!Array.isArray(message.badComponents))
          return "badComponents: array expected";
        for (let i = 0; i < message.badComponents.length; ++i)
          if (!$util.isInteger(message.badComponents[i]))
            return "badComponents: integer[] expected";
      }
      return null;
    };

    /**
     * Creates a FusionResult message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.FusionResult
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.FusionResult} FusionResult
     */
    FusionResult.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.FusionResult) return object;
      let message = new $root.fusion.FusionResult();
      if (object.ok != null) message.ok = Boolean(object.ok);
      if (object.txsignatures) {
        if (!Array.isArray(object.txsignatures))
          throw TypeError(".fusion.FusionResult.txsignatures: array expected");
        message.txsignatures = [];
        for (let i = 0; i < object.txsignatures.length; ++i)
          if (typeof object.txsignatures[i] === "string")
            $util.base64.decode(
              object.txsignatures[i],
              (message.txsignatures[i] = $util.newBuffer(
                $util.base64.length(object.txsignatures[i])
              )),
              0
            );
          else if (object.txsignatures[i].length >= 0)
            message.txsignatures[i] = object.txsignatures[i];
      }
      if (object.badComponents) {
        if (!Array.isArray(object.badComponents))
          throw TypeError(".fusion.FusionResult.badComponents: array expected");
        message.badComponents = [];
        for (let i = 0; i < object.badComponents.length; ++i)
          message.badComponents[i] = object.badComponents[i] >>> 0;
      }
      return message;
    };

    /**
     * Creates a plain object from a FusionResult message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.FusionResult
     * @static
     * @param {fusion.FusionResult} message FusionResult
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    FusionResult.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) {
        object.txsignatures = [];
        object.badComponents = [];
      }
      if (options.defaults) object.ok = false;
      if (message.ok != null && message.hasOwnProperty("ok"))
        object.ok = message.ok;
      if (message.txsignatures && message.txsignatures.length) {
        object.txsignatures = [];
        for (let j = 0; j < message.txsignatures.length; ++j)
          object.txsignatures[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.txsignatures[j],
                  0,
                  message.txsignatures[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.txsignatures[j])
                : message.txsignatures[j];
      }
      if (message.badComponents && message.badComponents.length) {
        object.badComponents = [];
        for (let j = 0; j < message.badComponents.length; ++j)
          object.badComponents[j] = message.badComponents[j];
      }
      return object;
    };

    /**
     * Converts this FusionResult to JSON.
     * @function toJSON
     * @memberof fusion.FusionResult
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    FusionResult.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for FusionResult
     * @function getTypeUrl
     * @memberof fusion.FusionResult
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    FusionResult.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.FusionResult";
    };

    return FusionResult;
  })();

  fusion.MyProofsList = (function () {
    /**
     * Properties of a MyProofsList.
     * @memberof fusion
     * @interface IMyProofsList
     * @property {Array.<Uint8Array>|null} [encryptedProofs] MyProofsList encryptedProofs
     * @property {Uint8Array} randomNumber MyProofsList randomNumber
     */

    /**
     * Constructs a new MyProofsList.
     * @memberof fusion
     * @classdesc Represents a MyProofsList.
     * @implements IMyProofsList
     * @constructor
     * @param {fusion.IMyProofsList=} [properties] Properties to set
     */
    function MyProofsList(properties) {
      this.encryptedProofs = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * MyProofsList encryptedProofs.
     * @member {Array.<Uint8Array>} encryptedProofs
     * @memberof fusion.MyProofsList
     * @instance
     */
    MyProofsList.prototype.encryptedProofs = $util.emptyArray;

    /**
     * MyProofsList randomNumber.
     * @member {Uint8Array} randomNumber
     * @memberof fusion.MyProofsList
     * @instance
     */
    MyProofsList.prototype.randomNumber = $util.newBuffer([]);

    /**
     * Creates a new MyProofsList instance using the specified properties.
     * @function create
     * @memberof fusion.MyProofsList
     * @static
     * @param {fusion.IMyProofsList=} [properties] Properties to set
     * @returns {fusion.MyProofsList} MyProofsList instance
     */
    MyProofsList.create = function create(properties) {
      return new MyProofsList(properties);
    };

    /**
     * Encodes the specified MyProofsList message. Does not implicitly {@link fusion.MyProofsList.verify|verify} messages.
     * @function encode
     * @memberof fusion.MyProofsList
     * @static
     * @param {fusion.IMyProofsList} message MyProofsList message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MyProofsList.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.encryptedProofs != null && message.encryptedProofs.length)
        for (let i = 0; i < message.encryptedProofs.length; ++i)
          writer
            .uint32(/* id 1, wireType 2 =*/ 10)
            .bytes(message.encryptedProofs[i]);
      writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.randomNumber);
      return writer;
    };

    /**
     * Encodes the specified MyProofsList message, length delimited. Does not implicitly {@link fusion.MyProofsList.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.MyProofsList
     * @static
     * @param {fusion.IMyProofsList} message MyProofsList message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MyProofsList.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MyProofsList message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.MyProofsList
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.MyProofsList} MyProofsList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MyProofsList.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.MyProofsList();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.encryptedProofs && message.encryptedProofs.length))
              message.encryptedProofs = [];
            message.encryptedProofs.push(reader.bytes());
            break;
          }
          case 2: {
            message.randomNumber = reader.bytes();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      if (!message.hasOwnProperty("randomNumber"))
        throw $util.ProtocolError("missing required 'randomNumber'", {
          instance: message,
        });
      return message;
    };

    /**
     * Decodes a MyProofsList message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.MyProofsList
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.MyProofsList} MyProofsList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MyProofsList.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MyProofsList message.
     * @function verify
     * @memberof fusion.MyProofsList
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MyProofsList.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (
        message.encryptedProofs != null &&
        message.hasOwnProperty("encryptedProofs")
      ) {
        if (!Array.isArray(message.encryptedProofs))
          return "encryptedProofs: array expected";
        for (let i = 0; i < message.encryptedProofs.length; ++i)
          if (
            !(
              (message.encryptedProofs[i] &&
                typeof message.encryptedProofs[i].length === "number") ||
              $util.isString(message.encryptedProofs[i])
            )
          )
            return "encryptedProofs: buffer[] expected";
      }
      if (
        !(
          (message.randomNumber &&
            typeof message.randomNumber.length === "number") ||
          $util.isString(message.randomNumber)
        )
      )
        return "randomNumber: buffer expected";
      return null;
    };

    /**
     * Creates a MyProofsList message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.MyProofsList
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.MyProofsList} MyProofsList
     */
    MyProofsList.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.MyProofsList) return object;
      let message = new $root.fusion.MyProofsList();
      if (object.encryptedProofs) {
        if (!Array.isArray(object.encryptedProofs))
          throw TypeError(
            ".fusion.MyProofsList.encryptedProofs: array expected"
          );
        message.encryptedProofs = [];
        for (let i = 0; i < object.encryptedProofs.length; ++i)
          if (typeof object.encryptedProofs[i] === "string")
            $util.base64.decode(
              object.encryptedProofs[i],
              (message.encryptedProofs[i] = $util.newBuffer(
                $util.base64.length(object.encryptedProofs[i])
              )),
              0
            );
          else if (object.encryptedProofs[i].length >= 0)
            message.encryptedProofs[i] = object.encryptedProofs[i];
      }
      if (object.randomNumber != null)
        if (typeof object.randomNumber === "string")
          $util.base64.decode(
            object.randomNumber,
            (message.randomNumber = $util.newBuffer(
              $util.base64.length(object.randomNumber)
            )),
            0
          );
        else if (object.randomNumber.length >= 0)
          message.randomNumber = object.randomNumber;
      return message;
    };

    /**
     * Creates a plain object from a MyProofsList message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.MyProofsList
     * @static
     * @param {fusion.MyProofsList} message MyProofsList
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MyProofsList.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.encryptedProofs = [];
      if (options.defaults)
        if (options.bytes === String) object.randomNumber = "";
        else {
          object.randomNumber = [];
          if (options.bytes !== Array)
            object.randomNumber = $util.newBuffer(object.randomNumber);
        }
      if (message.encryptedProofs && message.encryptedProofs.length) {
        object.encryptedProofs = [];
        for (let j = 0; j < message.encryptedProofs.length; ++j)
          object.encryptedProofs[j] =
            options.bytes === String
              ? $util.base64.encode(
                  message.encryptedProofs[j],
                  0,
                  message.encryptedProofs[j].length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.encryptedProofs[j])
                : message.encryptedProofs[j];
      }
      if (
        message.randomNumber != null &&
        message.hasOwnProperty("randomNumber")
      )
        object.randomNumber =
          options.bytes === String
            ? $util.base64.encode(
                message.randomNumber,
                0,
                message.randomNumber.length
              )
            : options.bytes === Array
              ? Array.prototype.slice.call(message.randomNumber)
              : message.randomNumber;
      return object;
    };

    /**
     * Converts this MyProofsList to JSON.
     * @function toJSON
     * @memberof fusion.MyProofsList
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MyProofsList.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MyProofsList
     * @function getTypeUrl
     * @memberof fusion.MyProofsList
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MyProofsList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.MyProofsList";
    };

    return MyProofsList;
  })();

  fusion.TheirProofsList = (function () {
    /**
     * Properties of a TheirProofsList.
     * @memberof fusion
     * @interface ITheirProofsList
     * @property {Array.<fusion.TheirProofsList.IRelayedProof>|null} [proofs] TheirProofsList proofs
     */

    /**
     * Constructs a new TheirProofsList.
     * @memberof fusion
     * @classdesc Represents a TheirProofsList.
     * @implements ITheirProofsList
     * @constructor
     * @param {fusion.ITheirProofsList=} [properties] Properties to set
     */
    function TheirProofsList(properties) {
      this.proofs = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * TheirProofsList proofs.
     * @member {Array.<fusion.TheirProofsList.IRelayedProof>} proofs
     * @memberof fusion.TheirProofsList
     * @instance
     */
    TheirProofsList.prototype.proofs = $util.emptyArray;

    /**
     * Creates a new TheirProofsList instance using the specified properties.
     * @function create
     * @memberof fusion.TheirProofsList
     * @static
     * @param {fusion.ITheirProofsList=} [properties] Properties to set
     * @returns {fusion.TheirProofsList} TheirProofsList instance
     */
    TheirProofsList.create = function create(properties) {
      return new TheirProofsList(properties);
    };

    /**
     * Encodes the specified TheirProofsList message. Does not implicitly {@link fusion.TheirProofsList.verify|verify} messages.
     * @function encode
     * @memberof fusion.TheirProofsList
     * @static
     * @param {fusion.ITheirProofsList} message TheirProofsList message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TheirProofsList.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.proofs != null && message.proofs.length)
        for (let i = 0; i < message.proofs.length; ++i)
          $root.fusion.TheirProofsList.RelayedProof.encode(
            message.proofs[i],
            writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
          ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified TheirProofsList message, length delimited. Does not implicitly {@link fusion.TheirProofsList.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.TheirProofsList
     * @static
     * @param {fusion.ITheirProofsList} message TheirProofsList message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TheirProofsList.encodeDelimited = function encodeDelimited(
      message,
      writer
    ) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TheirProofsList message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.TheirProofsList
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.TheirProofsList} TheirProofsList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TheirProofsList.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.TheirProofsList();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.proofs && message.proofs.length)) message.proofs = [];
            message.proofs.push(
              $root.fusion.TheirProofsList.RelayedProof.decode(
                reader,
                reader.uint32()
              )
            );
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a TheirProofsList message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.TheirProofsList
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.TheirProofsList} TheirProofsList
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TheirProofsList.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TheirProofsList message.
     * @function verify
     * @memberof fusion.TheirProofsList
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TheirProofsList.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.proofs != null && message.hasOwnProperty("proofs")) {
        if (!Array.isArray(message.proofs)) return "proofs: array expected";
        for (let i = 0; i < message.proofs.length; ++i) {
          let error = $root.fusion.TheirProofsList.RelayedProof.verify(
            message.proofs[i]
          );
          if (error) return "proofs." + error;
        }
      }
      return null;
    };

    /**
     * Creates a TheirProofsList message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.TheirProofsList
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.TheirProofsList} TheirProofsList
     */
    TheirProofsList.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.TheirProofsList) return object;
      let message = new $root.fusion.TheirProofsList();
      if (object.proofs) {
        if (!Array.isArray(object.proofs))
          throw TypeError(".fusion.TheirProofsList.proofs: array expected");
        message.proofs = [];
        for (let i = 0; i < object.proofs.length; ++i) {
          if (typeof object.proofs[i] !== "object")
            throw TypeError(".fusion.TheirProofsList.proofs: object expected");
          message.proofs[i] =
            $root.fusion.TheirProofsList.RelayedProof.fromObject(
              object.proofs[i]
            );
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a TheirProofsList message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.TheirProofsList
     * @static
     * @param {fusion.TheirProofsList} message TheirProofsList
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TheirProofsList.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.proofs = [];
      if (message.proofs && message.proofs.length) {
        object.proofs = [];
        for (let j = 0; j < message.proofs.length; ++j)
          object.proofs[j] = $root.fusion.TheirProofsList.RelayedProof.toObject(
            message.proofs[j],
            options
          );
      }
      return object;
    };

    /**
     * Converts this TheirProofsList to JSON.
     * @function toJSON
     * @memberof fusion.TheirProofsList
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TheirProofsList.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TheirProofsList
     * @function getTypeUrl
     * @memberof fusion.TheirProofsList
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TheirProofsList.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.TheirProofsList";
    };

    TheirProofsList.RelayedProof = (function () {
      /**
       * Properties of a RelayedProof.
       * @memberof fusion.TheirProofsList
       * @interface IRelayedProof
       * @property {Uint8Array} encryptedProof RelayedProof encryptedProof
       * @property {number} srcCommitmentIdx RelayedProof srcCommitmentIdx
       * @property {number} dstKeyIdx RelayedProof dstKeyIdx
       */

      /**
       * Constructs a new RelayedProof.
       * @memberof fusion.TheirProofsList
       * @classdesc Represents a RelayedProof.
       * @implements IRelayedProof
       * @constructor
       * @param {fusion.TheirProofsList.IRelayedProof=} [properties] Properties to set
       */
      function RelayedProof(properties) {
        if (properties)
          for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            if (properties[keys[i]] != null)
              this[keys[i]] = properties[keys[i]];
      }

      /**
       * RelayedProof encryptedProof.
       * @member {Uint8Array} encryptedProof
       * @memberof fusion.TheirProofsList.RelayedProof
       * @instance
       */
      RelayedProof.prototype.encryptedProof = $util.newBuffer([]);

      /**
       * RelayedProof srcCommitmentIdx.
       * @member {number} srcCommitmentIdx
       * @memberof fusion.TheirProofsList.RelayedProof
       * @instance
       */
      RelayedProof.prototype.srcCommitmentIdx = 0;

      /**
       * RelayedProof dstKeyIdx.
       * @member {number} dstKeyIdx
       * @memberof fusion.TheirProofsList.RelayedProof
       * @instance
       */
      RelayedProof.prototype.dstKeyIdx = 0;

      /**
       * Creates a new RelayedProof instance using the specified properties.
       * @function create
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {fusion.TheirProofsList.IRelayedProof=} [properties] Properties to set
       * @returns {fusion.TheirProofsList.RelayedProof} RelayedProof instance
       */
      RelayedProof.create = function create(properties) {
        return new RelayedProof(properties);
      };

      /**
       * Encodes the specified RelayedProof message. Does not implicitly {@link fusion.TheirProofsList.RelayedProof.verify|verify} messages.
       * @function encode
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {fusion.TheirProofsList.IRelayedProof} message RelayedProof message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      RelayedProof.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        writer.uint32(/* id 1, wireType 2 =*/ 10).bytes(message.encryptedProof);
        writer
          .uint32(/* id 2, wireType 0 =*/ 16)
          .uint32(message.srcCommitmentIdx);
        writer.uint32(/* id 3, wireType 0 =*/ 24).uint32(message.dstKeyIdx);
        return writer;
      };

      /**
       * Encodes the specified RelayedProof message, length delimited. Does not implicitly {@link fusion.TheirProofsList.RelayedProof.verify|verify} messages.
       * @function encodeDelimited
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {fusion.TheirProofsList.IRelayedProof} message RelayedProof message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      RelayedProof.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a RelayedProof message from the specified reader or buffer.
       * @function decode
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {fusion.TheirProofsList.RelayedProof} RelayedProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      RelayedProof.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length,
          message = new $root.fusion.TheirProofsList.RelayedProof();
        while (reader.pos < end) {
          let tag = reader.uint32();
          if (tag === error) break;
          switch (tag >>> 3) {
            case 1: {
              message.encryptedProof = reader.bytes();
              break;
            }
            case 2: {
              message.srcCommitmentIdx = reader.uint32();
              break;
            }
            case 3: {
              message.dstKeyIdx = reader.uint32();
              break;
            }
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        if (!message.hasOwnProperty("encryptedProof"))
          throw $util.ProtocolError("missing required 'encryptedProof'", {
            instance: message,
          });
        if (!message.hasOwnProperty("srcCommitmentIdx"))
          throw $util.ProtocolError("missing required 'srcCommitmentIdx'", {
            instance: message,
          });
        if (!message.hasOwnProperty("dstKeyIdx"))
          throw $util.ProtocolError("missing required 'dstKeyIdx'", {
            instance: message,
          });
        return message;
      };

      /**
       * Decodes a RelayedProof message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {fusion.TheirProofsList.RelayedProof} RelayedProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      RelayedProof.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Verifies a RelayedProof message.
       * @function verify
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */
      RelayedProof.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
          return "object expected";
        if (
          !(
            (message.encryptedProof &&
              typeof message.encryptedProof.length === "number") ||
            $util.isString(message.encryptedProof)
          )
        )
          return "encryptedProof: buffer expected";
        if (!$util.isInteger(message.srcCommitmentIdx))
          return "srcCommitmentIdx: integer expected";
        if (!$util.isInteger(message.dstKeyIdx))
          return "dstKeyIdx: integer expected";
        return null;
      };

      /**
       * Creates a RelayedProof message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {fusion.TheirProofsList.RelayedProof} RelayedProof
       */
      RelayedProof.fromObject = function fromObject(object) {
        if (object instanceof $root.fusion.TheirProofsList.RelayedProof)
          return object;
        let message = new $root.fusion.TheirProofsList.RelayedProof();
        if (object.encryptedProof != null)
          if (typeof object.encryptedProof === "string")
            $util.base64.decode(
              object.encryptedProof,
              (message.encryptedProof = $util.newBuffer(
                $util.base64.length(object.encryptedProof)
              )),
              0
            );
          else if (object.encryptedProof.length >= 0)
            message.encryptedProof = object.encryptedProof;
        if (object.srcCommitmentIdx != null)
          message.srcCommitmentIdx = object.srcCommitmentIdx >>> 0;
        if (object.dstKeyIdx != null)
          message.dstKeyIdx = object.dstKeyIdx >>> 0;
        return message;
      };

      /**
       * Creates a plain object from a RelayedProof message. Also converts values to other types if specified.
       * @function toObject
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {fusion.TheirProofsList.RelayedProof} message RelayedProof
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      RelayedProof.toObject = function toObject(message, options) {
        if (!options) options = {};
        let object = {};
        if (options.defaults) {
          if (options.bytes === String) object.encryptedProof = "";
          else {
            object.encryptedProof = [];
            if (options.bytes !== Array)
              object.encryptedProof = $util.newBuffer(object.encryptedProof);
          }
          object.srcCommitmentIdx = 0;
          object.dstKeyIdx = 0;
        }
        if (
          message.encryptedProof != null &&
          message.hasOwnProperty("encryptedProof")
        )
          object.encryptedProof =
            options.bytes === String
              ? $util.base64.encode(
                  message.encryptedProof,
                  0,
                  message.encryptedProof.length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.encryptedProof)
                : message.encryptedProof;
        if (
          message.srcCommitmentIdx != null &&
          message.hasOwnProperty("srcCommitmentIdx")
        )
          object.srcCommitmentIdx = message.srcCommitmentIdx;
        if (message.dstKeyIdx != null && message.hasOwnProperty("dstKeyIdx"))
          object.dstKeyIdx = message.dstKeyIdx;
        return object;
      };

      /**
       * Converts this RelayedProof to JSON.
       * @function toJSON
       * @memberof fusion.TheirProofsList.RelayedProof
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      RelayedProof.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for RelayedProof
       * @function getTypeUrl
       * @memberof fusion.TheirProofsList.RelayedProof
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      RelayedProof.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/fusion.TheirProofsList.RelayedProof";
      };

      return RelayedProof;
    })();

    return TheirProofsList;
  })();

  fusion.Blames = (function () {
    /**
     * Properties of a Blames.
     * @memberof fusion
     * @interface IBlames
     * @property {Array.<fusion.Blames.IBlameProof>|null} [blames] Blames blames
     */

    /**
     * Constructs a new Blames.
     * @memberof fusion
     * @classdesc Represents a Blames.
     * @implements IBlames
     * @constructor
     * @param {fusion.IBlames=} [properties] Properties to set
     */
    function Blames(properties) {
      this.blames = [];
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Blames blames.
     * @member {Array.<fusion.Blames.IBlameProof>} blames
     * @memberof fusion.Blames
     * @instance
     */
    Blames.prototype.blames = $util.emptyArray;

    /**
     * Creates a new Blames instance using the specified properties.
     * @function create
     * @memberof fusion.Blames
     * @static
     * @param {fusion.IBlames=} [properties] Properties to set
     * @returns {fusion.Blames} Blames instance
     */
    Blames.create = function create(properties) {
      return new Blames(properties);
    };

    /**
     * Encodes the specified Blames message. Does not implicitly {@link fusion.Blames.verify|verify} messages.
     * @function encode
     * @memberof fusion.Blames
     * @static
     * @param {fusion.IBlames} message Blames message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Blames.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.blames != null && message.blames.length)
        for (let i = 0; i < message.blames.length; ++i)
          $root.fusion.Blames.BlameProof.encode(
            message.blames[i],
            writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
          ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified Blames message, length delimited. Does not implicitly {@link fusion.Blames.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.Blames
     * @static
     * @param {fusion.IBlames} message Blames message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Blames.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Blames message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.Blames
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.Blames} Blames
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Blames.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.Blames();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            if (!(message.blames && message.blames.length)) message.blames = [];
            message.blames.push(
              $root.fusion.Blames.BlameProof.decode(reader, reader.uint32())
            );
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a Blames message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.Blames
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.Blames} Blames
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Blames.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Blames message.
     * @function verify
     * @memberof fusion.Blames
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Blames.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.blames != null && message.hasOwnProperty("blames")) {
        if (!Array.isArray(message.blames)) return "blames: array expected";
        for (let i = 0; i < message.blames.length; ++i) {
          let error = $root.fusion.Blames.BlameProof.verify(message.blames[i]);
          if (error) return "blames." + error;
        }
      }
      return null;
    };

    /**
     * Creates a Blames message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.Blames
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.Blames} Blames
     */
    Blames.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.Blames) return object;
      let message = new $root.fusion.Blames();
      if (object.blames) {
        if (!Array.isArray(object.blames))
          throw TypeError(".fusion.Blames.blames: array expected");
        message.blames = [];
        for (let i = 0; i < object.blames.length; ++i) {
          if (typeof object.blames[i] !== "object")
            throw TypeError(".fusion.Blames.blames: object expected");
          message.blames[i] = $root.fusion.Blames.BlameProof.fromObject(
            object.blames[i]
          );
        }
      }
      return message;
    };

    /**
     * Creates a plain object from a Blames message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.Blames
     * @static
     * @param {fusion.Blames} message Blames
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Blames.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.arrays || options.defaults) object.blames = [];
      if (message.blames && message.blames.length) {
        object.blames = [];
        for (let j = 0; j < message.blames.length; ++j)
          object.blames[j] = $root.fusion.Blames.BlameProof.toObject(
            message.blames[j],
            options
          );
      }
      return object;
    };

    /**
     * Converts this Blames to JSON.
     * @function toJSON
     * @memberof fusion.Blames
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Blames.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Blames
     * @function getTypeUrl
     * @memberof fusion.Blames
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Blames.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.Blames";
    };

    Blames.BlameProof = (function () {
      /**
       * Properties of a BlameProof.
       * @memberof fusion.Blames
       * @interface IBlameProof
       * @property {number} whichProof BlameProof whichProof
       * @property {Uint8Array|null} [sessionKey] BlameProof sessionKey
       * @property {Uint8Array|null} [privkey] BlameProof privkey
       * @property {boolean|null} [needLookupBlockchain] BlameProof needLookupBlockchain
       * @property {string|null} [blameReason] BlameProof blameReason
       */

      /**
       * Constructs a new BlameProof.
       * @memberof fusion.Blames
       * @classdesc Represents a BlameProof.
       * @implements IBlameProof
       * @constructor
       * @param {fusion.Blames.IBlameProof=} [properties] Properties to set
       */
      function BlameProof(properties) {
        if (properties)
          for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
            if (properties[keys[i]] != null)
              this[keys[i]] = properties[keys[i]];
      }

      /**
       * BlameProof whichProof.
       * @member {number} whichProof
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      BlameProof.prototype.whichProof = 0;

      /**
       * BlameProof sessionKey.
       * @member {Uint8Array|null|undefined} sessionKey
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      BlameProof.prototype.sessionKey = null;

      /**
       * BlameProof privkey.
       * @member {Uint8Array|null|undefined} privkey
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      BlameProof.prototype.privkey = null;

      /**
       * BlameProof needLookupBlockchain.
       * @member {boolean} needLookupBlockchain
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      BlameProof.prototype.needLookupBlockchain = false;

      /**
       * BlameProof blameReason.
       * @member {string} blameReason
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      BlameProof.prototype.blameReason = "";

      // OneOf field names bound to virtual getters and setters
      let $oneOfFields;

      /**
       * BlameProof decrypter.
       * @member {"sessionKey"|"privkey"|undefined} decrypter
       * @memberof fusion.Blames.BlameProof
       * @instance
       */
      Object.defineProperty(BlameProof.prototype, "decrypter", {
        get: $util.oneOfGetter(($oneOfFields = ["sessionKey", "privkey"])),
        set: $util.oneOfSetter($oneOfFields),
      });

      /**
       * Creates a new BlameProof instance using the specified properties.
       * @function create
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {fusion.Blames.IBlameProof=} [properties] Properties to set
       * @returns {fusion.Blames.BlameProof} BlameProof instance
       */
      BlameProof.create = function create(properties) {
        return new BlameProof(properties);
      };

      /**
       * Encodes the specified BlameProof message. Does not implicitly {@link fusion.Blames.BlameProof.verify|verify} messages.
       * @function encode
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {fusion.Blames.IBlameProof} message BlameProof message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      BlameProof.encode = function encode(message, writer) {
        if (!writer) writer = $Writer.create();
        writer.uint32(/* id 1, wireType 0 =*/ 8).uint32(message.whichProof);
        if (
          message.sessionKey != null &&
          Object.hasOwnProperty.call(message, "sessionKey")
        )
          writer.uint32(/* id 2, wireType 2 =*/ 18).bytes(message.sessionKey);
        if (
          message.privkey != null &&
          Object.hasOwnProperty.call(message, "privkey")
        )
          writer.uint32(/* id 3, wireType 2 =*/ 26).bytes(message.privkey);
        if (
          message.needLookupBlockchain != null &&
          Object.hasOwnProperty.call(message, "needLookupBlockchain")
        )
          writer
            .uint32(/* id 4, wireType 0 =*/ 32)
            .bool(message.needLookupBlockchain);
        if (
          message.blameReason != null &&
          Object.hasOwnProperty.call(message, "blameReason")
        )
          writer.uint32(/* id 5, wireType 2 =*/ 42).string(message.blameReason);
        return writer;
      };

      /**
       * Encodes the specified BlameProof message, length delimited. Does not implicitly {@link fusion.Blames.BlameProof.verify|verify} messages.
       * @function encodeDelimited
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {fusion.Blames.IBlameProof} message BlameProof message or plain object to encode
       * @param {$protobuf.Writer} [writer] Writer to encode to
       * @returns {$protobuf.Writer} Writer
       */
      BlameProof.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
      };

      /**
       * Decodes a BlameProof message from the specified reader or buffer.
       * @function decode
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @param {number} [length] Message length if known beforehand
       * @returns {fusion.Blames.BlameProof} BlameProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      BlameProof.decode = function decode(reader, length, error) {
        if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length,
          message = new $root.fusion.Blames.BlameProof();
        while (reader.pos < end) {
          let tag = reader.uint32();
          if (tag === error) break;
          switch (tag >>> 3) {
            case 1: {
              message.whichProof = reader.uint32();
              break;
            }
            case 2: {
              message.sessionKey = reader.bytes();
              break;
            }
            case 3: {
              message.privkey = reader.bytes();
              break;
            }
            case 4: {
              message.needLookupBlockchain = reader.bool();
              break;
            }
            case 5: {
              message.blameReason = reader.string();
              break;
            }
            default:
              reader.skipType(tag & 7);
              break;
          }
        }
        if (!message.hasOwnProperty("whichProof"))
          throw $util.ProtocolError("missing required 'whichProof'", {
            instance: message,
          });
        return message;
      };

      /**
       * Decodes a BlameProof message from the specified reader or buffer, length delimited.
       * @function decodeDelimited
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
       * @returns {fusion.Blames.BlameProof} BlameProof
       * @throws {Error} If the payload is not a reader or valid buffer
       * @throws {$protobuf.util.ProtocolError} If required fields are missing
       */
      BlameProof.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader)) reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
      };

      /**
       * Verifies a BlameProof message.
       * @function verify
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {Object.<string,*>} message Plain object to verify
       * @returns {string|null} `null` if valid, otherwise the reason why it is not
       */
      BlameProof.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
          return "object expected";
        let properties = {};
        if (!$util.isInteger(message.whichProof))
          return "whichProof: integer expected";
        if (
          message.sessionKey != null &&
          message.hasOwnProperty("sessionKey")
        ) {
          properties.decrypter = 1;
          if (
            !(
              (message.sessionKey &&
                typeof message.sessionKey.length === "number") ||
              $util.isString(message.sessionKey)
            )
          )
            return "sessionKey: buffer expected";
        }
        if (message.privkey != null && message.hasOwnProperty("privkey")) {
          if (properties.decrypter === 1) return "decrypter: multiple values";
          properties.decrypter = 1;
          if (
            !(
              (message.privkey && typeof message.privkey.length === "number") ||
              $util.isString(message.privkey)
            )
          )
            return "privkey: buffer expected";
        }
        if (
          message.needLookupBlockchain != null &&
          message.hasOwnProperty("needLookupBlockchain")
        )
          if (typeof message.needLookupBlockchain !== "boolean")
            return "needLookupBlockchain: boolean expected";
        if (
          message.blameReason != null &&
          message.hasOwnProperty("blameReason")
        )
          if (!$util.isString(message.blameReason))
            return "blameReason: string expected";
        return null;
      };

      /**
       * Creates a BlameProof message from a plain object. Also converts values to their respective internal types.
       * @function fromObject
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {Object.<string,*>} object Plain object
       * @returns {fusion.Blames.BlameProof} BlameProof
       */
      BlameProof.fromObject = function fromObject(object) {
        if (object instanceof $root.fusion.Blames.BlameProof) return object;
        let message = new $root.fusion.Blames.BlameProof();
        if (object.whichProof != null)
          message.whichProof = object.whichProof >>> 0;
        if (object.sessionKey != null)
          if (typeof object.sessionKey === "string")
            $util.base64.decode(
              object.sessionKey,
              (message.sessionKey = $util.newBuffer(
                $util.base64.length(object.sessionKey)
              )),
              0
            );
          else if (object.sessionKey.length >= 0)
            message.sessionKey = object.sessionKey;
        if (object.privkey != null)
          if (typeof object.privkey === "string")
            $util.base64.decode(
              object.privkey,
              (message.privkey = $util.newBuffer(
                $util.base64.length(object.privkey)
              )),
              0
            );
          else if (object.privkey.length >= 0) message.privkey = object.privkey;
        if (object.needLookupBlockchain != null)
          message.needLookupBlockchain = Boolean(object.needLookupBlockchain);
        if (object.blameReason != null)
          message.blameReason = String(object.blameReason);
        return message;
      };

      /**
       * Creates a plain object from a BlameProof message. Also converts values to other types if specified.
       * @function toObject
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {fusion.Blames.BlameProof} message BlameProof
       * @param {$protobuf.IConversionOptions} [options] Conversion options
       * @returns {Object.<string,*>} Plain object
       */
      BlameProof.toObject = function toObject(message, options) {
        if (!options) options = {};
        let object = {};
        if (options.defaults) {
          object.whichProof = 0;
          object.needLookupBlockchain = false;
          object.blameReason = "";
        }
        if (message.whichProof != null && message.hasOwnProperty("whichProof"))
          object.whichProof = message.whichProof;
        if (
          message.sessionKey != null &&
          message.hasOwnProperty("sessionKey")
        ) {
          object.sessionKey =
            options.bytes === String
              ? $util.base64.encode(
                  message.sessionKey,
                  0,
                  message.sessionKey.length
                )
              : options.bytes === Array
                ? Array.prototype.slice.call(message.sessionKey)
                : message.sessionKey;
          if (options.oneofs) object.decrypter = "sessionKey";
        }
        if (message.privkey != null && message.hasOwnProperty("privkey")) {
          object.privkey =
            options.bytes === String
              ? $util.base64.encode(message.privkey, 0, message.privkey.length)
              : options.bytes === Array
                ? Array.prototype.slice.call(message.privkey)
                : message.privkey;
          if (options.oneofs) object.decrypter = "privkey";
        }
        if (
          message.needLookupBlockchain != null &&
          message.hasOwnProperty("needLookupBlockchain")
        )
          object.needLookupBlockchain = message.needLookupBlockchain;
        if (
          message.blameReason != null &&
          message.hasOwnProperty("blameReason")
        )
          object.blameReason = message.blameReason;
        return object;
      };

      /**
       * Converts this BlameProof to JSON.
       * @function toJSON
       * @memberof fusion.Blames.BlameProof
       * @instance
       * @returns {Object.<string,*>} JSON object
       */
      BlameProof.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
      };

      /**
       * Gets the default type url for BlameProof
       * @function getTypeUrl
       * @memberof fusion.Blames.BlameProof
       * @static
       * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
       * @returns {string} The default type url
       */
      BlameProof.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
          typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/fusion.Blames.BlameProof";
      };

      return BlameProof;
    })();

    return Blames;
  })();

  fusion.RestartRound = (function () {
    /**
     * Properties of a RestartRound.
     * @memberof fusion
     * @interface IRestartRound
     */

    /**
     * Constructs a new RestartRound.
     * @memberof fusion
     * @classdesc Represents a RestartRound.
     * @implements IRestartRound
     * @constructor
     * @param {fusion.IRestartRound=} [properties] Properties to set
     */
    function RestartRound(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new RestartRound instance using the specified properties.
     * @function create
     * @memberof fusion.RestartRound
     * @static
     * @param {fusion.IRestartRound=} [properties] Properties to set
     * @returns {fusion.RestartRound} RestartRound instance
     */
    RestartRound.create = function create(properties) {
      return new RestartRound(properties);
    };

    /**
     * Encodes the specified RestartRound message. Does not implicitly {@link fusion.RestartRound.verify|verify} messages.
     * @function encode
     * @memberof fusion.RestartRound
     * @static
     * @param {fusion.IRestartRound} message RestartRound message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RestartRound.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      return writer;
    };

    /**
     * Encodes the specified RestartRound message, length delimited. Does not implicitly {@link fusion.RestartRound.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.RestartRound
     * @static
     * @param {fusion.IRestartRound} message RestartRound message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    RestartRound.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a RestartRound message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.RestartRound
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.RestartRound} RestartRound
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RestartRound.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.RestartRound();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a RestartRound message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.RestartRound
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.RestartRound} RestartRound
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    RestartRound.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a RestartRound message.
     * @function verify
     * @memberof fusion.RestartRound
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    RestartRound.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      return null;
    };

    /**
     * Creates a RestartRound message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.RestartRound
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.RestartRound} RestartRound
     */
    RestartRound.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.RestartRound) return object;
      return new $root.fusion.RestartRound();
    };

    /**
     * Creates a plain object from a RestartRound message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.RestartRound
     * @static
     * @param {fusion.RestartRound} message RestartRound
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    RestartRound.toObject = function toObject() {
      return {};
    };

    /**
     * Converts this RestartRound to JSON.
     * @function toJSON
     * @memberof fusion.RestartRound
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    RestartRound.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for RestartRound
     * @function getTypeUrl
     * @memberof fusion.RestartRound
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    RestartRound.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.RestartRound";
    };

    return RestartRound;
  })();

  fusion.Error = (function () {
    /**
     * Properties of an Error.
     * @memberof fusion
     * @interface IError
     * @property {string|null} [message] Error message
     */

    /**
     * Constructs a new Error.
     * @memberof fusion
     * @classdesc Represents an Error.
     * @implements IError
     * @constructor
     * @param {fusion.IError=} [properties] Properties to set
     */
    function Error(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Error message.
     * @member {string} message
     * @memberof fusion.Error
     * @instance
     */
    Error.prototype.message = "";

    /**
     * Creates a new Error instance using the specified properties.
     * @function create
     * @memberof fusion.Error
     * @static
     * @param {fusion.IError=} [properties] Properties to set
     * @returns {fusion.Error} Error instance
     */
    Error.create = function create(properties) {
      return new Error(properties);
    };

    /**
     * Encodes the specified Error message. Does not implicitly {@link fusion.Error.verify|verify} messages.
     * @function encode
     * @memberof fusion.Error
     * @static
     * @param {fusion.IError} message Error message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Error.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.message != null &&
        Object.hasOwnProperty.call(message, "message")
      )
        writer.uint32(/* id 1, wireType 2 =*/ 10).string(message.message);
      return writer;
    };

    /**
     * Encodes the specified Error message, length delimited. Does not implicitly {@link fusion.Error.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.Error
     * @static
     * @param {fusion.IError} message Error message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Error.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an Error message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.Error
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.Error} Error
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Error.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.Error();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.message = reader.string();
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes an Error message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.Error
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.Error} Error
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Error.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an Error message.
     * @function verify
     * @memberof fusion.Error
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Error.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      if (message.message != null && message.hasOwnProperty("message"))
        if (!$util.isString(message.message)) return "message: string expected";
      return null;
    };

    /**
     * Creates an Error message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.Error
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.Error} Error
     */
    Error.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.Error) return object;
      let message = new $root.fusion.Error();
      if (object.message != null) message.message = String(object.message);
      return message;
    };

    /**
     * Creates a plain object from an Error message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.Error
     * @static
     * @param {fusion.Error} message Error
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Error.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (options.defaults) object.message = "";
      if (message.message != null && message.hasOwnProperty("message"))
        object.message = message.message;
      return object;
    };

    /**
     * Converts this Error to JSON.
     * @function toJSON
     * @memberof fusion.Error
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Error.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Error
     * @function getTypeUrl
     * @memberof fusion.Error
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Error.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.Error";
    };

    return Error;
  })();

  fusion.Ping = (function () {
    /**
     * Properties of a Ping.
     * @memberof fusion
     * @interface IPing
     */

    /**
     * Constructs a new Ping.
     * @memberof fusion
     * @classdesc Represents a Ping.
     * @implements IPing
     * @constructor
     * @param {fusion.IPing=} [properties] Properties to set
     */
    function Ping(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new Ping instance using the specified properties.
     * @function create
     * @memberof fusion.Ping
     * @static
     * @param {fusion.IPing=} [properties] Properties to set
     * @returns {fusion.Ping} Ping instance
     */
    Ping.create = function create(properties) {
      return new Ping(properties);
    };

    /**
     * Encodes the specified Ping message. Does not implicitly {@link fusion.Ping.verify|verify} messages.
     * @function encode
     * @memberof fusion.Ping
     * @static
     * @param {fusion.IPing} message Ping message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Ping.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      return writer;
    };

    /**
     * Encodes the specified Ping message, length delimited. Does not implicitly {@link fusion.Ping.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.Ping
     * @static
     * @param {fusion.IPing} message Ping message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Ping.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Ping message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.Ping
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.Ping} Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Ping.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.Ping();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a Ping message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.Ping
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.Ping} Ping
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Ping.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Ping message.
     * @function verify
     * @memberof fusion.Ping
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Ping.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      return null;
    };

    /**
     * Creates a Ping message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.Ping
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.Ping} Ping
     */
    Ping.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.Ping) return object;
      return new $root.fusion.Ping();
    };

    /**
     * Creates a plain object from a Ping message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.Ping
     * @static
     * @param {fusion.Ping} message Ping
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Ping.toObject = function toObject() {
      return {};
    };

    /**
     * Converts this Ping to JSON.
     * @function toJSON
     * @memberof fusion.Ping
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Ping.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Ping
     * @function getTypeUrl
     * @memberof fusion.Ping
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Ping.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.Ping";
    };

    return Ping;
  })();

  fusion.OK = (function () {
    /**
     * Properties of a OK.
     * @memberof fusion
     * @interface IOK
     */

    /**
     * Constructs a new OK.
     * @memberof fusion
     * @classdesc Represents a OK.
     * @implements IOK
     * @constructor
     * @param {fusion.IOK=} [properties] Properties to set
     */
    function OK(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new OK instance using the specified properties.
     * @function create
     * @memberof fusion.OK
     * @static
     * @param {fusion.IOK=} [properties] Properties to set
     * @returns {fusion.OK} OK instance
     */
    OK.create = function create(properties) {
      return new OK(properties);
    };

    /**
     * Encodes the specified OK message. Does not implicitly {@link fusion.OK.verify|verify} messages.
     * @function encode
     * @memberof fusion.OK
     * @static
     * @param {fusion.IOK} message OK message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OK.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      return writer;
    };

    /**
     * Encodes the specified OK message, length delimited. Does not implicitly {@link fusion.OK.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.OK
     * @static
     * @param {fusion.IOK} message OK message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    OK.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a OK message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.OK
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.OK} OK
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OK.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.OK();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a OK message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.OK
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.OK} OK
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    OK.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a OK message.
     * @function verify
     * @memberof fusion.OK
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    OK.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      return null;
    };

    /**
     * Creates a OK message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.OK
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.OK} OK
     */
    OK.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.OK) return object;
      return new $root.fusion.OK();
    };

    /**
     * Creates a plain object from a OK message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.OK
     * @static
     * @param {fusion.OK} message OK
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    OK.toObject = function toObject() {
      return {};
    };

    /**
     * Converts this OK to JSON.
     * @function toJSON
     * @memberof fusion.OK
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    OK.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for OK
     * @function getTypeUrl
     * @memberof fusion.OK
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    OK.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.OK";
    };

    return OK;
  })();

  fusion.ClientMessage = (function () {
    /**
     * Properties of a ClientMessage.
     * @memberof fusion
     * @interface IClientMessage
     * @property {fusion.IClientHello|null} [clienthello] ClientMessage clienthello
     * @property {fusion.IJoinPools|null} [joinpools] ClientMessage joinpools
     * @property {fusion.IPlayerCommit|null} [playercommit] ClientMessage playercommit
     * @property {fusion.IMyProofsList|null} [myproofslist] ClientMessage myproofslist
     * @property {fusion.IBlames|null} [blames] ClientMessage blames
     */

    /**
     * Constructs a new ClientMessage.
     * @memberof fusion
     * @classdesc Represents a ClientMessage.
     * @implements IClientMessage
     * @constructor
     * @param {fusion.IClientMessage=} [properties] Properties to set
     */
    function ClientMessage(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * ClientMessage clienthello.
     * @member {fusion.IClientHello|null|undefined} clienthello
     * @memberof fusion.ClientMessage
     * @instance
     */
    ClientMessage.prototype.clienthello = null;

    /**
     * ClientMessage joinpools.
     * @member {fusion.IJoinPools|null|undefined} joinpools
     * @memberof fusion.ClientMessage
     * @instance
     */
    ClientMessage.prototype.joinpools = null;

    /**
     * ClientMessage playercommit.
     * @member {fusion.IPlayerCommit|null|undefined} playercommit
     * @memberof fusion.ClientMessage
     * @instance
     */
    ClientMessage.prototype.playercommit = null;

    /**
     * ClientMessage myproofslist.
     * @member {fusion.IMyProofsList|null|undefined} myproofslist
     * @memberof fusion.ClientMessage
     * @instance
     */
    ClientMessage.prototype.myproofslist = null;

    /**
     * ClientMessage blames.
     * @member {fusion.IBlames|null|undefined} blames
     * @memberof fusion.ClientMessage
     * @instance
     */
    ClientMessage.prototype.blames = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * ClientMessage msg.
     * @member {"clienthello"|"joinpools"|"playercommit"|"myproofslist"|"blames"|undefined} msg
     * @memberof fusion.ClientMessage
     * @instance
     */
    Object.defineProperty(ClientMessage.prototype, "msg", {
      get: $util.oneOfGetter(
        ($oneOfFields = [
          "clienthello",
          "joinpools",
          "playercommit",
          "myproofslist",
          "blames",
        ])
      ),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new ClientMessage instance using the specified properties.
     * @function create
     * @memberof fusion.ClientMessage
     * @static
     * @param {fusion.IClientMessage=} [properties] Properties to set
     * @returns {fusion.ClientMessage} ClientMessage instance
     */
    ClientMessage.create = function create(properties) {
      return new ClientMessage(properties);
    };

    /**
     * Encodes the specified ClientMessage message. Does not implicitly {@link fusion.ClientMessage.verify|verify} messages.
     * @function encode
     * @memberof fusion.ClientMessage
     * @static
     * @param {fusion.IClientMessage} message ClientMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientMessage.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.clienthello != null &&
        Object.hasOwnProperty.call(message, "clienthello")
      )
        $root.fusion.ClientHello.encode(
          message.clienthello,
          writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
        ).ldelim();
      if (
        message.joinpools != null &&
        Object.hasOwnProperty.call(message, "joinpools")
      )
        $root.fusion.JoinPools.encode(
          message.joinpools,
          writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
        ).ldelim();
      if (
        message.playercommit != null &&
        Object.hasOwnProperty.call(message, "playercommit")
      )
        $root.fusion.PlayerCommit.encode(
          message.playercommit,
          writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
        ).ldelim();
      if (
        message.myproofslist != null &&
        Object.hasOwnProperty.call(message, "myproofslist")
      )
        $root.fusion.MyProofsList.encode(
          message.myproofslist,
          writer.uint32(/* id 5, wireType 2 =*/ 42).fork()
        ).ldelim();
      if (
        message.blames != null &&
        Object.hasOwnProperty.call(message, "blames")
      )
        $root.fusion.Blames.encode(
          message.blames,
          writer.uint32(/* id 6, wireType 2 =*/ 50).fork()
        ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified ClientMessage message, length delimited. Does not implicitly {@link fusion.ClientMessage.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.ClientMessage
     * @static
     * @param {fusion.IClientMessage} message ClientMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ClientMessage.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ClientMessage message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.ClientMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.ClientMessage} ClientMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientMessage.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.ClientMessage();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.clienthello = $root.fusion.ClientHello.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 2: {
            message.joinpools = $root.fusion.JoinPools.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 3: {
            message.playercommit = $root.fusion.PlayerCommit.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 5: {
            message.myproofslist = $root.fusion.MyProofsList.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 6: {
            message.blames = $root.fusion.Blames.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a ClientMessage message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.ClientMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.ClientMessage} ClientMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ClientMessage.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ClientMessage message.
     * @function verify
     * @memberof fusion.ClientMessage
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ClientMessage.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      let properties = {};
      if (
        message.clienthello != null &&
        message.hasOwnProperty("clienthello")
      ) {
        properties.msg = 1;
        {
          let error = $root.fusion.ClientHello.verify(message.clienthello);
          if (error) return "clienthello." + error;
        }
      }
      if (message.joinpools != null && message.hasOwnProperty("joinpools")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.JoinPools.verify(message.joinpools);
          if (error) return "joinpools." + error;
        }
      }
      if (
        message.playercommit != null &&
        message.hasOwnProperty("playercommit")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.PlayerCommit.verify(message.playercommit);
          if (error) return "playercommit." + error;
        }
      }
      if (
        message.myproofslist != null &&
        message.hasOwnProperty("myproofslist")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.MyProofsList.verify(message.myproofslist);
          if (error) return "myproofslist." + error;
        }
      }
      if (message.blames != null && message.hasOwnProperty("blames")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.Blames.verify(message.blames);
          if (error) return "blames." + error;
        }
      }
      return null;
    };

    /**
     * Creates a ClientMessage message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.ClientMessage
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.ClientMessage} ClientMessage
     */
    ClientMessage.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.ClientMessage) return object;
      let message = new $root.fusion.ClientMessage();
      if (object.clienthello != null) {
        if (typeof object.clienthello !== "object")
          throw TypeError(".fusion.ClientMessage.clienthello: object expected");
        message.clienthello = $root.fusion.ClientHello.fromObject(
          object.clienthello
        );
      }
      if (object.joinpools != null) {
        if (typeof object.joinpools !== "object")
          throw TypeError(".fusion.ClientMessage.joinpools: object expected");
        message.joinpools = $root.fusion.JoinPools.fromObject(object.joinpools);
      }
      if (object.playercommit != null) {
        if (typeof object.playercommit !== "object")
          throw TypeError(
            ".fusion.ClientMessage.playercommit: object expected"
          );
        message.playercommit = $root.fusion.PlayerCommit.fromObject(
          object.playercommit
        );
      }
      if (object.myproofslist != null) {
        if (typeof object.myproofslist !== "object")
          throw TypeError(
            ".fusion.ClientMessage.myproofslist: object expected"
          );
        message.myproofslist = $root.fusion.MyProofsList.fromObject(
          object.myproofslist
        );
      }
      if (object.blames != null) {
        if (typeof object.blames !== "object")
          throw TypeError(".fusion.ClientMessage.blames: object expected");
        message.blames = $root.fusion.Blames.fromObject(object.blames);
      }
      return message;
    };

    /**
     * Creates a plain object from a ClientMessage message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.ClientMessage
     * @static
     * @param {fusion.ClientMessage} message ClientMessage
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ClientMessage.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (
        message.clienthello != null &&
        message.hasOwnProperty("clienthello")
      ) {
        object.clienthello = $root.fusion.ClientHello.toObject(
          message.clienthello,
          options
        );
        if (options.oneofs) object.msg = "clienthello";
      }
      if (message.joinpools != null && message.hasOwnProperty("joinpools")) {
        object.joinpools = $root.fusion.JoinPools.toObject(
          message.joinpools,
          options
        );
        if (options.oneofs) object.msg = "joinpools";
      }
      if (
        message.playercommit != null &&
        message.hasOwnProperty("playercommit")
      ) {
        object.playercommit = $root.fusion.PlayerCommit.toObject(
          message.playercommit,
          options
        );
        if (options.oneofs) object.msg = "playercommit";
      }
      if (
        message.myproofslist != null &&
        message.hasOwnProperty("myproofslist")
      ) {
        object.myproofslist = $root.fusion.MyProofsList.toObject(
          message.myproofslist,
          options
        );
        if (options.oneofs) object.msg = "myproofslist";
      }
      if (message.blames != null && message.hasOwnProperty("blames")) {
        object.blames = $root.fusion.Blames.toObject(message.blames, options);
        if (options.oneofs) object.msg = "blames";
      }
      return object;
    };

    /**
     * Converts this ClientMessage to JSON.
     * @function toJSON
     * @memberof fusion.ClientMessage
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ClientMessage.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ClientMessage
     * @function getTypeUrl
     * @memberof fusion.ClientMessage
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ClientMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.ClientMessage";
    };

    return ClientMessage;
  })();

  fusion.ServerMessage = (function () {
    /**
     * Properties of a ServerMessage.
     * @memberof fusion
     * @interface IServerMessage
     * @property {fusion.IServerHello|null} [serverhello] ServerMessage serverhello
     * @property {fusion.ITierStatusUpdate|null} [tierstatusupdate] ServerMessage tierstatusupdate
     * @property {fusion.IFusionBegin|null} [fusionbegin] ServerMessage fusionbegin
     * @property {fusion.IStartRound|null} [startround] ServerMessage startround
     * @property {fusion.IBlindSigResponses|null} [blindsigresponses] ServerMessage blindsigresponses
     * @property {fusion.IAllCommitments|null} [allcommitments] ServerMessage allcommitments
     * @property {fusion.IShareCovertComponents|null} [sharecovertcomponents] ServerMessage sharecovertcomponents
     * @property {fusion.IFusionResult|null} [fusionresult] ServerMessage fusionresult
     * @property {fusion.ITheirProofsList|null} [theirproofslist] ServerMessage theirproofslist
     * @property {fusion.IRestartRound|null} [restartround] ServerMessage restartround
     * @property {fusion.IError|null} [error] ServerMessage error
     */

    /**
     * Constructs a new ServerMessage.
     * @memberof fusion
     * @classdesc Represents a ServerMessage.
     * @implements IServerMessage
     * @constructor
     * @param {fusion.IServerMessage=} [properties] Properties to set
     */
    function ServerMessage(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * ServerMessage serverhello.
     * @member {fusion.IServerHello|null|undefined} serverhello
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.serverhello = null;

    /**
     * ServerMessage tierstatusupdate.
     * @member {fusion.ITierStatusUpdate|null|undefined} tierstatusupdate
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.tierstatusupdate = null;

    /**
     * ServerMessage fusionbegin.
     * @member {fusion.IFusionBegin|null|undefined} fusionbegin
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.fusionbegin = null;

    /**
     * ServerMessage startround.
     * @member {fusion.IStartRound|null|undefined} startround
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.startround = null;

    /**
     * ServerMessage blindsigresponses.
     * @member {fusion.IBlindSigResponses|null|undefined} blindsigresponses
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.blindsigresponses = null;

    /**
     * ServerMessage allcommitments.
     * @member {fusion.IAllCommitments|null|undefined} allcommitments
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.allcommitments = null;

    /**
     * ServerMessage sharecovertcomponents.
     * @member {fusion.IShareCovertComponents|null|undefined} sharecovertcomponents
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.sharecovertcomponents = null;

    /**
     * ServerMessage fusionresult.
     * @member {fusion.IFusionResult|null|undefined} fusionresult
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.fusionresult = null;

    /**
     * ServerMessage theirproofslist.
     * @member {fusion.ITheirProofsList|null|undefined} theirproofslist
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.theirproofslist = null;

    /**
     * ServerMessage restartround.
     * @member {fusion.IRestartRound|null|undefined} restartround
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.restartround = null;

    /**
     * ServerMessage error.
     * @member {fusion.IError|null|undefined} error
     * @memberof fusion.ServerMessage
     * @instance
     */
    ServerMessage.prototype.error = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * ServerMessage msg.
     * @member {"serverhello"|"tierstatusupdate"|"fusionbegin"|"startround"|"blindsigresponses"|"allcommitments"|"sharecovertcomponents"|"fusionresult"|"theirproofslist"|"restartround"|"error"|undefined} msg
     * @memberof fusion.ServerMessage
     * @instance
     */
    Object.defineProperty(ServerMessage.prototype, "msg", {
      get: $util.oneOfGetter(
        ($oneOfFields = [
          "serverhello",
          "tierstatusupdate",
          "fusionbegin",
          "startround",
          "blindsigresponses",
          "allcommitments",
          "sharecovertcomponents",
          "fusionresult",
          "theirproofslist",
          "restartround",
          "error",
        ])
      ),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new ServerMessage instance using the specified properties.
     * @function create
     * @memberof fusion.ServerMessage
     * @static
     * @param {fusion.IServerMessage=} [properties] Properties to set
     * @returns {fusion.ServerMessage} ServerMessage instance
     */
    ServerMessage.create = function create(properties) {
      return new ServerMessage(properties);
    };

    /**
     * Encodes the specified ServerMessage message. Does not implicitly {@link fusion.ServerMessage.verify|verify} messages.
     * @function encode
     * @memberof fusion.ServerMessage
     * @static
     * @param {fusion.IServerMessage} message ServerMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ServerMessage.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.serverhello != null &&
        Object.hasOwnProperty.call(message, "serverhello")
      )
        $root.fusion.ServerHello.encode(
          message.serverhello,
          writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
        ).ldelim();
      if (
        message.tierstatusupdate != null &&
        Object.hasOwnProperty.call(message, "tierstatusupdate")
      )
        $root.fusion.TierStatusUpdate.encode(
          message.tierstatusupdate,
          writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
        ).ldelim();
      if (
        message.fusionbegin != null &&
        Object.hasOwnProperty.call(message, "fusionbegin")
      )
        $root.fusion.FusionBegin.encode(
          message.fusionbegin,
          writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
        ).ldelim();
      if (
        message.startround != null &&
        Object.hasOwnProperty.call(message, "startround")
      )
        $root.fusion.StartRound.encode(
          message.startround,
          writer.uint32(/* id 4, wireType 2 =*/ 34).fork()
        ).ldelim();
      if (
        message.blindsigresponses != null &&
        Object.hasOwnProperty.call(message, "blindsigresponses")
      )
        $root.fusion.BlindSigResponses.encode(
          message.blindsigresponses,
          writer.uint32(/* id 5, wireType 2 =*/ 42).fork()
        ).ldelim();
      if (
        message.allcommitments != null &&
        Object.hasOwnProperty.call(message, "allcommitments")
      )
        $root.fusion.AllCommitments.encode(
          message.allcommitments,
          writer.uint32(/* id 6, wireType 2 =*/ 50).fork()
        ).ldelim();
      if (
        message.sharecovertcomponents != null &&
        Object.hasOwnProperty.call(message, "sharecovertcomponents")
      )
        $root.fusion.ShareCovertComponents.encode(
          message.sharecovertcomponents,
          writer.uint32(/* id 7, wireType 2 =*/ 58).fork()
        ).ldelim();
      if (
        message.fusionresult != null &&
        Object.hasOwnProperty.call(message, "fusionresult")
      )
        $root.fusion.FusionResult.encode(
          message.fusionresult,
          writer.uint32(/* id 8, wireType 2 =*/ 66).fork()
        ).ldelim();
      if (
        message.theirproofslist != null &&
        Object.hasOwnProperty.call(message, "theirproofslist")
      )
        $root.fusion.TheirProofsList.encode(
          message.theirproofslist,
          writer.uint32(/* id 9, wireType 2 =*/ 74).fork()
        ).ldelim();
      if (
        message.restartround != null &&
        Object.hasOwnProperty.call(message, "restartround")
      )
        $root.fusion.RestartRound.encode(
          message.restartround,
          writer.uint32(/* id 14, wireType 2 =*/ 114).fork()
        ).ldelim();
      if (message.error != null && Object.hasOwnProperty.call(message, "error"))
        $root.fusion.Error.encode(
          message.error,
          writer.uint32(/* id 15, wireType 2 =*/ 122).fork()
        ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified ServerMessage message, length delimited. Does not implicitly {@link fusion.ServerMessage.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.ServerMessage
     * @static
     * @param {fusion.IServerMessage} message ServerMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    ServerMessage.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a ServerMessage message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.ServerMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.ServerMessage} ServerMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ServerMessage.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.ServerMessage();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.serverhello = $root.fusion.ServerHello.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 2: {
            message.tierstatusupdate = $root.fusion.TierStatusUpdate.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 3: {
            message.fusionbegin = $root.fusion.FusionBegin.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 4: {
            message.startround = $root.fusion.StartRound.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 5: {
            message.blindsigresponses = $root.fusion.BlindSigResponses.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 6: {
            message.allcommitments = $root.fusion.AllCommitments.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 7: {
            message.sharecovertcomponents =
              $root.fusion.ShareCovertComponents.decode(
                reader,
                reader.uint32()
              );
            break;
          }
          case 8: {
            message.fusionresult = $root.fusion.FusionResult.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 9: {
            message.theirproofslist = $root.fusion.TheirProofsList.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 14: {
            message.restartround = $root.fusion.RestartRound.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 15: {
            message.error = $root.fusion.Error.decode(reader, reader.uint32());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a ServerMessage message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.ServerMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.ServerMessage} ServerMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    ServerMessage.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a ServerMessage message.
     * @function verify
     * @memberof fusion.ServerMessage
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    ServerMessage.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      let properties = {};
      if (
        message.serverhello != null &&
        message.hasOwnProperty("serverhello")
      ) {
        properties.msg = 1;
        {
          let error = $root.fusion.ServerHello.verify(message.serverhello);
          if (error) return "serverhello." + error;
        }
      }
      if (
        message.tierstatusupdate != null &&
        message.hasOwnProperty("tierstatusupdate")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.TierStatusUpdate.verify(
            message.tierstatusupdate
          );
          if (error) return "tierstatusupdate." + error;
        }
      }
      if (
        message.fusionbegin != null &&
        message.hasOwnProperty("fusionbegin")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.FusionBegin.verify(message.fusionbegin);
          if (error) return "fusionbegin." + error;
        }
      }
      if (message.startround != null && message.hasOwnProperty("startround")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.StartRound.verify(message.startround);
          if (error) return "startround." + error;
        }
      }
      if (
        message.blindsigresponses != null &&
        message.hasOwnProperty("blindsigresponses")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.BlindSigResponses.verify(
            message.blindsigresponses
          );
          if (error) return "blindsigresponses." + error;
        }
      }
      if (
        message.allcommitments != null &&
        message.hasOwnProperty("allcommitments")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.AllCommitments.verify(
            message.allcommitments
          );
          if (error) return "allcommitments." + error;
        }
      }
      if (
        message.sharecovertcomponents != null &&
        message.hasOwnProperty("sharecovertcomponents")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.ShareCovertComponents.verify(
            message.sharecovertcomponents
          );
          if (error) return "sharecovertcomponents." + error;
        }
      }
      if (
        message.fusionresult != null &&
        message.hasOwnProperty("fusionresult")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.FusionResult.verify(message.fusionresult);
          if (error) return "fusionresult." + error;
        }
      }
      if (
        message.theirproofslist != null &&
        message.hasOwnProperty("theirproofslist")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.TheirProofsList.verify(
            message.theirproofslist
          );
          if (error) return "theirproofslist." + error;
        }
      }
      if (
        message.restartround != null &&
        message.hasOwnProperty("restartround")
      ) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.RestartRound.verify(message.restartround);
          if (error) return "restartround." + error;
        }
      }
      if (message.error != null && message.hasOwnProperty("error")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.Error.verify(message.error);
          if (error) return "error." + error;
        }
      }
      return null;
    };

    /**
     * Creates a ServerMessage message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.ServerMessage
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.ServerMessage} ServerMessage
     */
    ServerMessage.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.ServerMessage) return object;
      let message = new $root.fusion.ServerMessage();
      if (object.serverhello != null) {
        if (typeof object.serverhello !== "object")
          throw TypeError(".fusion.ServerMessage.serverhello: object expected");
        message.serverhello = $root.fusion.ServerHello.fromObject(
          object.serverhello
        );
      }
      if (object.tierstatusupdate != null) {
        if (typeof object.tierstatusupdate !== "object")
          throw TypeError(
            ".fusion.ServerMessage.tierstatusupdate: object expected"
          );
        message.tierstatusupdate = $root.fusion.TierStatusUpdate.fromObject(
          object.tierstatusupdate
        );
      }
      if (object.fusionbegin != null) {
        if (typeof object.fusionbegin !== "object")
          throw TypeError(".fusion.ServerMessage.fusionbegin: object expected");
        message.fusionbegin = $root.fusion.FusionBegin.fromObject(
          object.fusionbegin
        );
      }
      if (object.startround != null) {
        if (typeof object.startround !== "object")
          throw TypeError(".fusion.ServerMessage.startround: object expected");
        message.startround = $root.fusion.StartRound.fromObject(
          object.startround
        );
      }
      if (object.blindsigresponses != null) {
        if (typeof object.blindsigresponses !== "object")
          throw TypeError(
            ".fusion.ServerMessage.blindsigresponses: object expected"
          );
        message.blindsigresponses = $root.fusion.BlindSigResponses.fromObject(
          object.blindsigresponses
        );
      }
      if (object.allcommitments != null) {
        if (typeof object.allcommitments !== "object")
          throw TypeError(
            ".fusion.ServerMessage.allcommitments: object expected"
          );
        message.allcommitments = $root.fusion.AllCommitments.fromObject(
          object.allcommitments
        );
      }
      if (object.sharecovertcomponents != null) {
        if (typeof object.sharecovertcomponents !== "object")
          throw TypeError(
            ".fusion.ServerMessage.sharecovertcomponents: object expected"
          );
        message.sharecovertcomponents =
          $root.fusion.ShareCovertComponents.fromObject(
            object.sharecovertcomponents
          );
      }
      if (object.fusionresult != null) {
        if (typeof object.fusionresult !== "object")
          throw TypeError(
            ".fusion.ServerMessage.fusionresult: object expected"
          );
        message.fusionresult = $root.fusion.FusionResult.fromObject(
          object.fusionresult
        );
      }
      if (object.theirproofslist != null) {
        if (typeof object.theirproofslist !== "object")
          throw TypeError(
            ".fusion.ServerMessage.theirproofslist: object expected"
          );
        message.theirproofslist = $root.fusion.TheirProofsList.fromObject(
          object.theirproofslist
        );
      }
      if (object.restartround != null) {
        if (typeof object.restartround !== "object")
          throw TypeError(
            ".fusion.ServerMessage.restartround: object expected"
          );
        message.restartround = $root.fusion.RestartRound.fromObject(
          object.restartround
        );
      }
      if (object.error != null) {
        if (typeof object.error !== "object")
          throw TypeError(".fusion.ServerMessage.error: object expected");
        message.error = $root.fusion.Error.fromObject(object.error);
      }
      return message;
    };

    /**
     * Creates a plain object from a ServerMessage message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.ServerMessage
     * @static
     * @param {fusion.ServerMessage} message ServerMessage
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    ServerMessage.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (
        message.serverhello != null &&
        message.hasOwnProperty("serverhello")
      ) {
        object.serverhello = $root.fusion.ServerHello.toObject(
          message.serverhello,
          options
        );
        if (options.oneofs) object.msg = "serverhello";
      }
      if (
        message.tierstatusupdate != null &&
        message.hasOwnProperty("tierstatusupdate")
      ) {
        object.tierstatusupdate = $root.fusion.TierStatusUpdate.toObject(
          message.tierstatusupdate,
          options
        );
        if (options.oneofs) object.msg = "tierstatusupdate";
      }
      if (
        message.fusionbegin != null &&
        message.hasOwnProperty("fusionbegin")
      ) {
        object.fusionbegin = $root.fusion.FusionBegin.toObject(
          message.fusionbegin,
          options
        );
        if (options.oneofs) object.msg = "fusionbegin";
      }
      if (message.startround != null && message.hasOwnProperty("startround")) {
        object.startround = $root.fusion.StartRound.toObject(
          message.startround,
          options
        );
        if (options.oneofs) object.msg = "startround";
      }
      if (
        message.blindsigresponses != null &&
        message.hasOwnProperty("blindsigresponses")
      ) {
        object.blindsigresponses = $root.fusion.BlindSigResponses.toObject(
          message.blindsigresponses,
          options
        );
        if (options.oneofs) object.msg = "blindsigresponses";
      }
      if (
        message.allcommitments != null &&
        message.hasOwnProperty("allcommitments")
      ) {
        object.allcommitments = $root.fusion.AllCommitments.toObject(
          message.allcommitments,
          options
        );
        if (options.oneofs) object.msg = "allcommitments";
      }
      if (
        message.sharecovertcomponents != null &&
        message.hasOwnProperty("sharecovertcomponents")
      ) {
        object.sharecovertcomponents =
          $root.fusion.ShareCovertComponents.toObject(
            message.sharecovertcomponents,
            options
          );
        if (options.oneofs) object.msg = "sharecovertcomponents";
      }
      if (
        message.fusionresult != null &&
        message.hasOwnProperty("fusionresult")
      ) {
        object.fusionresult = $root.fusion.FusionResult.toObject(
          message.fusionresult,
          options
        );
        if (options.oneofs) object.msg = "fusionresult";
      }
      if (
        message.theirproofslist != null &&
        message.hasOwnProperty("theirproofslist")
      ) {
        object.theirproofslist = $root.fusion.TheirProofsList.toObject(
          message.theirproofslist,
          options
        );
        if (options.oneofs) object.msg = "theirproofslist";
      }
      if (
        message.restartround != null &&
        message.hasOwnProperty("restartround")
      ) {
        object.restartround = $root.fusion.RestartRound.toObject(
          message.restartround,
          options
        );
        if (options.oneofs) object.msg = "restartround";
      }
      if (message.error != null && message.hasOwnProperty("error")) {
        object.error = $root.fusion.Error.toObject(message.error, options);
        if (options.oneofs) object.msg = "error";
      }
      return object;
    };

    /**
     * Converts this ServerMessage to JSON.
     * @function toJSON
     * @memberof fusion.ServerMessage
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    ServerMessage.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for ServerMessage
     * @function getTypeUrl
     * @memberof fusion.ServerMessage
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    ServerMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.ServerMessage";
    };

    return ServerMessage;
  })();

  fusion.CovertMessage = (function () {
    /**
     * Properties of a CovertMessage.
     * @memberof fusion
     * @interface ICovertMessage
     * @property {fusion.ICovertComponent|null} [component] CovertMessage component
     * @property {fusion.ICovertTransactionSignature|null} [signature] CovertMessage signature
     * @property {fusion.IPing|null} [ping] CovertMessage ping
     */

    /**
     * Constructs a new CovertMessage.
     * @memberof fusion
     * @classdesc Represents a CovertMessage.
     * @implements ICovertMessage
     * @constructor
     * @param {fusion.ICovertMessage=} [properties] Properties to set
     */
    function CovertMessage(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * CovertMessage component.
     * @member {fusion.ICovertComponent|null|undefined} component
     * @memberof fusion.CovertMessage
     * @instance
     */
    CovertMessage.prototype.component = null;

    /**
     * CovertMessage signature.
     * @member {fusion.ICovertTransactionSignature|null|undefined} signature
     * @memberof fusion.CovertMessage
     * @instance
     */
    CovertMessage.prototype.signature = null;

    /**
     * CovertMessage ping.
     * @member {fusion.IPing|null|undefined} ping
     * @memberof fusion.CovertMessage
     * @instance
     */
    CovertMessage.prototype.ping = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * CovertMessage msg.
     * @member {"component"|"signature"|"ping"|undefined} msg
     * @memberof fusion.CovertMessage
     * @instance
     */
    Object.defineProperty(CovertMessage.prototype, "msg", {
      get: $util.oneOfGetter(
        ($oneOfFields = ["component", "signature", "ping"])
      ),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new CovertMessage instance using the specified properties.
     * @function create
     * @memberof fusion.CovertMessage
     * @static
     * @param {fusion.ICovertMessage=} [properties] Properties to set
     * @returns {fusion.CovertMessage} CovertMessage instance
     */
    CovertMessage.create = function create(properties) {
      return new CovertMessage(properties);
    };

    /**
     * Encodes the specified CovertMessage message. Does not implicitly {@link fusion.CovertMessage.verify|verify} messages.
     * @function encode
     * @memberof fusion.CovertMessage
     * @static
     * @param {fusion.ICovertMessage} message CovertMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertMessage.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (
        message.component != null &&
        Object.hasOwnProperty.call(message, "component")
      )
        $root.fusion.CovertComponent.encode(
          message.component,
          writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
        ).ldelim();
      if (
        message.signature != null &&
        Object.hasOwnProperty.call(message, "signature")
      )
        $root.fusion.CovertTransactionSignature.encode(
          message.signature,
          writer.uint32(/* id 2, wireType 2 =*/ 18).fork()
        ).ldelim();
      if (message.ping != null && Object.hasOwnProperty.call(message, "ping"))
        $root.fusion.Ping.encode(
          message.ping,
          writer.uint32(/* id 3, wireType 2 =*/ 26).fork()
        ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified CovertMessage message, length delimited. Does not implicitly {@link fusion.CovertMessage.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.CovertMessage
     * @static
     * @param {fusion.ICovertMessage} message CovertMessage message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertMessage.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CovertMessage message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.CovertMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.CovertMessage} CovertMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertMessage.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.CovertMessage();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.component = $root.fusion.CovertComponent.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 2: {
            message.signature = $root.fusion.CovertTransactionSignature.decode(
              reader,
              reader.uint32()
            );
            break;
          }
          case 3: {
            message.ping = $root.fusion.Ping.decode(reader, reader.uint32());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a CovertMessage message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.CovertMessage
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.CovertMessage} CovertMessage
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertMessage.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CovertMessage message.
     * @function verify
     * @memberof fusion.CovertMessage
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CovertMessage.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      let properties = {};
      if (message.component != null && message.hasOwnProperty("component")) {
        properties.msg = 1;
        {
          let error = $root.fusion.CovertComponent.verify(message.component);
          if (error) return "component." + error;
        }
      }
      if (message.signature != null && message.hasOwnProperty("signature")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.CovertTransactionSignature.verify(
            message.signature
          );
          if (error) return "signature." + error;
        }
      }
      if (message.ping != null && message.hasOwnProperty("ping")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.Ping.verify(message.ping);
          if (error) return "ping." + error;
        }
      }
      return null;
    };

    /**
     * Creates a CovertMessage message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.CovertMessage
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.CovertMessage} CovertMessage
     */
    CovertMessage.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.CovertMessage) return object;
      let message = new $root.fusion.CovertMessage();
      if (object.component != null) {
        if (typeof object.component !== "object")
          throw TypeError(".fusion.CovertMessage.component: object expected");
        message.component = $root.fusion.CovertComponent.fromObject(
          object.component
        );
      }
      if (object.signature != null) {
        if (typeof object.signature !== "object")
          throw TypeError(".fusion.CovertMessage.signature: object expected");
        message.signature = $root.fusion.CovertTransactionSignature.fromObject(
          object.signature
        );
      }
      if (object.ping != null) {
        if (typeof object.ping !== "object")
          throw TypeError(".fusion.CovertMessage.ping: object expected");
        message.ping = $root.fusion.Ping.fromObject(object.ping);
      }
      return message;
    };

    /**
     * Creates a plain object from a CovertMessage message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.CovertMessage
     * @static
     * @param {fusion.CovertMessage} message CovertMessage
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CovertMessage.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (message.component != null && message.hasOwnProperty("component")) {
        object.component = $root.fusion.CovertComponent.toObject(
          message.component,
          options
        );
        if (options.oneofs) object.msg = "component";
      }
      if (message.signature != null && message.hasOwnProperty("signature")) {
        object.signature = $root.fusion.CovertTransactionSignature.toObject(
          message.signature,
          options
        );
        if (options.oneofs) object.msg = "signature";
      }
      if (message.ping != null && message.hasOwnProperty("ping")) {
        object.ping = $root.fusion.Ping.toObject(message.ping, options);
        if (options.oneofs) object.msg = "ping";
      }
      return object;
    };

    /**
     * Converts this CovertMessage to JSON.
     * @function toJSON
     * @memberof fusion.CovertMessage
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CovertMessage.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CovertMessage
     * @function getTypeUrl
     * @memberof fusion.CovertMessage
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CovertMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.CovertMessage";
    };

    return CovertMessage;
  })();

  fusion.CovertResponse = (function () {
    /**
     * Properties of a CovertResponse.
     * @memberof fusion
     * @interface ICovertResponse
     * @property {fusion.IOK|null} [ok] CovertResponse ok
     * @property {fusion.IError|null} [error] CovertResponse error
     */

    /**
     * Constructs a new CovertResponse.
     * @memberof fusion
     * @classdesc Represents a CovertResponse.
     * @implements ICovertResponse
     * @constructor
     * @param {fusion.ICovertResponse=} [properties] Properties to set
     */
    function CovertResponse(properties) {
      if (properties)
        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
          if (properties[keys[i]] != null) this[keys[i]] = properties[keys[i]];
    }

    /**
     * CovertResponse ok.
     * @member {fusion.IOK|null|undefined} ok
     * @memberof fusion.CovertResponse
     * @instance
     */
    CovertResponse.prototype.ok = null;

    /**
     * CovertResponse error.
     * @member {fusion.IError|null|undefined} error
     * @memberof fusion.CovertResponse
     * @instance
     */
    CovertResponse.prototype.error = null;

    // OneOf field names bound to virtual getters and setters
    let $oneOfFields;

    /**
     * CovertResponse msg.
     * @member {"ok"|"error"|undefined} msg
     * @memberof fusion.CovertResponse
     * @instance
     */
    Object.defineProperty(CovertResponse.prototype, "msg", {
      get: $util.oneOfGetter(($oneOfFields = ["ok", "error"])),
      set: $util.oneOfSetter($oneOfFields),
    });

    /**
     * Creates a new CovertResponse instance using the specified properties.
     * @function create
     * @memberof fusion.CovertResponse
     * @static
     * @param {fusion.ICovertResponse=} [properties] Properties to set
     * @returns {fusion.CovertResponse} CovertResponse instance
     */
    CovertResponse.create = function create(properties) {
      return new CovertResponse(properties);
    };

    /**
     * Encodes the specified CovertResponse message. Does not implicitly {@link fusion.CovertResponse.verify|verify} messages.
     * @function encode
     * @memberof fusion.CovertResponse
     * @static
     * @param {fusion.ICovertResponse} message CovertResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertResponse.encode = function encode(message, writer) {
      if (!writer) writer = $Writer.create();
      if (message.ok != null && Object.hasOwnProperty.call(message, "ok"))
        $root.fusion.OK.encode(
          message.ok,
          writer.uint32(/* id 1, wireType 2 =*/ 10).fork()
        ).ldelim();
      if (message.error != null && Object.hasOwnProperty.call(message, "error"))
        $root.fusion.Error.encode(
          message.error,
          writer.uint32(/* id 15, wireType 2 =*/ 122).fork()
        ).ldelim();
      return writer;
    };

    /**
     * Encodes the specified CovertResponse message, length delimited. Does not implicitly {@link fusion.CovertResponse.verify|verify} messages.
     * @function encodeDelimited
     * @memberof fusion.CovertResponse
     * @static
     * @param {fusion.ICovertResponse} message CovertResponse message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    CovertResponse.encodeDelimited = function encodeDelimited(message, writer) {
      return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a CovertResponse message from the specified reader or buffer.
     * @function decode
     * @memberof fusion.CovertResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {fusion.CovertResponse} CovertResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertResponse.decode = function decode(reader, length, error) {
      if (!(reader instanceof $Reader)) reader = $Reader.create(reader);
      let end = length === undefined ? reader.len : reader.pos + length,
        message = new $root.fusion.CovertResponse();
      while (reader.pos < end) {
        let tag = reader.uint32();
        if (tag === error) break;
        switch (tag >>> 3) {
          case 1: {
            message.ok = $root.fusion.OK.decode(reader, reader.uint32());
            break;
          }
          case 15: {
            message.error = $root.fusion.Error.decode(reader, reader.uint32());
            break;
          }
          default:
            reader.skipType(tag & 7);
            break;
        }
      }
      return message;
    };

    /**
     * Decodes a CovertResponse message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof fusion.CovertResponse
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {fusion.CovertResponse} CovertResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    CovertResponse.decodeDelimited = function decodeDelimited(reader) {
      if (!(reader instanceof $Reader)) reader = new $Reader(reader);
      return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a CovertResponse message.
     * @function verify
     * @memberof fusion.CovertResponse
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    CovertResponse.verify = function verify(message) {
      if (typeof message !== "object" || message === null)
        return "object expected";
      let properties = {};
      if (message.ok != null && message.hasOwnProperty("ok")) {
        properties.msg = 1;
        {
          let error = $root.fusion.OK.verify(message.ok);
          if (error) return "ok." + error;
        }
      }
      if (message.error != null && message.hasOwnProperty("error")) {
        if (properties.msg === 1) return "msg: multiple values";
        properties.msg = 1;
        {
          let error = $root.fusion.Error.verify(message.error);
          if (error) return "error." + error;
        }
      }
      return null;
    };

    /**
     * Creates a CovertResponse message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof fusion.CovertResponse
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {fusion.CovertResponse} CovertResponse
     */
    CovertResponse.fromObject = function fromObject(object) {
      if (object instanceof $root.fusion.CovertResponse) return object;
      let message = new $root.fusion.CovertResponse();
      if (object.ok != null) {
        if (typeof object.ok !== "object")
          throw TypeError(".fusion.CovertResponse.ok: object expected");
        message.ok = $root.fusion.OK.fromObject(object.ok);
      }
      if (object.error != null) {
        if (typeof object.error !== "object")
          throw TypeError(".fusion.CovertResponse.error: object expected");
        message.error = $root.fusion.Error.fromObject(object.error);
      }
      return message;
    };

    /**
     * Creates a plain object from a CovertResponse message. Also converts values to other types if specified.
     * @function toObject
     * @memberof fusion.CovertResponse
     * @static
     * @param {fusion.CovertResponse} message CovertResponse
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    CovertResponse.toObject = function toObject(message, options) {
      if (!options) options = {};
      let object = {};
      if (message.ok != null && message.hasOwnProperty("ok")) {
        object.ok = $root.fusion.OK.toObject(message.ok, options);
        if (options.oneofs) object.msg = "ok";
      }
      if (message.error != null && message.hasOwnProperty("error")) {
        object.error = $root.fusion.Error.toObject(message.error, options);
        if (options.oneofs) object.msg = "error";
      }
      return object;
    };

    /**
     * Converts this CovertResponse to JSON.
     * @function toJSON
     * @memberof fusion.CovertResponse
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    CovertResponse.prototype.toJSON = function toJSON() {
      return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for CovertResponse
     * @function getTypeUrl
     * @memberof fusion.CovertResponse
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    CovertResponse.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
      if (typeUrlPrefix === undefined) {
        typeUrlPrefix = "type.googleapis.com";
      }
      return typeUrlPrefix + "/fusion.CovertResponse";
    };

    return CovertResponse;
  })();

  return fusion;
})());

export { $root as default };
