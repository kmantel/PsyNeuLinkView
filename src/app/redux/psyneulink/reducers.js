// import initialState from "./initialState";
import * as atypes from './actionTypes';
import * as util from './util';

const initialState = {
    setId:new Set(),
    mapIdToData: {},
    mapMechNameToId:{},
    mapMechNameToParamDataArr:{},
    mapMechNameParamNameToId:{},
    mapCompNameToId:{},
    mapProjNameToId:{}
}

export function reducer(state = initialState, action) {
    switch (action.type) {
        case atypes.REGISTER_MECHANISM:
            var id = util.generatePNLId(state.setId);
            return Object.assign({}, state, {
                setId: new Set([...state.setId, id]),
                mapMechNameToId: {...state.mapMechNameToId, ...{[action.name]:id}},
                mapIdToData: {...state.idLookup, [id]:{type:'mechanism',name:action.name}}
            });

        case atypes.REGISTER_PARAMETERS:
            var paramNameList = action.parameters,
                paramId,
                idBuffer = {},
                mechName = action.mechanismName,
                mechNameParamNameBuffer = {};
            for (const paramName of paramNameList){
                paramId = util.generatePNLId(state.setId);
                mechNameParamNameBuffer[[mechName, paramName]] = paramId;
                idBuffer[paramId] = {
                    type:'parameter',
                    name:paramName,
                    mechanism:mechName,
                    mechanismId:state.mapMechNameToId[mechName]
                }
            }
            return Object.assign({}, state, {
                mapMechNameParamNameToId:{...state.parameters, ...mechNameParamNameBuffer},
                mapIdToData:{...state.idLookup, ...idBuffer},
                mapMechNameToParamDataArr:{...state.mapMechNameToParamDataArr, [mechName]:Object.values(idBuffer)}
            });

        default:
            return state
    }
}