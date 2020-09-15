import React from 'react';
import Plot from "./plot";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Label, Tooltip, Legend,
} from 'recharts';
import '../css/d3plotter.css'
import {getMapIdToDataSources, getSubplotMetaData} from "../state/subplots/selectors";
import {getMapIdToData} from "../state/psyneulink-parameters/selectors";
import {connect} from 'react-redux';
import * as _ from "lodash";
import {getPsyNeuLinkMapIdToName} from "../state/psyneulink-registry/selectors";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const mapStateToProps = ({subplots, psyNeuLinkParameters, psyNeuLinkRegistry}) => ({
    dataSourceIdToData: getMapIdToData(psyNeuLinkParameters),
    psyNeuLinkIdToName: getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
    subplotMetaData: getSubplotMetaData(subplots),
});

class LinePlot extends Plot {
    constructor(props) {
        super(props);
        this.state = {
            hasMouse: true,
            toolTipEnabled: true,
            activeBoundary: null
        };
        this.cursorSignal = props.cursorSignal;
        this.getPlotProps = _.throttle(this.getPlotProps, 10);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.toggleToolTip = this.toggleToolTip.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.getGraphBounds = this.getGraphBounds.bind(this);
        this.getData = this.getData.bind(this);
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

    getData(){
        let {id, dataSourceIdToData, subplotMetaData, psyNeuLinkIdToName} = this.props;
        let thisPlotMetaData = subplotMetaData[id];
        let data = {};
        let name;
        for (const dataSource of thisPlotMetaData.dataSources){
            name = psyNeuLinkIdToName[dataSource];
            for (const datum of dataSourceIdToData[dataSource]){
                if (!(datum.time in data)){
                    data[datum.time] = {time: datum.time}
                }
                data[datum.time][dataSource] = datum.value.data[0]
            }
        }
        data = _.sortBy(data, "time");
        return data
    }

    getLines(){
        let {id, subplotMetaData, psyNeuLinkIdToName} = this.props;
        let thisPlotMetaData = subplotMetaData[id];
        let lines = [];
        let name, color;
        for (const dataSource of thisPlotMetaData.dataSources){
            name = psyNeuLinkIdToName[dataSource];
            color = subplotMetaData[id]['dataSourceColors'][dataSource];
            lines.push(
                <Line
                    connectNulls
                    type="monotone"
                    dataKey={dataSource}
                    stroke={color}
                    isAnimationActive={false}
                />)
        }
        return lines
    }

    getPlotProps(){
        return {
            data: this.getData(),
            lines: this.getLines()
        }
    }

    render(){
        var {id, width, height, name} = this.props;
        let {data, lines} = this.getPlotProps();
        return(
            <div>
                <LineChart
                    width={width}
                    height={height}
                    data={data}
                    margin={{
                        top: 20, right: 30, left: 0, bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    {lines}
                </LineChart>
                {super.render()}
            </div>
        );
    }
}

export default connect(mapStateToProps)(LinePlot)