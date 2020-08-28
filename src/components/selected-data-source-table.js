import { Table, AddRowButton, RemoveRowButton, Form, Input } from "formik-antd"
import { Formik } from "formik"
import * as React from "react"
import { DeleteOutlined } from "@ant-design/icons"
import {Divider, Empty, Typography, Button, Checkbox} from "antd";
import { connect } from 'react-redux'
import * as _ from 'lodash';
import {setPlotSpecs} from "../app/redux/actions";
import VirtualTable from "./virtual-table";

const { Text } = Typography;

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
                    onClick={()=>{this.removeRecord(mechanism, rowId)}}/>
    }
    buildDataTable() {
        var dataTable = [];
        for (const [key, val] of Object.entries(this.props.plotSpecs[this.props.id])) {
            for (const loggedParameter of Object.values(val)) {
                dataTable.push(
                    {
                        id: loggedParameter.rowKey,
                        mechanismName: key,
                        parameterName: loggedParameter.name,
                        button: this.getDeleteButton(key, loggedParameter.rowKey)
                    }
                )
            }
        }
        return dataTable
    }

    onSelectedRowChange(source, rows){
        var loggedParameters = [];
        for (const selected of rows){
            loggedParameters.push({
                name:selected.name,
                rowKey:selected.id
            });
        }
        this.props.setPlotSpecs(this.props.id, {mechanism:source, parameters:loggedParameters});
    }
    removeRecord(mechanism, rowId){
        const
            source = mechanism,
            rows = new Set(_.cloneDeep(this.buildDataTable()));
        for (const val of rows){
            if (val.id === rowId){
                rows.delete(val);
                break
            }
        };
        this.onSelectedRowChange(source, rows)
    }

    render() {
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
                                value={'Selected data sources'}
                                disabled={true}
                                bordered={false}
                            />

                        </div>
                    </div>
                    <Divider />
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
                                title:<div className={'title-wrapper'}
                                           style={{'marginLeft':'8px'}}>
                                    <Text style={{width:"50px"}} className={'param-name-col-title'}>
                                        Parameter
                                    </Text>
                                </div>,
                                key: "parameterName",
                                render: (text, record, i) => (
                                    <Text>
                                        {this.state.dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                title: "Mechanism",
                                key: "mechanismName",
                                render: (text, record, i) => (
                                    <Text>
                                        {this.state.dataTable[i].mechanismName}
                                    </Text>
                                ),
                            },
                            {
                                key: "button",
                                align: 'right'
                            },
                        ]}
                        dataSource={this.buildDataTable()}
                        scroll={{
                            y: this.props.size.height - 117,
                        }}
                    />,
                </div>
        )
    }
}

const mapStateToProps = ({core}) => {
    return {
        plotSpecs:core.plotSpecs
    }
};

const mapDispatchToProps = dispatch => ({
    setPlotSpecs: (id, plotSpecs) => dispatch(setPlotSpecs(id, plotSpecs)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectedDataSourceTable)
