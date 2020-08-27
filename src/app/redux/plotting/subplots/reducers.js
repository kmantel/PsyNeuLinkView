import { ACTION_TYPES as atypes, KEYWORDS as keywords }  from './constants';

export const initialState = {
    mapIdToName:{},
    mapIdToPlotType:{},
    mapIdToDataSources:{}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT:
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [action.id]:action.name},
                mapIdToPlotType: {...state.mapIdToPlotType, [action.id]:action.plotType},
                mapIdToDataSources: {...state.mapIdToDataSources, [action.id]:action.dataSources}
            });
        default:
            return state
    }
}