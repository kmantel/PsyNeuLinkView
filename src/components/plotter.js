import React from 'react'
import '../css/d3plotter.css'
import LinePlot from "./line-plot";
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
    getGridShape,
    getGridDropFocus
} from "../app/redux/plotting/subplot-grid/selectors";
import {getSubplotIdSet} from "../app/redux/plotting/selectors";
import {editGridLayout} from "../app/redux/plotting/subplot-grid/actions";
import {getSubplotMetaData} from "../app/redux/plotting/subplots/selectors";
import {LINE_PLOT} from "../app/redux/plotting/subplots/constants";
import {editSubplotMetaData} from "../app/redux/plotting/subplots/actions";

const mapStateToProps = ({plotting}) => {
    return {
        subplotIdSet: getSubplotIdSet(plotting),
        subplotMetadata: getSubplotMetaData(plotting.subplots),
        gridLayout: getGridLayout(plotting.subplotGrid),
        gridShape: getGridShape(plotting.subplotGrid),
        gridPositions: getGridPositions(plotting.subplotGrid),
        gridDropFocus: getGridDropFocus(plotting.subplotGrid),
    }
};

const mapDispatchToProps = dispatch => ({
    addPlot: (plotSpec) => dispatch(addPlot(plotSpec)),
    initializeSubplotBundle: (id, plotType, name, dataSources, position, colSpan, rowSpan) =>
        dispatch(initializeSubplotBundle(id, plotType, name, dataSources, position, colSpan, rowSpan)),
    editGridLayout: (id, colSpan, rowSpan, position) =>
        dispatch(editGridLayout(id, colSpan, rowSpan, position)),
    editSubplotMetadata: ({id, plotType, name, dataSources})=> dispatch(editSubplotMetaData({id, plotType, name, dataSources}))
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
            if (props.subplotIdSet.size === 0){
                component._insertSubPlot(LINE_PLOT, [0, 0]);
                return {dropped: true}
            }
            var type = ItemTypes.LINE_PLOT,
                dropFocus = component.props.gridDropFocus,
                dropFocusLayout = _.clone(component.props.gridLayout[dropFocus[0]]),
                dropFocusPosition = [dropFocusLayout.x, dropFocusLayout.y],
                placementFromReference = dropFocus[1],
                shiftDirection;
            switch (placementFromReference) {
                case 'left':
                    shiftDirection = 'right';
                    break;
                case 'right':
                    dropFocusPosition[0] += 1;
                    shiftDirection = 'right';
                    break;
                case 'top':
                    shiftDirection = 'bottom';
                    break;
                case 'bottom':
                    dropFocusPosition[1] += 1;
                    shiftDirection = 'bottom';
                    break;
            }
            component._insertSubPlot(type, dropFocusPosition, shiftDirection);
        }
        return {dropped: true}
    },
    hover(props, monitor, component){
        var {gridDropFocus, subplotIdSet} = component.props;
        this.canDrop = ()=>{return gridDropFocus[1]!==null || subplotIdSet.size===0}
    },
    canDrop(props, monitor){
        return false
    }
};

class Plotter extends React.Component {
    constructor(props) {
        super(props);
        this.bind_this_to_functions = this.bind_this_to_functions.bind(this);
        this.bind_this_to_functions();
    }

    bind_this_to_functions(){
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.getSinglePlotSize = this.getSinglePlotSize.bind(this);
        this.insertSubPlot = this.insertSubPlot.bind(this);
        this.lateralShift = this.lateralShift.bind(this);
        this.verticalShift = this.verticalShift.bind(this);
    }

    insertSubPlot(type, position, shiftDirection='right'){
        var {gridPositions, subplotIdSet} = this.props,
            updatedLayout = {}, maxXNew, maxYNew,
            id = createId(subplotIdSet, PLOT_PREFIX, PLOT_ID_LEN);
        if (position in gridPositions){
            if (shiftDirection=='right'){
                updatedLayout =  this.lateralShift(position[1], position[0]);
            }
            else if (shiftDirection=='bottom'){
                updatedLayout = this.verticalShift(position[0], position[1]);
            }
        }
        for ( const [subplotId, layout] of Object.entries(updatedLayout) ){
            this.props.editGridLayout(subplotId, layout.w, layout.h, [layout.x, layout.y])
        }
        this.props.initializeSubplotBundle(id, LINE_PLOT, '', [], position, 1, 1);
    }

    lateralShift(row, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            cols = this.props.gridShape.rows,
            range = _.range(startIndex, cols);
        for (const i of range){
            if (!([i, row] in gridPositions)){continue}
            id = gridPositions[[i, row]];
            updatedLayout[id].x += 1;
        }
        return updatedLayout
    }

    verticalShift(column, startIndex){
        var id,
            gridLayout = this.props.gridLayout,
            updatedLayout = {...gridLayout},
            gridPositions = this.props.gridPositions,
            rows = this.props.gridShape.rows,
            range = _.range(startIndex, rows);
        for (const i of range){
            if (!([column, i] in gridPositions)){continue}
            id = gridPositions[[column, i]];
            updatedLayout[id].y += 1;
        }
        return updatedLayout
    }

    getSinglePlotSize(rows, cols){
        var component_height = (this.props.size.height-30)/(rows ? rows: 1),
            component_width = (this.props.size.width-30)/(cols ? cols: 1);
        return {width: component_width, height: component_height}
    }

    _handleNewLayout(newLayouts){
        // TODO: COME BACK TO THIS
        var {gridLayout, gridPositions, gridShape} = this.props,
            updatedGridLayout = {...gridLayout};
        newLayouts.forEach(
            (layout)=>{
                console.log(12345)
            }
        )
    }

    createLinePlot(id, name, dataSources, width, height) {
        return <div key={id}>
            <LinePlot
                id={id}
                width={width}
                height={height}
                data={dataSources}
            />
        </div>
    }

    getPlots(){
        const { subplotIdSet, subplotMetadata, gridShape } = this.props,
            {rows, cols} = gridShape,
            plotSize = this.getSinglePlotSize(rows, cols),
            {width, height} = plotSize;
        return [...subplotIdSet].map(
            id => {
                var {name, dataSources} = subplotMetadata[id];
                return this.createLinePlot(id, name, dataSources, width, height)
            }
        )
    }

    getLayout(){
        const {gridLayout} = this.props;
        return Object.values(gridLayout)
    }

    render() {
        const {connectDropTarget, isOver, canDrop, gridShape} = this.props,
            {rows, cols} = gridShape,
            isEmpty = _.isEqual(gridShape, [0, 0]),
            empty_valid_drag_hover = isOver && canDrop && isEmpty,
            components = this.getPlots(),
            layout = this.getLayout(),
            plotSize = this.getSinglePlotSize(rows, cols);

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
                    <div className={`plotter ${this.props.className}`}>
                        <Layout
                            className = {'plot-grid'}
                            margin = {[0, 0]}
                            layout = {layout}
                            cols = {gridShape.cols}
                            rowHeight={plotSize.height}
                            width={this.props.size.width-30}
                            components = {components}
                            isDraggable={true}
                            maxRows={gridShape.rows}
                            onLayoutChange={this.handleNewLayout}
                            preventCollision={false}
                            forceLayoutSetState={()=>{}}
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