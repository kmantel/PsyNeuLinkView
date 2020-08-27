import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';
import * as subplotActions  from "./subplots/actions";
import { ACTION_TYPES as subplotATypes } from "./subplots/constants";
import { reducer as subplotReducer, initialState as subplotInitialState } from "./subplots/reducers";
import * as subplotGridActions  from "./subplot-grid/actions";
import { ACTION_TYPES as subplotGridATypes } from "./subplot-grid/constants";
import { createId } from "../util";
import { reducer as subplotGridReducer, initialState as subplotGridInitialState } from "./subplot-grid/reducers";

const initialState = {
    setIds: new Set(),
    arrIds: [],
    subplots:subplotInitialState,
    subplotGrid:subplotGridInitialState,
};

export function reducer(state = initialState, action){
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT_BUNDLE:
            var {id, plotType, name, dataSources, position, width, colSpan, height, rowSpan} = action;
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
                arrIds: [...state.setIds, id],
                subplots: subplotReducer(state.subplots, subplotActions.initializeSubplot(
                    id, plotType, name, dataSources
                )),
                subplotGrid: subplotGridReducer(state.subplotGrid, subplotGridActions.setPlotInGrid(
                    id, position, width, colSpan, height, rowSpan
                ))
            });
        case subplotGridATypes.EDIT_GRID_LAYOUT:
            var {id, width, height, colSpan, rowSpan, position} = action;
            return Object.assign({}, state, {
                subplotGrid: subplotGridReducer(state.subplotGrid, subplotGridActions.editPlotLayout(
                    id, width, height, colSpan, rowSpan, position
                ))
            });
        default:
            return state
    }
}