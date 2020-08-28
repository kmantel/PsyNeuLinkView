import { ACTION_TYPES as atypes } from "./constants";
import {AUTO} from "../../constants";

export function initializeSubplot(id, plotType = AUTO, name = AUTO,
                                  dataSources = AUTO){
    return {
        type: atypes.INITIALIZE_SUBPLOT,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
    }
}

export function editSubplotMetaData({id, plotType, name, dataSources, width, height}){
    return {
        type: atypes.EDIT_SUBPLOT_METADATA,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
    }
}