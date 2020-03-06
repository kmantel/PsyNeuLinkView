import React from 'react'
import '../css/plotter.css'
import * as d3 from 'd3'
import {Resizable} from 're-resizable'
import {Spinner} from '@blueprintjs/core'
import * as _ from "lodash";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};


class Plotter extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            class: `plotter ${this.props.className}`,
            mounted: false,
            graph: this.props.graph,
            spinner_visible: false,
        };
        this.matrix = require('../matrix')
        this.bind_this_to_functions = this.bind_this_to_functions.bind(this);
        this.bind_this_to_functions();
        // this.set_non_react_state();
        // this.flags = {
        //     reload_locations: false,
        //     update_locations: false
        // };
        // this.update_script = _.debounce(this.update_script, 1000)
    }

    bind_this_to_functions(){
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.update_matrix_randomly =this.update_matrix_randomly.bind(this);
        this.createSVG = this.createSVG.bind(this);
        this.set_graph = this.set_graph.bind(this);
    }

    componentDidMount() {
        if (!this.state.mounted){
            this.set_graph();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!(this.props.graph === prevProps.graph)){
            // var spinner_state = this.props.graph === "loading";
            // this.setState({"spinner_visible": spinner_state});
        }
    }

    set_graph(){
        var self = this;
        this.createSVG();
        this.setState({'mounted':true})
        var canvas = self.canvas,
            context = canvas.getContext('2d')
        setInterval(
            function(){
                self.update_matrix_randomly(canvas, context)
            }
            ,100);
    }

    update_matrix_randomly(canvas, context){
        var self = this;
        var matrix = this.matrix,
            svg = this.svg,
            shape = this.get_matrix_shape(matrix),
            width=shape[0],
            height=shape[1];

        // Build color scale
        var myColor = d3.scaleLinear()
            .range(["#0007ff", "#ff2000"])
            .domain([0,1])

        // d3.selectAll('g.heatmap').selectAll('rect')
        //     .style("fill", function (d) {
        //         return myColor(Math.random())
        //     })
        var i = 0
        context.clearRect(0, 0, canvas.width, canvas.height)
        d3.selectAll('g.heatmap').selectAll('rect').each(
            function(d){
                var e = d3.select(this);
                context.beginPath();
                context.fillStyle = myColor(Math.random());
                context.fillRect(e.attr('x'), e.attr('y'), e.attr('width'), e.attr('height'));
                context.stroke();
                i += 1
            }
        )
        // context.clearRect(0, 0, canvas.width, canvas.height)
        //


        //
        // matrix.forEach(
        //     (r)=>{
        //         var increment_x = 150;
        //         heatmap
        //             .append('g')
        //             .attr('class', 'row')
        //             .selectAll("rect")
        //             .data(r)
        //             .enter()
        //             .append("rect")
        //             .attr("x", function (d){
        //                 var x = increment_x;
        //                 increment_x += 25;
        //                 return x
        //             })
        //             .attr("y", function (d){
        //                 var y = increment_y;
        //                 return y
        //             })
        //             .attr("width", 20)
        //             .attr("height", 20)
        //             .style("fill", function (d) {
        //                 return myColor(Math.random())
        //             })
        //         increment_y += 25
        //     }
        // )
    }

    draw_matrix(matrix){
        var svg = this.svg,
        shape = this.get_matrix_shape(matrix),
        width=shape[0],
        height=shape[1];

        var heatmap = svg.append('g')
            .attr('class', 'heatmap');

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([ 0, width ])
            // .domain(myGroups)
            .padding(0.01);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

        // Build X scales and axis:
        var y = d3.scaleBand()
            .range([ height, 0 ])
            // .domain(myVars)
            .padding(0.01);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Build color scale
        var myColor = d3.scaleLinear()
            .range(["#0007ff", "#ff2000"])
            .domain([0,1])

        var increment_y = 0;

        matrix.forEach(
            (r)=>{
                var increment_x = 0;
                var row = heatmap
                    .append('g')
                    .attr('class', 'row')
                    .selectAll("rect")
                    .data(r);

                row
                    .enter()
                    .append("rect")
                    .attr("x", function (d){
                        var x = increment_x;
                        increment_x += 5;
                        return x
                    })
                    .attr("y", function (d){
                        var y = increment_y;
                        return y
                    })
                    .attr("width", 4)
                    .attr("height", 4)
                    .style("fill", function (d) {
                        return myColor(Math.random())
                    });

                increment_y += 5
            }
        );
    }

    get_matrix_shape(matrix){
        return (matrix.length, matrix[0].length)
    }

    createSVG() {
        var svg, svg_rect, container;
        svg = d3.select('.plotter')
            .append('canvas')
            .attr('class', 'graph')
            .attr('height', this.props.size.height)
            .attr('width', this.props.size.width)
            .attr('preserveAspectRatio', 'xMidYMid');
        svg_rect = document.querySelector('canvas').getBoundingClientRect();
        // svg
        //     .attr("viewBox", [0, 0, svg_rect.width, svg_rect.height]);
        // this.appendDefs(svg);
        // this.apply_select_boxes(svg);
        // this.apply_zoom(svg);
        // this.bind_scroll_updating();
        this.svg = svg;
        this.draw_matrix(this.matrix)
        // return container
        this.canvas = svg.node()
        // var context = canvas.getContext("2d");
        this.context = svg.node().getContext('2d');
        console.log(this.context)
        this.apply_select_boxes(svg);
    }

    apply_select_boxes() {
        var self = this;
        var svg = d3.select('svg');
        //TODO: On select, save rect of selected nodes for more efficient collision detection when dragging
        svg
            .on('mousedown', function () {
                    // don't fire if command is pressed. command unlocks different options
                    if (!(d3.event.metaKey || d3.event.ctrlKey)) {
                        var anchor_pt = d3.mouse(this);
                        var processed_anchor_pt = [
                            {anchor: {x: anchor_pt[0], y: anchor_pt[1]}}
                        ];
                        svg.append('rect')
                            .attr('rx', 6)
                            .attr('ry', 6)
                            .attr('class', 'selection')
                            .data(processed_anchor_pt);
                    }
                }
            )
            .on("mousemove", function () {
                    var anchor_x, anchor_y, current_x, current_y;
                    var s = svg.select("rect.selection");
                    var current_pt = d3.mouse(this);
                    s
                        .attr('x', (d) => {
                            anchor_x = d.anchor.x;
                            current_x = current_pt[0];
                            if (current_x > anchor_x) {
                                return anchor_x
                            } else {
                                return current_x
                            }
                        })
                        .attr('y', (d) => {
                            anchor_y = d.anchor.y;
                            current_y = current_pt[1];
                            if (current_y > anchor_y) {
                                return anchor_y
                            } else {
                                return current_y
                            }
                        })
                        .attr('width', (d) => {
                            anchor_x = d.anchor.x;
                            current_x = current_pt[0];
                            return Math.abs(anchor_x - current_x)
                        })
                        .attr('height', (d) => {
                            anchor_y = d.anchor.y;
                            current_y = current_pt[1];
                            return Math.abs(anchor_y - current_y)
                        });
                }
            )
            .on("mouseup", function () {
                // // Remove selection frame
                svg.selectAll("rect.selection").remove();
            })
            .on("mouseout", function () {
                // if mouse enters an area of the screen not belonging to the SVG or one of its child elements
                var toElement = d3.event.toElement;
                if (!toElement ||
                    !(toElement === svg.node() ||
                        ('ownerSVGElement' in toElement && toElement.ownerSVGElement === svg.node()))) {
                    svg.selectAll("rect.selection").remove();
                }
            })
        }

    render() {
        return (
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
                <div className={this.state.class}/>
                <div className={'spinner'}
                     style={
                         {
                             "position": "absolute",
                         }
                     }
                >
                    {
                        this.state.spinner_visible ?
                            <Spinner
                                className={"graph_loading_spinner"}/> :
                            <div/>
                    }
                </div>
            </Resizable>
        )
    }
}

export default Plotter
