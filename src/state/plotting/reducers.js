import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';
import * as subplotActions  from "./subplots/actions";
import { ACTION_TYPES as subplotATypes } from "./subplots/constants";
import { reducer as subplotReducer, initialState as subplotInitialState } from "./subplots/reducers";
import * as gridActions  from "./subplot-grid/actions";
import { ACTION_TYPES as gridATypes } from "./subplot-grid/constants";
import { reducer as subplotGridReducer, initialState as subplotGridInitialState } from "./subplot-grid/reducers";
import { createId } from "../util";
import { ID_LEN } from "../core/constants";

const initialState = {
    setIds: new Set(),
    arrIds: [],
    subplots:subplotInitialState,
    subplotGrid:subplotGridInitialState,
};

export function reducer(state = initialState, action){
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT_BUNDLE:
            var {id, plotType, name, dataSources, position, colSpan, rowSpan} = action;
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
                arrIds: [...state.setIds, id],
                subplots: subplotReducer(state.subplots, subplotActions.initializeSubplot(
                    id, plotType, name, dataSources
                )),
                subplotGrid: subplotGridReducer(state.subplotGrid, gridActions.setPlotInGrid(
                    id,  position, rowSpan, colSpan
                ))
            });

        case gridATypes.EDIT_GRID_LAYOUT:
            var {id, colSpan, rowSpan, position} = action;
            return Object.assign({}, state, {
                subplotGrid: subplotGridReducer(state.subplotGrid, gridActions.editGridLayout(
                    id, colSpan, rowSpan, position
                ))
            });

        case gridATypes.SET_GRID_DROP_FOCUS:
            var {id, edge} = action;
            return Object.assign({}, state, {
                subplotGrid: subplotGridReducer(state.subplotGrid, gridActions.setGridDropFocus(
                    id, edge
                ))
            });

        case subplotATypes.EDIT_SUBPLOT_METADATA:
            var {id, plotType, name, dataSources} = action;
            return Object.assign({}, state, {
                subplots: subplotReducer(state.subplots, subplotActions.editSubplotMetaData(
                    {id:id, plotType:plotType, name:name, dataSources:dataSources}
                ))
            });

        default:
            return state
    }
}