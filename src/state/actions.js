import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function modifyState(
    {id, arg1, arg2, arg3}
) {
    return {
        type: atypes.MODIFY_STATE,
        id: id,
        arg1: arg1,
        arg2: arg2,
        arg3: arg3
    }
}