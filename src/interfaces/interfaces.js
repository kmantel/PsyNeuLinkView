const fileSystemInterface = require('./filesystem').fileSystemInterface,
    interpreterInterface = require('./interpreter').interpreterInterface,
    electronInterface = require('./electron').electronInterface;

var interfaces = {
    'filesystem': fileSystemInterface,
    'interpreter': interpreterInterface,
    'electron': electronInterface
};

exports.interfaces = interfaces;