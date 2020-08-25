import React from 'react'
import '../css/parametercontrolbox.css'
import { Resizable } from 're-resizable'
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import {connect} from "react-redux";
import {setActiveParamTab} from "../app/redux/actions";
import {store} from "../app/redux/store";
import MonitorParamForm from "./forms/monitorparamform";
import CompositionParamForm from "./forms/compositionparamform";
import * as _ from 'lodash'

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export class ParameterControlBox extends React.PureComponent {
    constructor(props) {
        super();
        this.state = {
            text: props.text,
            class: props.className !== undefined ? `parametercontrolbox ${props.className}`:'parametercontrolbox',
            activeTabId: 'composition',
            tabs: [{id: 'composition', label: 'Composition'}],
            linePlotCounter: {},
            linePlotGlobal: 0
        };
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.handleTabChange = this.handleTabChange.bind(this);
        this.instantiatePlots = this.instantiatePlots.bind(this);
    }

    updateText(newText) {
        this.setState({ text: newText })
    }

    handleTabChange(new_tab_id, prev_tab_id, e) {
        this.setState({activeTabId:new_tab_id});
        store.dispatch(setActiveParamTab(new_tab_id))
    }


    instantiatePlots(){
        var linePlotCounter = _.cloneDeep(this.state.linePlotCounter),
            linePlotGlobal = this.state.linePlotGlobal,
            activeTabId = this.state.activeTabId;
        this.setState({
            tabs: [{label: 'Composition', id:'composition'}, ...Object.keys(this.props.plots).map(id => {
                var numericId;
                if (!(id in linePlotCounter)){
                    linePlotCounter[id] = linePlotGlobal;
                    linePlotGlobal += 1
                }
                numericId = linePlotCounter[id];
                return {label:`LinePlot-${numericId}`, id:id}
            })],
            linePlotCounter: linePlotCounter,
            linePlotGlobal: linePlotGlobal
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        var activeTabUpdated,
            plotsInstantiated
        if (prevProps.plots !== this.props.plots){
            this.instantiatePlots();
            plotsInstantiated = true
        }
        if (prevState.activeTabId !== this.state.activeTabId){
            activeTabUpdated = true
        }
    }

    getFormForActiveTab(id){
        if (id === 'composition'){
            return <CompositionParamForm id={'composition'}/>
        }
        else {
            return <MonitorParamForm id={id}
                              size={{height:this.props.size.height-30}}
                              padding={10}/>
        }
    }

    render() {
        var id = this.state.activeTabId;
        return (
            <Resizable
                style={style}
                onResize={this.props.onResize}
                onResizeStart={this.props.onResizeStart}
                onResizeStop={()=>{console.log('does this work')}}
                enable={{
                    top:true,
                    right:false,
                    bottom:false,
                    left:true,
                    topRight:false,
                    bottomRight:false,
                    bottomLeft:false,
                    topLeft:true
                }}
                className='pnl-resizable'
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
                    <div className={'parameter-control-title'}>
                        <div className={'param-tab-container'}>
                            <Tabs id="param-tab-group" onChange={this.handleTabChange} selectedTabId={this.state.activeTabId}>
                                {this.state.tabs.map(
                                    tab=><Tab key={tab.id} id={tab.id} title= {tab.label} panel={<div/>}/>
                                )}
                            </Tabs>
                        </div>
                    </div>
                    <div className={'active-tab-container'}>
                        {this.getFormForActiveTab(id)}
                    </div>
                </div>
            </Resizable>
        )
    };
}

const mapStateToProps = state => {
    return {
        plots: state.plots
    }
};

export default connect(mapStateToProps, {setActiveParamTab})(ParameterControlBox)
