import React from 'react'
import {Form, Input} from "antd"

export default class CompositionConfigForm extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        var id = this.props.id;
        return <Form
                style={{ padding:"10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}
                labelCol={{ m: 4 }}
                wrapperCol={{ m: 2 }}
            >
                <Form.Item
                    name={`${id}-compositionInputs`}
                    label="Inputs"
                >
                    <Input name={`${id}-compositionInputs`} placeholder="Inputs" />
                </Form.Item>
            </Form>;
    }
}