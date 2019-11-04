const path = require ('path');

var PROTO_PATH =path.join(__dirname,'../../protos/graph.proto');

class RPCClient {
    constructor(){
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
        this.instantiate_client = this.instantiate_client.bind(this);
        this.load_script = this.load_script.bind(this);
        this.get_json = this.get_json.bind(this);
        this.load_custom_pnl = this.load_custom_pnl.bind(this);
    }

    instantiate_client() {
        return new this.graph_proto.ServeGraph(
            'localhost:50051',
            this.grpc.credentials.createInsecure()
        );
    }

    load_script(filepath, callback=function () {}) {
        var client = this.instantiate_client();
        client.LoadScript({
            path: filepath}, function(err, response) {
            if (err) {
                throw(err)
            }
            this.script.compositions = response.compositions;
            callback()
        });
    }

    get_json(name, callback=function() {}) {
        var client = this.instantiate_client();
        client.GetJSON({
            name:name}, function(err, response) {
            if (err) {
                throw(err)
            }
            this.script.gv = JSON.parse(response.JSON);
            callback()
        });
    }

    load_custom_pnl(filepath, callback=function () {}){
        var client = this.instantiate_client()
        client.LoadCustomPnl({
            path:filepath}, function (err, response) {
            if (err) {
                throw(err)
            }
            callback()
        })
    }
}

exports.rpc_client = RPCClient;
//
// exports.script_maintainer = script;
// exports.load_custom_pnl = load_custom_pnl;
// exports.load_script = load_script;
// exports.get_json = get_json;