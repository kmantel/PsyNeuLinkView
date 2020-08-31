import { reducer as configurationReducer } from './configuration/reducers'
import { reducer as formsReducer } from './forms/reducers'
import { reducer as plottingReducer } from "./plotting/reducers";
import { reducer as pnlReducer } from "./psyneulink/reducers";
import { coreReducer } from "./core/reducers";
import { combineReducers } from 'redux'

export const rootReducer = combineReducers(
    {
        'core':coreReducer,
        'plotting':plottingReducer,
        'pnl':pnlReducer,
        'configuration':configurationReducer,
        'forms':formsReducer
    }
);

//
// import {ACTION_TYPES as atypes, KEYWORDS as keywords} from './constants';
//
// export const initialState = {
//     mapIdToAttr:{}
// };
//
// export function reducer(state = initialState, action) {
//     switch (action.type) {
//         case atypes.MODIFY_STATE:
//             var {id, value} = action;
//             return Object.assign({}, state, {
//                 mapIdToAttr: {...state.mapIdToAttr, [id]:value}
//             });
//         default:
//             return state
//     }
// }