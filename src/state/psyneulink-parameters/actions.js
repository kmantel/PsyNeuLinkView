import * as atypes from '../action-types';

export function registerParameters(
    ownerId,
    name
){
    return {
        type: atypes.PSYNEULINK_REGISTER_PARAMETERS,
        ownerId: ownerId,
        name: name
    }
}