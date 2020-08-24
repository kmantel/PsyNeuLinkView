import { Table, AddRowButton, RemoveRowButton, Form, Input, Radio } from "formik-antd"
import {Divider, Button, Typography, Space, Empty} from "antd"
import { Formik } from "formik"
import * as React from "react"
import ComponentSelect from "./component_select";
import Highlighter from 'react-highlight-words';
import { SendOutlined, SearchOutlined } from "@ant-design/icons"
import { connect } from 'react-redux'

import * as _ from "lodash";
import {addPlot, setPlotSpecs} from "../app/redux/actions";

const { Text } = Typography;

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const rpc = window.interfaces.rpc;

class AvailableDataSourceTable extends React.Component{
    state = {
        trackedIds:new Set(),
        activeDataSource:{},
        dataTables:{},
        searchText: '',
        searchedColumn: '',
        selectedDataSources: {},
        parameterLists: {},
        selectedRowKeys: [],
        activeDataTable: '',
        currentlySelectedRowKeys: [],
        currentlyActiveTable: [],
        currentlyActiveDataSource: ''
    };
    selectionType = 'checkbox';

    constructor() {
        super();
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        ipcRenderer.on(
            'parameterList', (event, message)=> {
                var dataTable = this.buildDataTable(message.name, message.parameters),
                    dataTables = this.state.dataTables,
                    parameterLists = _.cloneDeep(this.state.parameterLists);
                dataTables[message.name] = dataTable;
                parameterLists[message.name] = message.parameters;
                this.setState({
                    dataTables:dataTables,
                    parameterLists:parameterLists
                })
            }
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.components, this.props.components)){
            this.initializeDataSourceState();
        }
        if (!this.state.trackedIds.has(this.props.id)){
            this.initializeTrackedId(this.props.id);

            // if (!_.isEmpty(this.props.components)){
            //     this.initializeDataSourceState();
            // }
        }
        if (!_.isEqual(prevProps.id, this.props.id)){
            var dataTable = {};
            for (const [key, val] of Object.entries(this.state.parameterLists)){
                dataTable[key] = this.buildDataTable(key, val)
            }
            this.setState(
                {dataTable:dataTable},
                );
        }
        if (!_.isEqual(prevState.currentlyActiveDataSource, this.state.currentlyActiveDataSource)){
            this.updateSelectedRowsFromProps();
        }
    }

    componentDidMount() {
        if (!_.isEmpty(this.props.components)){
            this.initializeDataSourceState();
        }
    }

    initializeTrackedId(id){
        var activeDataSource = {...this.state.activeDataSource, ...{[id]:''}}
        this.state.trackedIds.add(id);
        this.setState(
            {
                activeDataSource:activeDataSource,
            }
        )
    }

    initializeDataSourceState(){
        for (const component of this.props.components){
            this.getDataTable(component)
        }
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.setActiveDataSource = this.setActiveDataSource.bind(this);
        this.getDataTable = this.getDataTable.bind(this);
        this.onSelectedRowChange = this.onSelectedRowChange.bind(this);
        this.initializeTrackedId = this.initializeTrackedId.bind(this);
        this.buildDataTable = this.buildDataTable.bind(this);
        this.updateSelectedRowsFromProps = this.updateSelectedRowsFromProps.bind(this);
    }

    setActiveDataSource(source){
        var dataSource = this.state.activeDataSource;
        dataSource[this.props.id]=source;
        this.setState(
            {
                currentlyActiveDataSource:source,
                activeDataSource:dataSource,
            }
        )
    }

    buildDataTable(mechanismName, parameterList){
        var dataTable = [],
            id = this.props.id,
            dataSource = this.state.activeDataSource[this.props.id];
        for (var i = 0; i < parameterList.length; i++) {
            dataTable.push(
                {
                    id: `${id}-${mechanismName}-${i}`,
                    name: parameterList[i],
                }
            )
        }
        return dataTable
    }

    getDataTable(source){
        rpc.get_parameters(source)
    }

    onSelectedRowChange(selectedRowKeys, selectedRows){
        var activeDataSource = this.state.activeDataSource[this.props.id],
            loggedParameters = [];
        for (const selected of selectedRows){
            loggedParameters.push({
                name:selected.name,
                rowKey:selected.id
            });
        }
        this.props.setPlotSpecs(this.props.id, {mechanism:activeDataSource, parameters:loggedParameters});
    }

    updateSelectedRowsFromProps(){
        var id = this.props.id,
            selectedDataSources = this.props.plotSpecs[this.props.id],
            dataAreSelected = !_.isEmpty(selectedDataSources),
            activeDataSource = id in this.state.activeDataSource ? this.state.activeDataSource[id] : '',
            selectedRowKeys =  dataAreSelected && activeDataSource in selectedDataSources ? Object.values(selectedDataSources[activeDataSource]).map( row => row.rowKey ) : [],
            dataAreAvailable = !_.isEmpty(activeDataSource),
            activeDataTable = dataAreAvailable  ? this.state.dataTables[activeDataSource] : [];
        this.setState({
            'currentlySelectedRowKeys': selectedRowKeys,
            'currentlyActiveTable': activeDataTable,
            'currentlyActiveDataSource':activeDataSource
        })
    }

    render() {
        var activeDataSource = this.state.currentlyActiveDataSource,
            activeDataTable = this.state.currentlyActiveTable,
            selectedRowKeys = this.state.currentlySelectedRowKeys
        return (
            <div>
                <div className={'table-title-label-container'}
                    style={{width:this.props.size.width}}>
                    <div
                        className={'table-title-label'}
                        style={{float:"left"}}
                    >
                        <Input
                            style={{cursor: 'default'}}
                            value={'Available data sources'}
                            disabled={true}
                            bordered={false}
                        />

                    </div>
                    <div
                        className={'table-title-component-select'}
                        style={{float:"right"}}
                    >
                        <ComponentSelect
                            bordered={false}
                            components={this.props.components}
                            selectionHook={this.setActiveDataSource}
                            activeDataSource={activeDataSource}
                        />
                    </div>
                </div>
                <Divider />
                <Table
                    name={`${this.props.id}-dataTables`}
                    rowKey={(row) => row.id}
                    dataSource={activeDataTable}
                    size="small"
                    pagination={false}
                    locale={{ emptyText: <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{
                                                'height':this.props.size.height-117,
                                                'display': 'flex',
                                                'flexDirection': 'column',
                                                'justifyContent': 'center'
                                            }}/> }}
                    // style={{ width: this.props.size.width }}
                    scroll={{ y: this.props.size.height - 100}}
                    rowSelection={{
                        type: this.selectionType,
                        onChange: this.onSelectedRowChange,
                        getCheckboxProps: record => ({
                            name: record.name,
                        }),
                        selectedRowKeys: selectedRowKeys
                    }}
                    columns={[
                        {
                            title: <Text style={{width:"50px"}} className={'param-name-col-title'}>Name</Text>,
                            key: "name",
                            render: (text, record, i) =>
                                <Text>
                                    {activeDataTable[i].name}
                                </Text>
                        },
                    ]}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        plotSpecs:state.plotSpecs
    }
};

const mapDispatchToProps = dispatch => ({
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
});

AvailableDataSourceTable = connect(mapStateToProps, mapDispatchToProps)(AvailableDataSourceTable);

export default AvailableDataSourceTable