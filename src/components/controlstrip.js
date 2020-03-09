import React from 'react'
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import '../css/controlstrip.css'

export default class ControlStrip extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            selectedTabId:'ng'
        }
        this.handleTabChange = this.handleTabChange.bind(this);
    }

    handleTabChange(new_tab_id, prev_tab_id, e){
        if (!(new_tab_id===prev_tab_id)){
            this.setState({selectedTabId:new_tab_id})
        }
    }

    render() {
        return (
            <div class={'controlstrip-container'}
                 style={
                     {
                         width:`${this.props.width}px`,
                         height:'30px'
                     }
                 }>
                <div class={'controlstrip pnl-panel'}>
                    <div class={'view-tab-container'}>
                        <Tabs id="TabsExample" onChange={this.handleTabChange} selectedTabId={this.state.selectedTabId}>
                            <Tab id="ng" title="Construct" panel={<div />} />
                            <Tab id="mb" title="Monitor" panel={<div />} />
                            {/*<Tabs.Expander />*/}
                            {/*<input className="pt-input" type="text" placeholder="Search..." />*/}
                        </Tabs>
                    </div>
                    <div className={'run-flow-container'}>
                        <Icon
                            icon={"play"}
                            style={
                                {
                                    color:'green',
                                    cursor: 'pointer'
                                }
                            }
                            />
                        <Icon
                            icon={"stop"}
                            style={
                                {
                                    color:'red',
                                    cursor:'pointer'
                                }
                            }
                        />
                    </div>
                </div>
            </div>
        )
    }
}