/**
 * @fileoverview gRPC-Web generated client stub for graph
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.graph = require('./graph_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.graph.ServeGraphClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.graph.ServeGraphPromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

  /**
   * @private @const {?Object} The credentials to be used to connect
   *    to the server
   */
  this.credentials_ = credentials;

  /**
   * @private @const {?Object} Options for the client
   */
  this.options_ = options;
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.graph.ScriptPath,
 *   !proto.graph.ScriptCompositions>}
 */
const methodDescriptor_ServeGraph_LoadScript = new grpc.web.MethodDescriptor(
  '/graph.ServeGraph/LoadScript',
  grpc.web.MethodType.UNARY,
  proto.graph.ScriptPath,
  proto.graph.ScriptCompositions,
  /** @param {!proto.graph.ScriptPath} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.ScriptCompositions.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.graph.ScriptPath,
 *   !proto.graph.ScriptCompositions>}
 */
const methodInfo_ServeGraph_LoadScript = new grpc.web.AbstractClientBase.MethodInfo(
  proto.graph.ScriptCompositions,
  /** @param {!proto.graph.ScriptPath} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.ScriptCompositions.deserializeBinary
);


/**
 * @param {!proto.graph.ScriptPath} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.graph.ScriptCompositions)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.graph.ScriptCompositions>|undefined}
 *     The XHR Node Readable Stream
 */
proto.graph.ServeGraphClient.prototype.loadScript =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/graph.ServeGraph/LoadScript',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_LoadScript,
      callback);
};


/**
 * @param {!proto.graph.ScriptPath} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.graph.ScriptCompositions>}
 *     A native promise that resolves to the response
 */
proto.graph.ServeGraphPromiseClient.prototype.loadScript =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/graph.ServeGraph/LoadScript',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_LoadScript);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.graph.NullArgument,
 *   !proto.graph.ScriptCompositions>}
 */
const methodDescriptor_ServeGraph_GetCompositions = new grpc.web.MethodDescriptor(
  '/graph.ServeGraph/GetCompositions',
  grpc.web.MethodType.UNARY,
  proto.graph.NullArgument,
  proto.graph.ScriptCompositions,
  /** @param {!proto.graph.NullArgument} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.ScriptCompositions.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.graph.NullArgument,
 *   !proto.graph.ScriptCompositions>}
 */
const methodInfo_ServeGraph_GetCompositions = new grpc.web.AbstractClientBase.MethodInfo(
  proto.graph.ScriptCompositions,
  /** @param {!proto.graph.NullArgument} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.ScriptCompositions.deserializeBinary
);


/**
 * @param {!proto.graph.NullArgument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.graph.ScriptCompositions)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.graph.ScriptCompositions>|undefined}
 *     The XHR Node Readable Stream
 */
proto.graph.ServeGraphClient.prototype.getCompositions =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/graph.ServeGraph/GetCompositions',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_GetCompositions,
      callback);
};


/**
 * @param {!proto.graph.NullArgument} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.graph.ScriptCompositions>}
 *     A native promise that resolves to the response
 */
proto.graph.ServeGraphPromiseClient.prototype.getCompositions =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/graph.ServeGraph/GetCompositions',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_GetCompositions);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.graph.GraphName,
 *   !proto.graph.GraphJSON>}
 */
const methodDescriptor_ServeGraph_GetJSON = new grpc.web.MethodDescriptor(
  '/graph.ServeGraph/GetJSON',
  grpc.web.MethodType.UNARY,
  proto.graph.GraphName,
  proto.graph.GraphJSON,
  /** @param {!proto.graph.GraphName} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.GraphJSON.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.graph.GraphName,
 *   !proto.graph.GraphJSON>}
 */
const methodInfo_ServeGraph_GetJSON = new grpc.web.AbstractClientBase.MethodInfo(
  proto.graph.GraphJSON,
  /** @param {!proto.graph.GraphName} request */
  function(request) {
    return request.serializeBinary();
  },
  proto.graph.GraphJSON.deserializeBinary
);


/**
 * @param {!proto.graph.GraphName} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.graph.GraphJSON)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.graph.GraphJSON>|undefined}
 *     The XHR Node Readable Stream
 */
proto.graph.ServeGraphClient.prototype.getJSON =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/graph.ServeGraph/GetJSON',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_GetJSON,
      callback);
};


/**
 * @param {!proto.graph.GraphName} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.graph.GraphJSON>}
 *     A native promise that resolves to the response
 */
proto.graph.ServeGraphPromiseClient.prototype.getJSON =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/graph.ServeGraph/GetJSON',
      request,
      metadata || {},
      methodDescriptor_ServeGraph_GetJSON);
};


module.exports = proto.graph;

