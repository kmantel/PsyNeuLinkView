import * as atypes from './actionTypes'

export function setActiveView(id){
    return {
        type: atypes.SET_ACTIVE_VIEW,
        view: id
    }
}

export function setStyleSheet(stylesheet){
    return {
        type: atypes.SET_STYLESHEET,
        stylesheet: stylesheet
    }
}