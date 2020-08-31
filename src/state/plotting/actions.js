import { ACTION_TYPES as atypes } from "./constants";
import { KEYWORDS as subplotGridKeywords } from "./subplot-grid/constants";
import { AUTO } from "../core/constants";

export function initializeSubplotBundle({
    id,
    plotType,
    name,
    dataSources,
    position,
    colSpan,
    rowSpan
}) {
    return {
        type: atypes.INITIALIZE_SUBPLOT_BUNDLE,
        id: id,
        plotType: plotType,
        name: name,
        dataSources: dataSources,
        position: position,
        colSpan: colSpan,
        rowSpan: rowSpan
    }
}