import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";
import { AUTO } from "../../core/constants";

export function setPlotInGrid(id, position, rowSpan = AUTO, colSpan= AUTO){
    return {
        type: atypes.SET_PLOT_IN_GRID,
        id: id,
        position: position,
        colSpan: colSpan,
        rowSpan: rowSpan
    }
}

export function editGridLayout(id, colSpan, rowSpan, position){
    return {
        type: atypes.EDIT_GRID_LAYOUT,
        id: id,
        colSpan: colSpan,
        rowSpan: rowSpan,
        position: position
    }
}

export function setGridDropFocus(id, edge){
    return {
        type: atypes.SET_GRID_DROP_FOCUS,
        id: id,
        edge: edge
    }
}