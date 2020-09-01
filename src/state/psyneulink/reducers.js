import * as atypes from '../action-types'
import {createId} from "../util";
import {PNL_PREFIX, ID_LEN} from "../../keywords";

const initialState = {
    setIds: new Set(),
    arrIds: [],
    mapIdToData: {},
    mapMechNameToId:{},
    mapMechNameToParamDataArr:{},
    mapMechNameParamNameToId:{},
    mapCompNameToId:{},
    mapProjNameToId:{}
}

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.PSYNEULINK_REGISTER_MECHANISM:
            var id = createId(state.setIds, PNL_PREFIX, ID_LEN);
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
                mapMechNameToId: {...state.mapMechNameToId, ...{[action.name]:id}},
                mapIdToData: {...state.idLookup, [id]:{type:'mechanism',name:action.name}}
            });

        case atypes.PSYNEULINK_REGISTER_PARAMETERS:
            // var paramNameList = action.parameters,
            //     paramId,
            //     idBuffer = {},
            //     mechName = action.mechanismName,
            //     mechNameParamNameBuffer = {};
            // for (const paramName of paramNameList){
            //     paramId = createId(state.setIds, PNL_PREFIX, ID_LEN);
            //     mechNameParamNameBuffer[[mechName, paramName]] = paramId;
            //     idBuffer[paramId] = {
            //         type:'parameter',
            //         name:paramName,
            //         mechanism:mechName,
            //         mechanismId:state.mapMechNameToId[mechName]
            //     }
            // }
            // return Object.assign({}, state, {
            //     mapMechNameParamNameToId:{...state.parameters, ...mechNameParamNameBuffer},
            //     mapIdToData:{...state.idLookup, ...idBuffer},
            //     mapMechNameToParamDataArr:{...state.mapMechNameToParamDataArr, [mechName]:Object.values(idBuffer)}
            // });

        default:
            return state
    }
}