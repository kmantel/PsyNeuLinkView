import * as atypes from './actionTypes'

export function registerMechanism(mechanismName){
    return {
        type: atypes.REGISTER_MECHANISM,
        name: mechanismName
    }
}

export function registerParameters(mechanism, parameters){
    return {
        type: atypes.REGISTER_PARAMETERS,
        mechanismName: mechanism,
        parameters: parameters
    }

}