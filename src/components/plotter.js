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

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const PlotSpec = {
    drop(props, monitor, component){
        if (monitor.getItem().name === 'Line Graph') {
            var type = ItemTypes.LINE_GRAPH,
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
            component.insertSubPlot(type, position, shiftDirection)
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

const mapDispatchToProps = dispatch => ({
    addPlot: (plotSpec) => dispatch(addPlot(plotSpec)),
});

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

class Plotter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            class: `plotter ${this.props.className}`,
            mounted: false,
            spinner_visible: false,
            cols: 0,
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
            maxRows:0,
        };
        this.forceLayoutSetState = [];
        this.bind_this_to_functions = this.bind_this_to_functions.bind(this);
        this.bind_this_to_functions();
    }

    bind_this_to_functions(){
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.cursorSignal = this.cursorSignal.bind(this);
        this.handleNewLayout = this.handleNewLayout.bind(this);
        this.getSinglePlotSize = this.getSinglePlotSize.bind(this);
        this.insertSubPlot = this.insertSubPlot.bind(this);
        this.lateralShift = this.lateralShift.bind(this);
        this.verticalShift = this.verticalShift.bind(this);
        this.updatePlotSize = this.updatePlotSize.bind(this);
    }

    insertSubPlot(type, position, shiftDirection='right'){
        var updated_plot_props_lookup = {...this.state.plot_props_lookup},
            updated_position_id_lookup = {...this.state.position_id_lookup},
            plotSpecs = this.state.plot_props_lookup,
            positionSpecs = this.state.position_id_lookup,
            cols = this.state.cols,
            rows = this.state.maxRows == 1 ? 1 : this.state.maxRows -1 ,
            id = this.generateRandomID(),
            component_size = this.getSinglePlotSize(cols+1,rows),
            component_height = component_size.height,
            component_width = component_size.width,
            new_component_type,
            new_component_props,
            shiftSpec,
            padding;

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
            type: ItemTypes.LINE_GRAPH,
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
        updated_position_id_lookup[position] = id;
        this.setState(
            {
                cols: cols,
                maxRows: rows + 1,
                plot_props_lookup: updated_plot_props_lookup,
                plotSize:{
                    width:component_width,
                    height:component_height
                },
                position_id_lookup:updated_position_id_lookup
            }
        )
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

    updatePlotSize(){
        var cols = this.state.cols,
            rows = this.state.maxRows - 1,
            updatedPlotSize = this.getSinglePlotSize(cols, rows)
        this.setState(
            {plotSize:updatedPlotSize}
        )
    }

    verticalShift(column, startIndex){
        var updatedPlotSpec = {...this.state.plot_props_lookup},
            range = _.range(startIndex, this.state.maxRows - 1),
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

    componentDidMount() {
        if (!this.state.mounted){
            // this.set_graph();
        }
    }

    getSinglePlotSize(cols, rows){
        var component_height = (this.props.size.height-30)/(rows),
            component_width = (this.props.size.width-30)/(cols);
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

    render() {
        const {connectDropTarget, isOver, canDrop} = this.props;
        var isEmpty = Object.keys(this.state.plot_props_lookup).length == 0,
            empty_valid_drag_hover = isOver && canDrop && isEmpty,
            components = [],
            layout = [],
            plotSpecs = this.state.plot_props_lookup,
            activeLocation = this.state.activeLocation,
            classList,
            cols = this.state.cols,
            self = this,
            rowHeight = (this.props.size.height - 30)/(this.state.maxRows!==1 ? this.state.maxRows - 1:1);

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
                            maxRows={this.state.maxRows}
                            onLayoutChange={this.handleNewLayout}
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
Plotter = connect(null, mapDispatchToProps)(Plotter);

export default Plotter