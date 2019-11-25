import React from 'react'
import Layout from './layout'
import SideBar from './sidebar'
import GraphView from './graphview'
import ToolTipBox from './tooltipbox'
import ParameterControlBox from './parametercontrolbox'
import SettingsPane from './settings'
import { Spinner } from '@blueprintjs/core'
const path = require('path');

var proto_path = path.join(window.electron_root.app_path,'src','protos','graph.proto');

console.log(proto_path)

console.log(proto_path, window.modulePath);

var rpc_client = new window.rpc.rpc_client(proto_path, window.modulePath);

export default class Workspace extends React.Component {
  constructor(props) {
    super(props);
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.state = {
      active_tooltip: '',
      xRes: w,
      yRes: h,
      rowOneHorizontalFactor: Math.ceil(w/5),
      rowTwoHorizontalFactor: Math.ceil(w/5),
      verticalFactor: Math.ceil(h*0.7),
      graph:null,
      show_settings:false
    };
    this.file_loader = document.createElement('input');
    this.container = {};
    this.choose_composition = this.choose_composition.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.panel_resize = this.panel_resize.bind(this);
    this.get_mouse_initial = this.get_mouse_initial.bind(this);
    this.set_tool_tip = this.set_tool_tip.bind(this);
    this.window_resize = this.window_resize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.set_file_loader = this.set_file_loader.bind(this);
    this.load_file = this.load_file.bind(this);
    this.set_file_loader();
  }

  sleep(ms){
    return new Promise(resolve=>{
      setTimeout(resolve,ms)
    })
  }

  async load_file(e){
    var self = this;
    var wait_interval = 1000;
    if(e.path[0].files.length > 0) {
      self.setState({graph:"loading"});
      window.electron_root.restart_rpc_server(window.electron_root.child_proc);
      var server_ready = false;
      var rpc_client = new window.rpc.rpc_client(proto_path, window.modulePath);
      var server_attempt_limit = 50;
      var server_attempt_current = 0;
      while (!server_ready){
        rpc_client.health_check(
            function(){
              if(rpc_client.most_recent_response.status === 'Okay'){
                server_ready = true;
                rpc_client.most_recent_response.status = null
              }
            }
        );
        server_attempt_current += 1;
        if(server_attempt_current >= server_attempt_limit){
          throw(Error("Failed to load Python interpreter. Check path."))
        }
        await this.sleep(wait_interval);
      }
      var filepath = e.path[0].files[0].path;
      rpc_client.load_script(filepath,function () {
        var compositions = rpc_client.script_maintainer.compositions;
        var composition = compositions[compositions.length - 1];
        rpc_client.get_json(composition, function () {
          var new_graph = JSON.parse(JSON.stringify(rpc_client.script_maintainer.gv));
          self.setState({graph:new_graph})
        })
      })
    }

  }

  set_file_loader() {
    this.file_loader.type = 'file';
    this.file_loader.onchange = this.load_file;
  }

  choose_composition() {
    var compositions = this.container.json.compositions;
    var chosen_composition = null;
    if (compositions.length === 0){
    }
    else if (compositions.length === 1){
      chosen_composition = compositions[0]
    }
    else {
      //TODO: add handling for multiple compositions
    }
    return chosen_composition
  }

  set_tool_tip(text) {
    var stateWithNewText = { ...this.state.active_tooltip };
    stateWithNewText = text;
    this.setState({ active_tooltip: stateWithNewText })
  }

  get_mouse_initial() {
    this.mouse_initial = this.state.mouse
  }

  window_resize() {
    var old_xRes = this.state.xRes;
    var old_yRes = this.state.yRes;
    var old_r1_h_factor = this.state.rowOneHorizontalFactor;
    var old_r2_h_factor = this.state.rowTwoHorizontalFactor;
    var old_v_factor = this.state.verticalFactor;
    var w = window.innerWidth;
    var h = window.innerHeight;
    this.setState({
      xRes:w,
      yRes:h,
      rowOneHorizontalFactor: (old_r1_h_factor/old_xRes)*w,
      rowTwoHorizontalFactor: (old_r2_h_factor/old_xRes)*w,
      verticalFactor: (old_v_factor/old_yRes)*h,
      // graph:_graph,
      test_width:500
    });
    this.forceUpdate()
  }

  panel_resize(horizontal_factor, vertical_factor, e, direction, ref, d) {
    var self = this;
    var mouse_current = self.state.mouse;
    var mouse_initial = self.mouse_initial;
    var offset_hor = mouse_current.x - mouse_initial.x;
    var offset_ver = mouse_current.y - mouse_initial.y;
    if (['bottomRight', 'bottomLeft', 'topRight', 'topLeft'].includes(direction)) {
      self.setState({ [horizontal_factor]: self.state[horizontal_factor] + offset_hor });
      self.setState({ [vertical_factor]: self.state[vertical_factor] + offset_ver })
    } else if (['left', 'right'].includes(direction)) {
      self.setState({ [horizontal_factor]: self.state[horizontal_factor] + offset_hor })
    } else {
      self.setState({ [vertical_factor]: self.state[vertical_factor] + offset_ver })
    }
    self.mouse_initial = mouse_current
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove');
    window.removeEventListener('mousedown');
    window.removeEventListener('mouseup');
    window.removeEventListener('resize');
    window.removeEventListener('keydown');
  }

