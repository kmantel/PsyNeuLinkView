import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function addTab(
    {parentId, label, takeFocus}
) {
    return {
        type: atypes.ADD_TAB,
        parentId: parentId,
        label: label,
        takeFocus: takeFocus
    }
}

export function setMainTabFocus(
    {parentId}
) {
    return {
        type: atypes.SET_TAB_FOCUS,
        parentId: parentId
    }
}