import { createSelector } from 'reselect'

export const getMapIdToParameterSet = state => state.mapIdToParameterSet;
export const getMapIdToName = state => state.mapIdToName;

export const getComponentMapIdToParameterSet = createSelector(
    getMapIdToParameterSet,
    param => param
);

