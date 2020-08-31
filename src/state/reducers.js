import {reducer as configuration} from './configuration/reducers'
import {reducer as core} from "./core/reducers";
import {reducer as psyneulink} from "./psyneulink/reducers"
import {reducer as psyneulinkComponents} from "./psyneulink-components/reducers"
import {reducer as psyneulinkParameters} from "./psyneulink-parameters/reducers"
import {reducer as subplotConfigForm} from "./subplot-config-form/reducers"
import {reducer as subplotGrid} from "./subplot-grid/reducers"
import {reducer as subplotRegistry} from "./subplot-registry/reducers"
import {reducer as subplots} from "./subplots/reducers"

import {combineReducers} from 'redux'

export const rootReducer = combineReducers(
    {
        configuration: configuration,
        core: core,
        psyneulink: psyneulink,
        psyneulinkComponents: psyneulinkComponents,
        psyneulinkParameters: psyneulinkParameters,
        subplotConfigForm: subplotConfigForm,
        subplotGrid: subplotGrid,
        subplotRegistry: subplotRegistry,
        subplots: subplots
    }
);