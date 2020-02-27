import React from 'react'
import Layout from './layout'
import SideBar from './sidebar'
import GraphView from './graphview'
import ToolTipBox from './tooltipbox'
import ParameterControlBox from './parametercontrolbox'
import SettingsPane from './settings'
import ErrorDispatcher from "../utility/errors/dispatcher";
import fs from 'fs'
const path = require('path');
const os = require('os');
const config_client = window.config_client;
var proto_path = path.join(window.electron_root.app_path, 'src', 'protos', 'graph.proto');
var rpc_client = new window.rpc.rpc_client(proto_path, window.modulePath);

export default class WorkSpace extends React.Component {
    constructor(props) {
        super(props);
        var w = window.innerWidth;
        var h = window.innerHeight;
        var sizing_factors = this.get_initial_sizing_factors();
        this.state = {
            active_tooltip: '',
            x_res: w,
            y_res: h,
            row_one_horizontal_factor: sizing_factors.row_one_horizontal_factor,
            row_two_horizontal_factor: sizing_factors.row_two_horizontal_factor,
            vertical_factor: sizing_factors.vertical_factor,
            graph: null,
            graph_style:null,
            show_settings: false,
            mouse:null,
            filepath: null
        };
        this.name = 'workspace';
        this.dispatcher = new ErrorDispatcher(this);
        this.container = {};
        this.set_graph_size_hook = this.set_graph_size_hook.bind(this);
        this.choose_composition = this.choose_composition.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.panel_resize = this.panel_resize.bind(this);
        this.get_mouse_initial = this.get_mouse_initial.bind(this);
        this.set_tool_tip = this.set_tool_tip.bind(this);
        this.window_resize = this.window_resize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.validate_server_status_and_load_script = this.validate_server_status_and_load_script.bind(this);
        this.handleErrors = this.handleErrors.bind(this);
        this.saveMouseData = this.saveMouseData.bind(this);
        this.watch_file = this.watch_file.bind(this);
        this.unwatch_file = this.unwatch_file.bind(this);
        this.setMenu();
    }

    componentDidMount() {
        this.get_initial_filepath();
    }

    get_initial_filepath() {
        var config = {...config_client.get_config()},
            filepath = config.env.filepath;
        if (filepath){
            this.validate_server_status_and_load_script(filepath);
        }
    }

    get_initial_sizing_factors() {
        var w = window.innerWidth,
            h = window.innerHeight,
            row_one_h = null,
            row_two_h = null,
            v = null;
        if (!row_one_h) {
            row_one_h = Math.ceil(w * 0.2)
        }
        if (!row_two_h) {
            row_two_h = Math.ceil(w * 0.2)
        }
        if (!v) {
            v = Math.ceil(h * 0.7)
        }
        return(
            {
                row_one_horizontal_factor: row_one_h,
                row_two_horizontal_factor: row_two_h,
                vertical_factor: v
            }
        )
    }

