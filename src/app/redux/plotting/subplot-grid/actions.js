import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";
import { AUTO } from "../../constants";

export function setPlotInGrid(id, position, width = AUTO, height = AUTO,
                              rowSpan = AUTO, colSpan= AUTO){
    return {
        type: atypes.SET_PLOT_IN_GRID,
        id: id,
        position: position,
        width: width,
        height: height,
        colSpan: colSpan,
        rowSpan: rowSpan
    }
}

export function editPlotLayout(id, width, height, colSpan, rowSpan, position){
    return {
        type: atypes.EDIT_GRID_LAYOUT,
        id: id,
        position: position,
        width: width,
        height: height,
        colSpan: colSpan,
        rowSpan: rowSpan,
    }
}

export function setDropFocus(id, edge){
    return {
        type: atypes.SET_GRID_DROP_FOCUS,
        id: id,
        edge: edge
    }
}