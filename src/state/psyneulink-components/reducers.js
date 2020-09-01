import * as atypes from '../action-types'

export const initialState = {
    mapIdToName: {},
    mapIdToParameterSet: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_COMPONENT:
            var {id, name} = action;
            return Object.assign({}, state, {
                mapIdToName: {...state.mapIdToName, [id]:name}
            });
        default:
            return state
    }
}