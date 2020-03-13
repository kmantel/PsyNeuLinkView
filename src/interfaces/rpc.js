const log = require('electron-log'),
    grpc = require('grpc'),
    protoloader = require('@grpc/proto-loader'),
    path = require('path');

class RPCInterface{
    constructor() {
        var PROTO_PATH = path.join(__dirname, '../protos/graph.proto');
        this.packageDefinition = protoloader.loadSync(
            PROTO_PATH,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });
        this.graph_proto = grpc.loadPackageDefinition(this.packageDefinition).graph;
        this.script_maintainer = {
            compositions: {},
            gv: {},
            style: {}
        };
        this.most_recent_response = {'status': 'test'};
        this.instantiate_client = this.instantiate_client.bind(this);
        this.load_script = this.load_script.bind(this);
        this.get_json = this.get_json.bind(this);
        this.load_custom_pnl = this.load_custom_pnl.bind(this);
    }

    instantiate_client() {
        return new this.graph_proto.ServeGraph(
            'localhost:50051',
            grpc.credentials.createInsecure()
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
            } else {
                self.script_maintainer.compositions = response.compositions;
                callback()
            }
        });
    }

    get_style(filepath, callback = function () {
    }) {
        var client = this.instantiate_client();
        var self = this;
        client.LoadGraphics({
            path: filepath
        }, function (err, response) {
            if (err) {
                callback(err)
            } else {
                self.script_maintainer.style = JSON.parse(response.styleJSON);
                callback()
            }
        })
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
            } else {
                self.script_maintainer.gv = JSON.parse(response.objectsJSON);
                self.script_maintainer.style = JSON.parse(response.styleJSON);
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
            } else {
                callback()
            }
        })
    }

    update_stylesheet(callback = function () {
    }) {
        var client = this.instantiate_client();
        return client.UpdateStylesheet(callback)
    }

    health_check(callback = function () {
    }) {
        var self = this;
        var client = this.instantiate_client();
        client.HealthCheck({}, function (err, response) {
            if (err) {
                // log.debug(err)
                console.log('error:', err)
            } else {
                self.most_recent_response = response;
                callback();
            }
        })
    }
}

exports.rpcInterface = new RPCInterface();