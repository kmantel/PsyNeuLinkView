import React from 'react';
import 'antd/dist/antd.css';
import { Select } from 'antd';
import {Icon} from "@blueprintjs/core";

const { Option } = Select;

export default class ComponentSelect extends React.Component {
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
    }

    onChange(value) {
        this.props.selectionHook(value);
    }

    onBlur() {
    }

    onFocus() {
    }

    onSearch(val) {
    }
    render() {
        var componentNames = [];
        for (const name of this.props.components){
            componentNames.push(
                <Option key={name}
                        value={name}
                        style={
                            {position:'flex',
                             flexDirection:'row',
                             justifyContent:'center',
                             alignContent:'center'}}><Icon iconSize={14} icon={'cog'} style={{'marginRight':'10px'}}/>{name}</Option>
            )
        }
        return (
            <Select
                showSearch
                style={{width: 300}}
                placeholder="Select a mechanism"
                optionFilterProp="PsyNeuLink Mechanisms"
                // dropdownStyle={{backgroundColor:'palevioletred'}}
                onChange={this.onChange}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onSearch={this.onSearch}
                bordered={this.props.bordered}
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={this.props.activeDataSource}
            >
                {componentNames}
            </Select>)
    }
}
