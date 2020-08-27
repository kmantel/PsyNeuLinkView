import { createSelector } from 'reselect'

const getMapIdToName = state => state.mapIdToName;
const getMapIdToPlotType = state => state.mapIdToPlotType;
const getMapIdToDataSources = state => state.mapIdToDataSources;

export const getSubplotMetaData = createSelector(
    getMapIdToName,
    getMapIdToPlotType,
    getMapIdToDataSources,
    (name, plotType, dataSources) => {
        var ids = Object.keys(w),
            metaData;
        ids.forEach( (id)=>{
            metaData[id] = {name:name[id], plotType:plotType[id], dataSources:dataSources[id]}
        } )
    }
);