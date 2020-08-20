import React, { PureComponent } from 'react';
import Plot from "./plot";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import '../css/d3plotter.css'
import * as d3 from 'd3'

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export default class LinePlot extends Plot {
    constructor(props) {
        super(props);
        this.state = {
            hasMouse: true,
            toolTipEnabled: true,
            activeBoundary: null
        };
        this.cursorSignal = props.cursorSignal;
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.toggleToolTip = this.toggleToolTip.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.getGraphBounds = this.getGraphBounds.bind(this);
        this.render = this.render.bind(this);
    }

    getGraph(width, height, data) {
    }

    toggleToolTip(){
        this.setState({
            toolTipEnabled:!this.state.toolTipEnabled
        })
    }

    handleRightClick(){
        console.log('right')
        this.toggleToolTip()
    }

    handleMouseMove(args){
        console.log(args);
        // this.setState({hasMouse:true})
    }

    getGraphBounds(){
        var rect, bounds, domElement;
        if (!this.bounds){
            domElement = document.querySelector(`.subplot.${this.props.id}`)
            if (domElement === null){return null};
            rect = domElement.getBoundingClientRect();
            bounds = {
                left:rect.x,
                top:rect.y,
                right:rect.x+rect.width,
                bottom:rect.y+rect.height
            };
            this.bounds = bounds
        }
        return this.bounds
    }

    render(){
        var [width, height, data] = [this.props.size.width,this.props.size.height,this.props.data];
        var self = this;
        return(
            <div class={this.props.classList.join(' ')}
                 onClick={() => {
                 }}
                 onContextMenu={this.handleRightClick}
            >
                {
                    <LineChart
                        width={width}
                        height={height}
                        data={data = [
                            {
                                name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
                            },
                            {
                                name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
                            },
                            {
                                name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
                            },
                            {
                                name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
                            },
                            {
                                name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
                            },
                            {
                                name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
                            },
                            {
                                name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
                            },
                        ]}
                        margin={{
                            top: 20, right: 30, left: 10, bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis
                            width={60}/>
                        <Legend/>
                        <Line type="monotone" dataKey="pv" stroke="#8884d8" isAnimationActive={false}/>
                        <Line type="monotone" dataKey="uv" stroke="#82ca9d" isAnimationActive={false}/>
                    </LineChart>
                }
                {super.render()}
            </div>
        );
    }
}