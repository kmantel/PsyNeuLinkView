import { Table, AddRowButton, RemoveRowButton, Form, Input, Radio } from "formik-antd"
import {Divider, Button, Typography, Space, Empty, Checkbox} from "antd"
import { Formik } from "formik"
import * as React from "react"
import ComponentSelect from "./component_select";
import Highlighter from 'react-highlight-words';
import { SendOutlined, SearchOutlined } from "@ant-design/icons"
import { connect } from 'react-redux'
import VirtualTable from "./virtualtable";

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
        allSelectedRowKeys: {},
        activeDataTable: '',
        currentlySelectedRowKeys: new Set(),
        currentlySelectedRows: new Set(),
        currentlyActiveTable: [],
        currentlyActiveDataSource: ''
    };
    selectionType = 'checkbox';

    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        ipcRenderer.on(
            'parameterList', (event, message)=> {
                var parameterLists = _.cloneDeep(this.state.parameterLists);
                this.setState({parameterLists:parameterLists})
            }
        );
        this.updateDataTablesForId(this.props.id)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.components, this.props.components)){
            this.initializeDataSourceState();
        }
        if (!_.isEqual(prevProps.id, this.props.id)){
            if (!this.state.trackedIds.has(this.props.id)){
                this.initializeTrackedId(this.props.id);
            }
            this.updateDataTablesForId(this.props.id)
        }
        if (!_.isEqual(prevState.parameterLists, this.state.parameterLists)){
            for (const id of this.state.trackedIds){
                this.updateDataTablesForId(id)
            }
        }
        if (!_.isEqual(prevState.currentlyActiveDataSource, this.state.currentlyActiveDataSource)){
            this.updateSelectedRowsFromProps();
        }
    }

    updateDataTablesForId(id){
        var dataTables = _.cloneDeep(this.state.dataTables);
        if (!id in dataTables){ dataTables[id] = {} }
        if (!_.isEmpty(this.state.parameterLists)){
            for (const [key, val] of Object.entries(this.state.parameterLists)){
                dataTables[id][key] = this.buildDataTable(key, val)
            }
        }
        this.setState({dataTables:dataTables})
    }

    componentDidMount() {
        if (!_.isEmpty(this.props.components)){
            this.initializeDataSourceState();
        }
    }

    initializeTrackedId(id){
        var activeDataSource = {...this.state.activeDataSource, ...{[id]:''}},
            allSelectedRowKeys = {...this.state.allSelectedRowKeys, ...{[id]: new Set()}},
            dataTable = {...this.state.allSelectedRowKeys, ...{[id]: {}}};
        this.state.trackedIds.add(id);
        this.setState(
            {
                activeDataSource:activeDataSource,
                allSelectedRowKeys: allSelectedRowKeys,
                dataTables:dataTable
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
        this.onChange = this.onChange.bind(this);
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
            selectedRowKeys = this.state.allSelectedRowKeys[id] || new Set(),
            rowid;
        for (var i = 0; i < parameterList.length; i++) {
            rowid = `${id}-${mechanismName}-${i}`
            dataTable.push(
                {
                    id: rowid,
                    name: parameterList[i],
                    selected: selectedRowKeys.has(rowid)
                }
            )
        }
        return dataTable
    }

    getDataTable(source){
        console.log('get data table');
        rpc.get_parameters(source)
    }

    onChange(e, row){


    }

    onSelectedRowChange(selectedRowKeys, selectedRows){
        var activeDataSource = this.state.activeDataSource[this.props.id],
            loggedParameters = [],
            parameterList = this.state.parameterLists[activeDataSource],
            newDataTable;
        for (const selected of selectedRows){
            loggedParameters.push({
                name:selected.name,
                rowKey:selected.id
            });
        }
        this.setState({
            currentlySelectedRowKeys: selectedRowKeys,
            currentlySelectedRows: selectedRows,
            allSelectedRowKeys: {...this.state.allSelectedRowKeys, ...{[this.props.id]:selectedRowKeys}}
        }, ()=>{
            var id = this.props.id;
            this.updateDataTablesForId(id)
        });
        this.props.setPlotSpecs(this.props.id, {mechanism:activeDataSource, parameters:loggedParameters});
    }

    updateSelectedRowsFromProps(){
        var id = this.props.id,
            selectedDataSources = this.props.plotSpecs[this.props.id],
            dataAreSelected = !_.isEmpty(selectedDataSources),
            activeDataSource = id in this.state.activeDataSource ? this.state.activeDataSource[id] : '',
            selectedRowKeys =  dataAreSelected && activeDataSource in selectedDataSources ? new Set(Object.values(selectedDataSources[activeDataSource]).map( row => row.rowKey )) : new Set([]),
            dataAreAvailable = !_.isEmpty(activeDataSource),
            activeDataTable = dataAreAvailable  ? this.state.dataTables[id][activeDataSource] : [];
        this.setState({
            'currentlySelectedRowKeys': selectedRowKeys,
            'currentlyActiveTable': activeDataTable,
            'currentlyActiveDataSource':activeDataSource
        })
    }

    onChange(e, row){
        const isChecked = e.target.checked;
        const currentlySelectedKeys = _.cloneDeep(this.state.currentlySelectedRowKeys);
        const currentlySelectedRows = _.cloneDeep(this.state.currentlySelectedRows);
        if (isChecked){
            currentlySelectedKeys.add(row.id);
            currentlySelectedRows.add(row);
        }
        else {
            currentlySelectedKeys.remove(row.id)
            currentlySelectedRows.add(row);
        }
        this.onSelectedRowChange(currentlySelectedKeys, currentlySelectedRows)
    }

    render() {
        var activeDataSource = this.state.currentlyActiveDataSource,
            id = this.props.id,
            activeDataTable = !_.isEmpty(this.state.dataTables[id]) && !_.isEmpty(this.state.dataTables[id][activeDataSource])? this.state.dataTables[id][activeDataSource] : [];
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
                <VirtualTable
                    name={`${this.props.id}-dataTables`}
                    rowKey={(row) => row.id}
                    size="small"
                    onChange={this.onChange}
                    locale={{ emptyText: <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{
                                                // 'height':this.props.size.height-117,
                                                'display': 'flex',
                                                'flexDirection': 'column',
                                                'justifyContent': 'center'
                                            }}/> }}
                    columns={[
                        {
                            title:
                                <div className={'title-wrapper'}
                                    style={{'marginLeft':'8px'}}>
                                    <Checkbox onChange={(e)=>{}}
                                              style={{marginRight:'30px'}}/>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Name
                                    </Text>
                                </div>,
                            key: "name",
                            render: (text, record, i) =>
                                <Text>
                                    {activeDataTable[i].name}
                                </Text>,
                            // width: 300
                        },
                    ]}
                    // rowSelection={{
                    //     // onChange: this.onSelectedRowChange,
                    //     onChange: this.onChange,
                    //     getCheckboxProps: record => ({
                    //         name: record.name,
                    //     }),
                    //     selectedRowKeys: selectedRowKeys
                    // }}
                    dataSource={activeDataTable}
                    scroll={{
                        y: this.props.size.height - 100,
                    }}
                />,
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