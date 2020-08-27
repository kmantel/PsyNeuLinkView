import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';

export const initialState = {
    mapIdToWidth:{},
    mapIdToColSpan:{},
    mapIdToHeight:{},
    mapIdToRowSpan:{},
    mapIdToPosition:{},
    dropFocus:[[],[]]
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SET_PLOT_IN_GRID:
            return Object.assign({}, state, {
                mapIdToPosition: {...state.mapIdToPosition, [action.id]:action.position},
                mapIdToWidth: {...state.mapIdToWidth, [action.id]:action.width},
                mapIdToHeight: {...state.mapIdToHeight, [action.id]:action.height},
                mapIdToColSpan: {...state.mapIdToColSpan, [action.id]:action.colSpan},
                mapIdToRowSpan: {...state.mapIdToRowSpan, [action.id]:action.rowSpan},
            });

        case atypes.EDIT_GRID_LAYOUT:
            var {id, position, width, colSpan, height, rowSpan} = action;
            return Object.assign({}, state, {
                mapIdToPosition:{
                    ...state.mapIdToPosition,
                    ...(position ? {[id]:position} : {})
                },
                mapIdToWidth:{
                    ...state.mapIdToWidth,
                    ...(width ? {[id]:width} : {})
                },
                mapIdToHeight:{
                    ...state.mapIdToHeight,
                    ...(height ? {[id]:height} : {})
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
                dropFocus:[[id],[edge]]
            });

        default:
            return state

    }
}

