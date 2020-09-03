import {Input} from "formik-antd"
import * as React from "react"
import {DeleteOutlined} from "@ant-design/icons"
import {Button, Divider, Empty, Typography} from "antd";
import {connect} from 'react-redux'
import {setPlotSpecs} from "../state/core/actions";
import VirtualTable from "./virtual-table";
import {getMapIdToDataSources} from "../state/subplots/selectors";
import {getPsyNeuLinkMapIdToName} from "../state/psyneulink-registry/selectors";
import {getPsyNeuLinkParameterMetadata} from "../state/psyneulink-parameters/selectors";
import {removeDataSource} from "../state/subplots/actions";
import ComponentSelect from "./component-select";

const { Text } = Typography;

const mapStateToProps = ({core, subplots, psyNeuLinkParameters, psyNeuLinkRegistry}) => {
    return {
        plotSpecs:core.plotSpecs,
        subplotMapIdToSelectedDataSources:getMapIdToDataSources(subplots),
        psyNeuLinkParameterMetadata:getPsyNeuLinkParameterMetadata(psyNeuLinkParameters),
        psyNeuLinkMapIdToName:getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
    }
};

const mapDispatchToProps = dispatch => ({
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
    removeDataSource: ({id, dataSourceId}) => dispatch(removeDataSource({id, dataSourceId}))
});

class SelectedDataSourceTable extends React.Component{
    reduxPrefix = 'sdst';

    state = {
        dataTable:[],
    };

    constructor() {
        super();
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        this.buildDataTable = this.buildDataTable.bind(this);
    }

    getDeleteButton(mechanism, rowId){
        return <Button
                    style={{ border: "none" }}
                    icon={<DeleteOutlined />}
                    onClick={()=>{this.removeRecord(rowId)}}/>
    }

    buildDataTable() {
        const {
            id: plotId,
            subplotMapIdToSelectedDataSources: plotIdToSelected,
            psyNeuLinkParameterMetadata: pnlParameterMetadata,
            psyNeuLinkMapIdToName: pnlIdToName
        } = this.props;
        const selected = plotIdToSelected[plotId];
        if (!selected){
            return []
        }
        var dataTable = [];
        for (const parameterId of selected){
            let metadata = pnlParameterMetadata[parameterId];
            let mechanismName = pnlIdToName[metadata.ownerId];
            let parameterName = pnlIdToName[parameterId];
            dataTable.push(
                {
                    id: parameterId,
                    mechanismName: mechanismName,
                    parameterName: parameterName,
                    button: this.getDeleteButton(mechanismName, parameterId)
                }
            )
        }
        return dataTable
    }

    removeRecord(rowId){
        const {removeDataSource} = this.props;
        removeDataSource({id: this.props.id, dataSourceId: rowId})
    }

    render() {
        const dataTable = this.buildDataTable();
        return (
                <div>
                    <div style={{width:this.props.size.width}}>
                        <div/>
                    </div>
                    <div className={'horizontal-divider-container'}>
                        <Divider orientation="left" plain>
                            Selected data sources
                        </Divider>
                    </div>
                    <VirtualTable
                        name={`${this.props.id}-dataTables`}
                        rowKey={(row) => row.id}
                        size="small"
                        onChange={this.onChange}
                        cellCheckbox={false}
                        cellDelete={true}
                        removeRecord={()=>{}}
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
                                title: "Mechanism",
                                key: "mechanismName",
                                render: (text, record, i) => (
                                    <Text>
                                        {dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                title:<div className={'title-wrapper'}
                                           style={{'marginLeft':'8px'}}>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Parameter
                                    </Text>
                                </div>,
                                key: "parameterName",
                                render: (text, record, i) => (
                                    <Text>
                                        {dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                key: "button",
                                align: 'right'
                            },
                        ]}
                        // dataSource={this.buildDataTable()}
                        dataSource={dataTable}
                        scroll={{
                            y: this.props.size.height - 117,
                        }}
                    />,
                </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectedDataSourceTable)
