import {ACTION_TYPES as atypes, KEYWORDS as keywords, MAP_PARENT_TYPE_TO_FORM_TYPE} from './constants';
import * as subPlotConfigActions  from "./subplot-config-form/actions";
import { ACTION_TYPES as subPlotConfigATypes } from "./subplot-config-form/constants";
import { reducer as subPlotConfigReducer, initialState as subPlotConfigInitialState } from "./subplot-config-form/reducers";

import { getFormSpecFromParentType } from "./util";
import {INITIALIZE_SUBPLOT_BUNDLE} from "../plotting/constants";

export const initialState = {
    mapParentIdToParentType: {},
    subPlotConfig:subPlotConfigInitialState
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case INITIALIZE_SUBPLOT_BUNDLE:
            var {id, plotType} = action;
            return Object.assign({}, state, {
                mapParentIdToParentType: {...state.mapParentIdToParentType, [id]:plotType},
            });
            return state;

        case subPlotConfigATypes.SET_TAB_FOCUS:
            var {parentId, tabKey} = action;
            return Object.assign({}, state, {
                subPlotConfig: subPlotConfigReducer(state.subPlotConfig, subPlotConfigActions.setTabFocus(
                    {parentId:parentId, tabKey:tabKey}
                ))
            });

        default:
            return state
    }
}