  componentWillMount() {
    window.addEventListener('mousedown', (e) => {
        this.mouse_status = 'down'
      }
    );
    window.addEventListener('mousemove', (e) => {
        this.setState({ mouse: e })
      }
    );
    window.addEventListener('mouseup', (e) => {
        this.mouse_status = 'up'
      }
    );
    window.addEventListener('keydown', (e) => {
      // Checks for OS here. Consider refactoring with Redux to set as global state variable
      var combo_key;

      if (navigator.platform.toUpperCase().includes("MAC")){
        combo_key = e.metaKey
      }
      else {
        combo_key = e.ctrlKey
      }

      if (combo_key === true && e.key === 'u') {
        this.file_loader.click()
      }

      if (combo_key === true && e.key === ','){
        this.setState({'show_settings':true});
      }
    });
    window.addEventListener('resize', this.window_resize)
  }

  toggleDialog = () => this.setState({ show_settings: !this.state.show_settings });

  render() {
    var self = this;
    var padding = 10;
    var components = [
      <div key="a">
        <SideBar
          hover={() => this.set_tool_tip('sidebar')}
          className='pnl-panel'
          onResizeStart={this.get_mouse_initial}
          onResize={function (e, direction, ref, d) {
            self.panel_resize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          onResizeStop={function (e, direction, ref, d) {
            self.panel_resize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          size={
            {
              height: this.state.verticalFactor - padding,
              width: this.state.rowOneHorizontalFactor - padding
            }
          }
        />
      </div>,
      <div key="b">
        <GraphView
          className='pnl-panel'
          onResizeStart={this.get_mouse_initial}
          onResize={function (e, direction, ref, d) {
            self.panel_resize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          onResizeStop={function (e, direction, ref, d) {
            self.panel_resize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          size={
            {
              height: this.state.verticalFactor - padding,
              width: this.state.xRes - this.state.rowOneHorizontalFactor - padding * 2
            }
          }
          graph={this.state.graph}
        />
      </div>,
      <div key="c">
        <ToolTipBox
          text={this.state.active_tooltip}
          className='pnl-panel'
          onResizeStart={this.get_mouse_initial}
          onResizeStop={function (e, direction, ref, d) {
            self.panel_resize('rowTwoHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          onResize={function (e, direction, ref, d) {
            self.panel_resize('rowTwoHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          size={
            {
              height: this.state.yRes - this.state.verticalFactor - padding * 2,
              width: this.state.rowTwoHorizontalFactor - padding
            }
          }/>
      </div>,
      <div key="d">
        <ParameterControlBox
          text={this.state.active_tooltip}
          className='pnl-panel'
          onResizeStart={this.get_mouse_initial}
          onResizeStop={function (e, direction, ref, d) {
            self.panel_resize('rowTwoHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          onResize={function (e, direction, ref, d) {
            self.panel_resize('rowTwoHorizontalFactor', 'verticalFactor', e, direction, ref, d)
          }}
          size={
            {
              height: this.state.yRes - this.state.verticalFactor - padding * 2,
              width: this.state.xRes - this.state.rowTwoHorizontalFactor - padding * 2
            }
          }/>
      </div>
    ];
    return (
        <div>
          <SettingsPane
            isOpen={this.state.show_settings}
            toggleDialog={this.toggleDialog}
            config={window.config}/>
          <Layout
            className={'workspace_grid'}
            margin={[0, 0]}
            layout={[
              {
                i: 'a',
                x: 0,
                y: 0,
                w: this.state.rowOneHorizontalFactor,
                h: this.state.verticalFactor
              },
              {
                i: 'b',
                x: this.state.rowOneHorizontalFactor,
                y: 0,
                w: this.state.xRes - this.state.rowOneHorizontalFactor,
                h: this.state.verticalFactor
              },
              {
                i: 'c',
                x: 0,
                y: this.state.verticalFactor,
                w: this.state.rowTwoHorizontalFactor,
                h: this.state.yRes - this.state.verticalFactor
              },
              {
                i: 'd',
                x: this.state.rowTwoHorizontalFactor,
                y: this.state.verticalFactor,
                w: this.state.xRes - this.state.rowTwoHorizontalFactor,
                h: this.state.yRes - this.state.verticalFactor
              }
            ]}
            cols={this.state.xRes}
            rowHeight={1}
            width={this.state.xRes}
            components={components}
          />
        </div>
    )
  }
}