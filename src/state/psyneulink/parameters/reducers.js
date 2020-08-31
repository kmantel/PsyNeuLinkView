import {ACTION_TYPES as atypes, KEYWORDS as keywords} from './constants';

import { createId } from "../../util";
import { PNL_PREFIX } from "../constants";
import { ID_LEN } from "../../core/constants";

export const initialState = {
    mapIdToName: {},
    mapIdToOwnerComponent: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.REGISTER_PARAMETERS:

        default:
            return state
    }
}