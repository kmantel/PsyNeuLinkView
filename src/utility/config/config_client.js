var fs = require("fs")

class ConfigClient{
    constructor(filepath){
        this.filepath = filepath;
        this.config = require(filepath)
    }
    get_config(){
        return this.config
    }
    set_config(config){
        fs.writeFile(this.filepath, JSON.stringify(config, null, 4))
    }
}