import * as atypes from '../action-types'
import {AUTO} from "../core/constants";

export function initializeSubplot({id, plotType, name, dataSources, position, colSpan, rowSpan}){
    return {
        type: atypes.SUBPLOT_INITIALIZE,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources,
        position:position,
        colSpan:colSpan,
        rowSpan:rowSpan
    }
}

export function editSubplotMetaData(
    {
        id, plotType, name, dataSources,
        xAxisSource, xAxisMinType, xAxisMin, xAxisMaxType, xAxisMax, xAxisTickCount, xAxisLabel, xAxisScale,
        yAxisSource, yAxisMinType, yAxisMin, yAxisMaxType, yAxisMax, yAxisTickCount, yAxisLabel, yAxisScale
    }){
    return {
        type: atypes.SUBPLOT_EDIT_METADATA,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources,
        xAxisSource: xAxisSource,
        xAxisMinType: xAxisMinType,
        xAxisMin: xAxisMin,
        xAxisMaxType: xAxisMaxType,
        xAxisMax: xAxisMax,
        xAxisTickCount: xAxisTickCount,
        xAxisLabel: xAxisLabel,
        xAxisScale: xAxisScale,
        yAxisSource: yAxisSource,
        yAxisMinType: yAxisMinType,
        yAxisMin: yAxisMin,
        yAxisMaxType: yAxisMaxType,
        yAxisMax: yAxisMax,
        yAxisTickCount: yAxisTickCount,
        yAxisLabel: yAxisLabel,
        yAxisScale: yAxisScale
    }
}

export function addDataSource({id, dataSourceId}){
    return {
        type: atypes.SUBPLOT_ADD_DATA_SOURCE,
        id: id,
        dataSourceId: dataSourceId
    }
}

export function removeDataSource({id, dataSourceId}){
    return {
        type: atypes.SUBPLOT_REMOVE_DATA_SOURCE,
        id: id,
        dataSourceId: dataSourceId
    }
}