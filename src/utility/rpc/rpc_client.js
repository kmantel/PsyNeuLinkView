const path = require ('path');

var PROTO_PATH =path.join(__dirname,'../../protos/graph.proto');

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var graph_proto = grpc.loadPackageDefinition(packageDefinition).graph;
var script = {
    compositions: {},
    gv: {}
};

function instantiate_client() {
    return new graph_proto.ServeGraph(
        'localhost:50051',
        grpc.credentials.createInsecure()
    );
}

function load_script(filepath, callback=function () {}) {
    var client = instantiate_client();
    client.LoadScript({
        path: filepath}, function(err, response) {
        if (err) {
            throw(err)
        }
        script.compositions = response.compositions;
        callback()
    });
}

function get_json(name, callback=function() {}) {
    var client = instantiate_client();
    client.GetJSON({
        name:name}, function(err, response) {
        if (err) {
            throw(err)
        }
        script.gv = JSON.parse(response.JSON);
        callback()
    });
}

exports.script_maintainer = script;
exports.load_script = load_script;
exports.get_json = get_json;