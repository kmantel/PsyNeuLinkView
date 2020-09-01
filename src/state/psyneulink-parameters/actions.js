import * as atypes from '../action-types';

export function registerParameters({
    ownerId,
    parameterSpecs
}){
    return {
        type: atypes.PSYNEULINK_REGISTER_PARAMETERS,
        ownerId: ownerId,
        parameterSpecs: parameterSpecs
    }
}