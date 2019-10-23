import React from 'react'
import * as d3 from 'd3'

class BasicComponent extends React.Component{
  constructor(props){
    super(props)
    this.componentDidMount.bind(this)
    this.componentDidUpdate.bind(this)
  }

  drawBox(){
    const svg =
      d3.select("body")
        .append("svg")
        .attr("width", this.props.width)
        .attr("height", 300);
  }

  componentDidMount() {
    this.drawBox()
  }

  componentDidUpdate() {
    d3.select("body .svg")
      .remove()
    this.drawBox()
  }

  render() {
    return (
      <div>
        {this.props.text}
      </div>
    )
  }
}

export default BasicComponent