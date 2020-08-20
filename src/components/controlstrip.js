import React from 'react'
import {connect} from "react-redux";
import {store} from "../app/redux/store";
import { setActiveView } from "../app/redux/actions";
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import '../css/controlstrip.css'

class ControlStrip extends React.Component {
    constructor(props){
        super(props);
        this.handleTabChange = this.handleTabChange.bind(this)
    }

    handleTabChange(new_tab_id, prev_tab_id, e){
        store.dispatch(setActiveView(new_tab_id));
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
                        <Tabs id="view-tab-group" onChange={this.handleTabChange} selectedTabId={this.props.activeView}>
                            <Tab id="graphview" title="Construct" panel={<div />} />
                            <Tab id="plotter" title="Monitor" panel={<div />} />
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

const mapStateToProps = state => {
    return { activeView: state.activeView }
}

export default connect(
    mapStateToProps,
    { setActiveView }
)(ControlStrip)