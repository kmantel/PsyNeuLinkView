import * as atypes from '../action-types'

export function initializeSubplotConfigForm({parentId, plotType}){
    return {
        type: atypes.SUBPLOT_INITIALIZE,
        parentId: parentId,
        plotType: plotType
    }
}

export function setTabFocus({parentId, tabKey}) {
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_TAB_FOCUS,
        parentId: parentId,
        tabKey: tabKey
    }
}

export function setComponentFocus({parentId, tabKey}) {
    return {
        type: atypes.SUBPLOT_CONFIG_FORM_SET_COMPONENT_FOCUS,
        parentId: parentId,
        tabKey: tabKey
    }
}