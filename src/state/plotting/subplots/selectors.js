import { createSelector } from 'reselect'
import { LINE_PLOT } from './constants';

export const getMapIdToName = state => state.mapIdToName;
export const getMapIdToPlotType = state => state.mapIdToPlotType;
export const getMapIdToDataSources = state => state.mapIdToDataSources;
export const getMapPlotTypeToDefaultNameCounter = state => state.mapPlotTypeToDefaultNameCounter;

export const getSubplotMetaData = createSelector(
    getMapIdToName,
    getMapIdToPlotType,
    getMapIdToDataSources,
    (name, plotType, dataSources) => {
        const ids = Object.keys(name),
            metaData = {};
        ids.forEach( (id)=>{
            metaData[id] = {name:name[id], plotType:plotType[id], dataSources:dataSources[id]}
        });
        return metaData
    }
);
