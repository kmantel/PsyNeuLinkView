import {setActiveView} from "./actions";
import * as atypes from './actionTypes'

const initialState = {
    activeView: 'graphview',
    active_param_tab: 'composition',
    stylesheet: {},
    model_aspect_ratio: null
};

export function rootReducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SET_ACTIVE_VIEW:
            return Object.assign({}, state, {
                    activeView: action.view
                }
            );

        case atypes.SET_STYLESHEET:
            return Object.assign({}, state, {
                    stylesheet: action.stylesheet
                }
            );

        case atypes.SET_MODEL_ASPECT_RATIO:
            return Object.assign({}, state, {
                    model_aspect_ratio: action.ratio
                }
            );

        case atypes.SET_ACTIVE_PARAM_TAB:
            return Object.assign( {}, state, {
                    active_param_tab: action.id
                }
            );

        default:
            return state
    }
}