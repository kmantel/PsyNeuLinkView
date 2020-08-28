import {PNL_PREFIX} from "./actionTypes";

const idLength = 10;

function randomString(len){
    return Math.random().toString(20).substr(2, len)
}

export function generatePNLId(idSet){
    var id = `${PNL_PREFIX}_${randomString(idLength)}`;
    while (idSet.has(id)){
        id = randomString(idLength)
    }
    return id;
}