var fs = require("fs");

class ConfigClient{
    constructor(filepath){
        this.filepath = filepath;
        this.config = require(filepath);
        this.get_config = this.get_config.bind(this);
        this.set_config = this.set_config.bind(this);
    }
    get_config(){
        var cf = this.config;
        return {...cf};
    }
    set_config(cf){
        fs.writeFile(
            this.filepath, JSON.stringify(cf), (err) => {
                console.log(err)
            }
            );
        this.config = cf
    }
}

exports.ConfigClient = ConfigClient;