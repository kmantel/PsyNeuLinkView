import { createSelector } from 'reselect'

const getMapIdToWidth = state => state.mapIdToWidth;
const getMapIdToColSpan = state => state.mapIdToColSpan;
const getMapIdToHeight = state => state.mapIdToHeight;
const getMapIdToRowSpan = state => state.mapIdToRowSpan;
const getMapIdToPosition = state => state.mapIdToPosition;
const getDropFocus = state => state.dropFocus;

export const getGridLayout = createSelector(
    getMapIdToPosition,
    getMapIdToWidth,
    getMapIdToColSpan,
    getMapIdToHeight,
    getMapIdToRowSpan,
    (position, width, colSpan, height, rowSpan) => {
        var ids = Object.keys(width),
            metaData = {};
        for ( const id of ids ){
            metaData[id] = {position:position[id], width:width[id], colSpan:colSpan[id],
                height:height[id], rowSpan:rowSpan[id]}
        }
        return metaData
    }
);

export const getGridShape = createSelector(
    getMapIdToPosition,
    pos => {
        var positions = Object.values(pos),
            maxX=0, maxY=0;
        for (const [x,y] of positions){
            maxX = x>maxX ? x:maxX;
            maxY = y>maxY ? y:maxY;
        }
        return [maxX + 1, maxY + 1] // add 1 to return dimension sizes instead of indices
    }
);

export const getGridPositions = createSelector(
    getMapIdToPosition,
    pos => {
        var gridPositions = {};
        for (const [id, position] of Object.entries(pos)){
            gridPositions[position] = id
        }
        return gridPositions
    }
);

export const getGridDropFocus = createSelector(
    getDropFocus,
    dropFocus => dropFocus
);