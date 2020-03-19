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

export function setModelAspectRatio(ratio){
    return {
        type: atypes.SET_MODEL_ASPECT_RATIO,
        ratio: ratio
    }
}