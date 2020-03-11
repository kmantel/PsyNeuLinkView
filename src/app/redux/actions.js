import * as atypes from './actionTypes'

export function setActiveView(id){
    return {
        type: atypes.SET_ACTIVE_VIEW,
        id
    }
}