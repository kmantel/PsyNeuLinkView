import React from 'react';
import Plot from "./plot";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Label, Tooltip, Legend,
} from 'recharts';
import '../css/d3plotter.css'

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
        this.toggleToolTip()
    }

    handleMouseMove(args){
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
        var {id, data, width, height, name} = this.props;
        return(
            <div className={[['subplot', `${id}`], 'pnl-lineplot']}
                 onClick={() => {
                 }}
                 onContextMenu={this.handleRightClick}
            >
                {
                    <LineChart
                        width={width}
                        height={height}
                        data={data=[
                            {'a': 100, 'b': 200, 'c': 300},
                            {'a': 500, 'b': 600, 'c': 700},
                        ]}
                        margin={{
                            top: 20, right: 30, left: 0, bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis
                            tick={false}>
                            <Label value={name} offset={0} position="insideBottom" />
                        </XAxis>
                        <YAxis
                            tick={false}
                            width={35}
                            />
                        {/*<Legend/>*/}
                        <Line type="monotone" dataKey="b" stroke="#8884d8" isAnimationActive={false}/>
                        <Line type="monotone" dataKey="c" stroke="#82ca9d" isAnimationActive={false}/>
                    </LineChart>
                }
                {super.render()}
            </div>
        );
    }
}