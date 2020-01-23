import React from 'react'
import '../css/graphview.css'
import * as d3 from 'd3'
import add_context_menu from '../utility/add_context_menu'
import {Resizable} from 're-resizable'
import {Spinner, SVGSpinner} from '@blueprintjs/core'

const context_menu = [
    {
        onClick: {},
        text: 'Placeholder 1'
    },
    {
        onClick: {},
        text: 'Placeholder 2'
    }
];

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

class GraphView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            class: `graph-view ${this.props.className}`,
            mounted: false,
            node_width: 20,
            node_height: 15,
            graph: this.props.graph,
            spinner_visible: false,
        };
        this.mouse_offset = {x: 0, y: 0};
        this.centerpoint_offset = {x: 0, y: 0};
        this.scaling_factor = 1;
        this.fill_proportion = 1;
        this.center_graph_on_point = this.center_graph_on_point.bind(this);
        this.get_canvas_bounding_box = this.get_canvas_bounding_box.bind(this);
        this.get_graph_bounding_box = this.get_graph_bounding_box.bind(this);
        this.setGraph = this.setGraph.bind(this);
        this.capture_keys = this.capture_keys.bind(this);
        this.scale_graph = this.scale_graph.bind(this);
        this.scale_graph_to_fit = this.scale_graph_to_fit.bind(this);
        this.updateGraph = this.updateGraph.bind(this);
        this.capture_wheel = this.capture_wheel.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this)
    }

    componentWillMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!(this.props.graph === prevProps.graph)) {
            if (this.props.graph === "loading") {
                d3.selectAll('svg').remove();
                this.setState({"spinner_visible": true})
            } else {
                d3.selectAll('svg').remove();
                this.setState({"spinner_visible": false});
                this.setGraph();
                // this.updateGraph();
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateGraph);
        window.removeEventListener('wheel', this.capture_wheel);
        window.removeEventListener('keydown', this.capture_keys)
    }

    componentDidMount() {
        this.setGraph();
        window.addEventListener('resize', this.updateGraph);
        window.addEventListener('wheel', this.capture_wheel, {passive: false});
        window.addEventListener('keydown', this.capture_keys);
        add_context_menu('.graph-view', context_menu)
    }

    cartesian_to_polar(x, y, cx, cy) {
        var distance, radians, polar, centerpoint;
        x = x - cx;
        y = y - cy;
        distance = Math.sqrt(x * x + y * y);
        radians = Math.atan2(y, x);
        polar = {distance: distance, radians: radians};
        return polar
    }

    capture_keys(e) {
        if (e.metaKey) {
            if (e.key === '+' || e.key === '=') {
                this.nudge_graph_larger();
            } else if (e.key === '-') {
                this.nudge_graph_smaller();
            }
            if (e.key === 'c') {
                this.reset_graph()
            }
        }
    }

    dist(x1, y1, x2, y2) {
        var a = x1 - x2;
        var b = y1 - y2;
        var c = Math.sqrt(a * a + b * b);
        return c
    }

    getPointOnRect(angle, w, h) {
        var sine = Math.sin(angle), cosine = Math.cos(angle);   // Calculate once and store, to make quicker and cleaner
        var dy = Math.sin > 0 ? h / 2 : h / -2;                  // Distance to top or bottom edge (from center)
        var dx = Math.cos > 0 ? w / 2 : w / -2;                  // Distance to left or right edge (from center)
        if (Math.abs(dx * sine) < Math.abs(dy * cosine)) {           // if (distance to vertical line) < (distance to horizontal line)
            dy = (dx * sine) / cosine;                  // calculate distance to vertical line
        } else {                                      // else: (distance to top or bottom edge) < (distance to left or right edge)
            dx = (dy * cosine) / sine;                  // move to top or bottom line
        }
        return {dx: dx, dy: dy};                        // Return point on rectangle edge
    }

    reset_graph() {
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }

    get_len_from_point_to_edge(x1, y1, x2, y2, vx, vy, px, py) {
        // algorithm to find len of vector from point to edge of rect taken from here: https://stackoverflow.com/questions/3180000/calculate-a-vector-from-a-point-in-a-rectangle-to-edge-based-on-angle
        var possible_solutions = [];
        var left_wall_test = (x1 - px) / vx;
        if (left_wall_test > 0) {
            possible_solutions.push(left_wall_test)
        }
        ;
        var right_wall_test = (x2 - px) / vx;
        if (right_wall_test > 0) {
            possible_solutions.push(right_wall_test)
        }
        ;
        var top_wall_test = (y1 - py) / vy;
        if (top_wall_test > 0) {
            possible_solutions.push(top_wall_test)
        }
        ;
        var bottom_wall_test = (y2 - py) / vy;
        if (bottom_wall_test > 0) {
            possible_solutions.push(bottom_wall_test)
        }
        ;
        return Math.min.apply(null, possible_solutions)
    }

    capture_wheel(e) {
        if (e.metaKey) {
            this.mouse_offset = {
                x: e.offsetX,
                y: e.offsetY
            }
            e.preventDefault();
            if (e.deltaY > 0) {
                this.svg.call(this.zoom.scaleBy, 1.1, [e.offsetX, e.offsetY]);
            } else {
                this.svg.call(this.zoom.scaleBy, 0.9, [e.offsetX, e.offsetY]);
            }
        }
    }

    mouse_inside_canvas_bounds(e) {
        var canvas_bounds = this.get_canvas_bounding_box();
        if (
            e.clientX >= canvas_bounds.x && e.clientX <= canvas_bounds.x + canvas_bounds.width &&
            e.clientY >= canvas_bounds.y && e.clientY <= canvas_bounds.y + canvas_bounds.height
        ) {
            return true
        } else {
            return false
        }
    }

    generate_arc() {
        var arc = d3.arc()
            .innerRadius(7)
            .outerRadius(8)
            .startAngle(2.7)
            .endAngle(6.8);
        return arc
    }

    mouse_inside_graph_bounds(e) {
        var graph_bounds = this.get_graph_bounding_box();
        if (
            e.offsetX >= graph_bounds.x && e.offsetX <= graph_bounds.x + graph_bounds.width &&
            e.offsetY >= graph_bounds.y && e.offsetY <= graph_bounds.y + graph_bounds.height
        ) {
            return true
        } else {
            return false
        }
    }

    nudge_graph_larger() {
        var pre_resize_bounds, post_resize_bounds;
        pre_resize_bounds = this.get_graph_bounding_box();
        this.scale_graph_to_fit(this.fill_proportion + 0.03);
        post_resize_bounds = this.get_graph_bounding_box();
        return {
            'pre': pre_resize_bounds,
            'post': post_resize_bounds
        }
    }

    nudge_graph_smaller() {
        var pre_resize_bounds, post_resize_bounds;
        pre_resize_bounds = this.get_graph_bounding_box();
        if (this.fill_proportion - 0.03 > 0) {
            this.scale_graph_to_fit(this.fill_proportion - 0.03)
        }
        post_resize_bounds = this.get_graph_bounding_box();
        return {
            'pre': pre_resize_bounds,
            'post': post_resize_bounds
        }
    }

    updateGraph() {
        var horizontal_overflow, vertical_overflow;
        horizontal_overflow = this.graph_bounding_box.width * this.fill_proportion >= this.canvas_bounding_box.width;
        vertical_overflow = this.graph_bounding_box.height * this.fill_proportion >= this.canvas_bounding_box.height;
        if (!horizontal_overflow) {
            var horizontal_offset = -1 * (this.canvas_bounding_box.width - this.get_canvas_bounding_box().width) / 2;
            if (horizontal_offset !== 0) {
                this.move_graph(horizontal_offset, 0, this.node, this.label, this.edge)
            }
        }
        if (!vertical_overflow) {
            var vertical_offset = -1 * (this.canvas_bounding_box.height - this.get_canvas_bounding_box().height) / 2;
            if (vertical_offset !== 0) {
                this.move_graph(0, vertical_offset, this.node, this.label, this.edge)
            }
        }
        if (horizontal_overflow || vertical_overflow) {
            this.scale_graph_to_fit(this.fill_proportion);
        }
        this.canvas_bounding_box = this.get_canvas_bounding_box();
    }

    createSVG() {
        var width = document.querySelector('.graphview').getBoundingClientRect().width;
        var height = document.querySelector('.graphview').getBoundingClientRect().height;
        var svg = d3.select('.graph-view')
            .append('svg')
            .attr("viewBox", [0, 0, width, height])
            .attr('class', 'graph')
            .attr('overflow', 'auto');
        return svg
    }

    createContainer(svg) {
        var container = svg
            .append('g')
            .attr('class', 'container');
        return container
    }

    appendDefs(svg) {
        var colors = ["black", "orange", "blue"];
        var svg = svg;
        colors.forEach(
            color => {
                svg.append("svg:defs").append("svg:marker")
                    .attr("id", `triangle_${color}`)
                    .attr("refX", 4)
                    .attr("refY", 4)
                    .attr("markerWidth", 8)
                    .attr("markerHeight", 8)
                    .attr("orient", "auto")
                    .append("path")
                    .attr("d", "M 0 0 8 4 0 8 2 4")
                    .attr("fill", color);
            }
        );
        svg.append("svg:defs").append("svg:marker")
            .attr("id", "reference_arc")
            .append("path")
            .attr("d", this.generate_arc())
    }

    associateVisualInformationWithGraphNodes() {
        this.props.graph.objects.forEach(function (d) {
                d.x = parseInt(Math.abs(d.text.x));
                d.y = parseInt(Math.abs(d.text.y));
                if ('ellipse' in d) {
                    d.color = d.ellipse.stroke;
                    if ('stroke-width' in d.ellipse) {
                        d.stroke_width = parseInt(d.ellipse['stroke-width'])
                    } else {
                        d.stroke_width = 1
                    }
                } else {
                    d.color = d.polygon.stroke;
                }
                d.name = d.title;
            }
        );
    }

    associateVisualInformationWithGraphEdges() {
        var self = this;
        this.props.graph.edges.forEach(function (d) {
            d.tail = self.props.graph.objects[d.tail];
            d.head = self.props.graph.objects[d.head];
            d.color = d.path.stroke;
        });
    }

    drawProjections(svg) {
        var self = this;
        var edge = svg.append('g')
            .attr('class', 'edge')
            .selectAll('line')
            .data(self.props.graph.edges)
            .enter()
            .append('line')
            .attr('id', function (d) {
                return d.name
            })
            .attr('x1', function (d) {
                return d.tail.x
            })
            .attr('y1', function (d) {
                return d.tail.y
            })
            .attr('x2', function (d) {
                return d.head.x
            })
            .attr('y2', function (d) {
                return d.head.y
            })
            .attr('stroke-width', 1)
            .attr('stroke', function (d) {
                return d.color
            });
        d3.selectAll('g.edge line')
            .each(function () {
                var d3Element = d3.select(this);
                var color = d3Element.attr('stroke');
                d3Element
                    .attr('marker-end', `url(#triangle_${color})`)
            });
        var recurrent_projs = [];
        d3.selectAll('g.edge line')
            .each(function (e) {
                var recurrent_arc_offset = 10;
                if (e.head === e.tail) {
                    recurrent_projs.push(e);
                }
            });
        var recurrent = svg.append('g')
            .attr('class', 'recurrent')
            .selectAll('path')
            .data(recurrent_projs)
            .enter()
            .append('path')
            .attr('d', self.generate_arc())
            .attr('transform', (e) => {
                var recurrent_arc_offset = 10;
                var arc_x = e.head.x;
                var arc_y = e.head.y;
                return `translate(${arc_x - parseFloat(e.head.ellipse.rx / 2 + recurrent_arc_offset)},${arc_y})`
            });
        d3.selectAll('g.edge line')
            .filter(
                (e) => {
                    return e.head === e.tail
                }
            )
            .attr('x1', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var arc_length = reference_arc.getTotalLength();
                var arrow_start = reference_arc.getPointAtLength(arc_length * .75);
                var arrow_end = reference_arc.getPointAtLength(arc_length * .55);
                return d.head.x - d.head.ellipse.rx + arrow_start.x - document.querySelector("#reference_arc path").getBBox().x
            })
            .attr('y1', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var arc_length = reference_arc.getTotalLength();
                var arrow_start = reference_arc.getPointAtLength(arc_length * .75);
                var arrow_end = reference_arc.getPointAtLength(arc_length * .55);
                return d.head.y - d.head.ellipse.ry + arrow_start.y - document.querySelector("#reference_arc path").getBBox().y
            })
            .attr('x2', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var arc_length = reference_arc.getTotalLength();
                var arrow_start = reference_arc.getPointAtLength(arc_length * .75);
                var arrow_end = reference_arc.getPointAtLength(arc_length * .55);
                return d.head.x - d.head.ellipse.rx + arrow_end.x - document.querySelector("#reference_arc path").getBBox().x
            })
            .attr('y2', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var arc_length = reference_arc.getTotalLength();
                var arrow_start = reference_arc.getPointAtLength(arc_length * .75);
                var arrow_end = reference_arc.getPointAtLength(arc_length * .55);
                return d.head.y - d.head.ellipse.ry + arrow_start.y - document.querySelector("#reference_arc path").getBBox().y
            })
        var width = this.get_canvas_bounding_box().width
        var height = this.get_canvas_bounding_box().height
        this.recurrent = recurrent;
        this.edge = edge;
    }

    drawNodes(svg, nodeWidth, nodeHeight, nodeDragFunction) {
        var nodeWidth = nodeWidth;
        var nodeHeight = nodeHeight;
        var node = svg.append('g')
            .attr('class', 'node')
            .selectAll('ellipse')
            .data(this.props.graph.objects)
            .enter()
            .append('ellipse')
            .attr('rx', function (d) {
                d.rx = nodeWidth;
                return d.rx
            })
            .attr('ry', function (d) {
                d.ry = nodeHeight;
                return d.ry
            })
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            })
            .attr('fill', 'white')
            .attr('stroke-width', function (d) {
                return d.stroke_width
            })
            .attr('stroke', function (d) {
                return d.color
            })
            .call(d3.drag()
                .on('drag', nodeDragFunction));
        this.node = node
    }

    drawLabels(svg, offset, labelDragFunction) {
        var label = svg.append('g')
            .attr('class', 'label')
            .selectAll('text')
            .data(this.props.graph.objects)
            .enter()
            .append('text')
            .attr("text-anchor", "middle")
            .attr('x', function (d) {
                return d.x
            })
            .attr('y', function (d) {
                return d.y + offset
            })
            .attr('font-size', function (d) {
                d.text['font-size'] = '10';
                return '10px'
            })
            .text(function (d) {
                return d.name
            })
            .call(d3.drag()
                .on('drag', labelDragFunction));
        this.label = label;
        var width = this.get_canvas_bounding_box().width
        var height = this.get_canvas_bounding_box().height
    }

    get_offset_between_ellipses(x1, y1, x2, y2, nodeWidth, nodeHeight) {
        var arrow_offset = 3;
        var adjusted_x = x2 - x1;
        var adjusted_y = y2 - y1;
        var dist_between_centers = Math.sqrt(adjusted_x ** 2 + adjusted_y ** 2);
        var phi = Math.atan2(adjusted_y, adjusted_x);
        var a = nodeWidth;
        var b = nodeHeight;
        var radius_at_point = a * b / Math.sqrt(a ** 2 * Math.sin(phi) ** 2 + b ** 2 * Math.cos(phi) ** 2);
        var e_radius = dist_between_centers - radius_at_point - 3;
        var new_x = (e_radius * Math.cos(phi) + x1);
        var new_y = (e_radius * Math.sin(phi) + y1);
        return {
            x: new_x,
            y: new_y
        }
    }

    fit_graph_to_workspace() {
        var self = this;
        var node = this.node;
        var view_rect = document.querySelector('.graph-view')
            .getBoundingClientRect();
        var graph_rect = document.querySelector('g.node')
            .getBBox();
        var widthOffset = (view_rect.width / 2) - (graph_rect.width / 2);
        var heightOffset = (view_rect.height / 2) - (graph_rect.height / 2);
        this.props.graph.objects.forEach(function (d) {
            d.x = (view_rect.width * 0.95) * (d.x / (self.props.graph.max_x));
            d.y = (view_rect.height * 0.95) * (d.y / (self.props.graph.max_y))
        });
        node
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            });

    }

    move_graph(horizontal_offset, vertical_offset) {
        var self = this;
        var label_offset = 3;
        var node = this.node;
        var label = this.label;
        var edge = this.edge;
        var recurrent = this.recurrent;
        horizontal_offset /= this.scaling_factor;
        vertical_offset /= this.scaling_factor;
        self.props.graph.objects.forEach(function (d) {
                d.x += horizontal_offset;
                d.y += vertical_offset;
            }
        );
        node
            .attr('cx', function (d) {
                return d.x
            })
            .attr('cy', function (d) {
                return d.y
            });

        label
            .attr('x', function (d) {
                return d.x
            })
            .attr('y', function (d) {
                return d.y + label_offset
            });
        edge
            .attr('x1', function (d) {
                return d.tail.x
            })
            .attr('y1', function (d) {
                return d.tail.y
            })
            .attr('x2', function (d) {
                var x2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).x;
                return x2
            })
            .attr('y2', function (d) {
                var y2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).y;
                return y2
            });
        recurrent
            .attr('transform', (e) => {
                var recurrent_arc_offset = 10;
                var arc_x = e.head.x;
                var arc_y = e.head.y;
                return `translate(${arc_x - parseFloat(e.head.ellipse.rx / 2 + recurrent_arc_offset)},${arc_y})`
            })
        d3.selectAll('g.edge line')
            .filter(
                (e) => {
                    return e.head === e.tail
                }
            )
            .attr('x1', function (d) {
                return d.head.x - d.head.ellipse.rx + 6
            })
            .attr('y1', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var reference_arc_len = reference_arc.getTotalLength();
                var starting_y_location = reference_arc.getPointAtLength(reference_arc_len).y - reference_arc.getBBox().y - 8.2;
                return d.head.y + starting_y_location
            })
            .attr('x2', function (d) {
                return d.head.x - d.head.ellipse.rx + 7
            })
            .attr('y2', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var reference_arc_len = reference_arc.getTotalLength();
                var ending_y_location = reference_arc.getPointAtLength(reference_arc_len * .99).y - reference_arc.getBBox().y - 7.70;
                return d.head.y + ending_y_location
            })
    }

    resize_nodes_to_label_text() {
        var labels = Array.from(d3.selectAll('g.label text')._groups[0]);
        var nodes = Array.from(d3.selectAll('g.node ellipse')._groups[0]);
        var node_label_arrays = nodes.map(function (e, i) {
            return [e, labels[i]]
        });
        var node_label_mapping = {};
        node_label_arrays.forEach(function (e) {
            node_label_mapping[e[0]] = e[1];
            var ellipseWidth = d3.select(e[0]).attr('rx');
            var labelWidth = e[1].getBBox().width;
            if (labelWidth >= ellipseWidth) {
                d3.select(e[0]).attr('rx', Math.floor(labelWidth / 2) + 10)
            }
        });
    }

    apply_select_boxes(svg) {
        svg.on("mousedown", function () {
                if (!d3.event.ctrlKey) {
                    d3.selectAll('g.selected').classed("selected", false);
                }

                var p = d3.mouse(this);

                svg.append("rect")
                    .attr('rx', 6)
                    .attr('ry', 6)
                    .attr('class', "selection")
                    .attr('x', p[0])
                    .attr('y', p[1])
                    .attr('width', 0)
                    .attr('height', 0);
            }
        )
            .on("mousemove", function () {
                var s = svg.select("rect.selection");

                if (!s.empty()) {
                    let p = d3.mouse(this);
                    let d = {};
                    d.x = parseInt(s.attr('x'), 10);
                    d.y = parseInt(s.attr('y'), 10);
                    d.width = parseInt(s.attr('width'), 10);
                    d.height = parseInt(s.attr('height'), 10);
                    let move = {};
                    move.x = p[0] - d.x;
                    move.y = p[1] - d.y;

                    // Calculate new properties of selection rectangle
                    if (move.x < 1 || (move.x * 2 < d.width)) {
                        d.x = p[0];
                        d.width -= move.x;
                    } else {
                        d.width = move.x;
                    }
                    if (move.y < 1 || (move.y * 2 < d.height)) {
                        d.y = p[1];
                        d.height -= move.y;
                    } else {
                        d.height = move.y;
                    }

                    s.attr('x', d.x)
                        .attr('y', d.y)
                        .attr('width', d.width)
                        .attr('height', d.height);

                    // deselect all temporary selected state objects
                    d3.selectAll('g.state.selection.selected').classed("selected", false);

                }
            })
            .on("mouseup", function () {
                // Remove selection frame
                svg.selectAll("rect.selection").remove();

                // Remove temporary selection marker class
                d3.selectAll('g.state.selection').classed("selection", false);
            })
            .on("mouseout", function () {
                var s = svg.select("rect.selection");
                if (!s.empty() && d3.event.relatedTarget.tagName === 'HTML') {
                    // Remove selection frame
                    svg.selectAll("rect.selection").remove();

                    // Remove temporary selection marker class
                    d3.selectAll('g.state.selection').classed("selection", false);
                }
            });
    }

    correct_projection_lengths_for_ellipse_sizes(node, edge) {
        var self = this;
        var node = this.node;
        var edge = this.edge;
        edge
            .attr('x2', function (d) {
                var x2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).x;
                return x2
            })
            .attr('y2', function (d) {
                    var y2 = self.get_offset_between_ellipses(
                        d.tail.x,
                        d.tail.y,
                        d.head.x,
                        d.head.y,
                        node.filter(function (n) {
                            return n === d.head
                        })
                            .attr('rx'),
                        node.filter(function (n) {
                            return n === d.head
                        })
                            .attr('ry')
                    ).y;
                    return y2
                }
            )
    }

    drag_node(d) {
        var self = this;
        var node = this.node;
        var label = this.label;
        var edge = this.edge;
        var label_offset = 3;
        var canvas_dimensions = self.get_canvas_bounding_box();
        var node_x_radius = parseFloat(node.filter((n) => {
                return n === d
            }
        ).attr('rx')) * this.scaling_factor;
        var node_y_radius = parseFloat(node.filter((n) => {
                return n === d
            }
        ).attr('ry')) * this.scaling_factor;
        let bounds = {
            x_min: node_x_radius,
            x_max: canvas_dimensions.width - node_x_radius,
            y_min: node_y_radius,
            y_max: canvas_dimensions.height - node_y_radius
        };
        d.x = d3.event.x;
        d.y = d3.event.y;
        var canvas_width = canvas_dimensions.width;
        var interpolated_width = canvas_width / this.scaling_factor;
        var interpolated_x_start = canvas_width / 2 - interpolated_width / 2;
        var original_x = ((d.x - interpolated_x_start) / interpolated_width) * canvas_width;

        var canvas_height = canvas_dimensions.height;
        var interpolated_height = canvas_height / this.scaling_factor;
        var interpolated_y_start = canvas_height / 2 - interpolated_height / 2;
        var original_y = ((d.y - interpolated_y_start) / interpolated_height) * canvas_height;

        if (original_x < bounds.x_min) {
            d.x = Math.floor((node_x_radius / canvas_width) * interpolated_width + interpolated_x_start)
        } else if (original_x > bounds.x_max) {
            d.x = Math.floor((canvas_width - node_x_radius) / canvas_width * interpolated_width + interpolated_x_start)
        }
        if (original_y < bounds.y_min) {
            d.y = Math.floor((node_y_radius / canvas_height) * interpolated_height + interpolated_y_start)
        } else if (original_y > bounds.y_max) {
            d.y = Math.floor(((canvas_height - node_y_radius) / canvas_height) * interpolated_height + interpolated_y_start)
        }
        node.filter(function (n) {
            return n === d
        })
            .attr('cx', d.x)
            .attr('cy', d.y);

        label.filter(function (l) {
            return l === d
        })
            .attr('x', d.x)
            .attr('y', d.y + label_offset);

        label.filter(function (l) {
            return l === d
        })
            .attr('x', d.x)
            .attr('y', d.y + label_offset);

        edge.filter(function (l) {
            return l.tail === d
        })
            .attr('x1', d.x)
            .attr('y1', d.y)
            .attr('x2', function (d) {
                var x2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).x;
                return x2
            })
            .attr('y2', function (d) {
                var y2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).y;
                return y2
            });

        edge.filter(function (l) {
            return l.head === d
        })
            .attr('x2', function (d) {
                var x2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).x;
                return x2
            })
            .attr('y2', function (d) {
                var y2 = self.get_offset_between_ellipses(
                    d.tail.x,
                    d.tail.y,
                    d.head.x,
                    d.head.y,
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('rx'),
                    node.filter(function (n) {
                        return n === d.head
                    })
                        .attr('ry')
                ).y;
                return y2
            })
        this.recurrent
            .attr('transform', (e) => {
                var recurrent_arc_offset = 10;
                var arc_x = e.head.x;
                var arc_y = e.head.y;
                return `translate(${arc_x - parseFloat(e.head.ellipse.rx / 2 + recurrent_arc_offset)},${arc_y})`
            })
        d3.selectAll('g.edge line')
            .filter(
                (e) => {
                    return e.head === e.tail
                }
            )
            .attr('x1', function (d) {
                return d.head.x - d.head.ellipse.rx + 6
            })
            .attr('y1', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var reference_arc_len = reference_arc.getTotalLength();
                var starting_y_location = reference_arc.getPointAtLength(reference_arc_len).y - reference_arc.getBBox().y - 8.2;
                return d.head.y + starting_y_location
            })
            .attr('x2', function (d) {
                return d.head.x - d.head.ellipse.rx + 7
            })
            .attr('y2', function (d) {
                var reference_arc = document.querySelector('#reference_arc path');
                var reference_arc_len = reference_arc.getTotalLength();
                var ending_y_location = reference_arc.getPointAtLength(reference_arc_len * .99).y - reference_arc.getBBox().y - 7.70;
                return d.head.y + ending_y_location
            })
    }

    scroll_graph_into_view() {
        var horizontal_offset, vertical_offset, graph_bounding_box;
        var node = this.node;
        var label = this.label;
        var edge = this.edge;
        graph_bounding_box = this.get_graph_bounding_box();
        if (graph_bounding_box.x < 0) {
            horizontal_offset = Math.abs(0 - graph_bounding_box.x)
        } else {
            horizontal_offset = 0
        }
        if (graph_bounding_box.y < 0) {
            vertical_offset = Math.abs(0 - graph_bounding_box.y)
        } else {
            vertical_offset = 0
        }
        this.move_graph(horizontal_offset, vertical_offset, node, label, edge)
    }

    scale_graph(scaling_factor) {
        var node_selector, label_selector, edge_selector, recurrent_selector;
        this.scaling_factor = scaling_factor;
        node_selector = d3.select('g.node');
        node_selector
            .attr('transform', `scale(${scaling_factor})`);
        label_selector = d3.select('g.label');
        label_selector
            .attr('transform', `scale(${scaling_factor})`);
        edge_selector = d3.select('g.edge');
        edge_selector
            .attr('transform', `scale(${scaling_factor})`);
    }

    scale_graph_to_fit(proportion) {
        var canvas_bounding_box, graph_bounding_box, target_width, target_height, scaling_factor;
        this.fill_proportion = proportion;
        this.scale_graph(1);
        canvas_bounding_box = this.get_canvas_bounding_box();
        graph_bounding_box = this.get_graph_bounding_box();
        target_width = Math.floor(canvas_bounding_box.width * proportion * .99);
        target_height = Math.floor(canvas_bounding_box.height * proportion * .99);
        scaling_factor = Math.min(
            Math.floor(((target_width / graph_bounding_box.width) * 100)) / 100,
            Math.floor(((target_height / graph_bounding_box.height) * 100)) / 100,
        );
        this.scale_graph(scaling_factor);
        this.center_graph_on_point();
    }

    get_canvas_bounding_box() {
        var graph_dom_rect, canvas_bounding_box;
        graph_dom_rect = document.querySelector('.graph').getBoundingClientRect();
        canvas_bounding_box = {
            x: graph_dom_rect.x,
            y: graph_dom_rect.y,
            width: graph_dom_rect.width,
            height: graph_dom_rect.height
        };
        return canvas_bounding_box;
    }

    get_graph_bounding_box() {
        var canvas_bounding_box, node_bounding_box, node_dom_rect, label_bounding_box, label_dom_rect,
            graph_bounding_box, x, y, width, height;
        canvas_bounding_box = this.get_canvas_bounding_box();
        node_bounding_box = document.querySelector('.graph-view .node').getBBox();
        node_dom_rect = document.querySelector('.graph-view .node').getBoundingClientRect();
        label_bounding_box = document.querySelector('.graph-view .label').getBBox();
        label_dom_rect = document.querySelector('.graph-view .label').getBoundingClientRect();
        x = Math.min(node_dom_rect.x, label_dom_rect.x) - canvas_bounding_box.x;
        y = Math.min(node_dom_rect.y, label_dom_rect.y) - canvas_bounding_box.y;

        if ((node_dom_rect.width >= label_dom_rect.width && node_bounding_box.x <= label_bounding_box.x) ||
            (node_dom_rect.width <= label_dom_rect.width && node_bounding_box.x >= label_bounding_box.x)) {
            width = Math.max(node_dom_rect.width, label_dom_rect.width)
        } else {
            if (label_bounding_box.x < node_bounding_box.x) {
                width = Math.max(
                    label_bounding_box.width, node_bounding_box.width + node_bounding_box.x - label_bounding_box.x
                );
            } else {
                width = Math.max(
                    node_bounding_box.width, label_bounding_box.width + label_bounding_box.x - node_bounding_box.x
                );
            }
        }
        height = node_dom_rect.height;
        graph_bounding_box = {
            x: x,
            y: y,
            width: width,
            height: height,
            centerpoint: {
                x: Math.floor(x + width / 2),
                y: Math.floor(y + height / 2)
            }
        };
        return graph_bounding_box
    }

    center_graph_on_point(centerpoint_offset = this.centerpoint_offset) {
        var centerpoint, graph_bounding_box, canvas_bounding_box, vertical_offset, horizontal_offset;
        graph_bounding_box = this.get_graph_bounding_box();
        canvas_bounding_box = this.get_canvas_bounding_box();
        centerpoint = {x: canvas_bounding_box.width / 2, y: canvas_bounding_box.height / 2};
        horizontal_offset = centerpoint.x - graph_bounding_box.width / 2 - graph_bounding_box.x + centerpoint_offset.x;
        vertical_offset = centerpoint.y - graph_bounding_box.height / 2 - graph_bounding_box.y + centerpoint_offset.y;
        this.move_graph(horizontal_offset, vertical_offset)
    }

    setGraph() {
        var self = this;
        if (self.props.graph) {
            let nodeWidth = self.state.node_width;
            let nodeHeight = self.state.node_height;
            var svg = this.createSVG();
            var container = this.createContainer(svg);
            this.associateVisualInformationWithGraphNodes();
            this.associateVisualInformationWithGraphEdges();
            this.appendDefs(svg);
            this.drawProjections(container);
            // this.drawNodes(svg, nodeWidth, nodeHeight, (d) => {
            //     self.drag_node(d)
            // });
            // this.drawLabels(svg, 5, (d) => {
            //     self.drag_node(d)
            // });
            this.drawNodes(container, nodeWidth, nodeHeight, (d) => {
                self.drag_node(d)
            });
            this.drawLabels(container, 5, (d) => {
                self.drag_node(d)
            });
            this.scale_graph(1);
            // this.scale_graph_to_fit(this.fill_proportion);
            this.resize_nodes_to_label_text();
            this.correct_projection_lengths_for_ellipse_sizes();
            this.center_graph_on_point();
            // this.apply_select_boxes(svg);
            this.graph_bounding_box = this.get_graph_bounding_box();
            this.canvas_bounding_box = this.get_canvas_bounding_box();
            var width = document.querySelector('svg').getBoundingClientRect().width;
            var height = document.querySelector('svg').getBoundingClientRect().height;
            var zoom = d3.zoom();
            this.svg = svg;
            this.zoom = zoom
                .scaleExtent([1, 3])
                .filter(() => {
                    return d3.event.type.includes("mouse") || (d3.event.sourceEvent && !d3.event.sourceEvent.type === "wheel")
                });
            var d3e = d3.select('svg.graph')
            d3e.call(this.zoom
                .on("zoom", zoomed)
            );

            // d3e.call(this.zoom);
            function zoomed() {
                console.log(d3.event)
                var d3e = d3.select('svg.graph');
                var win = document.querySelector('.graph-view')
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'mousemove') {
                    if (d3.event.sourceEvent.metaKey) {
                        var xScroll = win.scrollLeft - d3.event.sourceEvent.movementX
                        var yScroll = win.scrollTop - d3.event.sourceEvent.movementY
                    }
                    else {
                        var xScroll = win.scrollLeft
                        var yScroll = win.scrollTop
                    }
                } else {
                    var full_g_pre = document.querySelector('svg.graph');
                    var full_g_box_pre = full_g_pre.getBoundingClientRect();
                    var pre_scale_x_proportion = self.mouse_offset.x / full_g_box_pre.width
                    var pre_scale_y_proportion = self.mouse_offset.y / full_g_box_pre.height
                    d3e
                        .attr('width', `${100 * d3.event.transform.k}%`)
                        .attr('height', `${100 * d3.event.transform.k}%`);
                    var full_g_post = document.querySelector('svg.graph');
                    var full_g_box_post = full_g_post.getBoundingClientRect();
                    var xScrollOffset = full_g_box_post.width * pre_scale_x_proportion - self.mouse_offset.x
                    var xScroll = win.scrollLeft + xScrollOffset
                    var yScrollOffset = full_g_box_post.height * pre_scale_y_proportion - self.mouse_offset.y
                    var yScroll = win.scrollTop + yScrollOffset
                }
                win.scrollTo(xScroll, yScroll)
            }

            zoomed.bind(this)
            window.scale = this.scale_graph;
            window.graph_bounds = this.get_graph_bounding_box;
            window.canvas_bounds = this.get_canvas_bounding_box;
            window.scale_to_fit = this.scale_graph_to_fit;
            window.move_graph = function (h, v) {
                self.move_graph(h, v)
            };
        }
    }

    render() {
        var self = this;
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
                className='graphview'
                defaultSize={
                    this.props.defaultSize
                }
                size={
                    this.props.size
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

export default GraphView
