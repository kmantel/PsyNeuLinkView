import { Table, AddRowButton, RemoveRowButton, Form, Input } from "formik-antd"
import { Formik } from "formik"
import * as React from "react"
import { DeleteOutlined } from "@ant-design/icons"
import {Divider, Empty, Typography, Button} from "antd";
import { connect } from 'react-redux'
import * as _ from 'lodash';
import {setPlotSpecs} from "../app/redux/actions";

const { Text } = Typography;

class SelectedDataSourceTable extends React.PureComponent{
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

    buildDataTable() {
        var dataTable = [];
        for (const [key, val] of Object.entries(this.props.plotSpecs[this.props.id])) {
            for (const loggedParameter of Object.values(val)) {
                dataTable.push(
                    {
                        id: loggedParameter.rowKey,
                        mechanismName: key,
                        parameterName: loggedParameter.name
                    }
                )
            }
        }
        this.setState({dataTable:dataTable})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!_.isEqual(prevProps.plotSpecs,this.props.plotSpecs) ||
             !_.isEqual(prevProps.id, this.props.id)){
            this.buildDataTable();
        }
        if (!_.isEqual(prevState.dataTable, this.state.dataTable)){
            console.log(this.state.dataTable)
        }
    }

    removeRecord(record){
        var id = this.props.id,
            match = {name: record.parameterName, rowKey: record.id},
            mechanismName = record.mechanismName,
            plotSpecs = _.cloneDeep(this.props.plotSpecs),
            matchingKey;
        for (const [key, val] of Object.entries(this.props.plotSpecs[id][mechanismName])){
            if (_.isEqual(val, match)){
                matchingKey = key;
                break
            }
        }
        delete plotSpecs[id][mechanismName][matchingKey];
        var updatedPlotSpec = {mechanism:mechanismName, parameters: plotSpecs[id][mechanismName][matchingKey]}
        this.props.setPlotSpecs(id, updatedPlotSpec);
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
                    <Table
                        name="selectedDataTable"
                        rowKey={(row) => row.id}
                        dataSource={this.state.dataTable}
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
                        scroll={{ y: this.props.size.height - 100}}
                        columns={[
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
                                key: "actions",
                                align: 'right',
                                render: (text, record, index) => (
                                    <Button
                                        style={{ border: "none" }}
                                        icon={<DeleteOutlined />}
                                        onClick={()=>{this.removeRecord(record)}}
                                    />
                                ),
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

export default connect(mapStateToProps, mapDispatchToProps)(SelectedDataSourceTable)
