import {ACTION_TYPES as atypes, DEFAULT_TAB_KEY, KEYWORDS as keywords} from './constants';
import {INITIALIZE_SUBPLOT_BUNDLE} from "../../plotting/constants";

export const initialState = {
    mapParentIdToTabFocus:{},
    mapParentIdToPlotType:{}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT_BUNDLE:
            var {id, plotType} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [id]:DEFAULT_TAB_KEY},
                mapParentIdToPlotType:{...state.mapParentIdToPlotType, [id]:plotType}
            });
        case atypes.SET_TAB_FOCUS:
            var {parentId, tabKey} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [parentId]:tabKey}
            });
        default:
            return state
    }
}