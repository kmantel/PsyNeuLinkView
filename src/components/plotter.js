import React from 'react'
import '../css/d3plotter.css'
import LinePlot from "./linegraph";
import {Resizable} from 're-resizable'
import { DropTarget } from 'react-dnd'
import { ItemTypes } from './constants'
import * as _ from "lodash";
import Layout from "./layout";
import {addPlot, removePlot} from "../app/redux/actions"
import {connect} from "react-redux";
import { initializeSubplotBundle } from "../app/redux/plotting/actions";
import { createId } from "../app/redux/util";
import { PLOT_PREFIX, PLOT_ID_LEN } from "../app/redux/plotting/constants";
import {
    getGridLayout,
    getGridPositions,
    getGridShape
} from "../app/redux/plotting/subplot-grid/selectors";
import {getSubplotIdSet} from "../app/redux/plotting/selectors";
import {editPlotLayout} from "../app/redux/plotting/subplot-grid/actions";

const mapStateToProps = ({plotting}) => {
    return {
        gridLayout: getGridLayout(plotting.subplotGrid),
        gridShape: getGridShape(plotting.subplotGrid),
        gridPositions: getGridPositions(plotting.subplotGrid),
        subplotIdSet: getSubplotIdSet(plotting)
    }
};

const mapDispatchToProps = dispatch => ({
    addPlot: (plotSpec) => dispatch(addPlot(plotSpec)),
    initializeSubplotBundle: (id, plotType, name, dataSources, position, width, colSpan, height, rowSpan) =>
        dispatch(initializeSubplotBundle(id, plotType, name, dataSources, position, width, colSpan, height, rowSpan)),
    editPlotLayout: (id, width, height, colSpan, rowSpan, position) =>
        dispatch(editPlotLayout(id, width, height, colSpan, rowSpan, position))
});

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const PlotSpec = {
    drop(props, monitor, component){
        if (monitor.getItem().name === 'Line Plot') {
            var type = ItemTypes.LINE_PLOT,
                componentHasSubPlots = Object.keys(component.state.plot_props_lookup).length > 0,
                currentActiveLocation,
                referencePlotProps,
                position,
                shiftDirection,
                placementFromReference;
            if (!componentHasSubPlots){
                position = [0, 0];
                shiftDirection = null
            }
            else{
                currentActiveLocation = component.state.activeLocation;
                referencePlotProps = component.state.plot_props_lookup[currentActiveLocation[0]];
                placementFromReference = currentActiveLocation[1];
                position = _.clone(referencePlotProps.position);
                switch (placementFromReference) {
                    case 'left':
                        shiftDirection = 'right';
                        break;
                    case 'right':
                        position[0] += 1;
                        shiftDirection = 'right';
                        break;
                    case 'top':
                        shiftDirection = 'bottom';
                        break;
                    case 'bottom':
                        position[1] += 1;
                        shiftDirection = 'bottom';
                        break;
                }
            }
            component.insertSubPlot(type, position, shiftDirection);
            component._insertSubPlot(type, position, shiftDirection);
        }
        return {dropped: true}
    },
    hover(props, monitor, component){
        var componentHasSubPlots = Object.keys(component.state.plot_props_lookup).length > 0;
        var componentHasActiveLocation = component.state.activeLocation[1] !== null;
        if (!componentHasSubPlots || componentHasActiveLocation){
            this.canDrop = ()=>{return true}
        }
        else{
            this.canDrop = ()=>{return false}
        }
    },
    canDrop(props, monitor){
        return false
    }
};

