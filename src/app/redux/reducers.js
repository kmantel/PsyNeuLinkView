import {setActiveView} from "./actions";
import * as atypes from './actionTypes'

const initialState = {
    activeView: 'graphview'
};

export function rootReducer(state = initialState, action) {
    console.log(action)
    switch (action.type) {
        case atypes.SET_ACTIVE_VIEW:
            return Object.assign({}, state, {
                    activeView: action.view
                }
            );
        default:
            return state
    }
}