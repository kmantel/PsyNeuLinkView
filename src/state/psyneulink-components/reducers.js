import * as atypes from '../action-types'

export const initialState = {
    mapIdToName: {},
    mapIdToParameterSet: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_COMPONENT:

        default:
            return state
    }
}