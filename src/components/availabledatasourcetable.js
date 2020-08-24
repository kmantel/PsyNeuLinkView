import { Table, AddRowButton, RemoveRowButton, Form, Input, Radio } from "formik-antd"
import {Divider, Button, Typography, Space, Empty} from "antd"
import { Formik } from "formik"
import * as React from "react"
import ComponentSelect from "./component_select";
import Highlighter from 'react-highlight-words';
import { SendOutlined, SearchOutlined } from "@ant-design/icons"
import * as _ from "lodash";

const { Text } = Typography;

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const rpc = window.interfaces.rpc;

export default class AvailableDataSourceTable extends React.PureComponent{
    state = {
        activeDataSource:'',
        dataTables:{},
        searchText: '',
        searchedColumn: '',
        selectedDataSources: {}
    };
    selectionType = 'checkbox';

    constructor() {
        super();
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        ipcRenderer.on(
            'parameterList', (event, message)=> {
                var dataTable = this.buildDataTable(message.parameters),
                    dataTables = this.state.dataTables;
                dataTables[message.name] = dataTable;
                this.setState({dataTables:dataTables})
            }
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.components, this.props.components)){
            this.initializeDataSourceState();
        }
    }

    componentDidMount() {
        if (!_.isEmpty(this.props.components)){
            this.initializeDataSourceState();
        }
    }

    initializeDataSourceState(){
        var selectedDataSources = _.fromPairs(this.props.components.map(component => [component, {}]));
        for (const component of this.props.components){this.getDataTable(component)}
        this.setState({selectedDataSources:selectedDataSources});
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.setActiveDataSource = this.setActiveDataSource.bind(this);
        this.getDataTable = this.getDataTable.bind(this);
        this.updateSelectedRows = this.updateSelectedRows.bind(this);
    }

    setActiveDataSource(source){
        var self = this;
        self.setState(
            {
                activeDataSource:source,
            }
        )
    }

    buildDataTable(parameterList){
        var dataTable = [];
        for (var i = 0; i < parameterList.length; i++) {
            dataTable.push(
                {
                    id: `${this.props.id}-${this.state.activeDataSource}-${i}`,
                    name: parameterList[i],
                }
            )
        }
        return dataTable
    }

    getDataTable(source){
        rpc.get_parameters(source)
    }

    updateSelectedRows(selectedRowKeys, selectedRows){
        var selectedDataSources = {...this.state.selectedDataSources},
            activeDataSource = this.state.activeDataSource;
        selectedDataSources[activeDataSource] = _.fromPairs(selectedRows.map(row => [row.id, row.name]));
        this.setState({selectedDataSources:selectedDataSources})
    }

    render() {
        var selectedDataSources = {...this.state.selectedDataSources},
            activeDataSource = this.state.activeDataSource,
            selectedRowKeys = activeDataSource ? Object.keys(selectedDataSources[activeDataSource]) : [],
            activeDataTable = activeDataSource ? this.state.dataTables[this.state.activeDataSource] : [];
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
                        onChange: this.updateSelectedRows,
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
