import React from 'react'
import Layout from './layout'
import SideBar from './sidebar'
import GraphView from './graphview'
import ToolTipBox from './tooltipbox'
import ParameterControlBox from './parametercontrolbox'
import SettingsPane from './settings'

const path = require('path');
var rpc_client = new window.rpc.rpc_client();

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
      test_text:'hey'
    };
    this.file_loader = document.createElement('input');
    this.container = {};
    this.choose_composition = this.choose_composition.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.panel_resize = this.panel_resize.bind(this);
    this.get_mouse_initial = this.get_mouse_initial.bind(this);
    this.set_tool_tip = this.set_tool_tip.bind(this);
    this.set_components = this.set_components.bind(this);
    this.window_resize = this.window_resize.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.set_file_loader = this.set_file_loader.bind(this);
    this.set_composition = this.set_composition.bind(this);
    this.set_components();
    this.set_file_loader();
  }

  set_file_loader() {
    var self = this;
    this.file_loader.type = 'file';
    this.file_loader.onchange = e => {
      if(e.path[0].files.length > 0) {
        window.electron_root.restart_rpc_server(window.electron_root.child_proc);
        rpc_client = new window.rpc.rpc_client();
        var filepath = e.path[0].files[0].path;
        rpc_client.load_script(filepath,function () {
          var compositions = rpc_client.script_maintainer.compositions;
          var composition = compositions[compositions.length - 1];
          console.log(compositions);
          console.log(composition);
          rpc_client.get_json(composition, function () {
            var new_graph = JSON.parse(JSON.stringify(rpc_client.script_maintainer.gv));
            self.setState({graph:new_graph})
          })
        })
      }
    }
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

  set_composition(composition){
    var self = this;
    self.setState({graph:null});
    var uri = 'http://127.0.0.1:5000/api/v1/resources/gv?name=' + composition;
    self.get_request(uri,
      function(){
      console.log(self.container.json);
      self.setState({graph:self.container.json})
    })
  }

  set_components() {
    var self = this
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
    window.removeEventListener('onkeypress');
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
    window.addEventListener('keypress', (e) => {
      if (e.keyCode === 21 && e.ctrlKey) {
        this.file_loader.click()
      }
    });
    window.addEventListener('resize', this.window_resize)
  }

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
            isOpen={true}
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