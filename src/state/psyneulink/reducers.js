import {ACTION_TYPES as atypes} from './constants';
import * as util from './util';
import {initialState as componentsInitialState} from "./components/reducers";
import {initialState as parametersInitialState} from "./parameters/reducers";

const initialState = {
    setIds: new Set(),
    arrIds: [],
    components:componentsInitialState,
    parameters:parametersInitialState,


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
            var id = util.generatePNLId(state.setIds);
            return Object.assign({}, state, {
                setIds: new Set([...state.setIds, id]),
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
                paramId = util.generatePNLId(state.setIds);
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