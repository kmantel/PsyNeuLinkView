import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';

export const initialState = {
    mapIdToColSpan:{},
    mapIdToRowSpan:{},
    mapIdToPosition:{},
    dropFocus:[null,null]
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SET_PLOT_IN_GRID:
            return Object.assign({}, state, {
                mapIdToPosition: {...state.mapIdToPosition, [action.id]:action.position},
                mapIdToColSpan: {...state.mapIdToColSpan, [action.id]:action.colSpan},
                mapIdToRowSpan: {...state.mapIdToRowSpan, [action.id]:action.rowSpan},
            });

        case atypes.EDIT_GRID_LAYOUT:
            var {id, position, colSpan, rowSpan} = action;
            return Object.assign({}, state, {
                mapIdToPosition:{
                    ...state.mapIdToPosition,
                    ...(position ? {[id]:position} : {})
                },
                mapIdToColSpan:{
                    ...state.mapIdToColSpan,
                    ...(colSpan ? {[id]:colSpan} : {})
                },
                mapIdToRowSpan:{
                    ...state.mapIdToRowSpan,
                    ...(rowSpan ? {[id]:rowSpan} : {})
                }
            });

        case atypes.SET_GRID_DROP_FOCUS:
            var {id, edge} = action;
            return Object.assign({}, state, {
                ...state,
                dropFocus:[id,edge]
            });

        default:
            return state

    }
}

