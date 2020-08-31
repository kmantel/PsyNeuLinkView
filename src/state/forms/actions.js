import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function initializeConfigForm(
    {parentId, parentType}
) {
    return {
        type: atypes.INITIALIZE_CONFIG_FORM,
        parentId: parentId,
        parentType: parentType,
    }
}
