import {setActiveView} from "./actions";
import * as atypes from './actionTypes'

const initialState = {
    activeView: 'graphview',
    stylesheet: {}
};

export function rootReducer(state = initialState, action) {
    console.log(action)
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
        default:
            return state
    }
}