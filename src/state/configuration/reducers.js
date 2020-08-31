import { ACTION_TYPES as atypes, KEYWORDS as keywords } from './constants';
import { INITIALIZE_SUBPLOT_BUNDLE } from "../plotting/constants";

export const initialState = {
    arrParentIds: [],
    mapIdToLabel:{},
    tabInFocus:''
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case INITIALIZE_SUBPLOT_BUNDLE:
            var {id, name} = action;
            return Object.assign({}, state, {
                arrParentIds: [...state.arrParentIds, id],
                mapIdToLabel: {...state.mapIdToLabel, [id]:name},
            });
            return state;

        case atypes.SET_MAIN_TAB_FOCUS:
            var {parentId} = action;
            return Object.assign({}, state, {
                tabInFocus: parentId
            });

        default:
            return state
    }
}