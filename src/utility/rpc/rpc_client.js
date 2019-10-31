var PROTO_PATH ='/Users/ds70/Library/Preferences/WebStorm2019.2/scratches/graph.proto';

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
    gv: ''
}

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
        script.compositions = response.compositions;
        callback()
    });
}

function get_json(name, callback=function() {}) {
    var client = instantiate_client();
    client.GetJSON({
        name:name}, function(err, response) {
        script.gv = JSON.parse(response.JSON);
        callback()
    });
}

exports.script_maintainer = script;
exports.load_script = load_script;
exports.get_json = get_json;