import * as atypes from '../action-types'

export function registerMechanism(mechanismName){
    return {
        type: atypes.PSYNEULINK_REGISTER_MECHANISM,
        name: mechanismName
    }
}

export function registerParameters(mechanism, parameters){
    return {
        type: atypes.PSYNEULINK_REGISTER_PARAMETERS,
        mechanismName: mechanism,
        parameters: parameters
    }

}