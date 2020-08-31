import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function registerComponent(
    id,
    name
){
    return {
        type: atypes.REGISTER_COMPONENT,
        id,
        name: name
    }
}