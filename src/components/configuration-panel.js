import React from 'react'
import '../css/parametercontrolbox.css'
import { Resizable } from 're-resizable'
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import {connect} from "react-redux";
import {setActiveParamTab} from "../state/core/actions";
import {store} from "../state/store";
import MonitorParamForm from "./forms/subplot-config-form";
import CompositionConfigForm from "./forms/composition-config-form";
import * as _ from 'lodash'
import {getSubplotIdArr} from "../state/plotting/selectors";
import {getSubplotMetaData} from "../state/plotting/subplots/selectors";
import {getGridLayout} from "../state/plotting/subplot-grid/selectors";

const mapStateToProps = ({plotting}) => {
    return {
        subplotIdArr: getSubplotIdArr(plotting),
        subplotMetadata: getSubplotMetaData(plotting.subplots),
        gridLayout : getGridLayout(plotting.subplotGrid)
    };
};

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

export class ConfigurationPanel extends React.Component {
    constructor(props) {
        super(props);
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
    }

    updateText(newText) {
        this.setState({ text: newText })
    }

    handleTabChange(new_tab_id, prev_tab_id, e) {
        this.setState({activeTabId:new_tab_id});
        store.dispatch(setActiveParamTab(new_tab_id))
    }

    getTab(id, label){
        return <Tab key={id} id={id} title={label} panel={<div/>}/>
    }

    getTabs() {
        let ids = this.props.subplotIdArr;
        let metadata = this.props.subplotMetadata;
        return [
            this.getTab('composition', 'Composition'),
            ...ids.map( id => this.getTab(id, metadata[id].name) )
        ];
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    getFormForActiveTab(id){
        if (id === 'composition'){
            return <CompositionConfigForm id={'composition'}/>
        }
        else {
            return <MonitorParamForm id={id}
                              size={{height:this.props.size.height-30}}
                              padding={10}/>
        }
    }

    render() {
        let id = this.state.activeTabId;
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
                                {this.getTabs()}
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

export default connect(mapStateToProps, {setActiveParamTab})(ConfigurationPanel)