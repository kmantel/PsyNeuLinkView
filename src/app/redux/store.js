import { createStore, combineReducers } from 'redux'
import { reducer as plottingReducer } from "./plotting/reducers";
import { reducer as pnlReducer } from "./psyneulink/reducers";
import { coreReducer } from "./reducers";

const rootReducer = combineReducers(
    {'core':coreReducer, 'plotting':plottingReducer, 'pnl':pnlReducer}
);

export const store = createStore(rootReducer);
window.reduxStore = store;