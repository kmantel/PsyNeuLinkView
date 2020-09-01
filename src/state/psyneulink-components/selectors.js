import { createSelector } from 'reselect'

export const getMapIdToParameterSet = state => state.mapIdToParameterSet;

export const getComponentMapIdToParameterSet = createSelector(
    getMapIdToParameterSet,
    param => param
);

