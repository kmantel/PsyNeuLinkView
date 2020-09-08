import * as atypes from '../action-types'
import {PLOT_TYPES} from './constants';
import {DYNAMIC, FIXED, TRIAL_NUMBER, VALUE} from "../../keywords";

import * as util from './util';
import * as _ from 'lodash';

export const initialState = {
    mapIdToName:{},
    mapIdToPlotType:{},
    mapIdToDataSources:{},
    mapIdToXAxisSource:{},
    mapIdToXAxisMinType:{},
    mapIdToXAxisMin:{},
    mapIdToXAxisMaxType:{},
    mapIdToXAxisMax:{},
    mapIdToXAxisTickCount:{},
    mapIdTOXAxisLabel:{},
    mapIdToXAxisScale:{},
    mapIdToYAxisSource:{},
    mapIdToYAxisMinType:{},
    mapIdToYAxisMin:{},
    mapIdToYAxisMaxType:{},
    mapIdToYAxisMax:{},
    mapIdToYAxisTickCount:{},
    mapIdTOYAxisLabel:{},
    mapIdToYAxisScale:{},
    mapPlotTypeToDefaultNameCounter:_.fromPairs(PLOT_TYPES.map( type => [type, 1] ))
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.SUBPLOT_INITIALIZE:
            var {id, plotType, name, dataSources} = action,
                counter = util.getDefaultNameCounter(state, plotType, name);
            dataSources = new Set([...dataSources]) ?? new Set();
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name},
                mapIdToPlotType: {...state.mapIdToPlotType, [id]:plotType},
                mapIdToDataSources: {...state.mapIdToDataSources, [id]:dataSources},
                mapPlotTypeToDefaultNameCounter: {...state.mapPlotTypeToDefaultNameCounter, [plotType]:counter},
                mapIdToXAxisSource: {...state.mapIdToXAxisSource, [id]:TRIAL_NUMBER},
                mapIdToXAxisMinType: {...state.mapIdToXAxisMinType, [id]:FIXED},
                mapIdToXAxisMin: {...state.mapIdToXAxisMin, [id]:0},
                mapIdToXAxisMaxType:{...state.mapIdToXAxisMaxType, [id]:DYNAMIC},
                mapIdToXAxisMax: {...state.mapIdToXAxisMax, [id]:DYNAMIC},
                mapIdToXAxisTickCount:  {...state.mapIdToXAxisTickCount, [id]:5},
                mapIdTOXAxisLabel: {...state.mapIdToXAxisTickCount, [id]:""},
                mapIdToXAxisScale: {...state.mapIdToXAxisScale, [id]:"linear"},
                mapIdToYAxisSource: {...state.mapIdToYAxisSource, [id]:VALUE},
                mapIdToYAxisMinType: {...state.mapIdToYAxisMinType, [id]:FIXED},
                mapIdToYAxisMin: {...state.mapIdToYAxisMin, [id]:0},
                mapIdToYAxisMaxType: {...state.mapIdToYAxisMaxType, [id]:DYNAMIC},
                mapIdToYAxisMax: {...state.mapIdToYAxisMax, [id]:DYNAMIC},
                mapIdToYAxisTickCount: {...state.mapIdToYAxisTickCount, [id]:5},
                mapIdTOYAxisLabel: {...state.mapIdTOYAxisLabel, [id]:""},
                mapIdToYAxisScale: {...state.mapIdToYAxisScale, [id]:"linear"}
            });

        case atypes.SUBPLOT_EDIT_METADATA:
            var {id, plotType, name, dataSources} = action,
                counter;
            return Object.assign({}, state, {
                mapIdToName:{
                    ...state.mapIdToName,
                    ...(name || name.trim() === "" ? {[id]:name} : {})
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

        case atypes.SUBPLOT_ADD_DATA_SOURCE:
            var {id, dataSourceId} = action;
            var dataSources = new Set([...state.mapIdToDataSources[id], dataSourceId]);
            return Object.assign({}, state, {
                mapIdToDataSources: {...state.mapIdToDataSources, [id]: dataSources}
            });

        case atypes.SUBPLOT_REMOVE_DATA_SOURCE:
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