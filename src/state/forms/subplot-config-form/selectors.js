import { createSelector } from 'reselect';
import * as _ from 'lodash';

export const getMapParentIdToTabFocus = state => state.mapParentIdToTabFocus;
export const getMapParentIdToPlotType = state => state.mapParentIdToPlotType;

export const getSubplotConfigFormMetadata = createSelector(
    getMapParentIdToTabFocus,
    getMapParentIdToPlotType,
    (foc, type) => {
        let ids = Object.keys(foc);
        return _.fromPairs(ids.map(
            id => [id, {
                tabFocus:foc[id],
                plotType:type[id]
            }]
        )) ?? {}
    }
);