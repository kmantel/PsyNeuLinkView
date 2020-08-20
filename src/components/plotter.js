import React from 'react'
import '../css/d3plotter.css'
import * as d3 from 'd3'
import Plot from "./plot";
import LinePlot from "./linegraph";
import {Resizable} from 're-resizable'
import {Spinner} from '@blueprintjs/core'
import { DropTarget } from 'react-dnd'
import { ItemTypes } from './constants'
import * as _ from "lodash";
import Layout from "./layout";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const PlotSpec = {
    drop(props, monitor, component){
        if (monitor.getItem().name === 'Line Graph') {
            var updated_plot_props_lookup = {...component.state.plot_props_lookup},
                cols = component.state.cols,
                id = component.generateRandomID(),
                component_height = component.state.size.height-30, //TODO: right now just dealing with one row, need to dynamically calc this when adding more rows
                component_width = (component.state.size.width-30)/(cols+1),
                new_component_type,
                new_component_props,
                padding;

            // in case generateRandomID happens to pull the same id for multiple components
            while (component.state.plot_props_lookup.hasOwnProperty(id)){
                id = component.generateRandomID();
            };

            new_component_type = ItemTypes.LINE_GRAPH;

            new_component_props = {
                id:id,
                size:{width: component_width, height: component_height},
                data:[]
            };
            var plotSpecs = component.state.plot_props_lookup;
            for (const [key, val] of Object.entries(plotSpecs)) {
                updated_plot_props_lookup[key].props.size = {width: component_width, height:component_height};
                updated_plot_props_lookup[key].layout.h = component_height
            }
            updated_plot_props_lookup[id] = {
                type: ItemTypes.LINE_GRAPH,
                id: id,
                props: new_component_props,
                position: [cols, 0],
                layout: {
                    i:id,
                    x:cols,
                    y:0,
                    w:1,
                    h:component_height
                }
            };
            component.setState(
                {
                    cols: cols + 1,
                    plot_props_lookup: updated_plot_props_lookup
                }
            )
        }
        return {dropped: true}
    }
};

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
            size: {
                width:props.size.width,
                height:props.size.height,
            },
            activeLocation: null
        };
        this.bind_this_to_functions = this.bind_this_to_functions.bind(this);
        this.bind_this_to_functions();
    }

    bind_this_to_functions(){
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.cursorSignal = this.cursorSignal.bind(this);
    }

    componentDidMount() {
        if (!this.state.mounted){
            // this.set_graph();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    generateRandomID() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
    }

    cursorSignal(id, type) {
        if (type!==null){
            if (this.state.activeLocation!==[id, type]){
                this.setState({activeLocation:[id, type]})
            }
        }
        else {
            if (this.state.activeLocation!==null){
                console.log('nullify')
                this.setState({activeLocation:null})
            }
        }
    }

    render() {
        const {connectDropTarget, isOver, canDrop} = this.props;
        var isEmpty = Object.keys(this.state.plot_props_lookup).length == 0,
            empty_valid_drag_hover = isOver && canDrop && isEmpty,
            components = [],
            layout = [],
            plotSpecs = this.state.plot_props_lookup,
            activeLocation = this.state.activeLocation,
            classList;
        window.lastPlotSpecs = plotSpecs;
        for (const [key, value] of Object.entries(plotSpecs)) {
            classList = ['subplot', `${key}`];
            if (activeLocation!== null && key == activeLocation[0]) {classList.push(activeLocation[1])};
            components.push(
                <div key={key}>
                    <LinePlot
                        {...value.props}
                        cursorSignal={this.cursorSignal}
                        classList={classList}
                    />
                </div>
            );
            layout.push(
                value.layout
            );
        }
        return connectDropTarget (
            <div class={empty_valid_drag_hover && activeLocation===null ? "valid-drag-hover": ""}>
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
                            cols = {this.state.cols}
                            rowHeight={1}
                            width={this.state.size.width-30}
                            components = {components}
                        />
                    </div>
                </Resizable>
            </div>
        )
    }
}

export default DropTarget(ItemTypes.PLOT, PlotSpec, collect)(Plotter)
