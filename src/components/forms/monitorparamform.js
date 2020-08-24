import React from 'react'
import { Formik } from 'formik'
import { SubmitButton, Input, Checkbox,
    ResetButton, FormikDebug, Form, FormItem} from "formik-antd"
import { message, Button, Row, Col, Divider } from "antd"
import { Persist } from 'formik-persist'
import SelectedDataSourceTable from "../selecteddatasourcetable";
import {Tab, Tabs} from "@blueprintjs/core";
import {store} from "../../app/redux/store";
import {setActiveParamTab} from "../../app/redux/actions";
import '../../css/paramform.css';
import AvailableDataSourceTable from "../availabledatasourcetable";
import {connect} from "react-redux";
import * as _ from 'lodash'

function validateRequired(value) {
}

const mapStateToProps = state => {
    return {
        activeComposition: state.activeComposition
    }
};

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const rpc = window.interfaces.rpc;

class MonitorParamForm extends React.PureComponent{
    state = {
        activeTab:'options',
        components:[]
    };
    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        ipcRenderer.on(
            'componentList', (event, message)=> {
                this.setState({components:message})
            }
        )
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.setComposition = this.setComposition.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
    }

    componentDidMount() {
        if (this.props.activeComposition !== ''){
            this.setComposition();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.activeComposition !== this.props.activeComposition){
            this.setComposition();
        }
    }

    setComposition(){
        if (this.props.activeComposition !== ''){rpc.get_components(this.props.activeComposition)}
    }


    handleTabChange(new_tab_id, prev_tab_id, e) {
        this.setState({activeTab:new_tab_id});
    }

    render() {
        var tabs = [
            <Tab key={`${this.props.id}-options`} id={`${this.props.id}-options`} title= {'Options'}/>,
            <Tab key={`${this.props.id}-data`} id={`${this.props.id}-data`} title= {'Data'}/>
        ],
            tableHeight = this.props.size.height - (this.props.padding * 2);

        return <Formik
            initialValues={{}}
            onSubmit={
                (values,actions)=>{
                    message.info(JSON.stringify(values, null, 4));
                    actions.setSubmitting(false);
                    actions.resetForm();
                }
            }>
                <Form
                    style={{
                        padding:`${this.props.padding}px`,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 50fr 1fr 50fr",
                        height: this.props.size.height,
                        ...this.props.style
                    }}
                    labelCol={{ m: 4 }}
                    wrapperCol={{ m: 2 }}
                >
                    <div className={'vertical-tab-container'}>
                        <Tabs id="param-tab-group" className={'vertical'} onChange={this.handleTabChange} selectedTabId={`${this.props.id}-data`}
                              vertical={true}>
                            {tabs}
                        </Tabs>
                    </div>
                    <Divider type={'vertical'}/>
                    <AvailableDataSourceTable name={`${this.props.id}-available-data`} id={this.props.id} components={this.state.components} size={{height: tableHeight, width:"100%"}}/>
                    <Divider type={'vertical'}/>
                    <SelectedDataSourceTable name={`${this.props.id}-available-data`} id={this.props.id} size={{height: tableHeight, width:"100%"}}/>
                </Form>
        </Formik>;
    }
}

export default connect(mapStateToProps)(MonitorParamForm)