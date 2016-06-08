/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Bootstrap
	var APIServer = __webpack_require__(1);
	var WebSocketServer = __webpack_require__(33).Server;

	var wss = new WebSocketServer({ port: 8642 });
	var app = new APIServer(wss);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	// Imports
	var mp = __webpack_require__(2);
	var reqHandler = __webpack_require__(30);

	// Create new server
	module.exports = function () {
		function _class(wss) {
			_classCallCheck(this, _class);

			console.log('Initializing Server.');
			this.wss = wss;
			this.connection;
			this.onInit();
		}

		_createClass(_class, [{
			key: 'onInit',
			value: function onInit() {
				var _this = this;

				this.wss.on('connection', function (ws) {
					ws.send('Connected to API Server. Listening for messages.');
					_this.connection = ws;
					_this.onConnect();
				});
			}
		}, {
			key: 'onConnect',
			value: function onConnect() {
				this.connection.on('message', function (data, flags) {
					if (!flags.binary) throw new Error("Data sent is not MessagePack binary");
					var rh = new reqHandler(data);
				});
			}
		}]);

		return _class;
	}();

	// do the thing

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// msgpack.js

	exports.encode = __webpack_require__(3).encode;
	exports.decode = __webpack_require__(10).decode;

	exports.Encoder = __webpack_require__(23).Encoder;
	exports.Decoder = __webpack_require__(25).Decoder;

	exports.createEncodeStream = __webpack_require__(26).createEncodeStream;
	exports.createDecodeStream = __webpack_require__(29).createDecodeStream;

	exports.createCodec = __webpack_require__(6).createCodec;
	exports.codec = __webpack_require__(5).codec;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// encode.js

	exports.encode = encode;

	var EncodeBuffer = __webpack_require__(4).EncodeBuffer;

	function encode(input, options) {
	  var encoder = new EncodeBuffer(options);
	  encoder.write(input);
	  return encoder.read();
	}


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// encode-buffer.js

	exports.EncodeBuffer = EncodeBuffer;

	var preset = __webpack_require__(5).codec.preset;

	var MIN_BUFFER_SIZE = 2048;
	var MAX_BUFFER_SIZE = 65536;

	function EncodeBuffer(options) {
	  if (!(this instanceof EncodeBuffer)) return new EncodeBuffer(options);

	  if (options) {
	    this.options = options;
	    if (options.codec) {
	      this.codec = options.codec;
	    }
	  }
	}

	EncodeBuffer.prototype.offset = 0;
	EncodeBuffer.prototype.start = 0;

	EncodeBuffer.prototype.push = function(chunk) {
	  var buffers = this.buffers || (this.buffers = []);
	  buffers.push(chunk);
	};

	EncodeBuffer.prototype.codec = preset;

	EncodeBuffer.prototype.write = function(input) {
	  this.codec.encode(this, input);
	};

	EncodeBuffer.prototype.read = function() {
	  var length = this.buffers && this.buffers.length;

	  // fetch the first result
	  if (!length) return this.fetch();

	  // flush current buffer
	  this.flush();

	  // read from the results
	  return this.pull();
	};

	EncodeBuffer.prototype.pull = function() {
	  var buffers = this.buffers || (this.buffers = []);
	  var chunk = buffers.length > 1 ? Buffer.concat(buffers) : buffers[0];
	  buffers.length = 0; // buffer exhausted
	  return chunk;
	};

	EncodeBuffer.prototype.fetch = function() {
	  var start = this.start;
	  if (start < this.offset) {
	    this.start = this.offset;
	    return this.buffer.slice(start, this.offset);
	  }
	};

	EncodeBuffer.prototype.flush = function() {
	  var buffer = this.fetch();
	  if (buffer) this.push(buffer);
	};

	EncodeBuffer.prototype.reserve = function(length) {
	  if (this.buffer) {
	    var size = this.buffer.length;

	    // is it long enough?
	    if (this.offset + length < size) return;

	    // flush current buffer
	    this.flush();

	    // resize it to 2x current length
	    length = Math.max(length, Math.min(size * 2, MAX_BUFFER_SIZE));
	  }

	  // minimum buffer size
	  length = length > MIN_BUFFER_SIZE ? length : MIN_BUFFER_SIZE;

	  // allocate new buffer
	  this.buffer = new Buffer(length);
	  this.start = 0;
	  this.offset = 0;
	};

	EncodeBuffer.prototype.send = function(buffer) {
	  var end = this.offset + buffer.length;
	  if (this.buffer && end < this.buffer.length) {
	    buffer.copy(this.buffer, this.offset);
	    this.offset = end;
	  } else {
	    this.flush();
	    this.push(buffer);
	  }
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// codec.js

	exports.codec = {
	  preset: __webpack_require__(6).createCodec({preset: true})
	};


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// ext.js

	var IS_ARRAY = __webpack_require__(7);

	exports.createCodec = createCodec;

	var ExtBuffer = __webpack_require__(8).ExtBuffer;
	var ExtPreset = __webpack_require__(9);
	var ReadCore = __webpack_require__(13);
	var WriteCore = __webpack_require__(19);

	function Codec(options) {
	  if (!(this instanceof Codec)) return new Codec(options);
	  this.extPackers = {};
	  this.extUnpackers = [];
	  this.encode = WriteCore.getEncoder(options);
	  this.decode = ReadCore.getDecoder(options);
	  if (options && options.preset) {
	    ExtPreset.setExtPreset(this);
	  }
	}

	function createCodec(options) {
	  return new Codec(options);
	}

	Codec.prototype.addExtPacker = function(etype, Class, packer) {
	  if (IS_ARRAY(packer)) {
	    packer = join(packer);
	  }
	  var name = Class.name;
	  if (name && name !== "Object") {
	    this.extPackers[name] = extPacker;
	  } else {
	    var list = this.extEncoderList || (this.extEncoderList = []);
	    list.unshift([Class, extPacker]);
	  }

	  function extPacker(value) {
	    var buffer = packer(value);
	    return new ExtBuffer(buffer, etype);
	  }
	};

	Codec.prototype.addExtUnpacker = function(etype, unpacker) {
	  this.extUnpackers[etype] = IS_ARRAY(unpacker) ? join(unpacker) : unpacker;
	};

	Codec.prototype.getExtPacker = function(value) {
	  var c = value.constructor;
	  var e = c && c.name && this.extPackers[c.name];
	  if (e) return e;
	  var list = this.extEncoderList;
	  if (!list) return;
	  var len = list.length;
	  for (var i = 0; i < len; i++) {
	    var pair = list[i];
	    if (c === pair[0]) return pair[1];
	  }
	};

	Codec.prototype.getExtUnpacker = function(type) {
	  return this.extUnpackers[type] || extUnpacker;

	  function extUnpacker(buffer) {
	    return new ExtBuffer(buffer, type);
	  }
	};

	function join(filters) {
	  filters = filters.slice();

	  return function(value) {
	    return filters.reduce(iterator, value);
	  };

	  function iterator(value, filter) {
	    return filter(value);
	  }
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	// ext-buffer.js

	exports.ExtBuffer = ExtBuffer;

	function ExtBuffer(buffer, type) {
	  if (!(this instanceof ExtBuffer)) return new ExtBuffer(buffer, type);
	  this.buffer = buffer;
	  this.type = type;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// ext-preset.js

	exports.setExtPreset = setExtPreset;

	var _encode, _decode;
	var hasUint8Array = ("undefined" !== typeof Uint8Array);
	var hasFloat64Array = ("undefined" !== typeof Float64Array);
	var hasUint8ClampedArray = ("undefined" !== typeof Uint8ClampedArray);

	var ERROR_COLUMNS = {name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1};

	function setExtPreset(codec) {
	  setExtPackers(codec);
	  setExtUnpackers(codec);
	}

	function setExtPackers(preset) {
	  preset.addExtPacker(0x0E, Error, [packError, encode]);
	  preset.addExtPacker(0x01, EvalError, [packError, encode]);
	  preset.addExtPacker(0x02, RangeError, [packError, encode]);
	  preset.addExtPacker(0x03, ReferenceError, [packError, encode]);
	  preset.addExtPacker(0x04, SyntaxError, [packError, encode]);
	  preset.addExtPacker(0x05, TypeError, [packError, encode]);
	  preset.addExtPacker(0x06, URIError, [packError, encode]);

	  preset.addExtPacker(0x0A, RegExp, [packRegExp, encode]);
	  preset.addExtPacker(0x0B, Boolean, [packValueOf, encode]);
	  preset.addExtPacker(0x0C, String, [packValueOf, encode]);
	  preset.addExtPacker(0x0D, Date, [Number, encode]);
	  preset.addExtPacker(0x0F, Number, [packValueOf, encode]);

	  if (hasUint8Array) {
	    preset.addExtPacker(0x11, Int8Array, packBuffer);
	    preset.addExtPacker(0x12, Uint8Array, packBuffer);
	    preset.addExtPacker(0x13, Int16Array, packTypedArray);
	    preset.addExtPacker(0x14, Uint16Array, packTypedArray);
	    preset.addExtPacker(0x15, Int32Array, packTypedArray);
	    preset.addExtPacker(0x16, Uint32Array, packTypedArray);
	    preset.addExtPacker(0x17, Float32Array, packTypedArray);

	    if (hasFloat64Array) {
	      // PhantomJS/1.9.7 doesn't have Float64Array
	      preset.addExtPacker(0x18, Float64Array, packTypedArray);
	    }

	    if (hasUint8ClampedArray) {
	      // IE10 doesn't have Uint8ClampedArray
	      preset.addExtPacker(0x19, Uint8ClampedArray, packBuffer);
	      preset.addExtUnpacker(0x19, unpackClass(Uint8ClampedArray));
	    }

	    preset.addExtPacker(0x1A, ArrayBuffer, packArrayBuffer);
	    preset.addExtPacker(0x1D, DataView, packTypedArray);
	    preset.addExtUnpacker(0x1A, unpackArrayBuffer);
	    preset.addExtUnpacker(0x1D, [unpackArrayBuffer, unpackClass(DataView)]);
	  }
	}

	function setExtUnpackers(preset) {
	  preset.addExtPacker(0x0E, Error, [packError, encode]);
	  preset.addExtPacker(0x01, EvalError, [packError, encode]);
	  preset.addExtPacker(0x02, RangeError, [packError, encode]);
	  preset.addExtPacker(0x03, ReferenceError, [packError, encode]);
	  preset.addExtPacker(0x04, SyntaxError, [packError, encode]);
	  preset.addExtPacker(0x05, TypeError, [packError, encode]);
	  preset.addExtPacker(0x06, URIError, [packError, encode]);

	  preset.addExtUnpacker(0x0E, [decode, unpackError(Error)]);
	  preset.addExtUnpacker(0x01, [decode, unpackError(EvalError)]);
	  preset.addExtUnpacker(0x02, [decode, unpackError(RangeError)]);
	  preset.addExtUnpacker(0x03, [decode, unpackError(ReferenceError)]);
	  preset.addExtUnpacker(0x04, [decode, unpackError(SyntaxError)]);
	  preset.addExtUnpacker(0x05, [decode, unpackError(TypeError)]);
	  preset.addExtUnpacker(0x06, [decode, unpackError(URIError)]);

	  preset.addExtPacker(0x0A, RegExp, [packRegExp, encode]);
	  preset.addExtPacker(0x0B, Boolean, [packValueOf, encode]);
	  preset.addExtPacker(0x0C, String, [packValueOf, encode]);
	  preset.addExtPacker(0x0D, Date, [Number, encode]);
	  preset.addExtPacker(0x0F, Number, [packValueOf, encode]);

	  preset.addExtUnpacker(0x0A, [decode, unpackRegExp]);
	  preset.addExtUnpacker(0x0B, [decode, unpackClass(Boolean)]);
	  preset.addExtUnpacker(0x0C, [decode, unpackClass(String)]);
	  preset.addExtUnpacker(0x0D, [decode, unpackClass(Date)]);
	  preset.addExtUnpacker(0x0F, [decode, unpackClass(Number)]);

	  if (hasUint8Array) {
	    preset.addExtPacker(0x11, Int8Array, packBuffer);
	    preset.addExtPacker(0x12, Uint8Array, packBuffer);
	    preset.addExtPacker(0x13, Int16Array, packTypedArray);
	    preset.addExtPacker(0x14, Uint16Array, packTypedArray);
	    preset.addExtPacker(0x15, Int32Array, packTypedArray);
	    preset.addExtPacker(0x16, Uint32Array, packTypedArray);
	    preset.addExtPacker(0x17, Float32Array, packTypedArray);

	    preset.addExtUnpacker(0x11, unpackClass(Int8Array));
	    preset.addExtUnpacker(0x12, unpackClass(Uint8Array));
	    preset.addExtUnpacker(0x13, [unpackArrayBuffer, unpackClass(Int16Array)]);
	    preset.addExtUnpacker(0x14, [unpackArrayBuffer, unpackClass(Uint16Array)]);
	    preset.addExtUnpacker(0x15, [unpackArrayBuffer, unpackClass(Int32Array)]);
	    preset.addExtUnpacker(0x16, [unpackArrayBuffer, unpackClass(Uint32Array)]);
	    preset.addExtUnpacker(0x17, [unpackArrayBuffer, unpackClass(Float32Array)]);

	    if (hasFloat64Array) {
	      // PhantomJS/1.9.7 doesn't have Float64Array
	      preset.addExtPacker(0x18, Float64Array, packTypedArray);
	      preset.addExtUnpacker(0x18, [unpackArrayBuffer, unpackClass(Float64Array)]);
	    }

	    if (hasUint8ClampedArray) {
	      // IE10 doesn't have Uint8ClampedArray
	      preset.addExtPacker(0x19, Uint8ClampedArray, packBuffer);
	      preset.addExtUnpacker(0x19, unpackClass(Uint8ClampedArray));
	    }

	    preset.addExtPacker(0x1A, ArrayBuffer, packArrayBuffer);
	    preset.addExtPacker(0x1D, DataView, packTypedArray);
	    preset.addExtUnpacker(0x1A, unpackArrayBuffer);
	    preset.addExtUnpacker(0x1D, [unpackArrayBuffer, unpackClass(DataView)]);
	  }
	}

	function encode(input) {
	  if (!_encode) _encode = __webpack_require__(3).encode; // lazy load
	  return _encode(input);
	}

	function decode(input) {
	  if (!_decode) _decode = __webpack_require__(10).decode; // lazy load
	  return _decode(input);
	}

	function packBuffer(value) {
	  return new Buffer(value);
	}

	function packValueOf(value) {
	  return (value).valueOf();
	}

	function packRegExp(value) {
	  value = RegExp.prototype.toString.call(value).split("/");
	  value.shift();
	  var out = [value.pop()];
	  out.unshift(value.join("/"));
	  return out;
	}

	function unpackRegExp(value) {
	  return RegExp.apply(null, value);
	}

	function packError(value) {
	  var out = {};
	  for (var key in ERROR_COLUMNS) {
	    out[key] = value[key];
	  }
	  return out;
	}

	function unpackError(Class) {
	  return function(value) {
	    var out = new Class();
	    for (var key in ERROR_COLUMNS) {
	      out[key] = value[key];
	    }
	    return out;
	  };
	}

	function unpackClass(Class) {
	  return function(value) {
	    return new Class(value);
	  };
	}

	function packTypedArray(value) {
	  return new Buffer(new Uint8Array(value.buffer));
	}

	function packArrayBuffer(value) {
	  return new Buffer(new Uint8Array(value));
	}

	function unpackArrayBuffer(value) {
	  return (new Uint8Array(value)).buffer;
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// decode.js

	exports.decode = decode;

	var DecodeBuffer = __webpack_require__(11).DecodeBuffer;

	function decode(input, options) {
	  var decoder = new DecodeBuffer(options);
	  decoder.write(input);
	  return decoder.read();
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// decode-buffer.js

	exports.DecodeBuffer = DecodeBuffer;

	var preset = __webpack_require__(5).codec.preset;

	var BufferShortageError = __webpack_require__(12).BufferShortageError;

	function DecodeBuffer(options) {
	  if (!(this instanceof DecodeBuffer)) return new DecodeBuffer(options);

	  if (options) {
	    this.options = options;
	    if (options.codec) {
	      this.codec = options.codec;
	    }
	  }
	}

	DecodeBuffer.prototype.offset = 0;

	DecodeBuffer.prototype.push = function(chunk) {
	  var buffers = this.buffers || (this.buffers = []);
	  buffers.push(chunk);
	};

	DecodeBuffer.prototype.codec = preset;

	DecodeBuffer.prototype.write = function(chunk) {
	  var prev = this.offset ? this.buffer.slice(this.offset) : this.buffer;
	  this.buffer = prev ? (chunk ? Buffer.concat([prev, chunk]) : prev) : chunk;
	  this.offset = 0;
	};

	DecodeBuffer.prototype.read = function() {
	  var length = this.buffers && this.buffers.length;

	  // fetch the first result
	  if (!length) return this.fetch();

	  // flush current buffer
	  this.flush();

	  // read from the results
	  return this.pull();
	};

	DecodeBuffer.prototype.pull = function() {
	  var buffers = this.buffers || (this.buffers = []);
	  return buffers.shift();
	};

	DecodeBuffer.prototype.fetch = function() {
	  return this.codec.decode(this);
	};

	DecodeBuffer.prototype.flush = function() {
	  while (this.offset < this.buffer.length) {
	    var start = this.offset;
	    var value;
	    try {
	      value = this.fetch();
	    } catch (e) {
	      if (!(e instanceof BufferShortageError)) throw e;
	      // rollback
	      this.offset = start;
	      break;
	    }
	    this.push(value);
	  }
	};


/***/ },
/* 12 */
/***/ function(module, exports) {

	// buffer-shortage.js

	exports.BufferShortageError = BufferShortageError;

	BufferShortageError.prototype = Error.prototype;

	function BufferShortageError() {
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// read-core.js

	exports.getDecoder = getDecoder;

	var readUint8 = __webpack_require__(14).readUint8;
	var ReadToken = __webpack_require__(18);

	function getDecoder(options) {
	  var readToken = ReadToken.getReadToken(options);
	  return decode;

	  function decode(decoder) {
	    var type = readUint8(decoder);
	    var func = readToken[type];
	    if (!func) throw new Error("Invalid type: " + (type ? ("0x" + type.toString(16)) : type));
	    return func(decoder);
	  }
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// read-format.js

	var ieee754 = __webpack_require__(15);
	var Int64Buffer = __webpack_require__(16);
	var Uint64BE = Int64Buffer.Uint64BE;
	var Int64BE = Int64Buffer.Int64BE;

	exports.getReadFormat = getReadFormat;
	exports.readUint8 = uint8;

	var BufferLite = __webpack_require__(17);
	var BufferShortageError = __webpack_require__(12).BufferShortageError;

	var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
	var NO_ASSERT = true;

	function getReadFormat(options) {
	  var readFormat = {
	    map: map,
	    array: array,
	    str: str,
	    bin: bin,
	    ext: ext,
	    uint8: uint8,
	    uint16: uint16,
	    uint32: read(4, Buffer.prototype.readUInt32BE),
	    uint64: read(8, readUInt64BE),
	    int8: read(1, Buffer.prototype.readInt8),
	    int16: read(2, Buffer.prototype.readInt16BE),
	    int32: read(4, Buffer.prototype.readInt32BE),
	    int64: read(8, readInt64BE),
	    float32: read(4, readFloatBE),
	    float64: read(8, readDoubleBE)
	  };

	  if (options && options.int64) {
	    readFormat.uint64 = read(8, readUInt64BE_int64);
	    readFormat.int64 = read(8, readInt64BE_int64);
	  }

	  return readFormat;
	}

	function map(decoder, len) {
	  var value = {};
	  var i;
	  var k = new Array(len);
	  var v = new Array(len);

	  var decode = decoder.codec.decode;
	  for (i = 0; i < len; i++) {
	    k[i] = decode(decoder);
	    v[i] = decode(decoder);
	  }
	  for (i = 0; i < len; i++) {
	    value[k[i]] = v[i];
	  }
	  return value;
	}

	function array(decoder, len) {
	  var value = new Array(len);
	  var decode = decoder.codec.decode;
	  for (var i = 0; i < len; i++) {
	    value[i] = decode(decoder);
	  }
	  return value;
	}

	function str(decoder, len) {
	  var start = decoder.offset;
	  var end = decoder.offset = start + len;
	  var buffer = decoder.buffer;
	  if (end > buffer.length) throw new BufferShortageError();
	  if (IS_BUFFER_SHIM || !Buffer.isBuffer(buffer)) {
	    // slower (compat)
	    return BufferLite.readString.call(buffer, start, end);
	  } else {
	    // 2x faster
	    return buffer.toString("utf-8", start, end);
	  }
	}

	function bin(decoder, len) {
	  var start = decoder.offset;
	  var end = decoder.offset = start + len;
	  if (end > decoder.buffer.length) throw new BufferShortageError();
	  return slice.call(decoder.buffer, start, end);
	}

	function ext(decoder, len) {
	  var start = decoder.offset;
	  var end = decoder.offset = start + len + 1;
	  if (end > decoder.buffer.length) throw new BufferShortageError();
	  var type = decoder.buffer[start];
	  var unpack = decoder.codec.getExtUnpacker(type);
	  if (!unpack) throw new Error("Invalid ext type: " + (type ? ("0x" + type.toString(16)) : type));
	  var buf = slice.call(decoder.buffer, start + 1, end);
	  return unpack(buf);
	}

	function uint8(decoder) {
	  var buffer = decoder.buffer;
	  if (decoder.offset >= buffer.length) throw new BufferShortageError();
	  return buffer[decoder.offset++];
	}

	function uint16(decoder) {
	  var buffer = decoder.buffer;
	  if (decoder.offset + 2 > buffer.length) throw new BufferShortageError();
	  return (buffer[decoder.offset++] << 8) | buffer[decoder.offset++];
	}

	function read(len, method) {
	  return function(decoder) {
	    var start = decoder.offset;
	    var end = decoder.offset = start + len;
	    if (end > decoder.buffer.length) throw new BufferShortageError();
	    return method.call(decoder.buffer, start, NO_ASSERT);
	  };
	}

	function readUInt64BE(start) {
	  return new Uint64BE(this, start).toNumber();
	}

	function readInt64BE(start) {
	  return new Int64BE(this, start).toNumber();
	}

	function readUInt64BE_int64(start) {
	  return new Uint64BE(this, start);
	}

	function readInt64BE_int64(start) {
	  return new Int64BE(this, start);
	}

	function readFloatBE(start) {
	  if (this.readFloatBE) return this.readFloatBE(start);
	  return ieee754.read(this, start, false, 23, 4);
	}

	function readDoubleBE(start) {
	  if (this.readDoubleBE) return this.readDoubleBE(start);
	  return ieee754.read(this, start, false, 52, 8);
	}

	function slice(start, end) {
	  var f = this.slice || Array.prototype.slice;
	  var buf = f.call(this, start, end);
	  if (!Buffer.isBuffer(buf)) buf = Buffer(buf);
	  return buf;
	}


/***/ },
/* 15 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 16 */
/***/ function(module, exports) {

	// int64-buffer.js

	/*jshint -W018 */ // Confusing use of '!'.
	/*jshint -W030 */ // Expected an assignment or function call and instead saw an expression.
	/*jshint -W093 */ // Did you mean to return a conditional instead of an assignment?

	var Uint64BE, Int64BE;

	!function(exports) {
	  // constructors

	  var U = exports.Uint64BE = Uint64BE = function(buffer, offset, value, raddix) {
	    if (!(this instanceof Uint64BE)) return new Uint64BE(buffer, offset, value, raddix);
	    return init(this, buffer, offset, value, raddix);
	  };

	  var I = exports.Int64BE = Int64BE = function(buffer, offset, value, raddix) {
	    if (!(this instanceof Int64BE)) return new Int64BE(buffer, offset, value, raddix);
	    return init(this, buffer, offset, value, raddix);
	  };

	  // member methods

	  var UPROTO = U.prototype;
	  var IPROTO = I.prototype;

	  // constants

	  var UNDEFIND = "undefined";
	  var BUFFER = (UNDEFIND !== typeof Buffer) && Buffer;
	  var UINT8ARRAY = (UNDEFIND !== typeof Uint8Array) && Uint8Array;
	  var ARRAYBUFFER = (UNDEFIND !== typeof ArrayBuffer) && ArrayBuffer;
	  var ZERO = [0, 0, 0, 0, 0, 0, 0, 0];
	  var isArray = Array.isArray || _isArray;
	  var BIT32 = 4294967296;
	  var BIT24 = 16777216;

	  // storage class

	  var storage; // Array;

	  // initializer

	  function init(that, buffer, offset, value, raddix) {
	    if (UINT8ARRAY && ARRAYBUFFER) {
	      if (buffer instanceof ARRAYBUFFER) buffer = new UINT8ARRAY(buffer);
	      if (value instanceof ARRAYBUFFER) value = new UINT8ARRAY(value);
	    }

	    // Int64BE() style
	    if (!buffer && !offset && !value && !storage) {
	      // shortcut to initialize with zero
	      that.buffer = newArray(ZERO, 0);
	      return;
	    }

	    // Int64BE(value, raddix) style
	    if (!isValidBuffer(buffer, offset)) {
	      var _storage = storage || Array;
	      raddix = offset;
	      value = buffer;
	      offset = 0;
	      buffer = new _storage(8);
	    }

	    that.buffer = buffer;
	    that.offset = offset |= 0;

	    // Int64BE(buffer, offset) style
	    if ("undefined" === typeof value) return;

	    // Int64BE(buffer, offset, value, raddix) style
	    if ("string" === typeof value) {
	      fromString(buffer, offset, value, raddix || 10);
	    } else if (isValidBuffer(value, raddix)) {
	      fromArray(buffer, offset, value, raddix);
	    } else if ("number" === typeof raddix) {
	      writeUInt32BE(buffer, offset, value); // high
	      writeUInt32BE(buffer, offset + 4, raddix); // low
	    } else if (value > 0) {
	      fromPositive(buffer, offset, value); // positive
	    } else if (value < 0) {
	      fromNegative(buffer, offset, value); // negative
	    } else {
	      fromArray(buffer, offset, ZERO, 0); // zero, NaN and others
	    }
	  }

	  UPROTO.buffer = IPROTO.buffer = void 0;

	  UPROTO.offset = IPROTO.offset = 0;

	  UPROTO._isUint64BE = IPROTO._isInt64BE = true;

	  U.isUint64BE = function(b) {
	    return !!(b && b._isUint64BE);
	  };

	  I.isInt64BE = function(b) {
	    return !!(b && b._isInt64BE);
	  };

	  UPROTO.toNumber = function() {
	    var buffer = this.buffer;
	    var offset = this.offset;
	    var high = readUInt32BE(buffer, offset);
	    var low = readUInt32BE(buffer, offset + 4);
	    return high ? (high * BIT32 + low) : low;
	  };

	  IPROTO.toNumber = function() {
	    var buffer = this.buffer;
	    var offset = this.offset;
	    var high = readUInt32BE(buffer, offset) | 0; // a trick to get signed
	    var low = readUInt32BE(buffer, offset + 4);
	    return high ? (high * BIT32 + low) : low;
	  };

	  UPROTO.toArray = IPROTO.toArray = function(raw) {
	    var buffer = this.buffer;
	    var offset = this.offset;
	    storage = null; // Array
	    if (raw !== false && offset === 0 && buffer.length === 8 && isArray(buffer)) return buffer;
	    return newArray(buffer, offset);
	  };

	  // add .toBuffer() method only when Buffer available

	  if (BUFFER) {
	    UPROTO.toBuffer = IPROTO.toBuffer = function(raw) {
	      var buffer = this.buffer;
	      var offset = this.offset;
	      storage = BUFFER;
	      if (raw !== false && offset === 0 && buffer.length === 8 && Buffer.isBuffer(buffer)) return buffer;
	      var dest = new BUFFER(8);
	      fromArray(dest, 0, buffer, offset);
	      return dest;
	    };
	  }

	  // add .toArrayBuffer() method only when Uint8Array available

	  if (UINT8ARRAY) {
	    UPROTO.toArrayBuffer = IPROTO.toArrayBuffer = function(raw) {
	      var buffer = this.buffer;
	      var offset = this.offset;
	      var arrbuf = buffer.buffer;
	      storage = UINT8ARRAY;
	      if (raw !== false && offset === 0 && (arrbuf instanceof ARRAYBUFFER) && arrbuf.byteLength === 8) return arrbuf;
	      var dest = new UINT8ARRAY(8);
	      fromArray(dest, 0, buffer, offset);
	      return dest.buffer;
	    };
	  }

	  IPROTO.toString = function(radix) {
	    return toString(this.buffer, this.offset, radix, true);
	  };

	  UPROTO.toString = function(radix) {
	    return toString(this.buffer, this.offset, radix, false);
	  };

	  UPROTO.toJSON = UPROTO.toNumber;
	  IPROTO.toJSON = IPROTO.toNumber;

	  // private methods

	  function isValidBuffer(buffer, offset) {
	    var len = buffer && buffer.length;
	    offset |= 0;
	    return len && (offset + 8 <= len) && ("string" !== typeof buffer[offset]);
	  }

	  function fromArray(destbuf, destoff, srcbuf, srcoff) {
	    destoff |= 0;
	    srcoff |= 0;
	    for (var i = 0; i < 8; i++) {
	      destbuf[destoff++] = srcbuf[srcoff++] & 255;
	    }
	  }

	  function fromString(buffer, offset, str, raddix) {
	    var pos = 0;
	    var len = str.length;
	    var high = 0;
	    var low = 0;
	    if (str[0] === "-") pos++;
	    var sign = pos;
	    while (pos < len) {
	      var chr = parseInt(str[pos++], raddix);
	      if (!(chr >= 0)) break; // NaN
	      low = low * raddix + chr;
	      high = high * raddix + Math.floor(low / BIT32);
	      low %= BIT32;
	    }
	    if (sign) {
	      high = ~high;
	      if (low) {
	        low = BIT32 - low;
	      } else {
	        high++;
	      }
	    }
	    writeUInt32BE(buffer, offset, high);
	    writeUInt32BE(buffer, offset + 4, low);
	  }

	  function toString(buffer, offset, radix, signed) {
	    var str = "";
	    var high = readUInt32BE(buffer, offset);
	    var low = readUInt32BE(buffer, offset + 4);
	    var sign = signed && (high & 0x80000000);
	    if (sign) {
	      high = ~high;
	      low = BIT32 - low;
	    }
	    radix = radix || 10;
	    while (1) {
	      var mod = (high % radix) * BIT32 + low;
	      high = Math.floor(high / radix);
	      low = Math.floor(mod / radix);
	      str = (mod % radix).toString(radix) + str;
	      if (!high && !low) break;
	    }
	    if (sign) {
	      str = "-" + str;
	    }
	    return str;
	  }

	  function newArray(buffer, offset) {
	    return Array.prototype.slice.call(buffer, offset, offset + 8);
	  }

	  function readUInt32BE(buffer, offset) {
	    return (buffer[offset++] * BIT24) + (buffer[offset++] << 16) + (buffer[offset++] << 8) + buffer[offset];
	  }

	  function writeUInt32BE(buffer, offset, value) {
	    buffer[offset + 3] = value & 255;
	    value = value >> 8;
	    buffer[offset + 2] = value & 255;
	    value = value >> 8;
	    buffer[offset + 1] = value & 255;
	    value = value >> 8;
	    buffer[offset] = value & 255;
	  }

	  function fromPositive(buffer, offset, value) {
	    for (var i = offset + 7; i >= offset; i--) {
	      buffer[i] = value & 255;
	      value /= 256;
	    }
	  }

	  function fromNegative(buffer, offset, value) {
	    value++;
	    for (var i = offset + 7; i >= offset; i--) {
	      buffer[i] = ((-value) & 255) ^ 255;
	      value /= 256;
	    }
	  }

	  // https://github.com/retrofox/is-array
	  function _isArray(val) {
	    return !!val && "[object Array]" == Object.prototype.toString.call(val);
	  }

	}(typeof exports === 'object' && typeof exports.nodeName !== 'string' ? exports : (this || {}));


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// util.js

	var Int64Buffer = __webpack_require__(16);
	var Uint64BE = Int64Buffer.Uint64BE;
	var Int64BE = Int64Buffer.Int64BE;

	var MAXBUFLEN = 8192;

	exports.writeString = writeString;
	exports.readString = readString;
	exports.byteLength = byteLength;
	exports.copy = copy;
	exports.writeUint64BE = writeUint64BE;
	exports.writeInt64BE = writeInt64BE;

	// new Buffer(string, "utf-8") is SLOWER then below

	function writeString(string, start) {
	  var buffer = this;
	  var index = start || 0;
	  var length = string.length;
	  // JavaScript's string uses UTF-16 surrogate pairs for characters other than BMP.
	  // This encodes string as CESU-8 which never reaches 4 octets per character.
	  for (var i = 0; i < length; i++) {
	    var chr = string.charCodeAt(i);
	    if (chr < 0x80) {
	      buffer[index++] = chr;
	    } else if (chr < 0x800) {
	      buffer[index++] = 0xC0 | (chr >> 6);
	      buffer[index++] = 0x80 | (chr & 0x3F);
	    } else {
	      buffer[index++] = 0xE0 | (chr >> 12);
	      buffer[index++] = 0x80 | ((chr >> 6) & 0x3F);
	      buffer[index++] = 0x80 | (chr & 0x3F);
	    }
	  }
	  return index - start;
	}

	// Buffer.ptototype.toString is 2x FASTER then below
	// https://github.com/feross/buffer may throw "Maximum call stack size exceeded." at String.fromCharCode.apply.

	function readString(start, end) {
	  var buffer = this;
	  var index = start - 0 || 0;
	  if (!end) end = buffer.length;
	  var size = end - start;
	  if (size > MAXBUFLEN) size = MAXBUFLEN;
	  var out = [];
	  for (; index < end;) {
	    var array = new Array(size);
	    for (var pos = 0; pos < size && index < end;) {
	      var chr = buffer[index++];
	      chr = (chr < 0x80) ? chr :
	        (chr < 0xE0) ? (((chr & 0x3F) << 6) | (buffer[index++] & 0x3F)) :
	          (((chr & 0x3F) << 12) | ((buffer[index++] & 0x3F) << 6) | ((buffer[index++] & 0x3F)));
	      array[pos++] = chr;
	    }
	    if (pos < size) array = array.slice(0, pos);
	    out.push(String.fromCharCode.apply("", array));
	  }
	  return (out.length > 1) ? out.join("") : out.length ? out.shift() : "";
	}

	// Buffer.byteLength is FASTER than below

	function byteLength(string) {
	  var length = 0 | 0;
	  Array.prototype.forEach.call(string, function(chr) {
	    var code = chr.charCodeAt(0);
	    length += (code < 0x80) ? 1 : (code < 0x800) ? 2 : 3;
	  });
	  return length;
	}

	// https://github.com/feross/buffer lacks descending copying feature

	function copy(target, targetStart, start, end) {
	  var i;
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (!targetStart) targetStart = 0;
	  var len = end - start;

	  if (target === this && start < targetStart && targetStart < end) {
	    // descending
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else {
	    // ascending
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start];
	    }
	  }

	  return len;
	}

	function writeUint64BE(value, offset) {
	  new Uint64BE(this, offset, value);
	}

	function writeInt64BE(value, offset) {
	  new Int64BE(this, offset, value);
	}


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// read-token.js

	var ReadFormat = __webpack_require__(14);

	exports.getReadToken = getReadToken;

	function getReadToken(options) {
	  var format = ReadFormat.getReadFormat(options);

	  if (options && options.useraw) {
	    return init_useraw(format);
	  } else {
	    return init_token(format);
	  }
	}

	function init_token(format) {
	  var i;
	  var token = new Array(256);

	  // positive fixint -- 0x00 - 0x7f
	  for (i = 0x00; i <= 0x7f; i++) {
	    token[i] = constant(i);
	  }

	  // fixmap -- 0x80 - 0x8f
	  for (i = 0x80; i <= 0x8f; i++) {
	    token[i] = fix(i - 0x80, format.map);
	  }

	  // fixarray -- 0x90 - 0x9f
	  for (i = 0x90; i <= 0x9f; i++) {
	    token[i] = fix(i - 0x90, format.array);
	  }

	  // fixstr -- 0xa0 - 0xbf
	  for (i = 0xa0; i <= 0xbf; i++) {
	    token[i] = fix(i - 0xa0, format.str);
	  }

	  // nil -- 0xc0
	  token[0xc0] = constant(null);

	  // (never used) -- 0xc1
	  token[0xc1] = null;

	  // false -- 0xc2
	  // true -- 0xc3
	  token[0xc2] = constant(false);
	  token[0xc3] = constant(true);

	  // bin 8 -- 0xc4
	  // bin 16 -- 0xc5
	  // bin 32 -- 0xc6
	  token[0xc4] = flex(format.uint8, format.bin);
	  token[0xc5] = flex(format.uint16, format.bin);
	  token[0xc6] = flex(format.uint32, format.bin);

	  // ext 8 -- 0xc7
	  // ext 16 -- 0xc8
	  // ext 32 -- 0xc9
	  token[0xc7] = flex(format.uint8, format.ext);
	  token[0xc8] = flex(format.uint16, format.ext);
	  token[0xc9] = flex(format.uint32, format.ext);

	  // float 32 -- 0xca
	  // float 64 -- 0xcb
	  token[0xca] = format.float32;
	  token[0xcb] = format.float64;

	  // uint 8 -- 0xcc
	  // uint 16 -- 0xcd
	  // uint 32 -- 0xce
	  // uint 64 -- 0xcf
	  token[0xcc] = format.uint8;
	  token[0xcd] = format.uint16;
	  token[0xce] = format.uint32;
	  token[0xcf] = format.uint64;

	  // int 8 -- 0xd0
	  // int 16 -- 0xd1
	  // int 32 -- 0xd2
	  // int 64 -- 0xd3
	  token[0xd0] = format.int8;
	  token[0xd1] = format.int16;
	  token[0xd2] = format.int32;
	  token[0xd3] = format.int64;

	  // fixext 1 -- 0xd4
	  // fixext 2 -- 0xd5
	  // fixext 4 -- 0xd6
	  // fixext 8 -- 0xd7
	  // fixext 16 -- 0xd8
	  token[0xd4] = fix(1, format.ext);
	  token[0xd5] = fix(2, format.ext);
	  token[0xd6] = fix(4, format.ext);
	  token[0xd7] = fix(8, format.ext);
	  token[0xd8] = fix(16, format.ext);

	  // str 8 -- 0xd9
	  // str 16 -- 0xda
	  // str 32 -- 0xdb
	  token[0xd9] = flex(format.uint8, format.str);
	  token[0xda] = flex(format.uint16, format.str);
	  token[0xdb] = flex(format.uint32, format.str);

	  // array 16 -- 0xdc
	  // array 32 -- 0xdd
	  token[0xdc] = flex(format.uint16, format.array);
	  token[0xdd] = flex(format.uint32, format.array);

	  // map 16 -- 0xde
	  // map 32 -- 0xdf
	  token[0xde] = flex(format.uint16, format.map);
	  token[0xdf] = flex(format.uint32, format.map);

	  // negative fixint -- 0xe0 - 0xff
	  for (i = 0xe0; i <= 0xff; i++) {
	    token[i] = constant(i - 0x100);
	  }

	  return token;
	}

	function init_useraw(format) {
	  var i;
	  var token = getReadToken(format).slice();

	  // raw 8 -- 0xd9
	  // raw 16 -- 0xda
	  // raw 32 -- 0xdb
	  token[0xd9] = token[0xc4];
	  token[0xda] = token[0xc5];
	  token[0xdb] = token[0xc6];

	  // fixraw -- 0xa0 - 0xbf
	  for (i = 0xa0; i <= 0xbf; i++) {
	    token[i] = fix(i - 0xa0, format.bin);
	  }

	  return token;
	}

	function constant(value) {
	  return function() {
	    return value;
	  };
	}

	function flex(lenFunc, decodeFunc) {
	  return function(decoder) {
	    var len = lenFunc(decoder);
	    return decodeFunc(decoder, len);
	  };
	}

	function fix(len, method) {
	  return function(decoder) {
	    return method(decoder, len);
	  };
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// write-core.js

	exports.getEncoder = getEncoder;

	var WriteType = __webpack_require__(20);

	function getEncoder(options) {
	  var writeType = WriteType.getWriteType(options);
	  return encode;

	  function encode(encoder, value) {
	    var func = writeType[typeof value];
	    if (!func) throw new Error("Unsupported type \"" + (typeof value) + "\": " + value);
	    func(encoder, value);
	  }
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// write-type.js

	var IS_ARRAY = __webpack_require__(7);
	var Int64Buffer = __webpack_require__(16);
	var Uint64BE = Int64Buffer.Uint64BE;
	var Int64BE = Int64Buffer.Int64BE;

	var BufferLite = __webpack_require__(17);
	var WriteToken = __webpack_require__(21);
	var uint8 = __webpack_require__(22).uint8;
	var ExtBuffer = __webpack_require__(8).ExtBuffer;

	var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);

	var extmap = [];
	extmap[1] = 0xd4;
	extmap[2] = 0xd5;
	extmap[4] = 0xd6;
	extmap[8] = 0xd7;
	extmap[16] = 0xd8;

	exports.getWriteType = getWriteType;

	function getWriteType(options) {
	  var token = WriteToken.getWriteToken(options);

	  var writeType = {
	    "boolean": bool,
	    "function": nil,
	    "number": number,
	    "object": object,
	    "string": string,
	    "symbol": nil,
	    "undefined": nil
	  };

	  if (options && options.useraw) {
	    writeType.object = object_raw;
	    writeType.string = string_raw;
	  }

	  return writeType;

	  // false -- 0xc2
	  // true -- 0xc3
	  function bool(encoder, value) {
	    var type = value ? 0xc3 : 0xc2;
	    token[type](encoder, value);
	  }

	  function number(encoder, value) {
	    var ivalue = value | 0;
	    var type;
	    if (value !== ivalue) {
	      // float 64 -- 0xcb
	      type = 0xcb;
	      token[type](encoder, value);
	      return;
	    } else if (-0x20 <= ivalue && ivalue <= 0x7F) {
	      // positive fixint -- 0x00 - 0x7f
	      // negative fixint -- 0xe0 - 0xff
	      type = ivalue & 0xFF;
	    } else if (0 <= ivalue) {
	      // uint 8 -- 0xcc
	      // uint 16 -- 0xcd
	      // uint 32 -- 0xce
	      type = (ivalue <= 0xFF) ? 0xcc : (ivalue <= 0xFFFF) ? 0xcd : 0xce;
	    } else {
	      // int 8 -- 0xd0
	      // int 16 -- 0xd1
	      // int 32 -- 0xd2
	      type = (-0x80 <= ivalue) ? 0xd0 : (-0x8000 <= ivalue) ? 0xd1 : 0xd2;
	    }
	    token[type](encoder, ivalue);
	  }

	  // uint 64 -- 0xcf
	  function uint64(encoder, value) {
	    var type = 0xcf;
	    token[type](encoder, value.toArray());
	  }

	  // int 64 -- 0xd3
	  function int64(encoder, value) {
	    var type = 0xd3;
	    token[type](encoder, value.toArray());
	  }

	  // str 8 -- 0xd9
	  // str 16 -- 0xda
	  // str 32 -- 0xdb
	  // fixstr -- 0xa0 - 0xbf
	  function string(encoder, value) {
	    // prepare buffer
	    var length = value.length;
	    var maxsize = 5 + length * 3;
	    encoder.reserve(maxsize);

	    // expected header size
	    var expected = (length < 32) ? 1 : (length <= 0xFF) ? 2 : (length <= 0xFFFF) ? 3 : 5;

	    // expected start point
	    var start = encoder.offset + expected;

	    // write string
	    length = BufferLite.writeString.call(encoder.buffer, value, start);

	    // actual header size
	    var actual = (length < 32) ? 1 : (length <= 0xFF) ? 2 : (length <= 0xFFFF) ? 3 : 5;

	    // move content when needed
	    if (expected !== actual) move(encoder, start, length, actual - expected);

	    // write header
	    var type = (actual === 1) ? (0xa0 + length) : (actual <= 3) ? 0xd7 + actual : 0xdb;
	    token[type](encoder, length);

	    // move cursor
	    encoder.offset += length;
	  }

	  function object(encoder, value) {
	    // null
	    if (value === null) return nil(encoder, value);

	    // Buffer
	    if (Buffer.isBuffer(value)) return bin(encoder, value);

	    // Array
	    if (IS_ARRAY(value)) return array(encoder, value);

	    // int64-buffer objects
	    if (Uint64BE.isUint64BE(value)) return uint64(encoder, value);
	    if (Int64BE.isInt64BE(value)) return int64(encoder, value);

	    // ext formats
	    var packer = encoder.codec.getExtPacker(value);
	    if (packer) value = packer(value);
	    if (value instanceof ExtBuffer) return ext(encoder, value);

	    // plain old objects
	    map(encoder, value);
	  }

	  // nil -- 0xc0
	  function nil(encoder, value) {
	    var type = 0xc0;
	    token[type](encoder, value);
	  }

	  // fixarray -- 0x90 - 0x9f
	  // array 16 -- 0xdc
	  // array 32 -- 0xdd
	  function array(encoder, value) {
	    var length = value.length;
	    var type = (length < 16) ? (0x90 + length) : (length <= 0xFFFF) ? 0xdc : 0xdd;
	    token[type](encoder, length);

	    var encode = encoder.codec.encode;
	    for (var i = 0; i < length; i++) {
	      encode(encoder, value[i]);
	    }
	  }

	  // bin 8 -- 0xc4
	  // bin 16 -- 0xc5
	  // bin 32 -- 0xc6
	  function bin(encoder, value) {
	    var length = value.length;
	    var type = (length < 0xFF) ? 0xc4 : (length <= 0xFFFF) ? 0xc5 : 0xc6;
	    token[type](encoder, length);
	    encoder.send(value);
	  }

	  // fixext 1 -- 0xd4
	  // fixext 2 -- 0xd5
	  // fixext 4 -- 0xd6
	  // fixext 8 -- 0xd7
	  // fixext 16 -- 0xd8
	  // ext 8 -- 0xc7
	  // ext 16 -- 0xc8
	  // ext 32 -- 0xc9
	  function ext(encoder, value) {
	    var buffer = value.buffer;
	    var length = buffer.length;
	    var type = extmap[length] || ((length < 0xFF) ? 0xc7 : (length <= 0xFFFF) ? 0xc8 : 0xc9);
	    token[type](encoder, length);
	    uint8[value.type](encoder);
	    encoder.send(buffer);
	  }

	  // fixmap -- 0x80 - 0x8f
	  // map 16 -- 0xde
	  // map 32 -- 0xdf
	  function map(encoder, value) {
	    var keys = Object.keys(value);
	    var length = keys.length;
	    var type = (length < 16) ? (0x80 + length) : (length <= 0xFFFF) ? 0xde : 0xdf;
	    token[type](encoder, length);

	    var encode = encoder.codec.encode;
	    keys.forEach(function(key) {
	      encode(encoder, key);
	      encode(encoder, value[key]);
	    });
	  }

	  // raw 16 -- 0xda
	  // raw 32 -- 0xdb
	  // fixraw -- 0xa0 - 0xbf
	  function string_raw(encoder, value) {
	    // prepare buffer
	    var length = value.length;
	    var maxsize = 5 + length * 3;
	    encoder.reserve(maxsize);

	    // expected header size
	    var expected = (length < 32) ? 1 : (length <= 0xFFFF) ? 3 : 5;

	    // expected start point
	    var start = encoder.offset + expected;

	    // write string
	    length = BufferLite.writeString.call(encoder.buffer, value, start);

	    // actual header size
	    var actual = (length < 32) ? 1 : (length <= 0xFFFF) ? 3 : 5;

	    // move content when needed
	    if (expected !== actual) move(encoder, start, length, actual - expected);

	    // write header
	    var type = (length < 32) ? (0xa0 + length) : (length <= 0xFFFF) ? 0xda : 0xdb;
	    token[type](encoder, length);

	    // move cursor
	    encoder.offset += length;
	  }

	  // raw 16 -- 0xda
	  // raw 32 -- 0xdb
	  // fixraw -- 0xa0 - 0xbf
	  function object_raw(encoder, value) {
	    if (!Buffer.isBuffer(value)) return object(encoder, value);

	    var length = value.length;
	    var type = (length < 32) ? (0xa0 + length) : (length <= 0xFFFF) ? 0xda : 0xdb;
	    token[type](encoder, length);
	    encoder.send(value);
	  }
	}

	function move(encoder, start, length, diff) {
	  var targetStart = start + diff;
	  var end = start + length;
	  if (IS_BUFFER_SHIM) {
	    BufferLite.copy.call(encoder.buffer, encoder.buffer, targetStart, start, end);
	  } else {
	    encoder.buffer.copy(encoder.buffer, targetStart, start, end);
	  }
	}


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// write-token.js

	var BufferLite = __webpack_require__(17);
	var uint8 = __webpack_require__(22).uint8;

	var IS_BUFFER_SHIM = ("TYPED_ARRAY_SUPPORT" in Buffer);
	var NO_TYPED_ARRAY = IS_BUFFER_SHIM && !Buffer.TYPED_ARRAY_SUPPORT;

	exports.getWriteToken = getWriteToken;

	function getWriteToken(options) {
	  if (NO_TYPED_ARRAY || (options && options.safe)) {
	    return init_safe();
	  } else {
	    return init_token();
	  }
	}

	// Node.js and browsers with TypedArray

	function init_token() {
	  // (immediate values)
	  // positive fixint -- 0x00 - 0x7f
	  // nil -- 0xc0
	  // false -- 0xc2
	  // true -- 0xc3
	  // negative fixint -- 0xe0 - 0xff
	  var token = uint8.slice();

	  // bin 8 -- 0xc4
	  // bin 16 -- 0xc5
	  // bin 32 -- 0xc6
	  token[0xc4] = write1(0xc4);
	  token[0xc5] = write2(0xc5);
	  token[0xc6] = write4(0xc6);

	  // ext 8 -- 0xc7
	  // ext 16 -- 0xc8
	  // ext 32 -- 0xc9
	  token[0xc7] = write1(0xc7);
	  token[0xc8] = write2(0xc8);
	  token[0xc9] = write4(0xc9);

	  // float 32 -- 0xca
	  // float 64 -- 0xcb
	  token[0xca] = writeN(0xca, 4, Buffer.prototype.writeFloatBE, true);
	  token[0xcb] = writeN(0xcb, 8, Buffer.prototype.writeDoubleBE, true);

	  // uint 8 -- 0xcc
	  // uint 16 -- 0xcd
	  // uint 32 -- 0xce
	  // uint 64 -- 0xcf
	  token[0xcc] = write1(0xcc);
	  token[0xcd] = write2(0xcd);
	  token[0xce] = write4(0xce);
	  token[0xcf] = writeN(0xcf, 8, BufferLite.writeUint64BE);

	  // int 8 -- 0xd0
	  // int 16 -- 0xd1
	  // int 32 -- 0xd2
	  // int 64 -- 0xd3
	  token[0xd0] = write1(0xd0);
	  token[0xd1] = write2(0xd1);
	  token[0xd2] = write4(0xd2);
	  token[0xd3] = writeN(0xd3, 8, BufferLite.writeUint64BE);

	  // str 8 -- 0xd9
	  // str 16 -- 0xda
	  // str 32 -- 0xdb
	  token[0xd9] = write1(0xd9);
	  token[0xda] = write2(0xda);
	  token[0xdb] = write4(0xdb);

	  // array 16 -- 0xdc
	  // array 32 -- 0xdd
	  token[0xdc] = write2(0xdc);
	  token[0xdd] = write4(0xdd);

	  // map 16 -- 0xde
	  // map 32 -- 0xdf
	  token[0xde] = write2(0xde);
	  token[0xdf] = write4(0xdf);

	  return token;
	}

	// safe mode: for old browsers and who needs asserts

	function init_safe() {
	  // (immediate values)
	  // positive fixint -- 0x00 - 0x7f
	  // nil -- 0xc0
	  // false -- 0xc2
	  // true -- 0xc3
	  // negative fixint -- 0xe0 - 0xff
	  var token = uint8.slice();

	  // bin 8 -- 0xc4
	  // bin 16 -- 0xc5
	  // bin 32 -- 0xc6
	  token[0xc4] = writeN(0xc4, 1, Buffer.prototype.writeUInt8);
	  token[0xc5] = writeN(0xc5, 2, Buffer.prototype.writeUInt16BE);
	  token[0xc6] = writeN(0xc6, 4, Buffer.prototype.writeUInt32BE);

	  // ext 8 -- 0xc7
	  // ext 16 -- 0xc8
	  // ext 32 -- 0xc9
	  token[0xc7] = writeN(0xc7, 1, Buffer.prototype.writeUInt8);
	  token[0xc8] = writeN(0xc8, 2, Buffer.prototype.writeUInt16BE);
	  token[0xc9] = writeN(0xc9, 4, Buffer.prototype.writeUInt32BE);

	  // float 32 -- 0xca
	  // float 64 -- 0xcb
	  token[0xca] = writeN(0xca, 4, Buffer.prototype.writeFloatBE);
	  token[0xcb] = writeN(0xcb, 8, Buffer.prototype.writeDoubleBE);

	  // uint 8 -- 0xcc
	  // uint 16 -- 0xcd
	  // uint 32 -- 0xce
	  // uint 64 -- 0xcf
	  token[0xcc] = writeN(0xcc, 1, Buffer.prototype.writeUInt8);
	  token[0xcd] = writeN(0xcd, 2, Buffer.prototype.writeUInt16BE);
	  token[0xce] = writeN(0xce, 4, Buffer.prototype.writeUInt32BE);
	  token[0xcf] = writeN(0xcf, 8, BufferLite.writeUint64BE);

	  // int 8 -- 0xd0
	  // int 16 -- 0xd1
	  // int 32 -- 0xd2
	  // int 64 -- 0xd3
	  token[0xd0] = writeN(0xd0, 1, Buffer.prototype.writeInt8);
	  token[0xd1] = writeN(0xd1, 2, Buffer.prototype.writeInt16BE);
	  token[0xd2] = writeN(0xd2, 4, Buffer.prototype.writeInt32BE);
	  token[0xd3] = writeN(0xd3, 8, BufferLite.writeUint64BE);

	  // str 8 -- 0xd9
	  // str 16 -- 0xda
	  // str 32 -- 0xdb
	  token[0xd9] = writeN(0xd9, 1, Buffer.prototype.writeUInt8);
	  token[0xda] = writeN(0xda, 2, Buffer.prototype.writeUInt16BE);
	  token[0xdb] = writeN(0xdb, 4, Buffer.prototype.writeUInt32BE);

	  // array 16 -- 0xdc
	  // array 32 -- 0xdd
	  token[0xdc] = writeN(0xdc, 2, Buffer.prototype.writeUInt16BE);
	  token[0xdd] = writeN(0xdd, 4, Buffer.prototype.writeUInt32BE);

	  // map 16 -- 0xde
	  // map 32 -- 0xdf
	  token[0xde] = writeN(0xde, 2, Buffer.prototype.writeUInt16BE);
	  token[0xdf] = writeN(0xdf, 4, Buffer.prototype.writeUInt32BE);

	  return token;
	}

	function write1(type) {
	  return function(encoder, value) {
	    encoder.reserve(2);
	    var buffer = encoder.buffer;
	    var offset = encoder.offset;
	    buffer[offset++] = type;
	    buffer[offset++] = value;
	    encoder.offset = offset;
	  };
	}

	function write2(type) {
	  return function(encoder, value) {
	    encoder.reserve(3);
	    var buffer = encoder.buffer;
	    var offset = encoder.offset;
	    buffer[offset++] = type;
	    buffer[offset++] = value >>> 8;
	    buffer[offset++] = value;
	    encoder.offset = offset;
	  };
	}

	function write4(type) {
	  return function(encoder, value) {
	    encoder.reserve(5);
	    var buffer = encoder.buffer;
	    var offset = encoder.offset;
	    buffer[offset++] = type;
	    buffer[offset++] = value >>> 24;
	    buffer[offset++] = value >>> 16;
	    buffer[offset++] = value >>> 8;
	    buffer[offset++] = value;
	    encoder.offset = offset;
	  };
	}

	function writeN(type, len, method, noAssert) {
	  return function(encoder, value) {
	    encoder.reserve(len + 1);
	    encoder.buffer[encoder.offset++] = type;
	    method.call(encoder.buffer, value, encoder.offset, noAssert);
	    encoder.offset += len;
	  };
	}


/***/ },
/* 22 */
/***/ function(module, exports) {

	// write-unit8.js

	var constant = exports.uint8 = new Array(256);

	for (var i = 0x00; i <= 0xFF; i++) {
	  constant[i] = write0(i);
	}

	function write0(type) {
	  return function(encoder) {
	    encoder.reserve(1);
	    encoder.buffer[encoder.offset++] = type;
	  };
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	// encoder.js

	exports.Encoder = Encoder;

	var EventLite = __webpack_require__(24);
	var EncodeBuffer = __webpack_require__(4).EncodeBuffer;

	function Encoder(options) {
	  if (!(this instanceof Encoder)) return new Encoder(options);
	  EncodeBuffer.call(this, options);
	}

	Encoder.prototype = new EncodeBuffer();

	EventLite.mixin(Encoder.prototype);

	Encoder.prototype.encode = function(chunk) {
	  this.write(chunk);
	  this.emit("data", this.read());
	};

	Encoder.prototype.end = function(chunk) {
	  if (arguments.length) this.encode(chunk);
	  this.flush();
	  this.emit("end");
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * event-lite.js - Light-weight EventEmitter (less than 1KB when gzipped)
	 *
	 * @copyright Yusuke Kawasaki
	 * @license MIT
	 * @constructor
	 * @see https://github.com/kawanet/event-lite
	 * @see http://kawanet.github.io/event-lite/EventLite.html
	 * @example
	 * var EventLite = require("event-lite");
	 *
	 * function MyClass() {...}             // your class
	 *
	 * EventLite.mixin(MyClass.prototype);  // import event methods
	 *
	 * var obj = new MyClass();
	 * obj.on("foo", function() {...});     // add event listener
	 * obj.once("bar", function() {...});   // add one-time event listener
	 * obj.emit("foo");                     // dispatch event
	 * obj.emit("bar");                     // dispatch another event
	 * obj.off("foo");                      // remove event listener
	 */

	function EventLite() {
	  if (!(this instanceof EventLite)) return new EventLite();
	}

	(function(EventLite) {
	  // export the class for node.js
	  if (true) module.exports = EventLite;

	  // property name to hold listeners
	  var LISTENERS = "listeners";

	  // methods to export
	  var methods = {
	    on: on,
	    once: once,
	    off: off,
	    emit: emit
	  };

	  // mixin to self
	  mixin(EventLite.prototype);

	  // export mixin function
	  EventLite.mixin = mixin;

	  /**
	   * Import on(), once(), off() and emit() methods into target object.
	   *
	   * @function EventLite.mixin
	   * @param target {Prototype}
	   */

	  function mixin(target) {
	    for (var key in methods) {
	      target[key] = methods[key];
	    }
	    return target;
	  }

	  /**
	   * Add an event listener.
	   *
	   * @function EventLite.prototype.on
	   * @param type {string}
	   * @param func {Function}
	   * @returns {EventLite} Self for method chaining
	   */

	  function on(type, func) {
	    getListeners(this, type).push(func);
	    return this;
	  }

	  /**
	   * Add one-time event listener.
	   *
	   * @function EventLite.prototype.once
	   * @param type {string}
	   * @param func {Function}
	   * @returns {EventLite} Self for method chaining
	   */

	  function once(type, func) {
	    var that = this;
	    wrap.originalListener = func;
	    getListeners(that, type).push(wrap);
	    return that;

	    function wrap() {
	      off.call(that, type, wrap);
	      func.apply(this, arguments);
	    }
	  }

	  /**
	   * Remove an event listener.
	   *
	   * @function EventLite.prototype.off
	   * @param [type] {string}
	   * @param [func] {Function}
	   * @returns {EventLite} Self for method chaining
	   */

	  function off(type, func) {
	    var that = this;
	    var listners;
	    if (!arguments.length) {
	      delete that[LISTENERS];
	    } else if (!func) {
	      listners = that[LISTENERS];
	      if (listners) {
	        delete listners[type];
	        if (!Object.keys(listners).length) return off.call(that);
	      }
	    } else {
	      listners = getListeners(that, type, true);
	      if (listners) {
	        listners = listners.filter(ne);
	        if (!listners.length) return off.call(that, type);
	        that[LISTENERS][type] = listners;
	      }
	    }
	    return that;

	    function ne(test) {
	      return test !== func && test.originalListener !== func;
	    }
	  }

	  /**
	   * Dispatch (trigger) an event.
	   *
	   * @function EventLite.prototype.emit
	   * @param type {string}
	   * @param [value] {*}
	   * @returns {boolean} True when a listener received the event
	   */

	  function emit(type, value) {
	    var that = this;
	    var listeners = getListeners(that, type, true);
	    if (!listeners) return false;
	    var arglen = arguments.length;
	    if (arglen === 1) {
	      listeners.forEach(zeroarg);
	    } else if (arglen === 2) {
	      listeners.forEach(onearg);
	    } else {
	      var args = Array.prototype.slice.call(arguments, 1);
	      listeners.forEach(moreargs);
	    }
	    return !!listeners.length;

	    function zeroarg(func) {
	      func.call(that);
	    }

	    function onearg(func) {
	      func.call(that, value);
	    }

	    function moreargs(func) {
	      func.apply(that, args);
	    }
	  }

	  /**
	   * @ignore
	   */

	  function getListeners(that, type, readonly) {
	    if (readonly && !that[LISTENERS]) return;
	    var listeners = that[LISTENERS] || (that[LISTENERS] = {});
	    return listeners[type] || (listeners[type] = []);
	  }

	})(EventLite);


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// decoder.js

	exports.Decoder = Decoder;

	var EventLite = __webpack_require__(24);
	var DecodeBuffer = __webpack_require__(11).DecodeBuffer;

	function Decoder(options) {
	  if (!(this instanceof Decoder)) return new Decoder(options);
	  DecodeBuffer.call(this, options);
	}

	Decoder.prototype = new DecodeBuffer();

	EventLite.mixin(Decoder.prototype);

	Decoder.prototype.decode = function(chunk) {
	  if (arguments.length) this.write(chunk);
	  this.flush();
	};

	Decoder.prototype.push = function(chunk) {
	  this.emit("data", chunk);
	};

	Decoder.prototype.end = function(chunk) {
	  this.decode(chunk);
	  this.emit("end");
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// encode-stream.js

	exports.createEncodeStream = EncodeStream;

	var util = __webpack_require__(27);
	var Transform = __webpack_require__(28).Transform;
	var EncodeBuffer = __webpack_require__(4).EncodeBuffer;

	util.inherits(EncodeStream, Transform);

	var DEFAULT_OPTIONS = {objectMode: true};

	function EncodeStream(options) {
	  if (!(this instanceof EncodeStream)) return new EncodeStream(options);
	  if (options) {
	    options.objectMode = true;
	  } else {
	    options = DEFAULT_OPTIONS;
	  }
	  Transform.call(this, options);

	  var stream = this;
	  var encoder = this.encoder = new EncodeBuffer(options);
	  encoder.push = function(chunk) {
	    stream.push(chunk);
	  };
	}

	EncodeStream.prototype._transform = function(chunk, encoding, callback) {
	  this.encoder.write(chunk);
	  if (callback) callback();
	};

	EncodeStream.prototype._flush = function(callback) {
	  this.encoder.flush();
	  if (callback) callback();
	};


/***/ },
/* 27 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// decode-stream.js

	exports.createDecodeStream = DecodeStream;

	var util = __webpack_require__(27);
	var Transform = __webpack_require__(28).Transform;
	var DecodeBuffer = __webpack_require__(11).DecodeBuffer;

	util.inherits(DecodeStream, Transform);

	var DEFAULT_OPTIONS = {objectMode: true};

	function DecodeStream(options) {
	  if (!(this instanceof DecodeStream)) return new DecodeStream(options);
	  if (options) {
	    options.objectMode = true;
	  } else {
	    options = DEFAULT_OPTIONS;
	  }
	  Transform.call(this, options);
	  var stream = this;
	  var decoder = this.decoder = new DecodeBuffer(options);
	  decoder.push = function(chunk) {
	    stream.push(chunk);
	  };
	}

	DecodeStream.prototype._transform = function(chunk, encoding, callback) {
	  this.decoder.write(chunk);
	  this.decoder.flush();
	  if (callback) callback();
	};


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var mp = __webpack_require__(2);
	var rp = __webpack_require__(31);
	var lh = __webpack_require__(32);

	module.exports = function () {
	    function _class(inputMP) {
	        _classCallCheck(this, _class);

	        var requestParser = new rp();
	        this.request = requestParser.parse(inputMP);
	        this.process();
	    }

	    _createClass(_class, [{
	        key: 'process',
	        value: function process() {
	            if (this.request.path == "user/login") {
	                new lh().handle(this.request);
	            }
	            // .. Write more handlers here
	        }
	    }]);

	    return _class;
	}();

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var mp = __webpack_require__(2);

	module.exports = function () {
	    function _class() {
	        _classCallCheck(this, _class);
	    }

	    _createClass(_class, [{
	        key: 'parse',
	        value: function parse(input) {
	            return mp.decode(input);
	        }
	    }]);

	    return _class;
	}();

/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	module.exports = function () {
	    function _class() {
	        _classCallCheck(this, _class);
	    }

	    _createClass(_class, [{
	        key: 'handle',
	        value: function handle(req) {
	            console.log('Loggin attempt for ' + req.name);
	            if (req.pass == "myPass") {
	                console.log('- Loggin succesfull');
	            }
	        }
	    }]);

	    return _class;
	}();

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	module.exports = __webpack_require__(34);
	module.exports.Server = __webpack_require__(52);
	module.exports.Sender = __webpack_require__(42);
	module.exports.Receiver = __webpack_require__(46);


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var util = __webpack_require__(27)
	  , events = __webpack_require__(35)
	  , http = __webpack_require__(36)
	  , https = __webpack_require__(37)
	  , crypto = __webpack_require__(38)
	  , url = __webpack_require__(39)
	  , fs = __webpack_require__(40)
	  , Options = __webpack_require__(41)
	  , Sender = __webpack_require__(42)
	  , Receiver = __webpack_require__(46)
	  , SenderHixie = __webpack_require__(50)
	  , ReceiverHixie = __webpack_require__(51);

	/**
	 * Constants
	 */

	// Default protocol version

	var protocolVersion = 13;

	// Close timeout

	var closeTimeout = 30000; // Allow 5 seconds to terminate the connection cleanly

	/**
	 * Node version 0.4 and 0.6 compatibility
	 */

	var isNodeV4 = /^v0\.4/.test(process.version);

	/**
	 * WebSocket implementation
	 */

	function WebSocket(address, options) {
	  var self = this;

	  this._socket = null;
	  this.bytesReceived = 0;
	  this.readyState = null;
	  this.supports = {};

	  if (Object.prototype.toString.call(address) == '[object Array]') {
	    initAsServerClient.apply(this, address.concat(options));
	  }
	  else initAsClient.apply(this, arguments);
	}

	/**
	 * Inherits from EventEmitter.
	 */

	util.inherits(WebSocket, events.EventEmitter);

	/**
	 * Ready States
	 */

	WebSocket.CONNECTING = 0;
	WebSocket.OPEN = 1;
	WebSocket.CLOSING = 2;
	WebSocket.CLOSED = 3;

	/**
	 * Gracefully closes the connection, after sending a description message to the server
	 *
	 * @param {Object} data to be sent to the server
	 * @api public
	 */

	WebSocket.prototype.close = function(code, data) {
	  if (this.readyState == WebSocket.CLOSING || this.readyState == WebSocket.CLOSED) return;
	  if (this.readyState == WebSocket.CONNECTING) {
	    this.readyState = WebSocket.CLOSED;
	    return;
	  }
	  try {
	    this.readyState = WebSocket.CLOSING;
	    this._closeCode = code;
	    this._closeMessage = data;
	    var mask = !this._isServer;
	    this._sender.close(code, data, mask);
	  }
	  catch (e) {
	    this.emit('error', e);
	  }
	  finally {
	    this.terminate();
	  }
	}

	/**
	 * Pause the client stream
	 *
	 * @api public
	 */

	WebSocket.prototype.pause = function() {
	  if (this.readyState != WebSocket.OPEN) throw new Error('not opened');
	  return this._socket.pause();
	}

	/**
	 * Sends a ping
	 *
	 * @param {Object} data to be sent to the server
	 * @param {Object} Members - mask: boolean, binary: boolean
	 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
	 * @api public
	 */

	WebSocket.prototype.ping = function(data, options, dontFailWhenClosed) {
	  if (this.readyState != WebSocket.OPEN) {
	    if (dontFailWhenClosed === true) return;
	    throw new Error('not opened');
	  }
	  options = options || {};
	  if (typeof options.mask == 'undefined') options.mask = !this._isServer;
	  this._sender.ping(data, options);
	}

	/**
	 * Sends a pong
	 *
	 * @param {Object} data to be sent to the server
	 * @param {Object} Members - mask: boolean, binary: boolean
	 * @param {boolean} dontFailWhenClosed indicates whether or not to throw if the connection isnt open
	 * @api public
	 */

	WebSocket.prototype.pong = function(data, options, dontFailWhenClosed) {
	  if (this.readyState != WebSocket.OPEN) {
	    if (dontFailWhenClosed === true) return;
	    throw new Error('not opened');
	  }
	  options = options || {};
	  if (typeof options.mask == 'undefined') options.mask = !this._isServer;
	  this._sender.pong(data, options);
	}

	/**
	 * Resume the client stream
	 *
	 * @api public
	 */

	WebSocket.prototype.resume = function() {
	  if (this.readyState != WebSocket.OPEN) throw new Error('not opened');
	  return this._socket.resume();
	}

	/**
	 * Sends a piece of data
	 *
	 * @param {Object} data to be sent to the server
	 * @param {Object} Members - mask: boolean, binary: boolean
	 * @param {function} Optional callback which is executed after the send completes
	 * @api public
	 */

	WebSocket.prototype.send = function(data, options, cb) {
	  if (typeof options == 'function') {
	    cb = options;
	    options = {};
	  }
	  if (this.readyState != WebSocket.OPEN) {
	    if (typeof cb == 'function') cb(new Error('not opened'));
	    else throw new Error('not opened');
	    return;
	  }
	  if (!data) data = '';
	  if (this._queue) {
	    var self = this;
	    this._queue.push(function() { self.send(data, options, cb); });
	    return;
	  }
	  options = options || {};
	  options.fin = true;
	  if (typeof options.mask == 'undefined') options.mask = !this._isServer;
	  if (data instanceof fs.ReadStream) {
	    startQueue(this);
	    var self = this;
	    sendStream(this, data, options, function(error) {
	      process.nextTick(function() { executeQueueSends(self); });
	      if (typeof cb == 'function') cb(error);
	    });
	  }
	  else return this._sender.send(data, options, cb);
	}

	/**
	 * Streams data through calls to a user supplied function
	 *
	 * @param {Object} Members - mask: boolean, binary: boolean
	 * @param {function} 'function (error, send)' which is executed on successive ticks of which send is 'function (data, final)'.
	 * @api public
	 */

	WebSocket.prototype.stream = function(options, cb) {
	  if (typeof options == 'function') {
	    cb = options;
	    options = {};
	  }
	  if (typeof cb != 'function') throw new Error('callback must be provided');
	  if (this.readyState != WebSocket.OPEN) {
	    if (typeof cb == 'function') cb(new Error('not opened'));
	    else throw new Error('not opened');
	    return;
	  }
	  if (this._queue) {
	    var self = this;
	    this._queue.push(function() { self.stream(options, cb); });
	    return;
	  }
	  options = options || {};
	  if (typeof options.mask == 'undefined') options.mask = !this._isServer;
	  startQueue(this);
	  var self = this;
	  var send = function(data, final) {
	    try {
	      if (self.readyState != WebSocket.OPEN) throw new Error('not opened');
	      options.fin = final === true;
	      self._sender.send(data, options);
	      if (!final) process.nextTick(cb.bind(null, null, send));
	      else executeQueueSends(self);
	    }
	    catch (e) {
	      if (typeof cb == 'function') cb(e);
	      else {
	        delete self._queue;
	        self.emit('error', e);
	      }
	    }
	  }
	  process.nextTick(cb.bind(null, null, send));
	}

	/**
	 * Immediately shuts down the connection
	 *
	 * @api public
	 */

	WebSocket.prototype.terminate = function() {
	  if (this.readyState == WebSocket.CLOSED) return;
	  if (this._socket) {
	    try {
	      // End the connection
	      this._socket.end();
	    }
	    catch (e) {
	      // Socket error during end() call, so just destroy it right now
	      cleanupWebsocketResources.call(this, true);
	      return;
	    }

	    // Add a timeout to ensure that the connection is completely
	    // cleaned up within 30 seconds, even if the clean close procedure
	    // fails for whatever reason
	    setTimeout(cleanupWebsocketResources.bind(this, true), closeTimeout);
	  }
	  else if (this.readyState == WebSocket.CONNECTING) {
	    cleanupWebsocketResources.call(this, true);
	  }
	};

	/**
	 * Emulates the W3C Browser based WebSocket interface using function members.
	 *
	 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
	 * @api public
	 */

	['open', 'error', 'close', 'message'].forEach(function(method) {
	  Object.defineProperty(WebSocket.prototype, 'on' + method, {
	    /**
	     * Returns the current listener
	     *
	     * @returns {Mixed} the set function or undefined
	     * @api public
	     */

	    get: function get() {
	      var listener = this.listeners(method)[0];
	      return listener ? (listener._listener ? listener._listener : listener) : undefined;
	    },

	    /**
	     * Start listening for events
	     *
	     * @param {Function} listener the listener
	     * @returns {Mixed} the set function or undefined
	     * @api public
	     */

	    set: function set(listener) {
	      this.removeAllListeners(method);
	      this.addEventListener(method, listener);
	    }
	  });
	});

	/**
	 * Emulates the W3C Browser based WebSocket interface using addEventListener.
	 *
	 * @see https://developer.mozilla.org/en/DOM/element.addEventListener
	 * @see http://dev.w3.org/html5/websockets/#the-websocket-interface
	 * @api public
	 */
	WebSocket.prototype.addEventListener = function(method, listener) {
	  if (typeof listener === 'function') {
	    // Special case for messages as we need to wrap the data
	    // in a MessageEvent object.
	    if (method === 'message') {
	      function onMessage (data) {
	        listener.call(this, new MessageEvent(data));
	      }

	      // store a reference so we can return the origional function again
	      onMessage._listener = listener;
	      this.on(method, onMessage);
	    } else {
	      this.on(method, listener);
	    }
	  }
	}

	module.exports = WebSocket;

	/**
	 * W3C MessageEvent
	 *
	 * @see http://www.w3.org/TR/html5/comms.html
	 * @api private
	 */

	function MessageEvent(dataArg) {
	  // Currently only the data attribute is implemented. More can be added later if needed.
	  Object.defineProperty(this, 'data', { writable: false, value: dataArg });
	}

	/**
	 * Entirely private apis,
	 * which may or may not be bound to a sepcific WebSocket instance.
	 */

	 function initAsServerClient(req, socket, upgradeHead, options) {
	  options = new Options({
	    protocolVersion: protocolVersion,
	    protocol: null
	  }).merge(options);

	  // expose state properties
	  this.protocol = options.value.protocol;
	  this.protocolVersion = options.value.protocolVersion;
	  this.supports.binary = (this.protocolVersion != 'hixie-76');
	  this.upgradeReq = req;
	  this.readyState = WebSocket.CONNECTING;
	  this._isServer = true;

	  // establish connection
	  if (options.value.protocolVersion == 'hixie-76') establishConnection.call(this, ReceiverHixie, SenderHixie, socket, upgradeHead);
	  else establishConnection.call(this, Receiver, Sender, socket, upgradeHead);
	}

	function initAsClient(address, options) {
	  options = new Options({
	    origin: null,
	    protocolVersion: protocolVersion,
	    protocol: null
	  }).merge(options);
	  if (options.value.protocolVersion != 8 && options.value.protocolVersion != 13) {
	    throw new Error('unsupported protocol version');
	  }

	  // verify url and establish http class
	  var serverUrl = url.parse(address);
	  var isUnixSocket = serverUrl.protocol === 'ws+unix:';
	  if (!serverUrl.host && !isUnixSocket) throw new Error('invalid url');
	  var isSecure = serverUrl.protocol === 'wss:' || serverUrl.protocol === 'https:';
	  var httpObj = isSecure ? https : http;

	  // expose state properties
	  this._isServer = false;
	  this.url = address;
	  this.protocolVersion = options.value.protocolVersion;
	  this.supports.binary = (this.protocolVersion != 'hixie-76');

	  // begin handshake
	  var key = new Buffer(options.value.protocolVersion + '-' + Date.now()).toString('base64');
	  var shasum = crypto.createHash('sha1');
	  shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
	  var expectedServerKey = shasum.digest('base64');

	  // node<=v0.4.x compatibility
	  var agent;
	  if (isNodeV4) {
	    isNodeV4 = true;
	    agent = new httpObj.Agent({
	      host: serverUrl.hostname,
	      port: serverUrl.port || (isSecure ? 443 : 80)
	    });
	  }

	  var requestOptions = {
	    port: serverUrl.port || (isSecure ? 443 : 80),
	    host: serverUrl.hostname,
	    headers: {
	      'Connection': 'Upgrade',
	      'Upgrade': 'websocket',
	      'Sec-WebSocket-Version': options.value.protocolVersion,
	      'Sec-WebSocket-Key': key
	    }
	  };
	  if (options.value.protocol) {
	    requestOptions.headers['Sec-WebSocket-Protocol'] = options.value.protocol;
	  }
	  if (isNodeV4) {
	    requestOptions.path = (serverUrl.pathname || '/') + (serverUrl.search || '');
	    requestOptions.agent = agent;
	  }
	  else requestOptions.path = serverUrl.path || '/';
	  if (isUnixSocket) {
	    requestOptions.socketPath = serverUrl.pathname;
	  }
	  if (options.value.origin) {
	    if (options.value.protocolVersion < 13) requestOptions.headers['Sec-WebSocket-Origin'] = options.value.origin;
	    else requestOptions.headers['Origin'] = options.value.origin;
	  }

	  var self = this;
	  var req = httpObj.request(requestOptions);
	  (isNodeV4 ? agent : req).on('error', function(error) {
	    self.emit('error', error);
	  });
	  (isNodeV4 ? agent : req).once('upgrade', function(res, socket, upgradeHead) {
	    if (self.readyState == WebSocket.CLOSED) {
	      // client closed before server accepted connection
	      self.emit('close');
	      removeAllListeners(self);
	      socket.end();
	      return;
	    }
	    var serverKey = res.headers['sec-websocket-accept'];
	    if (typeof serverKey == 'undefined' || serverKey !== expectedServerKey) {
	      self.emit('error', 'invalid server key');
	      removeAllListeners(self);
	      socket.end();
	      return;
	    }

	    establishConnection.call(self, Receiver, Sender, socket, upgradeHead);

	    // perform cleanup on http resources
	    removeAllListeners(isNodeV4 ? agent : req);
	    req = null;
	    agent = null;
	  });

	  req.end();
	  this.readyState = WebSocket.CONNECTING;
	}

	function establishConnection(ReceiverClass, SenderClass, socket, upgradeHead) {
	  this._socket = socket;
	  socket.setTimeout(0);
	  socket.setNoDelay(true);
	  var self = this;
	  this._receiver = new ReceiverClass();

	  // socket cleanup handlers
	  socket.on('end', cleanupWebsocketResources.bind(this));
	  socket.on('close', cleanupWebsocketResources.bind(this));

	  // ensure that the upgradeHead is added to the receiver
	  function firstHandler(data) {
	    if (self.readyState != WebSocket.OPEN) return;
	    if (upgradeHead && upgradeHead.length > 0) {
	      self.bytesReceived += upgradeHead.length;
	      var head = upgradeHead;
	      upgradeHead = null;
	      self._receiver.add(head);
	    }
	    dataHandler = realHandler;
	    if (data) {
	      self.bytesReceived += data.length;
	      self._receiver.add(data);
	    }
	  }
	  // subsequent packets are pushed straight to the receiver
	  function realHandler(data) {
	    if (data) self.bytesReceived += data.length;
	    self._receiver.add(data);
	  }
	  var dataHandler = firstHandler;
	  socket.on('data', dataHandler);
	  socket.on('drain', function(){
	    self.emit('drain');
	  });
	  // if data was passed along with the http upgrade,
	  // this will schedule a push of that on to the receiver.
	  // this has to be done on next tick, since the caller
	  // hasn't had a chance to set event handlers on this client
	  // object yet.
	  process.nextTick(firstHandler);

	  // receiver event handlers
	  self._receiver.ontext = function (data, flags) {
	    flags = flags || {};
	    self.emit('message', data, flags);
	  };
	  self._receiver.onbinary = function (data, flags) {
	    flags = flags || {};
	    flags.binary = true;
	    self.emit('message', data, flags);
	  };
	  self._receiver.onping = function(data, flags) {
	    flags = flags || {};
	    self.pong(data, {mask: !self._isServer, binary: flags.binary === true}, true);
	    self.emit('ping', data, flags);
	  };
	  self._receiver.onpong = function(data, flags) {
	    self.emit('pong', data, flags);
	  };
	  self._receiver.onclose = function(code, data, flags) {
	    flags = flags || {};
	    self.close(code, data);
	  };
	  self._receiver.onerror = function(reason, errorCode) {
	    // close the connection when the receiver reports a HyBi error code
	    self.close(typeof errorCode != 'undefined' ? errorCode : 1002, '');
	    self.emit('error', reason, errorCode);
	  };

	  // finalize the client
	  this._sender = new SenderClass(socket);
	  this._sender.on('error', function(error) {
	    self.close(1002, '');
	    self.emit('error', error);
	  });
	  this.readyState = WebSocket.OPEN;
	  this.emit('open');
	}

	function startQueue(instance) {
	  instance._queue = instance._queue || [];
	}

	function executeQueueSends(instance) {
	  var queue = instance._queue;
	  if (typeof queue == 'undefined') return;
	  delete instance._queue;
	  for (var i = 0, l = queue.length; i < l; ++i) {
	    queue[i]();
	  }
	}

	function sendStream(instance, stream, options, cb) {
	  stream.on('data', function(data) {
	    if (instance.readyState != WebSocket.OPEN) {
	      if (typeof cb == 'function') cb(new Error('not opened'));
	      else {
	        delete instance._queue;
	        instance.emit('error', new Error('not opened'));
	      }
	      return;
	    }
	    options.fin = false;
	    instance._sender.send(data, options);
	  });
	  stream.on('end', function() {
	    if (instance.readyState != WebSocket.OPEN) {
	      if (typeof cb == 'function') cb(new Error('not opened'));
	      else {
	        delete instance._queue;
	        instance.emit('error', new Error('not opened'));
	      }
	      return;
	    }
	    options.fin = true;
	    instance._sender.send(null, options);
	    if (typeof cb == 'function') cb(null);
	  });
	}

	function cleanupWebsocketResources(error) {
	  if (this.readyState == WebSocket.CLOSED) return;
	  var emitClose = this.readyState != WebSocket.CONNECTING;
	  this.readyState = WebSocket.CLOSED;
	  if (this._socket) {
	    removeAllListeners(this._socket);
	    // catch all socket error after removing all standard handlers
	    var socket = this._socket;
	    this._socket.on('error', function() {
	      try { socket.destroy(); } catch (e) {}
	    });
	    try {
	      if (!error) this._socket.end();
	      else this._socket.terminate();
	    }
	    catch (e) { /* Ignore termination errors */ }
	    this._socket = null;
	  }
	  if (this._sender) {
	    removeAllListeners(this._sender);
	    this._sender = null;
	  }
	  if (this._receiver) {
	    this._receiver.cleanup();
	    this._receiver = null;
	  }
	  if (emitClose) this.emit('close', this._closeCode || 1000, this._closeMessage || '');
	  removeAllListeners(this);
	  this.on('error', function() {}); // catch all errors after this
	  delete this._queue;
	}

	function removeAllListeners(instance) {
	  if (isNodeV4) {
	    // node v4 doesn't *actually* remove all listeners globally,
	    // so we do that instead
	    instance._events = {};
	  }
	  else instance.removeAllListeners();
	}


/***/ },
/* 35 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = require("https");

/***/ },
/* 38 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 39 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var fs = __webpack_require__(40);

	function Options(defaults) {
	  var internalValues = {};
	  var values = this.value = {};
	  Object.keys(defaults).forEach(function(key) {
	    internalValues[key] = defaults[key];
	    Object.defineProperty(values, key, {
	      get: function() { return internalValues[key]; },
	      configurable: false,
	      enumerable: true
	    });
	  });
	  this.reset = function() {
	    Object.keys(defaults).forEach(function(key) {
	      internalValues[key] = defaults[key];
	    });
	    return this;
	  };
	  this.merge = function(options, required) {
	    options = options || {};
	    if (Object.prototype.toString.call(required) === '[object Array]') {
	      var missing = [];
	      for (var i = 0, l = required.length; i < l; ++i) {
	        var key = required[i];
	        if (!(key in options)) {
	          missing.push(key);
	        }
	      }
	      if (missing.length > 0) {
	        if (missing.length > 1) {
	          throw new Error('options ' +
	            missing.slice(0, missing.length - 1).join(', ') + ' and ' +
	            missing[missing.length - 1] + ' must be defined');
	        }
	        else throw new Error('option ' + missing[0] + ' must be defined');
	      }
	    }
	    Object.keys(options).forEach(function(key) {
	      if (key in internalValues) {
	        internalValues[key] = options[key];
	      }
	    });
	    return this;
	  };
	  this.copy = function(keys) {
	    var obj = {};
	    Object.keys(defaults).forEach(function(key) {
	      if (keys.indexOf(key) !== -1) {
	        obj[key] = values[key];
	      }
	    });
	    return obj;
	  };
	  this.read = function(filename, cb) {
	    if (typeof cb == 'function') {
	      var self = this;
	      fs.readFile(filename, function(error, data) {
	        if (error) return cb(error);
	        var conf = JSON.parse(data);
	        self.merge(conf);
	        cb();
	      });
	    }
	    else {
	      var conf = JSON.parse(fs.readFileSync(filename));
	      this.merge(conf);
	    }
	    return this;
	  };
	  this.isDefined = function(key) {
	    return typeof values[key] != 'undefined';
	  };
	  this.isDefinedAndNonNull = function(key) {
	    return typeof values[key] != 'undefined' && values[key] !== null;
	  };
	  Object.freeze(values);
	  Object.freeze(this);
	}

	module.exports = Options;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var events = __webpack_require__(35)
	  , util = __webpack_require__(27)
	  , EventEmitter = events.EventEmitter
	  , ErrorCodes = __webpack_require__(43)
	  , bufferUtil = __webpack_require__(44).BufferUtil;

	/**
	 * HyBi Sender implementation
	 */

	function Sender(socket) {
	  this._socket = socket;
	  this.firstFragment = true;
	}

	/**
	 * Inherits from EventEmitter.
	 */

	util.inherits(Sender, events.EventEmitter);

	/**
	 * Sends a close instruction to the remote party.
	 *
	 * @api public
	 */

	Sender.prototype.close = function(code, data, mask) {
	  if (typeof code !== 'undefined') {
	    if (typeof code !== 'number' ||
	      !ErrorCodes.isValidErrorCode(code)) throw new Error('first argument must be a valid error code number');
	  }
	  code = code || 1000;
	  var dataBuffer = new Buffer(2 + (data ? Buffer.byteLength(data) : 0));
	  writeUInt16BE.call(dataBuffer, code, 0);
	  if (dataBuffer.length > 2) dataBuffer.write(data, 2);
	  return this.frameAndSend(0x8, dataBuffer, true, mask);
	}

	/**
	 * Sends a ping message to the remote party.
	 *
	 * @api public
	 */

	Sender.prototype.ping = function(data, options) {
	  var mask = options && options.mask;
	  return this.frameAndSend(0x9, data || '', true, mask);
	}

	/**
	 * Sends a pong message to the remote party.
	 *
	 * @api public
	 */

	Sender.prototype.pong = function(data, options) {
	  var mask = options && options.mask;
	  return this.frameAndSend(0xa, data || '', true, mask);
	}

	/**
	 * Sends text or binary data to the remote party.
	 *
	 * @api public
	 */

	Sender.prototype.send = function(data, options, cb) {
	  var finalFragment = options && options.fin === false ? false : true;
	  var mask = options && options.mask;
	  var opcode = options && options.binary === false ? 1 : 2;
	  if (this.firstFragment === false) opcode = 0;
	  else this.firstFragment = false;
	  if (finalFragment) this.firstFragment = true
	  return this.frameAndSend(opcode, data, finalFragment, mask, cb);
	}

	/**
	 * Frames and sends a piece of data according to the HyBi WebSocket protocol.
	 *
	 * @api private
	 */

	Sender.prototype.frameAndSend = function(opcode, data, finalFragment, maskData, cb) {
	  var canModifyData = false;
	  var out = null;

	  if (!data) {
	    try {
	      out = this._socket.write(new Buffer([opcode | (finalFragment ? 0x80 : 0), 0 | (maskData ? 0x80 : 0)].concat(maskData ? [0, 0, 0, 0] : [])), 'binary', cb);
	    }
	    catch (e) {
	      if (typeof cb == 'function') cb(e);
	      else this.emit('error', e);
	    }
	    return out;
	  }

	  if (!Buffer.isBuffer(data)) {
	    canModifyData = true;
	    data = (data && typeof data.buffer !== 'undefined') ? getArrayBuffer(data.buffer) : new Buffer(data);
	  }

	  var dataLength = data.length
	    , dataOffset = maskData ? 6 : 2
	    , secondByte = dataLength;

	  if (dataLength >= 65536) {
	    dataOffset += 8;
	    secondByte = 127;
	  }
	  else if (dataLength > 125) {
	    dataOffset += 2;
	    secondByte = 126;
	  }

	  var mergeBuffers = dataLength < 32768 || (maskData && !canModifyData);
	  var totalLength = mergeBuffers ? dataLength + dataOffset : dataOffset;
	  var outputBuffer = new Buffer(totalLength);
	  outputBuffer[0] = finalFragment ? opcode | 0x80 : opcode;

	  switch (secondByte) {
	    case 126:
	      writeUInt16BE.call(outputBuffer, dataLength, 2);
	      break;
	    case 127:
	      writeUInt32BE.call(outputBuffer, 0, 2);
	      writeUInt32BE.call(outputBuffer, dataLength, 6);
	  }

	  if (maskData) {
	    outputBuffer[1] = secondByte | 0x80;
	    var mask = this._randomMask || (this._randomMask = getRandomMask());
	    outputBuffer[dataOffset - 4] = mask[0];
	    outputBuffer[dataOffset - 3] = mask[1];
	    outputBuffer[dataOffset - 2] = mask[2];
	    outputBuffer[dataOffset - 1] = mask[3];
	    if (mergeBuffers) {
	      bufferUtil.mask(data, mask, outputBuffer, dataOffset, dataLength);
	      try {
	        out = this._socket.write(outputBuffer, 'binary', cb);
	      }
	      catch (e) {
	        if (typeof cb == 'function') cb(e);
	        else this.emit('error', e);
	      }
	    }
	    else {
	      bufferUtil.mask(data, mask, data, 0, dataLength);
	      try {
	        this._socket.write(outputBuffer, 'binary');
	        out = this._socket.write(data, 'binary', cb);
	      }
	      catch (e) {
	        if (typeof cb == 'function') cb(e);
	        else this.emit('error', e);
	      }
	    }
	  }
	  else {
	    outputBuffer[1] = secondByte;
	    if (mergeBuffers) {
	      data.copy(outputBuffer, dataOffset);
	      try {
	        out = this._socket.write(outputBuffer, 'binary', cb);
	      }
	      catch (e) {
	        if (typeof cb == 'function') cb(e);
	        else this.emit('error', e);
	      }
	    }
	    else {
	      try {
	        this._socket.write(outputBuffer, 'binary');
	        out = this._socket.write(data, 'binary', cb);
	      }
	      catch (e) {
	        if (typeof cb == 'function') cb(e);
	        else this.emit('error', e);
	      }
	    }
	  }
	  return out;
	}

	module.exports = Sender;

	function writeUInt16BE(value, offset) {
	  this[offset] = (value & 0xff00)>>8;
	  this[offset+1] = value & 0xff;
	}

	function writeUInt32BE(value, offset) {
	  this[offset] = (value & 0xff000000)>>24;
	  this[offset+1] = (value & 0xff0000)>>16;
	  this[offset+2] = (value & 0xff00)>>8;
	  this[offset+3] = value & 0xff;
	}

	function getArrayBuffer(array) {
	  var l = array.byteLength
	    , buffer = new Buffer(l);
	  for (var i = 0; i < l; ++i) {
	    buffer[i] = array[i];
	  }
	  return buffer;
	}

	function getRandomMask() {
	  return new Buffer([
	    ~~(Math.random() * 255),
	    ~~(Math.random() * 255),
	    ~~(Math.random() * 255),
	    ~~(Math.random() * 255)
	  ]);
	}


/***/ },
/* 43 */
/***/ function(module, exports) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	module.exports = {
	  isValidErrorCode: function(code) {
	    return (code >= 1000 && code <= 1011 && code != 1004 && code != 1005 && code != 1006) ||
	         (code >= 3000 && code <= 4999);
	  },
	  1000: 'normal',
	  1001: 'going away',
	  1002: 'protocol error',
	  1003: 'unsupported data',
	  1004: 'reserved',
	  1005: 'reserved for extensions',
	  1006: 'reserved for extensions',
	  1007: 'inconsistent or invalid data',
	  1008: 'policy violation',
	  1009: 'message too big',
	  1010: 'extension handshake missing',
	  1011: 'an unexpected condition prevented the request from being fulfilled',
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	try {
	  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/Release/bufferutil\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (e) { try {
	  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/default/bufferutil\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (e) { try {
	  module.exports = __webpack_require__(45);
	} catch (e) {
	  console.error('bufferutil.node seems to not have been built. Run npm install.');
	  throw e;
	}}}


/***/ },
/* 45 */
/***/ function(module, exports) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	module.exports.BufferUtil = {
	  merge: function(mergedBuffer, buffers) {
	    var offset = 0;
	    for (var i = 0, l = buffers.length; i < l; ++i) {
	      var buf = buffers[i];
	      buf.copy(mergedBuffer, offset);
	      offset += buf.length;
	    }
	  },
	  mask: function(source, mask, output, offset, length) {
	    var maskNum = mask.readUInt32LE(0, true);
	    var i = 0;
	    for (; i < length - 3; i += 4) {
	      var num = maskNum ^ source.readUInt32LE(i, true);
	      if (num < 0) num = 4294967296 + num;
	      output.writeUInt32LE(num, offset + i, true);
	    }
	    switch (length % 4) {
	      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
	      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
	      case 1: output[offset + i] = source[i] ^ mask[0];
	      case 0:;
	    }
	  },
	  unmask: function(data, mask) {
	    var maskNum = mask.readUInt32LE(0, true);
	    var length = data.length;
	    var i = 0;
	    for (; i < length - 3; i += 4) {
	      var num = maskNum ^ data.readUInt32LE(i, true);
	      if (num < 0) num = 4294967296 + num;
	      data.writeUInt32LE(num, i, true);
	    }
	    switch (length % 4) {
	      case 3: data[i + 2] = data[i + 2] ^ mask[2];
	      case 2: data[i + 1] = data[i + 1] ^ mask[1];
	      case 1: data[i] = data[i] ^ mask[0];
	      case 0:;
	    }
	  }
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var util = __webpack_require__(27)
	  , Validation = __webpack_require__(47).Validation
	  , ErrorCodes = __webpack_require__(43)
	  , BufferPool = __webpack_require__(49)
	  , bufferUtil = __webpack_require__(44).BufferUtil;

	/**
	 * Node version 0.4 and 0.6 compatibility
	 */

	var isNodeV4 = /^v0\.4/.test(process.version);

	/**
	 * HyBi Receiver implementation
	 */

	function Receiver () {
	  // memory pool for fragmented messages
	  var fragmentedPoolPrevUsed = -1;
	  this.fragmentedBufferPool = new BufferPool(1024, function(db, length) {
	    return db.used + length;
	  }, function(db) {
	    return fragmentedPoolPrevUsed = fragmentedPoolPrevUsed >= 0 ?
	      (fragmentedPoolPrevUsed + db.used) / 2 :
	      db.used;
	  });

	  // memory pool for unfragmented messages
	  var unfragmentedPoolPrevUsed = -1;
	  this.unfragmentedBufferPool = new BufferPool(1024, function(db, length) {
	    return db.used + length;
	  }, function(db) {
	    return unfragmentedPoolPrevUsed = unfragmentedPoolPrevUsed >= 0 ?
	      (unfragmentedPoolPrevUsed + db.used) / 2 :
	      db.used;
	  });

	  this.state = {
	    activeFragmentedOperation: null,
	    lastFragment: false,
	    masked: false,
	    opcode: 0,
	    fragmentedOperation: false
	  };
	  this.overflow = [];
	  this.headerBuffer = new Buffer(10);
	  this.expectOffset = 0;
	  this.expectBuffer = null;
	  this.expectHandler = null;
	  this.currentMessage = [];
	  this.expectHeader(2, this.processPacket);
	  this.dead = false;

	  this.onerror = function() {};
	  this.ontext = function() {};
	  this.onbinary = function() {};
	  this.onclose = function() {};
	  this.onping = function() {};
	  this.onpong = function() {};
	};

	module.exports = Receiver;

	/**
	 * Add new data to the parser.
	 *
	 * @api public
	 */

	Receiver.prototype.add = function(data) {
	  var dataLength = data.length;
	  if (dataLength == 0) return;
	  if (this.expectBuffer == null) {
	    this.overflow.push(data);
	    return;
	  }
	  var toRead = Math.min(dataLength, this.expectBuffer.length - this.expectOffset);
	  fastCopy(toRead, data, this.expectBuffer, this.expectOffset);
	  this.expectOffset += toRead;
	  if (toRead < dataLength) {
	    this.overflow.push(data.slice(toRead));
	  }
	  while (this.expectBuffer && this.expectOffset == this.expectBuffer.length) {
	    var bufferForHandler = this.expectBuffer;
	    this.expectBuffer = null;
	    this.expectOffset = 0;
	    this.expectHandler.call(this, bufferForHandler);
	  }
	}

	/**
	 * Releases all resources used by the receiver.
	 *
	 * @api public
	 */

	Receiver.prototype.cleanup = function() {
	  this.dead = true;
	  this.overflow = null;
	  this.headerBuffer = null;
	  this.expectBuffer = null;
	  this.expectHandler = null;
	  this.unfragmentedBufferPool = null;
	  this.fragmentedBufferPool = null;
	  this.state = null;
	  this.currentMessage = null;
	  this.onerror = null;
	  this.ontext = null;
	  this.onbinary = null;
	  this.onclose = null;
	  this.onping = null;
	  this.onpong = null;
	}

	/**
	 * Waits for a certain amount of header bytes to be available, then fires a callback.
	 *
	 * @api private
	 */

	Receiver.prototype.expectHeader = function(length, handler) {
	  if (length == 0) {
	    handler(null);
	    return;
	  }
	  this.expectBuffer = this.headerBuffer.slice(this.expectOffset, this.expectOffset + length);
	  this.expectHandler = handler;
	  var toRead = length;
	  while (toRead > 0 && this.overflow.length > 0) {
	    var fromOverflow = this.overflow.pop();
	    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
	    var read = Math.min(fromOverflow.length, toRead);
	    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
	    this.expectOffset += read;
	    toRead -= read;
	  }
	}

	/**
	 * Waits for a certain amount of data bytes to be available, then fires a callback.
	 *
	 * @api private
	 */

	Receiver.prototype.expectData = function(length, handler) {
	  if (length == 0) {
	    handler(null);
	    return;
	  }
	  this.expectBuffer = this.allocateFromPool(length, this.state.fragmentedOperation);
	  this.expectHandler = handler;
	  var toRead = length;
	  while (toRead > 0 && this.overflow.length > 0) {
	    var fromOverflow = this.overflow.pop();
	    if (toRead < fromOverflow.length) this.overflow.push(fromOverflow.slice(toRead));
	    var read = Math.min(fromOverflow.length, toRead);
	    fastCopy(read, fromOverflow, this.expectBuffer, this.expectOffset);
	    this.expectOffset += read;
	    toRead -= read;
	  }
	}

	/**
	 * Allocates memory from the buffer pool.
	 *
	 * @api private
	 */

	Receiver.prototype.allocateFromPool = !isNodeV4
	  ? function(length, isFragmented) { return (isFragmented ? this.fragmentedBufferPool : this.unfragmentedBufferPool).get(length); }
	  : function(length) { return new Buffer(length); };

	/**
	 * Start processing a new packet.
	 *
	 * @api private
	 */

	Receiver.prototype.processPacket = function (data) {
	  if ((data[0] & 0x70) != 0) {
	    this.error('reserved fields must be empty', 1002);
	    return;
	  }
	  this.state.lastFragment = (data[0] & 0x80) == 0x80;
	  this.state.masked = (data[1] & 0x80) == 0x80;
	  var opcode = data[0] & 0xf;
	  if (opcode === 0) {
	    // continuation frame
	    this.state.fragmentedOperation = true;
	    this.state.opcode = this.state.activeFragmentedOperation;
	    if (!(this.state.opcode == 1 || this.state.opcode == 2)) {
	      this.error('continuation frame cannot follow current opcode', 1002);
	      return;
	    }
	  }
	  else {
	    if (opcode < 3 && this.state.activeFragmentedOperation != null) {
	      this.error('data frames after the initial data frame must have opcode 0', 1002);
	      return;
	    }
	    this.state.opcode = opcode;
	    if (this.state.lastFragment === false) {
	      this.state.fragmentedOperation = true;
	      this.state.activeFragmentedOperation = opcode;
	    }
	    else this.state.fragmentedOperation = false;
	  }
	  var handler = opcodes[this.state.opcode];
	  if (typeof handler == 'undefined') this.error('no handler for opcode ' + this.state.opcode, 1002);
	  else {
	    handler.start.call(this, data);
	  }
	}

	/**
	 * Endprocessing a packet.
	 *
	 * @api private
	 */

	Receiver.prototype.endPacket = function() {
	  if (!this.state.fragmentedOperation) this.unfragmentedBufferPool.reset(true);
	  else if (this.state.lastFragment) this.fragmentedBufferPool.reset(false);
	  this.expectOffset = 0;
	  this.expectBuffer = null;
	  this.expectHandler = null;
	  if (this.state.lastFragment && this.state.opcode === this.state.activeFragmentedOperation) {
	    // end current fragmented operation
	    this.state.activeFragmentedOperation = null;
	  }
	  this.state.lastFragment = false;
	  this.state.opcode = this.state.activeFragmentedOperation != null ? this.state.activeFragmentedOperation : 0;
	  this.state.masked = false;
	  this.expectHeader(2, this.processPacket);
	}

	/**
	 * Reset the parser state.
	 *
	 * @api private
	 */

	Receiver.prototype.reset = function() {
	  if (this.dead) return;
	  this.state = {
	    activeFragmentedOperation: null,
	    lastFragment: false,
	    masked: false,
	    opcode: 0,
	    fragmentedOperation: false
	  };
	  this.fragmentedBufferPool.reset(true);
	  this.unfragmentedBufferPool.reset(true);
	  this.expectOffset = 0;
	  this.expectBuffer = null;
	  this.expectHandler = null;
	  this.overflow = [];
	  this.currentMessage = [];
	}

	/**
	 * Unmask received data.
	 *
	 * @api private
	 */

	Receiver.prototype.unmask = function (mask, buf, binary) {
	  if (mask != null && buf != null) bufferUtil.unmask(buf, mask);
	  if (binary) return buf;
	  return buf != null ? buf.toString('utf8') : '';
	}

	/**
	 * Concatenates a list of buffers.
	 *
	 * @api private
	 */

	Receiver.prototype.concatBuffers = function(buffers) {
	  var length = 0;
	  for (var i = 0, l = buffers.length; i < l; ++i) length += buffers[i].length;
	  var mergedBuffer = new Buffer(length);
	  bufferUtil.merge(mergedBuffer, buffers);
	  return mergedBuffer;
	}

	/**
	 * Handles an error
	 *
	 * @api private
	 */

	Receiver.prototype.error = function (reason, protocolErrorCode) {
	  this.reset();
	  this.onerror(reason, protocolErrorCode);
	  return this;
	}

	/**
	 * Buffer utilities
	 */

	function readUInt16BE(start) {
	  return (this[start]<<8) +
	         this[start+1];
	}

	function readUInt32BE(start) {
	  return (this[start]<<24) +
	         (this[start+1]<<16) +
	         (this[start+2]<<8) +
	         this[start+3];
	}

	function fastCopy(length, srcBuffer, dstBuffer, dstOffset) {
	  switch (length) {
	    default: srcBuffer.copy(dstBuffer, dstOffset, 0, length); break;
	    case 16: dstBuffer[dstOffset+15] = srcBuffer[15];
	    case 15: dstBuffer[dstOffset+14] = srcBuffer[14];
	    case 14: dstBuffer[dstOffset+13] = srcBuffer[13];
	    case 13: dstBuffer[dstOffset+12] = srcBuffer[12];
	    case 12: dstBuffer[dstOffset+11] = srcBuffer[11];
	    case 11: dstBuffer[dstOffset+10] = srcBuffer[10];
	    case 10: dstBuffer[dstOffset+9] = srcBuffer[9];
	    case 9: dstBuffer[dstOffset+8] = srcBuffer[8];
	    case 8: dstBuffer[dstOffset+7] = srcBuffer[7];
	    case 7: dstBuffer[dstOffset+6] = srcBuffer[6];
	    case 6: dstBuffer[dstOffset+5] = srcBuffer[5];
	    case 5: dstBuffer[dstOffset+4] = srcBuffer[4];
	    case 4: dstBuffer[dstOffset+3] = srcBuffer[3];
	    case 3: dstBuffer[dstOffset+2] = srcBuffer[2];
	    case 2: dstBuffer[dstOffset+1] = srcBuffer[1];
	    case 1: dstBuffer[dstOffset] = srcBuffer[0];
	  }
	}

	/**
	 * Opcode handlers
	 */

	var opcodes = {
	  // text
	  '1': {
	    start: function(data) {
	      var self = this;
	      // decode length
	      var firstLength = data[1] & 0x7f;
	      if (firstLength < 126) {
	        opcodes['1'].getData.call(self, firstLength);
	      }
	      else if (firstLength == 126) {
	        self.expectHeader(2, function(data) {
	          opcodes['1'].getData.call(self, readUInt16BE.call(data, 0));
	        });
	      }
	      else if (firstLength == 127) {
	        self.expectHeader(8, function(data) {
	          if (readUInt32BE.call(data, 0) != 0) {
	            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
	            return;
	          }
	          opcodes['1'].getData.call(self, readUInt32BE.call(data, 4));
	        });
	      }
	    },
	    getData: function(length) {
	      var self = this;
	      if (self.state.masked) {
	        self.expectHeader(4, function(data) {
	          var mask = data;
	          self.expectData(length, function(data) {
	            opcodes['1'].finish.call(self, mask, data);
	          });
	        });
	      }
	      else {
	        self.expectData(length, function(data) {
	          opcodes['1'].finish.call(self, null, data);
	        });
	      }
	    },
	    finish: function(mask, data) {
	      var packet = this.unmask(mask, data, true);
	      if (packet != null) this.currentMessage.push(packet);
	      if (this.state.lastFragment) {
	        var messageBuffer = this.concatBuffers(this.currentMessage);
	        if (!Validation.isValidUTF8(messageBuffer)) {
	          this.error('invalid utf8 sequence', 1007);
	          return;
	        }
	        this.ontext(messageBuffer.toString('utf8'), {masked: this.state.masked, buffer: messageBuffer});
	        this.currentMessage = [];
	      }
	      this.endPacket();
	    }
	  },
	  // binary
	  '2': {
	    start: function(data) {
	      var self = this;
	      // decode length
	      var firstLength = data[1] & 0x7f;
	      if (firstLength < 126) {
	        opcodes['2'].getData.call(self, firstLength);
	      }
	      else if (firstLength == 126) {
	        self.expectHeader(2, function(data) {
	          opcodes['2'].getData.call(self, readUInt16BE.call(data, 0));
	        });
	      }
	      else if (firstLength == 127) {
	        self.expectHeader(8, function(data) {
	          if (readUInt32BE.call(data, 0) != 0) {
	            self.error('packets with length spanning more than 32 bit is currently not supported', 1008);
	            return;
	          }
	          opcodes['2'].getData.call(self, readUInt32BE.call(data, 4, true));
	        });
	      }
	    },
	    getData: function(length) {
	      var self = this;
	      if (self.state.masked) {
	        self.expectHeader(4, function(data) {
	          var mask = data;
	          self.expectData(length, function(data) {
	            opcodes['2'].finish.call(self, mask, data);
	          });
	        });
	      }
	      else {
	        self.expectData(length, function(data) {
	          opcodes['2'].finish.call(self, null, data);
	        });
	      }
	    },
	    finish: function(mask, data) {
	      var packet = this.unmask(mask, data, true);
	      if (packet != null) this.currentMessage.push(packet);
	      if (this.state.lastFragment) {
	        var messageBuffer = this.concatBuffers(this.currentMessage);
	        this.onbinary(messageBuffer, {masked: this.state.masked, buffer: messageBuffer});
	        this.currentMessage = [];
	      }
	      this.endPacket();
	    }
	  },
	  // close
	  '8': {
	    start: function(data) {
	      var self = this;
	      if (self.state.lastFragment == false) {
	        self.error('fragmented close is not supported', 1002);
	        return;
	      }

	      // decode length
	      var firstLength = data[1] & 0x7f;
	      if (firstLength < 126) {
	        opcodes['8'].getData.call(self, firstLength);
	      }
	      else {
	        self.error('control frames cannot have more than 125 bytes of data', 1002);
	      }
	    },
	    getData: function(length) {
	      var self = this;
	      if (self.state.masked) {
	        self.expectHeader(4, function(data) {
	          var mask = data;
	          self.expectData(length, function(data) {
	            opcodes['8'].finish.call(self, mask, data);
	          });
	        });
	      }
	      else {
	        self.expectData(length, function(data) {
	          opcodes['8'].finish.call(self, null, data);
	        });
	      }
	    },
	    finish: function(mask, data) {
	      var self = this;
	      data = self.unmask(mask, data, true);
	      if (data && data.length == 1) {
	        self.error('close packets with data must be at least two bytes long', 1002);
	        return;
	      }
	      var code = data && data.length > 1 ? readUInt16BE.call(data, 0) : 1000;
	      if (!ErrorCodes.isValidErrorCode(code)) {
	        self.error('invalid error code', 1002);
	        return;
	      }
	      var message = '';
	      if (data && data.length > 2) {
	        var messageBuffer = data.slice(2);
	        if (!Validation.isValidUTF8(messageBuffer)) {
	          self.error('invalid utf8 sequence', 1007);
	          return;
	        }
	        message = messageBuffer.toString('utf8');
	      }
	      this.onclose(code, message, {masked: self.state.masked});
	      this.reset();
	    },
	  },
	  // ping
	  '9': {
	    start: function(data) {
	      var self = this;
	      if (self.state.lastFragment == false) {
	        self.error('fragmented ping is not supported', 1002);
	        return;
	      }

	      // decode length
	      var firstLength = data[1] & 0x7f;
	      if (firstLength < 126) {
	        opcodes['9'].getData.call(self, firstLength);
	      }
	      else {
	        self.error('control frames cannot have more than 125 bytes of data', 1002);
	      }
	    },
	    getData: function(length) {
	      var self = this;
	      if (self.state.masked) {
	        self.expectHeader(4, function(data) {
	          var mask = data;
	          self.expectData(length, function(data) {
	            opcodes['9'].finish.call(self, mask, data);
	          });
	        });
	      }
	      else {
	        self.expectData(length, function(data) {
	          opcodes['9'].finish.call(self, null, data);
	        });
	      }
	    },
	    finish: function(mask, data) {
	      this.onping(this.unmask(mask, data, true), {masked: this.state.masked, binary: true});
	      this.endPacket();
	    }
	  },
	  // pong
	  '10': {
	    start: function(data) {
	      var self = this;
	      if (self.state.lastFragment == false) {
	        self.error('fragmented pong is not supported', 1002);
	        return;
	      }

	      // decode length
	      var firstLength = data[1] & 0x7f;
	      if (firstLength < 126) {
	        opcodes['10'].getData.call(self, firstLength);
	      }
	      else {
	        self.error('control frames cannot have more than 125 bytes of data', 1002);
	      }
	    },
	    getData: function(length) {
	      var self = this;
	      if (this.state.masked) {
	        this.expectHeader(4, function(data) {
	          var mask = data;
	          self.expectData(length, function(data) {
	            opcodes['10'].finish.call(self, mask, data);
	          });
	        });
	      }
	      else {
	        this.expectData(length, function(data) {
	          opcodes['10'].finish.call(self, null, data);
	        });
	      }
	    },
	    finish: function(mask, data) {
	      this.onpong(this.unmask(mask, data, true), {masked: this.state.masked, binary: true});
	      this.endPacket();
	    }
	  }
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	try {
	  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/Release/validation\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (e) { try {
	  module.exports = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../build/default/validation\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	} catch (e) { try {
	  module.exports = __webpack_require__(48);
	} catch (e) {
	  console.error('validation.node seems to not have been built. Run npm install.');
	  throw e;
	}}}


/***/ },
/* 48 */
/***/ function(module, exports) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */
	 
	module.exports.Validation = {
	  isValidUTF8: function(buffer) {
	    return true;
	  }
	};



/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var util = __webpack_require__(27);

	function BufferPool(initialSize, growStrategy, shrinkStrategy) {
	  if (typeof initialSize === 'function') {
	    shrinkStrategy = growStrategy;
	    growStrategy = initialSize;
	    initialSize = 0;
	  }
	  else if (typeof initialSize === 'undefined') {
	    initialSize = 0;
	  }
	  this._growStrategy = (growStrategy || function(db, size) {
	    return db.used + size;
	  }).bind(null, this);
	  this._shrinkStrategy = (shrinkStrategy || function(db) {
	    return initialSize;
	  }).bind(null, this);
	  this._buffer = initialSize ? new Buffer(initialSize) : null;
	  this._offset = 0;
	  this._used = 0;
	  this._changeFactor = 0;
	  this.__defineGetter__('size', function(){
	    return this._buffer == null ? 0 : this._buffer.length;
	  });
	  this.__defineGetter__('used', function(){
	    return this._used;
	  });
	}

	BufferPool.prototype.get = function(length) {
	  if (this._buffer == null || this._offset + length > this._buffer.length) {
	    var newBuf = new Buffer(this._growStrategy(length));
	    this._buffer = newBuf;
	    this._offset = 0;
	  }
	  this._used += length;
	  var buf = this._buffer.slice(this._offset, this._offset + length);
	  this._offset += length;
	  return buf;
	}

	BufferPool.prototype.reset = function(forceNewBuffer) {
	  var len = this._shrinkStrategy();
	  if (len < this.size) this._changeFactor -= 1;
	  if (forceNewBuffer || this._changeFactor < -2) {
	    this._changeFactor = 0;
	    this._buffer = len ? new Buffer(len) : null;
	  }
	  this._offset = 0;
	  this._used = 0;
	}

	module.exports = BufferPool;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var events = __webpack_require__(35)
	  , util = __webpack_require__(27)
	  , EventEmitter = events.EventEmitter;

	/**
	 * Hixie Sender implementation
	 */

	function Sender(socket) {
	  this.socket = socket;
	  this.continuationFrame = false;
	  this.isClosed = false;
	}

	module.exports = Sender;

	/**
	 * Inherits from EventEmitter.
	 */

	util.inherits(Sender, events.EventEmitter);

	/**
	 * Frames and writes data.
	 *
	 * @api public
	 */

	Sender.prototype.send = function(data, options, cb) {
	  if (this.isClosed) return;
	  if (options && options.binary) {
	    this.error('hixie websockets do not support binary');
	    return;
	  }

	  var isString = typeof data == 'string'
	    , length = isString ? Buffer.byteLength(data) : data.length
	    , writeStartMarker = this.continuationFrame == false
	    , writeEndMarker = !options || !(typeof options.fin != 'undefined' && !options.fin)
	    , buffer = new Buffer((writeStartMarker ? 1 : 0) + length + (writeEndMarker ? 1 : 0))
	    , offset = writeStartMarker ? 1 : 0;

	  if (writeStartMarker) buffer.write('\x00', 'binary');

	  if (isString) buffer.write(data, offset, 'utf8');
	  else data.copy(buffer, offset, 0);

	  if (writeEndMarker) {
	    buffer.write('\xff', offset + length, 'binary');
	    this.continuationFrame = false;
	  }
	  else this.continuationFrame = true;

	  try {
	    return this.socket.write(buffer, 'binary', cb);
	  } catch (e) {
	    this.error(e.toString());
	  }
	}

	/**
	 * Sends a close instruction to the remote party.
	 *
	 * @api public
	 */

	Sender.prototype.close = function(code, data, mask, cb) {
	  if (this.isClosed) return;
	  this.isClosed = true;
	  try {
	    if (this.continuationFrame) this.socket.write(new Buffer([0xff], 'binary'));
	    return this.socket.write(new Buffer([0xff, 0x00]), 'binary', cb);
	  } catch (e) {
	    this.error(e.toString());
	  }
	}

	/**
	 * Sends a ping message to the remote party. Not available for hixie.
	 *
	 * @api public
	 */

	Sender.prototype.ping = function(data, options) {}

	/**
	 * Sends a pong message to the remote party. Not available for hixie.
	 *
	 * @api public
	 */

	Sender.prototype.pong = function(data, options) {}

	/**
	 * Handles an error
	 *
	 * @api private
	 */

	Sender.prototype.error = function (reason) {
	  this.emit('error', reason);
	  return this;
	}


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var util = __webpack_require__(27);

	/**
	 * State constants
	 */

	var EMPTY = 0
	  , BODY = 1;

	/**
	 * Hixie Receiver implementation
	 */

	function Receiver () {
	  this.state = EMPTY;
	  this.buffers = [];
	  this.messageEnd = -1;
	  this.spanLength = 0;
	  this.dead = false;

	  this.onerror = function() {};
	  this.ontext = function() {};
	  this.onbinary = function() {};
	  this.onclose = function() {};
	  this.onping = function() {};
	  this.onpong = function() {};
	}

	module.exports = Receiver;

	/**
	 * Add new data to the parser.
	 *
	 * @api public
	 */

	Receiver.prototype.add = function(data) {
	  var self = this;
	  function doAdd() {
	    if (self.state === EMPTY) {
	      if (data.length == 2 && data[0] == 0xFF && data[1] == 0x00) {
	        self.reset();
	        self.onclose();
	        return;
	      }
	      if (data[0] !== 0x00) {
	        self.error('payload must start with 0x00 byte', true);
	        return;
	      }
	      data = data.slice(1);
	      self.state = BODY;
	    }
	    self.buffers.push(data);
	    if ((self.messageEnd = bufferIndex(data, 0xFF)) != -1) {
	      self.spanLength += self.messageEnd;
	      return self.parse();
	    }
	    else self.spanLength += data.length;
	  }
	  while(data) data = doAdd();
	}

	/**
	 * Releases all resources used by the receiver.
	 *
	 * @api public
	 */

	Receiver.prototype.cleanup = function() {
	  this.dead = true;
	  this.state = EMPTY;
	  this.buffers = [];
	}

	/**
	 * Process buffered data.
	 *
	 * @api public
	 */

	Receiver.prototype.parse = function() {
	  var output = new Buffer(this.spanLength);
	  var outputIndex = 0;
	  for (var bi = 0, bl = this.buffers.length; bi < bl - 1; ++bi) {
	    var buffer = this.buffers[bi];
	    buffer.copy(output, outputIndex);
	    outputIndex += buffer.length;
	  }
	  var lastBuffer = this.buffers[this.buffers.length - 1];
	  if (this.messageEnd > 0) lastBuffer.copy(output, outputIndex, 0, this.messageEnd);
	  var tail = null;
	  if (this.messageEnd < lastBuffer.length - 1) {
	    tail = lastBuffer.slice(this.messageEnd + 1);
	  }
	  this.reset();
	  this.ontext(output.toString('utf8'));
	  return tail;
	}

	/**
	 * Handles an error
	 *
	 * @api private
	 */

	Receiver.prototype.error = function (reason, terminate) {
	  this.reset();
	  this.onerror(reason, terminate);
	  return this;
	}

	/**
	 * Reset parser state
	 *
	 * @api private
	 */

	Receiver.prototype.reset = function (reason) {
	  if (this.dead) return;
	  this.state = EMPTY;
	  this.buffers = [];
	  this.messageEnd = -1;
	  this.spanLength = 0;
	}

	/**
	 * Internal api
	 */

	function bufferIndex(buffer, byte) {
	  for (var i = 0, l = buffer.length; i < l; ++i) {
	    if (buffer[i] === byte) return i;
	  }
	  return -1;
	}


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/*!
	 * ws: a node.js websocket client
	 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
	 * MIT Licensed
	 */

	var util = __webpack_require__(27)
	  , events = __webpack_require__(35)
	  , http = __webpack_require__(36)
	  , crypto = __webpack_require__(38)
	  , url = __webpack_require__(39)
	  , Options = __webpack_require__(41)
	  , WebSocket = __webpack_require__(34)
	  , tls = __webpack_require__(53)
	  , url = __webpack_require__(39);

	/**
	 * WebSocket Server implementation
	 */

	function WebSocketServer(options, callback) {
	  options = new Options({
	    host: '127.0.0.1',
	    port: null,
	    server: null,
	    verifyClient: null,
	    path: null,
	    noServer: false,
	    disableHixie: false,
	    clientTracking: true
	  }).merge(options);
	  if (!options.value.port && !options.value.server && !options.value.noServer) {
	    throw new TypeError('`port` or a `server` must be provided');
	  }

	  var self = this;

	  if (options.value.port) {
	    this._server = http.createServer(function (req, res) {
	      res.writeHead(200, {'Content-Type': 'text/plain'});
	      res.end('Not implemented');
	    });
	    this._server.listen(options.value.port, options.value.host, callback);
	    this._closeServer = function() { self._server.close(); };
	    this._server.once('listening', function() { self.emit('listening'); });
	  }
	  else if (options.value.server) {
	    this._server = options.value.server;
	    if (options.value.path) {
	      // take note of the path, to avoid collisions when multiple websocket servers are
	      // listening on the same http server
	      if (this._server._webSocketPaths && options.value.server._webSocketPaths[options.value.path]) {
	        throw new Error('two instances of WebSocketServer cannot listen on the same http server path');
	      }
	      if (typeof this._server._webSocketPaths !== 'object') {
	        this._server._webSocketPaths = {};
	      }
	      this._server._webSocketPaths[options.value.path] = 1;
	    }
	  }

	  if (typeof this._server != 'undefined') {
	    this._server.on('error', function(error) {
	      self.emit('error', error)
	    });
	    this._server.on('upgrade', function(req, socket, upgradeHead) {
	      self.handleUpgrade(req, socket, upgradeHead, function(client) {
	        self.emit('connection'+req.url, client);
	        self.emit('connection', client);
	      });
	    });
	  }

	  this.options = options.value;
	  this.path = options.value.path;
	  this.clients = [];
	}

	/**
	 * Inherits from EventEmitter.
	 */

	util.inherits(WebSocketServer, events.EventEmitter);

	/**
	 * Immediately shuts down the connection.
	 *
	 * @api public
	 */

	WebSocketServer.prototype.close = function(code, data) {
	  // terminate all associated clients
	  var error = null;
	  try {
	    for (var i = 0, l = this.clients.length; i < l; ++i) {
	      this.clients[i].terminate();
	    }
	  }
	  catch (e) {
	    error = e;
	  }

	  // remove path descriptor, if any
	  if (this.path && this._server._webSocketPaths) {
	    delete this._server._webSocketPaths[this.path];
	    if (Object.keys(this._server._webSocketPaths).length == 0) {
	      delete this._server._webSocketPaths;
	    }
	  }

	  // close the http server if it was internally created
	  try {
	    if (typeof this._closeServer !== 'undefined') {
	      this._closeServer();
	    }
	  }
	  finally {
	    delete this._server;
	  }
	  if (error) throw error;
	}

	/**
	 * Handle a HTTP Upgrade request.
	 *
	 * @api public
	 */

	WebSocketServer.prototype.handleUpgrade = function(req, socket, upgradeHead, cb) {
	  // check for wrong path
	  if (this.options.path) {
	    var u = url.parse(req.url);
	    if (u && u.pathname !== this.options.path) return;
	  }

	  if (typeof req.headers.upgrade === 'undefined' || req.headers.upgrade.toLowerCase() !== 'websocket') {
	    abortConnection(socket, 400, 'Bad Request');
	    return;
	  }

	  if (req.headers['sec-websocket-key1']) handleHixieUpgrade.apply(this, arguments);
	  else handleHybiUpgrade.apply(this, arguments);
	}

	module.exports = WebSocketServer;

	/**
	 * Entirely private apis,
	 * which may or may not be bound to a sepcific WebSocket instance.
	 */

	function handleHybiUpgrade(req, socket, upgradeHead, cb) {
	  // handle premature socket errors
	  var errorHandler = function() {
	    try { socket.destroy(); } catch (e) {}
	  }
	  socket.on('error', errorHandler);

	  // verify key presence
	  if (!req.headers['sec-websocket-key']) {
	    abortConnection(socket, 400, 'Bad Request');
	    return;
	  }

	  // verify version
	  var version = parseInt(req.headers['sec-websocket-version']);
	  if ([8, 13].indexOf(version) === -1) {
	    abortConnection(socket, 400, 'Bad Request');
	    return;
	  }

	  // verify client
	  var origin = version < 13 ?
	    req.headers['sec-websocket-origin'] :
	    req.headers['origin'];

	  // handler to call when the connection sequence completes
	  var self = this;
	  var completeHybiUpgrade = function() {
	     var protocol = req.headers['sec-websocket-protocol'];

	    // calc key
	    var key = req.headers['sec-websocket-key'];
	    var shasum = crypto.createHash('sha1');
	    shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	    key = shasum.digest('base64');

	    var headers = [
	        'HTTP/1.1 101 Switching Protocols'
	      , 'Upgrade: websocket'
	      , 'Connection: Upgrade'
	      , 'Sec-WebSocket-Accept: ' + key
	    ];

	    if (typeof protocol != 'undefined') {
	      headers['Sec-WebSocket-Protocol'] = protocol;
	    }

	    socket.setTimeout(0);
	    socket.setNoDelay(true);
	    try {
	      socket.write(headers.concat('', '').join('\r\n'));
	    }
	    catch (e) {
	      // if the upgrade write fails, shut the connection down hard
	      try { socket.destroy(); } catch (e) {}
	      return;
	    }

	    var client = new WebSocket([req, socket, upgradeHead], {
	      protocolVersion: version,
	      protocol: protocol
	    });

	    if (self.options.clientTracking) {
	      self.clients.push(client);
	      client.on('close', function() {
	        var index = self.clients.indexOf(client);
	        if (index != -1) {
	          self.clients.splice(index, 1);
	        }
	      });
	    }

	    // signal upgrade complete
	    socket.removeListener('error', errorHandler);
	    cb(client);
	  }

	  // optionally call external client verification handler
	  if (typeof this.options.verifyClient == 'function') {
	    var info = {
	      origin: origin,
	      secure: typeof req.connection.encrypted !== 'undefined',
	      req: req
	    };
	    if (this.options.verifyClient.length == 2) {
	      this.options.verifyClient(info, function(result) {
	        if (!result) abortConnection(socket, 401, 'Unauthorized')
	        else completeHybiUpgrade();
	      });
	      return;
	    }
	    else if (!this.options.verifyClient(info)) {
	      abortConnection(socket, 401, 'Unauthorized');
	      return;
	    }
	  }

	  completeHybiUpgrade();
	}

	function handleHixieUpgrade(req, socket, upgradeHead, cb) {
	  // handle premature socket errors
	  var errorHandler = function() {
	    try { socket.destroy(); } catch (e) {}
	  }
	  socket.on('error', errorHandler);

	  // bail if options prevent hixie
	  if (this.options.disableHixie) {
	    abortConnection(socket, 401, 'Hixie support disabled');
	    return;
	  }

	  // verify key presence
	  if (!req.headers['sec-websocket-key2']) {
	    abortConnection(socket, 400, 'Bad Request');
	    return;
	  }

	  var origin = req.headers['origin']
	    , self = this;

	  // setup handshake completion to run after client has been verified
	  var onClientVerified = function() {
	    var location = ((req.headers['x-forwarded-proto'] === 'https' || socket.encrypted) ? 'wss' : 'ws') + '://' + req.headers.host + req.url
	      , protocol = req.headers['sec-websocket-protocol'];

	    // handshake completion code to run once nonce has been successfully retrieved
	    var completeHandshake = function(nonce, rest) {
	      // calculate key
	      var k1 = req.headers['sec-websocket-key1']
	        , k2 = req.headers['sec-websocket-key2']
	        , md5 = crypto.createHash('md5');

	      [k1, k2].forEach(function (k) {
	        var n = parseInt(k.replace(/[^\d]/g, ''))
	          , spaces = k.replace(/[^ ]/g, '').length;
	        if (spaces === 0 || n % spaces !== 0){
	          abortConnection(socket, 400, 'Bad Request');
	          return;
	        }
	        n /= spaces;
	        md5.update(String.fromCharCode(
	          n >> 24 & 0xFF,
	          n >> 16 & 0xFF,
	          n >> 8  & 0xFF,
	          n       & 0xFF));
	      });
	      md5.update(nonce.toString('binary'));

	      var headers = [
	          'HTTP/1.1 101 Switching Protocols'
	        , 'Upgrade: WebSocket'
	        , 'Connection: Upgrade'
	        , 'Sec-WebSocket-Location: ' + location
	      ];
	      if (typeof protocol != 'undefined') headers.push('Sec-WebSocket-Protocol: ' + protocol);
	      if (typeof origin != 'undefined') headers.push('Sec-WebSocket-Origin: ' + origin);

	      socket.setTimeout(0);
	      socket.setNoDelay(true);
	      try {
	        // merge header and hash buffer
	        var headerBuffer = new Buffer(headers.concat('', '').join('\r\n'));
	        var hashBuffer = new Buffer(md5.digest('binary'), 'binary');
	        var handshakeBuffer = new Buffer(headerBuffer.length + hashBuffer.length);
	        headerBuffer.copy(handshakeBuffer, 0);
	        hashBuffer.copy(handshakeBuffer, headerBuffer.length);

	        // do a single write, which - upon success - causes a new client websocket to be setup
	        socket.write(handshakeBuffer, 'binary', function(err) {
	          if (err) return; // do not create client if an error happens
	          var client = new WebSocket([req, socket, rest], {
	            protocolVersion: 'hixie-76',
	            protocol: protocol
	          });
	          if (self.options.clientTracking) {
	            self.clients.push(client);
	            client.on('close', function() {
	              var index = self.clients.indexOf(client);
	              if (index != -1) {
	                self.clients.splice(index, 1);
	              }
	            });
	          }

	          // signal upgrade complete
	          socket.removeListener('error', errorHandler);
	          cb(client);
	        });
	      }
	      catch (e) {
	        try { socket.destroy(); } catch (e) {}
	        return;
	      }
	    }

	    // retrieve nonce
	    var nonceLength = 8;
	    if (upgradeHead && upgradeHead.length >= nonceLength) {
	      var nonce = upgradeHead.slice(0, nonceLength);
	      var rest = upgradeHead.length > nonceLength ? upgradeHead.slice(nonceLength) : null;
	      completeHandshake.call(self, nonce, rest);
	    }
	    else {
	      // nonce not present in upgradeHead, so we must wait for enough data
	      // data to arrive before continuing
	      var nonce = new Buffer(nonceLength);
	      upgradeHead.copy(nonce, 0);
	      var received = upgradeHead.length;
	      var rest = null;
	      var handler = function (data) {
	        var toRead = Math.min(data.length, nonceLength - received);
	        if (toRead === 0) return;
	        data.copy(nonce, received, 0, toRead);
	        received += toRead;
	        if (received == nonceLength) {
	          socket.removeListener('data', handler);
	          if (toRead < data.length) rest = data.slice(toRead);
	          completeHandshake.call(self, nonce, rest);
	        }
	      }
	      socket.on('data', handler);
	    }
	  }

	  // verify client
	  if (typeof this.options.verifyClient == 'function') {
	    var info = {
	      origin: origin,
	      secure: typeof req.connection.encrypted !== 'undefined',
	      req: req
	    };
	    if (this.options.verifyClient.length == 2) {
	      var self = this;
	      this.options.verifyClient(info, function(result) {
	        if (!result) abortConnection(socket, 401, 'Unauthorized')
	        else onClientVerified.apply(self);
	      });
	      return;
	    }
	    else if (!this.options.verifyClient(info)) {
	      abortConnection(socket, 401, 'Unauthorized');
	      return;
	    }
	  }

	  // no client verification required
	  onClientVerified();
	}

	function abortConnection(socket, code, name) {
	  try {
	    var response = [
	      'HTTP/1.1 ' + code + ' ' + name,
	      'Content-type: text/html'
	    ];
	    socket.write(response.concat('', '').join('\r\n'));
	  }
	  catch (e) { /* ignore errors - we've aborted this connection */ }
	  finally {
	    // ensure that an early aborted connection is shut down completely
	    try { socket.destroy(); } catch (e) {}
	  }
	}


/***/ },
/* 53 */
/***/ function(module, exports) {

	module.exports = require("tls");

/***/ }
/******/ ]);