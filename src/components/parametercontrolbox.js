import React from 'react'
import '../css/parametercontrolbox.css'
import { Resizable } from 're-resizable'
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import {connect} from "react-redux";
import {setActiveParamTab} from "../app/redux/actions";
import {store} from "../app/redux/store";
import MonitorParamForm from "./forms/monitorparamform";
import CompositionParamForm from "./forms/compositionparamform";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export class ParameterControlBox extends React.Component {
    constructor(props) {
        super();
        this.state = {
            text: props.text,
            class: props.className !== undefined ? `parametercontrolbox ${props.className}`:'parametercontrolbox',
            activeTab: 'composition'
        };
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    updateText(newText) {
        this.setState({ text: newText })
    }

    handleTabChange(new_tab_id, prev_tab_id, e) {
        this.setState({activeTab:new_tab_id});
        store.dispatch(setActiveParamTab(new_tab_id))
    }

    render() {
        var plotTabs = [];
        var plotForms = {'composition':<CompositionParamForm id={'composition'}/>};
        for (const [key, val] of Object.entries(this.props.plots)){
            plotTabs.push(<Tab key={key} id={key} title= {`LinePlot-${key}`} panel={<div/>}/>)
            plotForms[key] = <MonitorParamForm id={key}
                                size={{height:this.props.size.height-30}}
                                padding={10}/>
        };
        return (
            <Resizable
                style={style}
                onResize={this.props.onResize}
                onResizeStart={this.props.onResizeStart}
                onResizeStop={this.props.onResizeStop}
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
                            <Tabs id="param-tab-group" onChange={this.handleTabChange} selectedTabId={this.state.activeTab}>
                                <Tab key='composition' id="composition" title="Composition"/>
                                {plotTabs}
                            </Tabs>
                        </div>
                    </div>
                    <div className={'active-tab-container'}>
                        {plotForms[this.state.activeTab]}
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
