import * as atypes from '../action-types'
import {DEFAULT_TAB_KEY} from "./constants";

export const initialState = {
    mapParentIdToTabFocus:{},
    mapParentIdToPlotType:{}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id, plotType} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [id]:DEFAULT_TAB_KEY},
                mapParentIdToPlotType:{...state.mapParentIdToPlotType, [id]:plotType}
            });
        case atypes.SUBPLOT_CONFIG_FORM_SET_TAB_FOCUS:
            var {parentId, tabKey} = action;
            return Object.assign({}, state, {
                mapParentIdToTabFocus: {...state.mapParentIdToTabFocus, [parentId]:tabKey}
            });
        default:
            return state
    }
}