import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function registerParameters(
    ownerId,
    name
){
    return {
        type: atypes.REGISTER_PARAMETERS,
        ownerId: ownerId,
        name: name
    }
}