import { ACTION_TYPES as atypes, KEYWORDS as keywords } from "./constants";

export function initializeSubplotConfigForm({parentId, plotType}){
    return {
        type: atypes.INITIALIZE_SUBPLOT_CONFIG_FORM,
        parentId: parentId,
        plotType: plotType
    }
}

export function setTabFocus({parentId, tabKey}) {
    return {
        type: atypes.SET_TAB_FOCUS,
        parentId: parentId,
        tabKey: tabKey
    }
}
