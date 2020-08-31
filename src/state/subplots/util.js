export function snakeCaseToUpperCamelCase(word) {
    return word.split('_').map(word=>word.charAt(0).toUpperCase() + word.slice(1)).join('')
}

export function generateDefaultName(state, plotType, counter=null){
    const prefix = snakeCaseToUpperCamelCase(plotType);
    counter = counter ?? state.mapPlotTypeToDefaultNameCounter[plotType];
    return `${prefix}-${counter}`
}

export function getDefaultNameCounter(state, plotType, name){
    /**
     * checks if adding subplot with `name` should increment the default name counter for `plotType` and returns
     * the counter, including increment if necessary
     */
    let counter = state.mapPlotTypeToDefaultNameCounter[plotType];
    if (name == generateDefaultName(state, plotType)){
        counter += 1
    }
    return counter
}
