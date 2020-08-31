import * as atypes from '../action-types'
import { createId } from "../util";
import { PNL_PREFIX, ID_LEN} from "../../keywords";

export const initialState = {
    mapIdToName: {},
    mapIdToOwnerComponent: {}
};

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_PARAMETERS:

        default:
            return state
    }
}