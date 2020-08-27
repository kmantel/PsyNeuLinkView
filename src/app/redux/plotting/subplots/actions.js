import { ACTION_TYPES as atypes } from "./constants";
import {AUTO} from "../../constants";

export function initializeSubplot(id, plotType = AUTO, name = AUTO, dataSources = AUTO){
    return {
        type: atypes.INITIALIZE_SUBPLOT,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources
    }
}