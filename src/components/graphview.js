import React from 'react'
import '../css/graphview.css'
import * as d3 from 'd3'
import add_context_menu from '../utility/add_context_menu'
import { Resizable } from 're-resizable'

const context_menu = [{
  onClick: {},
  text: 'Placeholder 1'
},
  {
    onClick: {},
    text: 'Placeholder 2'
  }
]

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

class GraphView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      class: `graph-view ${this.props.className}`,
      mounted: false,
      node_width: 40,
      node_height: 30,
      graph: this.props.graph
    }
    this.setGraph = this.setGraph.bind(this)
    this.updateGraph = this.updateGraph.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
  }

  componentWillMount() {
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!(this.props.graph===prevProps.graph)){
      d3.selectAll('svg').remove()
      this.setGraph()
      this.updateGraph()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateGraph)
  }

  componentDidMount() {
    this.setGraph()
    window.addEventListener('resize', this.updateGraph)
    add_context_menu('.graph-view', context_menu)
  }

  updateGraph() {
    var self = this
    if (self.props.graph){
      var percentage;
      var graph = document.querySelector('.graph-view .graph')
      var view_rect = document.querySelector('.graph-view')
        .getBoundingClientRect()
      var graph_rect = document.querySelector('.graph-view g.node')
        .getBBox()
      var total_graph_height = graph_rect.height + graph_rect.y
      if (total_graph_height > view_rect.height) {
        percentage = Math.ceil((total_graph_height / (view_rect.height)) * 100)
        graph.setAttribute('height', `${percentage}%`)
      } else {
        graph.setAttribute('height', '100%')
      }

      var total_graph_width = graph_rect.width + graph_rect.x
      if (total_graph_width > view_rect.width) {
        percentage = Math.ceil((total_graph_width / view_rect.width) * 100)
        graph.setAttribute('width', `${percentage}%`)
      } else {
        graph.setAttribute('width', '100%')
      }
    }
  }

  setGraph() {
    var self = this
    if (self.props.graph){
      let nodeWidth = self.state.node_width
      let nodeHeight = self.state.node_height
      var svg = d3.select('.graph-view')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '99.5%')
        .attr('class', 'graph')
        .attr('overflow', 'auto')

      svg.append("svg:defs").append("svg:marker")
        .attr("id", window.location.href +"/triangle_orange")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .attr("fill", "orange");

      svg.append("svg:defs").append("svg:marker")
        .attr("id", window.location.href +"/triangle_black")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 30)
        .attr("markerHeight", 30)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .attr("fill", "black");

      self.props.graph.objects.forEach(function (d) {
          d.x = parseInt(d._ldraw_[2].pt[0])
          d.y = parseInt(d._ldraw_[2].pt[1])
        }
      )

      self.props.graph.edges.forEach(function (d) {
        d.tail = self.props.graph.objects[d.tail]
        d.head = self.props.graph.objects[d.head]
      })

      var edge = svg.append('g')
        .attr('class', 'edge')
        .selectAll('line')
        .data(self.props.graph.edges)
        .enter()
        .append('line')
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
        })

      d3.selectAll('g.edge line')
        .each(function () {
          var d3Element = d3.select(this)
          var color = d3Element.attr('stroke')
          d3Element
            .attr('marker-end', 'url(#' + window.location.href + `/triangle_${color})`)
        })

      var node = svg.append('g')
        .attr('class', 'node')
        .selectAll('ellipse')
        .data(self.props.graph.objects)
        .enter()
        .append('ellipse')
        .attr('rx', nodeWidth)
        .attr('ry', nodeHeight)
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })
        .attr('fill', 'white')
        .attr('stroke', function (d){
          return d.color
        })
        .call(d3.drag()
          .on('drag', drag_node))

      var labelOffset = 5
      var label = svg.append('g')
        .attr('class', 'label')
        .selectAll('text')
        .data(self.props.graph.objects)
        .enter()
        .append('text')
        .attr("text-anchor","middle")
        .attr('x', function (d) {
          return d.x
        })
        .attr('y', function (d) {
          return d.y + labelOffset
        })
        .attr('font-size', '14px')
        .text(function (d) {
          return d.name
        })
        .call(d3.drag()
          .on('drag', drag_node))

      function offset_point(x1,y1,x2,y2,nodeWidth,nodeHeight){
        var adjusted_x = x2 - x1
        var adjusted_y = y2 - y1
        var dist_between_centers = Math.sqrt(adjusted_x**2 + adjusted_y**2)
        var phi = Math.atan2(adjusted_y, adjusted_x)
        var a = nodeWidth
        var b = nodeHeight
        var radius_at_point = a*b/Math.sqrt(a**2 * Math.sin(phi)**2 + b**2 * Math.cos(phi)**2)
        var e_radius = dist_between_centers - radius_at_point - 5
        var new_x = (e_radius * Math.cos(phi) + x1)
        var new_y = (e_radius * Math.sin(phi) + y1)
        return {
          x:new_x,
          y:new_y
        }
      }

      var view_rect = document.querySelector('.graph-view')
        .getBoundingClientRect()
      var graph_rect = document.querySelector('g.node')
        .getBBox()
      var widthOffset = (view_rect.width/2)-(graph_rect.width/2)
      var heightOffset = (view_rect.height/2)-(graph_rect.height/2)

      self.props.graph.objects.forEach(function (d) {
        d.x = (view_rect.width * 0.95)  * (d.x/(self.props.graph.max_x))
        d.y = (view_rect.height * 0.95) * (d.y/(self.props.graph.max_y))
      })

      node
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })

      graph_rect = document.querySelector('g.node')
        .getBBox()
      widthOffset = graph_rect.x-((view_rect.width/2)-(graph_rect.width/2))
      heightOffset = (view_rect.height/2)-(graph_rect.height/2)

      self.props.graph.objects.forEach(function (d) {
          d.x -= widthOffset
          d.y = view_rect.height - (d.y + heightOffset)
        }
      )

      node
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })

      label
        .attr('x', function (d) {
          return d.x
        })
        .attr('y', function (d) {
          return d.y + labelOffset
        })

      var labels = Array.from(d3.selectAll('g.label text')._groups[0])
      var nodes = Array.from(d3.selectAll('g.node ellipse')._groups[0])
      var node_label_arrays = nodes.map(function(e,i){return [e, labels[i]]})
      var node_label_mapping = {}
      node_label_arrays.forEach( function(e){
        node_label_mapping[e[0]]=e[1]
        var ellipseWidth = d3.select(e[0]).attr('rx')
        var labelWidth = e[1].getBBox().width
        if(labelWidth>=ellipseWidth){
          d3.select(e[0]).attr('rx',labelWidth)
        }
      })

      edge
        .attr('x1', function (d) {
          return d.tail.x
        })
        .attr('y1', function (d) {
          return d.tail.y
        })
        .attr('x2', function (d) {
          var x2 = offset_point(
            d.tail.x,
            d.tail.y,
            d.head.x,
            d.head.y,
            node.filter(function(n){
              return n===d.head
            })
              .attr('rx'),
            node.filter(function(n){
              return n===d.head
            })
              .attr('ry')
          ).x
          return x2
          // return d.head.x
        })
        .attr('y2', function (d) {
          var y2 = offset_point(
            d.tail.x,
            d.tail.y,
            d.head.x,
            d.head.y,
            node.filter(function(n){
              return n===d.head
            })
              .attr('rx'),
            node.filter(function(n){
              return n===d.head
            })
              .attr('ry')
          ).y
          return y2
          // return d.head.y
        });

      function drag_node(d) {
        let graph_dimensions = document.querySelector('.graph-view .graph')
          .getBoundingClientRect()

        var width = parseFloat(node.filter((n)=>{
          return n===d}
        ).attr('rx'))

        var height = parseFloat(node.filter((n)=>{
          return n===d}
        ).attr('ry'))

        let bounds = {
          x_min: width,
          x_max: graph_dimensions.width - width,
          y_min: height,
          y_max: graph_dimensions.height - height
        }

        d.x = d3.event.x
        d.y = d3.event.y
        if (d.x < bounds.x_min) {
          d.x = bounds.x_min
        }
        else if (d.x > bounds.x_max) {
          d.x = bounds.x_max
        }
        if (d.y < bounds.y_min) {
          d.y = bounds.y_min
        }
        else if (d.y > bounds.y_max) {
          d.y = bounds.y_max
        }
        node.filter(function (n) {
          return n === d
        })
          .attr('cx', d.x)
          .attr('cy', d.y)

        label.filter(function (l) {
          return l === d
        })
          .attr('x', d.x)
          .attr('y', d.y + labelOffset)

        edge.filter(function (l) {
          return l.tail === d
        })
          .attr('x1', d.x)
          .attr('y1', d.y)
          .attr('x2', function (d) {
            var x2 = offset_point(
              d.tail.x,
              d.tail.y,
              d.head.x,
              d.head.y,
              node.filter(function(n){
                return n===d.head
              })
                .attr('rx'),
              node.filter(function(n){
                return n===d.head
              })
                .attr('ry')
            ).x
            return x2
          })
          .attr('y2', function (d) {
            var y2 = offset_point(
              d.tail.x,
              d.tail.y,
              d.head.x,
              d.head.y,
              node.filter(function(n){
                return n===d.head
              })
                .attr('rx'),
              node.filter(function(n){
                return n===d.head
              })
                .attr('ry')
            ).y
            return y2
          })

        edge.filter(function (l) {
          return l.head === d
        })
          .attr('x2', function (d) {
            var x2 = offset_point(
              d.tail.x,
              d.tail.y,
              d.head.x,
              d.head.y,
              node.filter(function(n){
                return n===d.head
              })
                .attr('rx'),
              node.filter(function(n){
                return n===d.head
              })
                .attr('ry')
            ).x
            return x2
          })
          .attr('y2', function (d) {
            var y2 = offset_point(
              d.tail.x,
              d.tail.y,
              d.head.x,
              d.head.y,
              node.filter(function(n){
                return n===d.head
              })
                .attr('rx'),
              node.filter(function(n){
                return n===d.head
              })
                .attr('ry')
            ).y
            return y2
          })

      }
      svg.on( "mousedown", function() {
          if( !d3.event.ctrlKey) {
            d3.selectAll( 'g.selected').classed( "selected", false);
          }

          var p = d3.mouse( this);

          svg.append( "rect")
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('class', "selection")
            .attr('x', p[0])
            .attr('y', p[1])
            .attr('width',0)
            .attr('height',0);
        }
      )
        .on( "mousemove", function() {
          var s = svg.select( "rect.selection");

          if( !s.empty()) {
            let p = d3.mouse(this);
            let d = {};
            d.x = parseInt( s.attr('x'), 10);
            d.y = parseInt( s.attr('y'), 10);
            d.width = parseInt( s.attr('width'), 10);
            d.height = parseInt( s.attr('height'), 10);
            let move = {};
            move.x = p[0] - d.x;
            move.y = p[1] - d.y;

            // Calculate new properties of selection rectangle
            if( move.x < 1 || (move.x*2<d.width)) {
              d.x = p[0];
              d.width -= move.x;
            } else {
              d.width = move.x;
            }
            if( move.y < 1 || (move.y*2<d.height)) {
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
            d3.selectAll( 'g.state.selection.selected').classed( "selected", false);

          }
        })
         .on( "mouseup",   function() {
          // Remove selection frame
          svg.selectAll( "rect.selection").remove();

          // Remove temporary selection marker class
          d3.selectAll( 'g.state.selection').classed( "selection", false);
        })
         .on( "mouseout",  function() {
          var s = svg.select( "rect.selection");
          if( !s.empty() && d3.event.relatedTarget.tagName==='HTML' ) {
            // Remove selection frame
            svg.selectAll( "rect.selection").remove();

            // Remove temporary selection marker class
            d3.selectAll( 'g.state.selection').classed( "selection", false);
          }
        });
      self.updateGraph()
    }
  }
  render() {
    return (
      <Resizable
        style={style}
        onResize={this.props.onResize}
        onResizeStart={this.props.onResizeStart}
        onResizeStop={this.props.onResizeStop}
        enable={{
          top:false,
          right:false,
          bottom:true,
          left:true,
          topRight:false,
          bottomRight:false,
          bottomLeft:true,
          topLeft:false
        }}
        className='graphview'
        defaultSize={
          this.props.defaultSize
        }
        size={
          this.props.size
        }
      >
      <div className={this.state.class}
           onScroll={this.updateGraph}/>
      </Resizable>
    )
  }
}

export default GraphView