    setMenu() {
        const electron = window.remote;
        const isMac = navigator.platform.toUpperCase().includes("MAC");
        if (isMac) {
            electron.systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);
            electron.systemPreferences.setUserDefault('NSDisabledCharacterPaletteMenuItem', 'boolean', true);
            electron.systemPreferences.setUserDefault('NSDisabledEmoji&SymbolsMenuItem', 'boolean', true);
        }
        var self = this;
        var menu = electron.Menu.buildFromTemplate([
            ...(isMac ? [{
                label: "PsyNeuLinkView",
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }] : []),
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Open',
                        accelerator: 'CmdOrCtrl+o',
                        click(e) {
                            self.file_selection_dialog()
                        }
                    },
                    isMac ? {role: 'close'} : {role: 'quit'}
                ],
            },
            {
                label: 'Edit',
                submenu: [
                    {
                        label: 'Undo',
                        accelerator: 'CmdOrCtrl+Z',
                        role: 'undo'
                    },
                    {
                        label: 'Redo',
                        accelerator: 'Shift+CmdOrCtrl+Z',
                        role: 'redo'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Cut',
                        accelerator: 'CmdOrCtrl+X',
                        role: 'cut'
                    },
                    {
                        label: 'Copy',
                        accelerator: 'CmdOrCtrl+C',
                        role: 'copy'
                    },
                    {
                        label: 'Paste',
                        accelerator: 'CmdOrCtrl+V',
                        role: 'paste'
                    },
                    {
                        label: 'Select All',
                        accelerator: 'CmdOrCtrl+A',
                        role: 'selectall'
                    },
                    {
                        label: 'Preferences',
                        accelerator: 'CmdOrCtrl+,',
                        click() {
                            self.setState({'show_settings': true});
                        }
                    }
                ],
            },
            {
                label: 'Help',
                submenu: [
                    {
                        role: 'toggleDevTools'
                    },
                    {
                        label: 'Open Debug Log',
                        accelerator: 'CmdOrCtrl+L',
                        click() {
                            window.electron_root.open_log_file();
                        }
                    },
                    {
                        label: 'Show Debug Log in Finder',
                        accelerator: 'CmdOrCtrl+Shift+L',
                        click() {
                            window.electron_root.open_log_folder();
                        }
                    }
                ]
            }
        ]);
        electron.Menu.setApplicationMenu(menu);
        // exports.menu_bindings = menu_bindings;
    }

    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    file_selection_dialog() {
        var self = this;
        var filepath = window.dialog.showOpenDialog(
            window.getCurrentWindow(),
            {
                filters: [
                    {name: 'Python', extensions: ['py']}
                ]
            }
        ).then((paths) => {
                var pathArray = paths.filePaths;
                if (pathArray.length > 0) {
                    self.setState({'filepath':pathArray[0]});
                    self.validate_server_status_and_load_script(pathArray[0]);
                }
            }
        )
    }

    async validate_server_status(wait_interval, attempt_limit) {
        var server_ready = false;
        var server_attempt_current = 0;
        var self = this;
        while (!server_ready) {
            rpc_client.health_check(
                function () {
                    if (rpc_client.most_recent_response.status === 'Okay') {
                        server_ready = true;
                        rpc_client.most_recent_response.status = null
                    }
                }
            );
            server_attempt_current += 1;
            if (server_attempt_current >= attempt_limit) {
                self.dispatcher.capture(
                    {
                        error: "Failed to load Python interpreter. Check path."
                    },
                    self.setState({'graph': null})
                );
                return false
            }
            await this.sleep(wait_interval);
        }
        return true
    }

    watch_file(filepath) {
        var self = this;
        window.fs.watchFile(filepath,{interval:10},()=>{
            if (!['loading',null].includes(self.state.graph)){
                rpc_client.get_style(self.state.filepath, ()=>{
                    self.setState({graph_style:rpc_client.script_maintainer.style})
                })
            }
        })
    }

    unwatch_file(filepath) {
        window.fs.unwatchFile(filepath)
    }

    load_script(filepath) {
        var win;
        var self = this;
        win = window.remote.getCurrentWindow();
        self.setState({'filepath':filepath});
        rpc_client.load_script(filepath, (err) => {
                if (err) {
                    self.dispatcher.capture({
                            error: "Python interpreter crashed while loading script. ",
                            message:
                                `Message: ${err.cause !== undefined ?
                                    err.cause.message
                                    :
                                    err.message}`
                        },
                        {graph: null}
                    )
                } else {
                    var compositions = rpc_client.script_maintainer.compositions;
                    var composition = compositions[compositions.length - 1];
                    rpc_client.get_json(composition, function (err) {
                            if (err) {
                                self.dispatcher.capture({
                                        error: "Python interpreter crashed while loading script.",
                                        message:
                                            `Message: ${err.cause !== undefined ?
                                                err.cause.message
                                                :
                                                err.message}`
                                    },
                                    {graph: null}
                                );
                                return false
                            }
                            var new_graph = JSON.parse(JSON.stringify(rpc_client.script_maintainer.gv));
                            try {
                                var new_graph_style = JSON.parse(JSON.stringify(rpc_client.script_maintainer.style));
                            }
                            catch {
                                var new_graph_style = {};
                            }
                            var cf = {...config_client.get_config()};
                            cf.env.filepath = filepath;
                            config_client.set_config({...cf});
                            self.setState({
                                graph: new_graph,
                                graph_style: new_graph_style,
                                filepath: filepath,
                            });
                            self.watch_file(filepath);
                            var homedir = window.remote.app.getPath('home');
                            if (filepath.startsWith(homedir)){
                                filepath = `~${filepath.slice(homedir.length)}`
                            }
                            window.remote.getCurrentWindow().setTitle(`${composition} \u2014 ${filepath}`)
                        }
                    )
                }
            }
        );
    }

    async validate_server_status_and_load_script(filepath) {
        var self, previous_title, win;
        self = this;
        win = window.remote.getCurrentWindow();
        self.filepath = filepath;
        self.setState({graph: "loading"}, ()=>{win.setTitle('PsyNeuLinkView')});
        window.electron_root.addRecentDocument(filepath);
        window.electron_root.restart_rpc_server(
            ()=>{
                self.load_script(filepath)
            },
        );
    }

    choose_composition() {
        var compositions = this.container.json.compositions;
        var chosen_composition = null;
        if (compositions.length === 0) {
        } else if (compositions.length === 1) {
            chosen_composition = compositions[0]
        } else {
            //TODO: add handling for multiple compositions
        }
        return chosen_composition
    }

    set_tool_tip(text) {
        var stateWithNewText = {...this.state.active_tooltip};
        stateWithNewText = text;
        this.setState({active_tooltip: stateWithNewText})
    }

    get_mouse_initial() {
        this.mouse_initial = this.state.mouse
    }

    window_resize() {
        var old_x_res = this.state.x_res;
        var old_y_res = this.state.y_res;
        var old_r1_h_factor = this.state.row_one_horizontal_factor;
        var old_r2_h_factor = this.state.row_two_horizontal_factor;
        var old_v_factor = this.state.vertical_factor;
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.setState({
            x_res: w,
            y_res: h,
            row_one_horizontal_factor: (old_r1_h_factor / old_x_res) * w,
            row_two_horizontal_factor: (old_r2_h_factor / old_x_res) * w,
            vertical_factor: (old_v_factor / old_y_res) * h,
            test_width: 500
        });
        this.forceUpdate()
    }

    update_config_panel_sizes(){
        // var cf = {...config_client.get_config()};
        // cf.env.workspace.row_one_horizontal_factor = Math.round(this.state.row_one_horizontal_factor);
        // cf.env.workspace.row_two_horizontal_factor = Math.round(this.state.row_two_horizontal_factor);
        // cf.env.workspace.vertical_factor = Math.round(this.state.vertical_factor); //for some reason this keeps getting converted to a float which is causing errors;
        // config_client.set_config({...cf});
    }

    panel_resize(horizontal_factor, vertical_factor, e, direction, ref, d) {
        var self = this;
        var mouse_current = self.state.mouse;
        var mouse_initial = self.mouse_initial;
        var offset_hor = mouse_current.x - mouse_initial.x;
        var offset_ver = mouse_current.y - mouse_initial.y;
        if (['bottomRight', 'bottomLeft', 'topRight', 'topLeft'].includes(direction)) {
            self.setState({[horizontal_factor]: self.state[horizontal_factor] + offset_hor});
            self.setState({[vertical_factor]: self.state[vertical_factor] + offset_ver})
        } else if (['left', 'right'].includes(direction)) {
            self.setState({[horizontal_factor]: self.state[horizontal_factor] + offset_hor})
        } else {
            self.setState({[vertical_factor]: self.state[vertical_factor] + offset_ver})
        }
        self.mouse_initial = mouse_current
    }

    set_graph_size_hook(width=this.state.row_one_horizontal_factor,
                        height=this.state.vertical_factor){
        // This is a hook to allow child element graphview to set its own size.
        // Current horizontal factor attribute is set with respect to the first element in row.
        //  We subtract from one here so that calls to this method refer to the size of the actual
        //  graphview element instead.
        //
        // Args should be given in percents, so we convert them to fractions.
        var new_h_factor = window.innerWidth*(1-width/100),
            new_v_factor = window.innerHeight*(height/100);
        this.setState(
            {
                row_one_horizontal_factor:new_h_factor,
                vertical_factor:new_v_factor
            }
        )
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.saveMouseData);
        window.removeEventListener('resize', this.window_resize);
    }

    componentWillMount() {
        window.addEventListener('mousemove', this.saveMouseData);
        window.addEventListener('resize', this.window_resize);
    }

    saveMouseData(e) {
        this.setState({mouse: e})
    }

    toggleDialog = () => {
        var interpreter_path_is_blank = !{...window.config_client.get_config()}['Python']['Interpreter Path'];
        if (!interpreter_path_is_blank) {
            this.setState({show_settings: !this.state.show_settings});
        }
    };

    handleErrors() {
        this.dispatcher.emit()
    }

    render() {
        var interpreter_path_is_blank = !{...window.config_client.get_config()}['Python']['Interpreter Path'];
        if (!this.state.show_settings && interpreter_path_is_blank) {
            this.setState({show_settings: true})
        }
        var self = this;
        var padding = 10;
        var components = [
            <div key="sidebar">
                <SideBar
                    hover={() => this.set_tool_tip('sidebar')}
                    className='pnl-panel'
                    onResizeStart={this.get_mouse_initial}
                    onResize={function (e, direction, ref, d) {
                        self.panel_resize('row_one_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        window.dispatchEvent(new Event('resize'));
                    }}
                    onResizeStop={function (e, direction, ref, d) {
                        self.panel_resize('row_one_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        self.update_config_panel_sizes()
                        window.dispatchEvent(new Event('resize_end'));
                    }}
                    size={
                        {
                            height: this.state.vertical_factor - padding,
                            width: this.state.row_one_horizontal_factor - padding
                        }
                    }
                />
            </div>,
            <div key="graphview">
                <GraphView
                    className='pnl-panel'
                    onResizeStart={this.get_mouse_initial}
                    onResize={function (e, direction, ref, d) {
                        self.panel_resize('row_one_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        window.dispatchEvent(new Event('resize'));
                    }}
                    onResizeStop={function (e, direction, ref, d) {
                        self.panel_resize('row_one_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        self.update_config_panel_sizes()
                        window.dispatchEvent(new Event('resize_end'));
                    }}
                    size={
                        {
                            height: this.state.vertical_factor - padding,
                            width: this.state.x_res - this.state.row_one_horizontal_factor - padding * 2
                        }
                    }
                    location = {
                        {
                            x:this.state.row_one_horizontal_factor,
                            y:0
                        }
                    }
                    graph={this.state.graph}
                    graph_style = {this.state.graph_style}
                    filepath = {this.state.filepath}
                    rpc_client = {rpc_client}
                    filewatch_fx = {this.watch_file}
                    fileunwatch_fx = {this.unwatch_file}
                    graph_size_fx = {this.set_graph_size_hook}
                />
            </div>,
            <div key="tipbox">
                <ToolTipBox
                    text={this.state.active_tooltip}
                    className='pnl-panel'
                    onResizeStart={this.get_mouse_initial}
                    onResizeStop={function (e, direction, ref, d) {
                        self.panel_resize('row_two_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        self.update_config_panel_sizes()
                        window.dispatchEvent(new Event('resize_end'));
                    }}
                    onResize={function (e, direction, ref, d) {
                        self.panel_resize('row_two_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        window.dispatchEvent(new Event('resize'));
                    }}
                    size={
                        {
                            height: this.state.y_res - this.state.vertical_factor - padding * 2,
                            width: this.state.row_two_horizontal_factor - padding
                        }
                    }/>
            </div>,
            <div key="paramcontrol">
                <ParameterControlBox
                    text={this.state.active_tooltip}
                    className='pnl-panel'
                    onResizeStart={this.get_mouse_initial}
                    onResizeStop={function (e, direction, ref, d) {
                        self.panel_resize('row_two_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        self.update_config_panel_sizes()
                        window.dispatchEvent(new Event('resize_end'));
                    }}
                    onResize={function (e, direction, ref, d) {
                        self.panel_resize('row_two_horizontal_factor', 'vertical_factor', e, direction, ref, d)
                        window.dispatchEvent(new Event('resize'));
                    }}
                    size={
                        {
                            height: this.state.y_res - this.state.vertical_factor - padding * 2,
                            width: this.state.x_res - this.state.row_two_horizontal_factor - padding * 2
                        }
                    }/>
            </div>
        ];
        return (
            <div>
                <SettingsPane
                    isOpen={this.state.show_settings}
                    // isOpen={true}
                    toggleDialog={this.toggleDialog}
                    config={window.config}/>
                <Layout
                    className={'workspace_grid'}
                    margin={[0, 0]}
                    layout={[
                        {
                            i: 'sidebar',
                            x: 0,
                            y: 0,
                            w: this.state.row_one_horizontal_factor,
                            h: this.state.vertical_factor
                        },
                        {
                            i: 'graphview',
                            x: this.state.row_one_horizontal_factor,
                            y: 0,
                            w: this.state.x_res - this.state.row_one_horizontal_factor,
                            h: this.state.vertical_factor
                        },
                        {
                            i: 'tipbox',
                            x: 0,
                            y: this.state.vertical_factor,
                            w: this.state.row_two_horizontal_factor,
                            h: this.state.y_res - this.state.vertical_factor
                        },
                        {
                            i: 'paramcontrol',
                            x: this.state.row_two_horizontal_factor,
                            y: this.state.vertical_factor,
                            w: this.state.x_res - this.state.row_two_horizontal_factor,
                            h: this.state.y_res - this.state.vertical_factor
                        }
                    ]}
                    cols={this.state.x_res}
                    rowHeight={1}
                    width={this.state.x_res}
                    components={components}
                />
            </div>
        )
    }
}