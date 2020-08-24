import React from 'react';
import 'antd/dist/antd.css';
import { Select } from 'antd';

const { Option } = Select;

export default class ComponentSelect extends React.Component {
    state = {
        selectedComponent:''
    }

    constructor(props) {
        super(props);
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
    }

    bindThisToFunctions(){
        var _ = this;
        this.onChange = this.onChange.bind(this);
        [this.render, this.onChange].forEach(
            fx=>fx=fx.bind(_)
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.selectedComponent !== this.state.selectedComponent){
            this.props.selectionHook(this.state.selectedComponent);
        }
    }

    onChange(value) {
        this.setState({selectedComponent:value})
    }

    onBlur() {
        console.log('blur');
    }

    onFocus() {
        console.log('focus');
    }

    onSearch(val) {
        console.log('search:', val);
    }
    render() {
        var componentNames = [];
        for (const name of this.props.components){
            componentNames.push(
                <Option key={name} value={name}>{name}</Option>
            )
        }
        return (
            <Select
                showSearch
                style={{width: 200}}
                placeholder="Select a mechanism"
                optionFilterProp="PsyNeuLink Mechanisms"
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onSearch={this.onSearch}
                bordered={this.props.bordered}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {componentNames}
            </Select>)
    }
}
