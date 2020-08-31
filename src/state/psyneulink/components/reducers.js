import {ACTION_TYPES as atypes, KEYWORDS as keywords} from './constants';

export const initialState = {
    mapIdToName: {},
    mapIdToParameterSet: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.REGISTER_COMPONENT:

        default:
            return state
    }
}