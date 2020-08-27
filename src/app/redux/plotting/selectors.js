import { createSelector } from 'reselect'

const getSetIds = state => state.setIds;

export const getSubplotIdSet = createSelector(
    getSetIds,
    ids => ids
);