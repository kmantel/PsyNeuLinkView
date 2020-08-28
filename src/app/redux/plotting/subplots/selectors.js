import { createSelector } from 'reselect'
import { LINE_PLOT } from './constants';

const getMapIdToName = state => state.mapIdToName;
const getMapIdToPlotType = state => state.mapIdToPlotType;
const getMapIdToDataSources = state => state.mapIdToDataSources;

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
