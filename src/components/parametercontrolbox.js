import React from 'react'
import '../css/parametercontrolbox.css'
import { Resizable } from 're-resizable'
import {Icon, Tab, Tabs} from "@blueprintjs/core"
import {connect} from "react-redux";
import {setActiveParamTab} from "../app/redux/actions";
import {store} from "../app/redux/store";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export class ParameterControlBox extends React.Component {
  constructor(props) {
    super();
    this.state = {
      text: props.text,
      class: props.className !== undefined ? `parametercontrolbox ${props.className}`:'parametercontrolbox'
    }
  }

  updateText(newText) {
    this.setState({ text: newText })
  }

  handleTabChange(new_tab_id, prev_tab_id, e) {
      store.dispatch(setActiveParamTab(new_tab_id))
  }

  render() {
    return (
      <Resizable
        style={style}
        onResize={this.props.onResize}
        onResizeStart={this.props.onResizeStart}
        onResizeStop={this.props.onResizeStop}
        enable={{
          top:true,
          right:false,
          bottom:false,
          left:true,
          topRight:false,
          bottomRight:false,
          bottomLeft:false,
          topLeft:true
        }}
        className='sidebar'
        defaultSize={
          this.props.defaultSize
        }
        size={
          this.props.size
        }
        minHeight={
            40
        }
        minWidth={
            40
        }
        maxWidth={
            this.props.maxWidth
        }
        maxHeight={
            this.props.maxHeight
        }
      >
        <div className={this.state.class}>
            {this.state.text}
            <div className={'parameter-control-title'}>
                <div className={'param-tab-container'}>
                    <Tabs id="param-tab-group" onChange={this.handleTabChange} selectedTabId={this.props.active_param_tab}>
                        <Tab id="composition" title="Composition" panel={<div/>}/>
                    </Tabs>
                </div>
            </div>
        </div>
      </Resizable>
    )
  };
}

const mapStateToProps = state => {
    return {
        active_param_tab: state.active_param_tab
    }
};

export default connect(mapStateToProps, {setActiveParamTab})(ParameterControlBox)
