import {ACTION_TYPES as atypes, PLOT_TYPES} from './constants';
import * as util from './util';
import * as _ from 'lodash';

export const initialState = {
    mapIdToName:{},
    mapIdToPlotType:{},
    mapIdToDataSources:{},
    mapPlotTypeToDefaultNameCounter:_.fromPairs(PLOT_TYPES.map( type => [type, 1] ))
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.INITIALIZE_SUBPLOT:
            var {id, plotType, name, dataSources} = action,
                counter;
            name = util.parseName(state, plotType, name);
            counter = util.getDefaultNameCounter(state, plotType, name);
            dataSources = dataSources ?? new Set();
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name},
                mapIdToPlotType: {...state.mapIdToPlotType, [id]:plotType},
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources},
                mapPlotTypeToDefaultNameCounter: {...state.mapPlotTypeToDefaultNameCounter, [plotType]:counter}
            });

        case atypes.EDIT_SUBPLOT_METADATA:
            var {id, plotType, name, dataSources} = action,
                counter;
            name = util.parseNameOnEdit(id, state, plotType, name);
            counter = util.parseDefaultNameCounterOnEdit(id, state, plotType, name);
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
                },
                mapPlotTypeToDefaultNameCounter: {
                    ...state.mapPlotTypeToDefaultNameCounter,
                    [plotType]:counter
                }
            });

        case atypes.ADD_DATA_SOURCE:
            var {id, dataSourceId} = action;
            var dataSources = new Set([...state.mapIdToDataSources[id], dataSourceId]);
            return Object.assign({}, state, {
                mapIdToDataSources: {...state.mapIdToDataSources, [id]: dataSources}
            });

        case atypes.REMOVE_DATA_SOURCE:
            var {id, dataSourceId} = action;
            var dataSources = new Set([...state.mapIdToDataSources[id]]);
            dataSources.delete(dataSourceId);
            return Object.assign({}, state, {
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources}
            });

        default:
            return state
    }
}