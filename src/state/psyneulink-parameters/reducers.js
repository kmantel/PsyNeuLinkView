import * as atypes from '../action-types'
import * as _ from 'lodash'

export const initialState = {
    mapIdToName: {},
    mapIdToOwnerComponent: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_PARAMETERS:
            var {ownerId, parameterSpecs} = action,
                idToOwner = _.fromPairs(Object.keys(parameterSpecs).map(id => [id, ownerId]));
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, ...parameterSpecs},
                mapIdToOwnerComponent: {...state.mapIdToOwnerComponent, ...idToOwner}
            });
        default:
            return state
    }
}