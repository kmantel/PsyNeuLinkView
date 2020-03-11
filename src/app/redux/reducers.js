import { setActiveView } from "./actions";

const initialState = {
    activeView: 'plotter'
};

export function rootReducer(state=initialState, action) {
    console.log(action)
    return Object.assign({}, state, {
        activeView:action.id
    });
}