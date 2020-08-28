import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';

export const initialState = {
    mapIdToName:{},
    mapIdToPlotType:{},
    mapIdToDataSources:{}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT:
            var {id, plotType, name, dataSources, width, height} = action;
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name},
                mapIdToPlotType: {...state.mapIdToPlotType, [id]:plotType},
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources}
            });

        case atypes.EDIT_SUBPLOT_METADATA:
            var {id, plotType, name, dataSources, width, height} = action;
            return Object.assign({}, state, {
                mapIdToName:{
                    ...state.mapIdToName,
                    ...(name ? {[id]:name} : {})
                },
                mapIdToPlotType:{
                    ...state.mapIdToPlotType,
                    ...(plotType ? {[id]:plotType} : {})
                },
                mapIdToDataSources:{
                    ...state.mapIdToDataSources,
                    ...(dataSources ? {[id]:dataSources} : {})
                }
            });

        default:
            return state
    }
}