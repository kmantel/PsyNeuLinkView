import React, { PureComponent } from 'react';
import LineChart from "recharts";
import '../css/d3plotter.css'
import * as d3 from 'd3'
import PlotBoundaries from "./plot-boundary";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

class Plot extends React.PureComponent{
    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            data: props.data ? props.data:[]
        };
    }

    render() {
        return <PlotBoundaries
            id={this.props.id}
            cursorSignal={this.props.cursorSignal}/>
    }
}

export default Plot