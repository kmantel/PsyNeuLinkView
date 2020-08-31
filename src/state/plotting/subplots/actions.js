import { ACTION_TYPES as atypes } from "./constants";
import {AUTO} from "../../core/constants";

export function initializeSubplot(id, plotType, name, dataSources){
    return {
        type: atypes.INITIALIZE_SUBPLOT,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
    }
}

export function editSubplotMetaData({id, plotType, name, dataSources}){
    return {
        type: atypes.EDIT_SUBPLOT_METADATA,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
    }
}

export function addDataSource({id, dataSourceId}){
    return {
        type: atypes.ADD_DATA_SOURCE,
        id: id,
        dataSourceId: dataSourceId
    }
}

export function removeDataSource({id, dataSourceId}){
    return {
        type: atypes.ADD_DATA_SOURCE,
        id: id,
        dataSourceId: dataSourceId
    }
}