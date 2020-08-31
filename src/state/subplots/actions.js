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

export function editSubplotMetaData({id, plotType, name, dataSources}){
    return {
        type: atypes.SUBPLOT_EDIT_METADATA,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
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