class Plotter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            class: `plotter ${this.props.className}`,
            mounted: false,
            spinner_visible: false,
            cols:0,
            rows:0,
            plot_data: {},
            plot_props_lookup: {},
            position_id_lookup: {},
            location_props_lookup: {},
            size: {
                width:props.size.width,
                height:props.size.height,
            },
            plotWidth:0,
            plotHeight:0,
            activeLocation: [null, null],
        };
        this.forceLayoutSetState = [];
        this.bind_this_to_functions = this.bind_this_to_functions.bind(this);
        this.bind_this_to_functions();
        this.debounceFunctions();
    }

    debounceFunctions(){
        // this.updatePlotSize = _.debounce(this.updatePlotSize, 100)
    }

    bind_this_to_functions(){
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.cursorSignal = this.cursorSignal.bind(this);
        this.handleNewLayout = this.handleNewLayout.bind(this);
        this.getSinglePlotSize = this.getSinglePlotSize.bind(this);
        this.insertSubPlot = this.insertSubPlot.bind(this);
        this._insertSubPlot = this._insertSubPlot.bind(this);
        this.lateralShift = this.lateralShift.bind(this);
        this._lateralShift = this._lateralShift.bind(this);
        this.verticalShift = this.verticalShift.bind(this);
        this._verticalShift = this._verticalShift.bind(this);
        this.updatePlotSize = this.updatePlotSize.bind(this);
        this.debounceFunctions = this.debounceFunctions.bind(this);
    }

    insertSubPlot(type, position, shiftDirection='right'){
        var updated_plot_props_lookup = {...this.state.plot_props_lookup},
            updated_position_id_lookup = {...this.state.position_id_lookup},
            plotSpecs = this.state.plot_props_lookup,
            positionSpecs = this.state.position_id_lookup,
            cols = this.state.cols,
            rows = this.state.rows,
            id = this.generateRandomID(),
            component_size = this.getSinglePlotSize(cols+1,rows),
            component_height = component_size.height,
            component_width = component_size.width,
            new_component_type,
            new_component_props,
            shiftSpec,
            padding,
            colSpan = 1,
            rowSpan = 1;

        // in case generateRandomID happens to pull the same id for multiple components
        while (this.state.plot_props_lookup.hasOwnProperty(id)){
            id = this.generateRandomID();
        };
        new_component_props = {
            id:id,
            size:{width: component_width, height: component_height},
            data:[]
        };
        if (position in updated_position_id_lookup || _.isEmpty(updated_position_id_lookup)){
            if (shiftDirection=='right'){
                shiftSpec =  this.lateralShift(position[1], position[0]);
                updated_plot_props_lookup = shiftSpec[0];
                updated_position_id_lookup = shiftSpec[1];
                cols += 1
            }
            else if (shiftDirection=='bottom'){
                shiftSpec = this.verticalShift(position[0], position[1]);
                updated_plot_props_lookup = shiftSpec[0];
                updated_position_id_lookup = shiftSpec[1];
                rows += 1;
            }
            else {
                cols += 1
            }}
        for (const [key, val] of Object.entries(plotSpecs)) {
            updated_plot_props_lookup[key].props.size = {width: component_width, height:component_height};
        };
        updated_plot_props_lookup[id] = {
            type: ItemTypes.LINE_PLOT,
            id: id,
            props: new_component_props,
            position: [position[0], position[1]],
            layout: {
                i:id,
                x:position[0],
                y:position[1],
                w:1,
                h:1
            }
        };
        this.props.addPlot(updated_plot_props_lookup[id]);
        // this.props.initializeSubplotBundle(
        //     undefined, undefined, undefined, position, undefined, undefined, undefined, undefined
        // );
        updated_position_id_lookup[position] = id;
        this.setState(
            {
                cols: cols,
                rows: rows,
                plot_props_lookup: updated_plot_props_lookup,
                plotSize:{
                    width:component_width,
                    height:component_height
                },
                position_id_lookup:updated_position_id_lookup
            }
        )
    }

    _insertSubPlot(type, position, shiftDirection='right'){
        var {gridPositions, subplotIdSet} = this.props,
            [rows, cols] = this.props.gridShape,
            updatedLayout = {},
            id = createId(subplotIdSet, PLOT_PREFIX, PLOT_ID_LEN);
        this.getSinglePlotSize(rows, cols+1);
        if (position in gridPositions){
            if (shiftDirection=='right'){
                updatedLayout =  this._lateralShift(position[1], position[0]);
            }
            else if (shiftDirection=='bottom'){
                updatedLayout = this._verticalShift(position[0], position[1]);
            }
        }
        for ( const [subplotId, layout] of Object.entries(updatedLayout) ){
            this.props.editPlotLayout(subplotId, undefined, undefined, undefined, undefined, layout.pos)
        }
        this.props.initializeSubplotBundle(id, undefined, undefined, undefined, position,
            undefined, undefined, undefined, undefined);
    }

    lateralShift(row, startIndex){
        var updatedPlotSpec = {...this.state.plot_props_lookup},
            range = _.range(startIndex, this.state.cols),
            updatedPositionIdLookup = _.cloneDeep(this.state.position_id_lookup),
            currentPositionIdLookup = this.state.position_id_lookup,
            id;

        range.forEach(
            i=>{
                id = currentPositionIdLookup[[i, row]];
                updatedPlotSpec[id].position[0] += 1;
                updatedPlotSpec[id].layout.x += 1;
                updatedPositionIdLookup[updatedPlotSpec[id].position] = id
            }
        );
        return [updatedPlotSpec, updatedPositionIdLookup]
    }

    _lateralShift(row, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            cols = this.props.gridShape[0],
            range = _.range(startIndex, cols);

        range.forEach(
            i=>{
                id = gridPositions[[i, row]];
                updatedLayout[id].position[0] += 1;
            }
        );
        return updatedLayout
    }

    updatePlotSize(){
        var cols = this.state.cols,
            rows = this.state.rows,
            updatedPlotSize = this.getSinglePlotSize(cols, rows)
        this.setState(
            {plotSize:updatedPlotSize}
        )
    }
    verticalShift(column, startIndex){
        var updatedPlotSpec = {...this.state.plot_props_lookup},
            range = _.range(startIndex, this.state.rows),
            updatedPositionIdLookup = _.cloneDeep(this.state.position_id_lookup),
            currentPositionIdLookup = this.state.position_id_lookup,
            id;

        range.forEach(
            i=>{
                id = currentPositionIdLookup[[column, i]];
                updatedPlotSpec[id].position[1] += 1;
                updatedPlotSpec[id].layout.y += 1;
                updatedPositionIdLookup[updatedPlotSpec[id].position] = id
            }
        );
        return [updatedPlotSpec, updatedPositionIdLookup]
    }

    _verticalShift(column, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            rows = this.props.gridShape[1],
            range = _.range(startIndex, rows);

        range.forEach(
            i=>{
                id = gridPositions[[column, i]];
                updatedLayout[id].position[1] += 1;
            }
        );
        return updatedLayout
    }

    componentDidMount() {
    }

    getSinglePlotSize(rows, cols){
        var component_height = (this.props.size.height-30)/(rows ? rows: 1),
            component_width = (this.props.size.width-30)/(cols ? cols: 1);
        return {width: component_width, height: component_height}
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.size, this.props.size)){
            this.updatePlotSize();
        }
    }

    generateRandomID() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
    }

    cursorSignal(id, type) {
        if (type == null) {
            if (this.state.activeLocation[0] !== null){
                this.setState({activeLocation: [null, null]})
            }
        } else {
            if (!_.isEqual([id, type], this.state.activeLocation)){
                this.setState({activeLocation: [id, type]})
            }
        }
    }

    _handleNewLayout(newLayoutArr){
        // TODO: COME BACK TO THIS
        var {gridLayout, gridPositions, gridShape} = this.props,
            updatedGridLayout = {...gridLayout};
        newLayoutArr.forEach(
            (layout)=>{
                console.log(12345)
            }
        )
    }

    handleNewLayout(newLayouts){
        var updated_plot_props_lookup = {...this.state.plot_props_lookup},
            cols = new Set([]),
            usedCols = new Set([]),
            maxCols = 0,
            rows = new Set([]),
            usedRows = new Set([]),
            rowRange,
            colRange,
            maxRows = 0,
            unusedCols,
            unusedRows,
            colTracker = {},
            rowTracker = {},
            openColumn = 0,
            openRow = 0,
            dirty = false;
        newLayouts.forEach(
            (layout)=>{
                layout = _.cloneDeep(layout);
                updated_plot_props_lookup[layout.i].layout = layout;
                updated_plot_props_lookup[layout.i].position = [layout.x, layout.y];
                usedCols.add(layout.x);
                if (!(layout.x in colTracker)){colTracker[layout.x]=[]}
                maxCols = layout.x > maxCols ? layout.x : maxCols;
                usedRows.add(layout.y);
                if (!(layout.y in rowTracker)){rowTracker[layout.y]=[]}
                maxRows = layout.y > maxRows ? layout.y : maxRows;
                colTracker[layout.x].push(layout.i);
                rowTracker[layout.y].push(layout.i);
            }
        );
        cols = Object.keys(colTracker).length;
        colRange = new Set([...Array(maxCols+1).keys()]);
        unusedCols = new Set([...colRange].filter(x => !usedCols.has(x)));
        rows = Object.keys(rowTracker).length;
        rowRange = new Set([...Array(maxRows+1).keys()]);
        unusedRows = new Set([...rowRange].filter(x => !usedRows.has(x)));
        if (unusedCols.size > 0){
            dirty = true;
            for (const [key, value] of Object.entries(colTracker)){
                var numKey = parseInt(key);
                if (!(unusedCols.has(numKey))){
                    if (!(openColumn == numKey)){
                        colTracker[key].forEach(
                            (id)=>{
                                updated_plot_props_lookup[id].layout.width = openColumn;
                                updated_plot_props_lookup[id].layout.x = openColumn;
                                updated_plot_props_lookup[id].position[0] = openColumn;
                            }
                        )
                    }
                    openColumn += 1
                }
            }
        }
        if (unusedRows.size>0){
            dirty = true;
            for (const [key, value] of Object.entries(rowTracker)){
                var numKey = parseInt(key);
                if (!(unusedRows.has(numKey))){
                    if (!(openRow == numKey)){
                        rowTracker[key].forEach(
                            (id)=>{
                                updated_plot_props_lookup[id].layout.y = openRow;
                                updated_plot_props_lookup[id].position[1] = openRow;
                            }
                        )
                    }
                    openRow += 1
                }
            }        }
        //todo: need to combine the loops for row and column compacting for efficiency
        this.setState(
            {
                cols:cols,
                plot_props_lookup:updated_plot_props_lookup,
                maxRows:rows+1,
                plotSize:this.getSinglePlotSize(cols, rows)
            },
            ()=>{
                if (dirty){
                    this.forceLayoutSetState[0]({layout:[...Object.values(updated_plot_props_lookup).map((spec)=>{return spec.layout})]})
                }
            }
        );
    }

    _getPlots(){
        const { gridLayout } = this.props,
            layout  = [];
        for (const [id, metadata] of gridLayout){
            classList = ['subplot', `${id}`]
        }
    }

    getPlots(plotSpecs){
        var activeLocation = this.state.activeLocation,
            classList,
            components = [],
            layout = [];
        const { gridLayout } = this.props;

        for (const [key, value] of Object.entries(plotSpecs)) {
            classList = ['subplot', `${key}`];
            if (activeLocation!== null && key == activeLocation[0]) {classList.push(activeLocation[1])};
            value.props.size = this.state.plotSize;
            components.push(
                <div key={key}>
                    <LinePlot
                        {...value.props}
                        cursorSignal={this.cursorSignal}
                        classList={classList}
                        id={key}
                    />
                </div>
            );
            layout.push(
                value.layout
            );
        }
        return [components, layout]
    }

    render() {
        const {connectDropTarget, isOver, canDrop} = this.props;
        var isEmpty = Object.keys(this.state.plot_props_lookup).length == 0,
            empty_valid_drag_hover = isOver && canDrop && isEmpty,
            components = [],
            layout = [],
            plotSpecs = this.state.plot_props_lookup,
            cols = this.state.cols,
            rowHeight = (this.props.size.height - 30)/(this.state.rows ===0 ? 1 : this.state.rows + 1);
        [components, layout] = this.getPlots(plotSpecs);
        return connectDropTarget (
            <div class={empty_valid_drag_hover ? "valid-drag-hover": ""}>
            <Resizable
                    style={style}
                    onResize={this.props.onResize}
                    onResizeStart={this.props.onResizeStart}
                    onResizeStop={this.props.onResizeStop}
                    enable={{
                        top: false,
                        right: false,
                        bottom: true,
                        left: true,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: true,
                        topLeft: false
                    }}
                    className='plotter_canvas'
                    defaultSize={
                        this.props.defaultSize
                    }
                    size={
                        this.props.size
                    }
                    minHeight={
                        40
                    }
                    minWidth={
                        40
                    }
                    maxWidth={
                        this.props.maxWidth
                    }
                    maxHeight={
                        this.props.maxHeight
                    }
                >
                    <div className={this.state.class}>
                        <Layout
                            className = {'plot-grid'}
                            margin = {[0, 0]}
                            layout = {layout}
                            cols = {cols}
                            rowHeight={rowHeight}
                            width={this.props.size.width-30}
                            components = {components}
                            isDraggable={true}
                            maxRows={this.state.rows+1}
                            onLayoutChange={
                                (layout)=>{
                                    this.handleNewLayout(layout);
                                    this._handleNewLayout(layout);
                                }
                            }
                            preventCollision={false}
                            forceLayoutSetState={this.forceLayoutSetState}
                        />
                    </div>
                </Resizable>
            </div>
        )
    }
}

// connect DnD
Plotter = DropTarget(ItemTypes.PLOT, PlotSpec, collect)(Plotter);
// connect Redux
Plotter = connect(mapStateToProps, mapDispatchToProps)(Plotter);

export default Plotter