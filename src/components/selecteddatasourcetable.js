import { Table, AddRowButton, RemoveRowButton, Form, Input } from "formik-antd"
import { Formik } from "formik"
import * as React from "react"
import { DeleteOutlined } from "@ant-design/icons"
import {Divider, Empty, Typography} from "antd";
const { Text } = Typography;

export default class SelectedDataSourceTable extends React.PureComponent{
    state = {
        tableData:[],
    };

    render() {
        return (
                <Formik
                    onSubmit={() => {}}
                >
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
                            name="tableData"
                            rowKey={(row) => "" + row.id}
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
                                            {this.state.tableData[i].mechanismName}
                                        </Text>
                                    ),
                                },
                                {
                                    title: "Parameter",
                                    key: "parameterName",
                                    render: (text, record, i) => (
                                        <Text>
                                            {this.state.tableData[i].parameterName}
                                        </Text>
                                    ),
                                },
                                {
                                    key: "actions",
                                    render: (text, record, index) => (
                                        <RemoveRowButton
                                            style={{ border: "none" }}
                                            icon={<DeleteOutlined />}
                                            name="tableData"
                                            index={index}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </div>
                </Formik>
        )
    }
}
