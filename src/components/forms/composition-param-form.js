import React from 'react'
import { Formik } from 'formik'
import { SubmitButton, Input, Checkbox,
    ResetButton, FormikDebug, Form, FormItem} from "formik-antd"
import { message, Button, Row, Col } from "antd"
import {Persist} from "formik-persist";

function validateRequired(value) {
}

export default class CompositionParamForm extends React.Component{
    constructor(props) {
        super(props);
    }
    render() {
        var id = this.props.id;
        return <Formik
            initialValues={
                {
                    firstName: ""
                }
            }
            onSubmit={
                (values,actions)=>{
                    message.info(JSON.stringify(values, null, 4));
                    actions.setSubmitting(false);
                    actions.resetForm();
                }
            }>
            <Form
                style={{ padding:"10px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}
                labelCol={{ m: 4 }}
                wrapperCol={{ m: 2 }}
            >
                <FormItem
                    name={`${id}-compositionInputs`}
                    label="Inputs"
                >
                    <Input name={`${id}-compositionInputs`} placeholder="Inputs" />
                    <SubmitButton />
                    <ResetButton />
                </FormItem>

                {/*<pre style={{ flex: 1 }}>*/}
                {/*    <FormikDebug />*/}
                {/*</pre>*/}
                <Persist name="composition-form" />
            </Form>
        </Formik>;
    }
}