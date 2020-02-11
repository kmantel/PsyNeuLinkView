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
var proto_path = path.join(window.electron_root.app_path, 'src', 'protos', 'graph.proto');
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
            rowOneHorizontalFactor: Math.ceil(w / 5),
            rowTwoHorizontalFactor: Math.ceil(w / 5),
            verticalFactor: Math.ceil(h * 0.7),
            graph: null,
            graph_style:null,
            show_settings: false,
            mouse:null,
            filepath: null
        };
        this.dispatcher = new ErrorDispatcher(this);
        this.container = {};
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
        var old_xRes = this.state.xRes;
        var old_yRes = this.state.yRes;
        var old_r1_h_factor = this.state.rowOneHorizontalFactor;
        var old_r2_h_factor = this.state.rowTwoHorizontalFactor;
        var old_v_factor = this.state.verticalFactor;
        var w = window.innerWidth;
        var h = window.innerHeight;
        this.setState({
            xRes: w,
            yRes: h,
            rowOneHorizontalFactor: (old_r1_h_factor / old_xRes) * w,
            rowTwoHorizontalFactor: (old_r2_h_factor / old_xRes) * w,
            verticalFactor: (old_v_factor / old_yRes) * h,
            test_width: 500
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
            self.setState({[horizontal_factor]: self.state[horizontal_factor] + offset_hor});
            self.setState({[vertical_factor]: self.state[vertical_factor] + offset_ver})
        } else if (['left', 'right'].includes(direction)) {
            self.setState({[horizontal_factor]: self.state[horizontal_factor] + offset_hor})
        } else {
            self.setState({[vertical_factor]: self.state[vertical_factor] + offset_ver})
        }
        self.mouse_initial = mouse_current
    }

    componentDidMount() {
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
            <div key="a">
                <SideBar
                    hover={() => this.set_tool_tip('sidebar')}
                    className='pnl-panel'
                    onResizeStart={this.get_mouse_initial}
                    onResize={function (e, direction, ref, d) {
                        self.panel_resize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
                        window.dispatchEvent(new Event('resize'));
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
                        window.dispatchEvent(new Event('resize'));
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
                    graph_style = {this.state.graph_style}
                    filepath = {this.state.filepath}
                    rpc_client = {rpc_client}
                    filewatch_fx = {this.watch_file}
                    fileunwatch_fx = {this.unwatch_file}
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
                        window.dispatchEvent(new Event('resize'));
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
                        window.dispatchEvent(new Event('resize'));
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
                    // isOpen={true}
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