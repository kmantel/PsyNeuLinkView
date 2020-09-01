import { Table, AddRowButton, RemoveRowButton, Form, Input, Radio } from "formik-antd"
import {Divider, Button, Typography, Space, Empty, Checkbox} from "antd"
import { Formik } from "formik"
import * as React from "react"
import ComponentSelect from "./component-select";
import Highlighter from 'react-highlight-words';
import { SendOutlined, SearchOutlined } from "@ant-design/icons"
import { connect } from 'react-redux'
import VirtualTable from "./virtual-table";

import * as _ from "lodash";
import {addPlot, setPlotSpecs} from "../state/core/actions";
import {registerParameters} from "../state/psyneulink/actions";
import {registerParameters as _registerParameters} from "../state/psyneulink-parameters/actions"
import {addDataSource, removeDataSource} from "../state/subplots/actions";
import {createId} from "../state/util";
import {ID_LEN, PNL_PREFIX} from "../keywords";
import {getPsyNeuLinkIdSet, getPsyNeuLinkMapNameToId} from "../state/psyneulink-registry/selectors";

const { Text } = Typography;

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const rpc = window.interfaces.rpc;

const mapStateToProps = ({core, psyNeuLinkRegistry}) => {
    return {
        plotSpecs:core.plotSpecs,
        psyNeuLinkIdSet:getPsyNeuLinkIdSet(psyNeuLinkRegistry),
        psyNeuLinkMapNameToId:getPsyNeuLinkMapNameToId(psyNeuLinkRegistry)
    }
};

const mapDispatchToProps = dispatch => ({
    addDataSource: (id, dataSourceId) => dispatch(addDataSource(id, dataSourceId)),
    removeDataSource: (id, dataSourceId) => dispatch(removeDataSource(id, dataSourceId)),
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
    registerParameters: (mechanism, parameterList) => dispatch(registerParameters(mechanism, parameterList)),
    _registerParameters: ({ownerId, parameterSpecs}) => dispatch(_registerParameters({ownerId, parameterSpecs}))
});

class AvailableDataSourceTable extends React.Component{
    state = {
        selectedDataSources: {},
        parameterLists: {},
    };
    selectionType = 'checkbox';

    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        if (this.props.components.length > 0){
            this.props.components.forEach( component => {this.getDataTable(component)} )
        }
        ipcRenderer.on('parameterList', this.handleParameterList);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.components, this.props.components)) {
            this.props.components.forEach( component => {this.getDataTable(component)} )
        }
    }

    updateDataTablesForId(id){
    }

    componentDidMount() {
        if (!(this.props.id in this.state.selectedDataSources)){
            var selectedDataSources = _.cloneDeep(this.state.selectedDataSources);
            selectedDataSources[this.props.id] = '';
            this.setState({selectedDataSources:selectedDataSources})
        }
    }

    handleParameterList(event, message) {
        let idSet = new Set([...this.props.psyNeuLinkIdSet]);
        let {ownerName, parameters} = message;
        let ownerId = this.props.psyNeuLinkMapNameToId[ownerName];
        let parameterSpecs = {};
        parameters.forEach(p=>{
            let id = createId(idSet, PNL_PREFIX, ID_LEN);
            idSet.add(id);
            parameterSpecs[id] = p
        });
        this.props._registerParameters({ownerId: ownerId, parameterSpecs: parameterSpecs})
    }

    bindThisToFunctions(){
        this.render = this.render.bind(this);
        this.setActiveDataSource = this.setActiveDataSource.bind(this);
        this.getDataTable = this.getDataTable.bind(this);
        this.onSelectedRowChange = this.onSelectedRowChange.bind(this);
        this.buildDataTable = this.buildDataTable.bind(this);
        this.updateSelectedRowsFromProps = this.updateSelectedRowsFromProps.bind(this);
        this.onChange = this.onChange.bind(this);
        this.handleParameterList = this.handleParameterList.bind(this);
    }

    setActiveDataSource(source){
        var selectedDataSources = this.state.selectedDataSources;
        selectedDataSources[this.props.id]=source;
        this.setState(
            {
                selectedDataSources:selectedDataSources
            }
        )
    }

    getActiveDataSource(id){
        return id in this.state.selectedDataSources ? this.state.selectedDataSources[id] : ''
    }

    getSelectedKeys(source, id){
        return new Set()
        // return new Set(Object.values(_.cloneDeep(this.props.plotSpecs[id][source] || {})).map(row=>row.rowKey));
    }

    getSelectedRowsAndIds(source, id){
        var ids = this.getSelectedKeys(source, id),
            rows = new Set(this.getActiveDataTable(source, id).map(row=>{return ids.has(row.id) ? row : ''}));
        rows.delete('')
        return {selectedRows: rows, selectedIds: ids}
    }

    getActiveDataTable(source, id){
        if (_.isEmpty(source) || _.isEmpty(id)){
            return []
        }
        if (!(source in this.state.parameterLists)){
            return []
        }
        var baseParameterList, plotSpecs, rowid, selectedKeys, dataTable = [];
        selectedKeys = this.getSelectedKeys(source, id);
        baseParameterList = _.cloneDeep(this.state.parameterLists[source]);
        for (var i = 0; i < baseParameterList.length; i++) {
            rowid = `${id}-${source}-${i}`;
            dataTable.push(
                {
                    id: rowid,
                    name: baseParameterList[i],
                    selected: selectedKeys.has(rowid)
                }
            )
        }
        return dataTable
    }

    buildDataTable(mechanismName, parameterList){
    }

    getDataTable(source){
        rpc.get_parameters(source)
    }

    onSelectedRowChange(selectedRows){
        var activeDataSource = this.state.selectedDataSources[this.props.id],
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
    }

    onChange(e, row){
        const isChecked = e.target.checked,
            id = this.props.id,
            source = this.getActiveDataSource(id),
            idsAndRows = this.getSelectedRowsAndIds(source, id),
            currentlySelectedRows = idsAndRows['selectedRows'];
        if (isChecked){

            currentlySelectedRows.add(row);
        }
        else {
            for (const val of currentlySelectedRows){
                if (val.id === row.id){
                    currentlySelectedRows.delete(val)
                    break
                }
            };
        }
        this.onSelectedRowChange(currentlySelectedRows)
    }

    render() {
        var id = this.props.id,
            activeDataSource = this.getActiveDataSource(id),
            activeDataTable = this.getActiveDataTable(activeDataSource, id);
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
                    cellCheckbox={true}
                    cellDelete={false}
                    onChange={this.onChange}
                    locale={{ emptyText: <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            style={{
                                                'height':this.props.size.height-117,
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
                    dataSource={activeDataTable}
                    scroll={{
                        y: this.props.size.height - 117,
                    }}
                />,
            </div>
        )
    }
}

AvailableDataSourceTable = connect(mapStateToProps, mapDispatchToProps)(AvailableDataSourceTable);

export default AvailableDataSourceTable