const path = require('path');

class RPCClient {
    constructor(proto_path, module_path) {
        var PROTO_PATH = proto_path;
        var log = require(path.join(module_path,'electron-log'));
        this.grpc = require(path.join(module_path,'grpc'));
        this.protoLoader = require(path.join(module_path,'@grpc/proto-loader'));
        this.packageDefinition = this.protoLoader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        this.graph_proto = this.grpc.loadPackageDefinition(this.packageDefinition).graph;
        this.script_maintainer = {
            compositions: {},
            gv: {}
        };
        this.most_recent_response = {'status':'test'};
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

    load_script(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.LoadScript({
            path: filepath
        }, function (err, response) {
            if (err) {
                callback(err)
            }
            else{
                self.script_maintainer.compositions = response.compositions;
                callback()
            }
        });
    }

    get_json(name, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.GetJSON({
            name: name
        }, function (err, response) {
            if (err) {
                callback(err)
            }
            else{
                self.script_maintainer.gv = JSON.parse(response.JSON);
                callback()
            }
        });
    }

    load_custom_pnl(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        client.LoadCustomPnl({
            path: filepath
        }, function (err, response) {
            if (err) {
                // log.debug(err)
                console.log(err)
            }
            else {
                callback()
            }
        })
    }

    health_check(callback = function () {
    }) {
        var self = this;
        var client = this.instantiate_client();
        client.HealthCheck({
        }, function (err, response) {
            if (err) {
                // log.debug(err)
                console.log('error:', err)
            }
            else{
                self.most_recent_response = response;
                callback();
            }
        })
    }
}

exports.rpc_client = RPCClient;
//
// exports.script_maintainer = script;
// exports.load_custom_pnl = load_custom_pnl;
// exports.load_script = load_script;
// exports.get_json = get_json;