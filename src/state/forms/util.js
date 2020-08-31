import {LINE_PLOT} from "../plotting/subplots/constants";
import { reducer as subPlotConfigReducer } from "./subplot-config-form/reducers";
import { initializeSubplotConfigForm } from "./subplot-config-form/actions";

const mapParentTypeToFormType  = {
    LINE_PLOT:{
        reducer: subPlotConfigReducer,
        key: 'subplotConfig',
        actionFn: initializeSubplotConfigForm,
        options: {
            parentId: null,
            plotType: LINE_PLOT
        }
    }
};

export function getFormSpecFromParentType(parentId, parentType){
    const spec = mapParentTypeToFormType[parentType];
    spec.options.parentId = parentId;
    return spec
}