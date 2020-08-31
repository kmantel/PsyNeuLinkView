import React from 'react'
import Layout from './layout'
import SideBar from './sidebar'
import PlotterSideBar from "./plotter-sidebar";
import D3plotter from './plotter'
import GraphView from './d3model'
import ToolTipBox from './tooltip-box'
import ControlStrip from "./control-strip";
import ParameterControlBox from './configuration-panel'
import SettingsPane from './settings'
import ErrorDispatcher from "../utility/errors/dispatcher";
import {connect} from "react-redux";
import {setActiveView, setStyleSheet, setActiveComposition} from "../state/core/actions";
import {store} from "../state/store";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const fs = window.interfaces.filesystem,
    interp = window.interfaces.interpreter,
    rpc_client = window.interfaces.rpc;

class WorkSpace extends React.PureComponent {
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
            baseline_row_one_h:sizing_factors.row_one_horizontal_factor,
            baseline_row_two_h:sizing_factors.row_two_horizontal_factor,
            baseline_vertical:sizing_factors.vertical_factor,
            graph: null,
            graph_style:null,
            show_settings: false,
            mouse:null,
            filepath: null,
            active_component: 'graphview'
        };
        this.panel_padding = 10;
        this.panel_max_width = window.innerWidth - this.panel_padding * 7;
        this.panel_max_height = window.innerHeight - this.panel_padding * 7;
        this.name = 'workspace';
        this.dispatcher = new ErrorDispatcher(this);
        this.container = {};
        // window.this = this;
        this.get_current_graph_style = this.get_current_graph_style.bind(this);
        this.get_reference_sizing_factors = this.get_reference_sizing_factors.bind(this);
        this.set_graph_size = this.set_graph_size.bind(this);
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
        this.set_active_component = this.set_active_component.bind(this);
        this.setMenu();
        this.rpc_client = rpc_client;
    }

    componentDidMount() {
        var self = this,
            padding = 10
        this.get_initial_filepath();

    }

    get_initial_filepath() {
        var config = fs.get_config(),
            filepath = config.env.filepath;
        if (filepath){
            this.validate_server_status_and_load_script(filepath);
        }
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
                    this.filepath = filepath
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
                        self.set_state_from_rpc_client()
                        }
                    )
                }
            }
        );
    }

    set_state_from_rpc_client(){
        var self = this,
            filepath = this.filepath,
            compositions = rpc_client.script_maintainer.compositions,
            composition = compositions[compositions.length - 1],
            new_graph = Object.assign({}, JSON.parse(JSON.stringify(rpc_client.script_maintainer.gv))),
            new_graph_style = Object.assign({}, JSON.parse(JSON.stringify(rpc_client.script_maintainer.style))),
            cf = Object.assign({}, fs.get_config());
        cf.env.filepath = filepath;
        fs.set_config(cf);
        this.props.setStyleSheet(new_graph_style);
        this.props.setActiveComposition(composition);
        self.setState({
            graph: new_graph,
            filepath: filepath,
        });
        var homedir = window.remote.app.getPath('home');
        if (filepath.startsWith(homedir)){
            filepath = `~${filepath.slice(homedir.length)}`
        }
        fs.watch(filepath, (e)=>{
            window.dispatchEvent(new Event(e));
            self.get_current_graph_style()
        });
        window.remote.getCurrentWindow().setTitle(`${composition} \u2014 ${filepath}`)
    }

    async validate_server_status_and_load_script(filepath) {
        var self, previous_title, win;
        self = this;
        win = window.remote.getCurrentWindow();
        self.filepath = filepath;
        self.setState({graph: "loading"}, ()=>{win.setTitle('PsyNeuLinkView')});
        window.electron_root.addRecentDocument(filepath);
        // self.load_script(filepath)
        interp.restart_rpc_server(
            ()=>{
                self.load_script(filepath)
            },
        );
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


    get_current_graph_style(){
        var self = this;
        this.rpc_client.get_style(self.filepath, function (err) {
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
            try {
                var new_graph_style = JSON.parse(JSON.stringify(rpc_client.script_maintainer.style));
            } catch {
                var new_graph_style = {};
            }
            self.props.setStyleSheet(new_graph_style);
        })
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

    get_reference_sizing_factors(horizontal, vertical){
        // this.reference_factors = {
        //     horizontal_key:horizontal,
        //     horizontal_value:this.state[horizontal],
        //     vertical_key:vertical,
        //     vertical_value:this.state[vertical]
        // }
    }

    window_resize() {
        // var old_x_res = this.state.x_res;
        // var old_y_res = this.state.y_res;
        // var old_r1_h_factor = this.state.row_one_horizontal_factor;
        // var old_r2_h_factor = this.state.row_two_horizontal_factor;
        // var old_v_factor = this.state.vertical_factor;
        // var w = window.innerWidth;
        // var h = window.innerHeight;
        // this.setState({
        //     x_res: w,
        //     y_res: h,
        //     row_one_horizontal_factor: (old_r1_h_factor / old_x_res) * w,
        //     row_two_horizontal_factor: (old_r2_h_factor / old_x_res) * w,
        //     vertical_factor: (old_v_factor / old_y_res) * h,
        //     test_width: 500
        // });
        // this.forceUpdate()
    }

    panel_resize(e, direction, ref, d) {
        // var h_key = this.reference_factors.horizontal_key,
        //     h_val = this.reference_factors.horizontal_value,
        //     v_key = this.reference_factors.vertical_key,
        //     v_val = this.reference_factors.vertical_value;
        // if (direction.toLowerCase().includes('left')){d.width*=-1}
        // if (direction.toLowerCase().includes('top')){d.height*=-1}
        // if (['bottomRight', 'bottomLeft', 'topRight', 'topLeft'].includes(direction)) {
        //     this.setState({[h_key]: h_val + d.width});
        //     this.setState({[v_key]: v_val + d.height})
        // } else if (['left', 'right'].includes(direction)) {
        //     this.setState({[h_key]: h_val + d.width})
        // } else {
        //     this.setState({[v_key]: v_val + d.height})
        // }
        // window.dispatchEvent(new Event('resize'));
    }

    set_graph_size(width=this.state.row_one_horizontal_factor,
                   height=this.state.vertical_factor,
                   callback=()=>{}){
        // This is a hook to allow child element graphview to set its own size.
        // Current horizontal factor attribute is set with respect to the first element in row.
        //  We subtract from one here so that calls to this method refer to the size of the actual
        //  graphview element instead.
        //
        // Args are passed in percents, so we need to convert them to fractions.

        var padding = this.panel_padding,
            new_h_factor = window.innerWidth-((window.innerWidth)*(width/100)+padding*2)-1,
            new_v_factor = (window.innerHeight)*(height/100)+padding;
        this.setState(
            {
                row_one_horizontal_factor:new_h_factor,
                vertical_factor:new_v_factor
            },
            callback
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentWillUnmount() {
        // window.removeEventListener('mousemove', this.saveMouseData);
        // window.removeEventListener('resize', this.window_resize);
        // window.removeEventListener('change', this.on_change)
    }

    componentWillMount() {
        // window.addEventListener('mousemove', this.saveMouseData);
        // window.addEventListener('resize', this.window_resize);
        // window.addEventListener('change', this.on_change)
    }

    on_change(e) {
    }

    saveMouseData(e) {
        this.setState({mouse: e})
    }

    toggleDialog = () => {
        var interpreter_path_is_blank = !fs.get_config()['Python']['Interpreter Path'];
        if (!interpreter_path_is_blank) {
            this.setState({show_settings: !this.state.show_settings});
        }
    };

    handleErrors() {
        this.dispatcher.emit()
    }

    on_resize(e, direction, ref, d) {
        // this.panel_resize('row_one_horizontal_factor', 'vertical_factor', e, direction, ref, d)
        // window.dispatchEvent(new Event('resize'));
    }

    set_active_component(component, callback=()=>{}){
        // this.setState({'active_component':component}, callback)
    }

    render_log(message){
        console.log(message);
    }

    render() {
        // var interpreter_path_is_blank = !fs.get_config()['Python']['Interpreter Path'];
        // var interpreter_path_is_blank = false;
        // if (!this.state.show_settings && interpreter_path_is_blank) {
        //     this.setState({show_settings: true})
        // }
        var self = this;
        var padding = 10,
            sidebar = <div key="sidebar">
                <SideBar
                    hover={() => this.set_tool_tip('sidebar')}
                    className='pnl-panel'
                    onResize={
                        // self.panel_resize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    row_one_horizontal_factor:this.state.baseline_row_one_h + delta.width,
                                    vertical_factor:this.state.baseline_vertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baseline_row_one_h:this.state.baseline_row_one_h + delta.width,
                                    baseline_vertical:this.state.baseline_vertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.vertical_factor - padding,
                            width: this.state.row_one_horizontal_factor - padding
                        }
                    }
                    maxWidth = {
                        this.panel_max_width
                    }
                    maxHeight = {
                        this.panel_max_height
                    }
                />
            </div>,
            graphview = <div key="graphview">
                <GraphView
                    className='pnl-panel'
                    onResize={
                        // self.panel_resize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    row_one_horizontal_factor:this.state.baseline_row_one_h - delta.width,
                                    vertical_factor:this.state.baseline_vertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baseline_row_one_h:this.state.baseline_row_one_h - delta.width,
                                    baseline_vertical:this.state.baseline_vertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.vertical_factor - padding,
                            width: this.state.x_res - this.state.row_one_horizontal_factor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panel_max_width
                    }
                    maxHeight = {
                        this.panel_max_height
                    }
                    location = {
                        {
                            x:this.state.row_one_horizontal_factor,
                            y:0
                        }
                    }
                    graph={this.state.graph}
                    // graph_style = {this.state.graph_style}
                    filepath = {this.state.filepath}
                    graph_size_fx = {this.set_graph_size}
                />
            </div>,
            plotter =  <div key="plotter">
                <D3plotter
                    className='pnl-panel'
                    onResize={
                        // self.panel_resize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    row_one_horizontal_factor:this.state.baseline_row_one_h - delta.width,
                                    vertical_factor:this.state.baseline_vertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baseline_row_one_h:this.state.baseline_row_one_h - delta.width,
                                    baseline_vertical:this.state.baseline_vertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.vertical_factor - padding,
                            width: this.state.x_res - this.state.row_one_horizontal_factor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panel_max_width
                    }
                    maxHeight = {
                        this.panel_max_height
                    }
                    location = {
                        {
                            x:this.state.row_one_horizontal_factor - padding,
                            y:0
                        }
                    }
                    graph={this.state.graph}
                    graph_style = {this.state.graph_style}
                    filepath = {this.state.filepath}
                />
            </div>,
            tipbox = <div key="tipbox">
                <ToolTipBox
                    text={this.state.active_tooltip}
                    className='pnl-panel'
                    onResize={
                        // self.panel_resize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    row_two_horizontal_factor:this.state.baseline_row_two_h + delta.width,
                                    vertical_factor:this.state.baseline_vertical - delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baseline_row_two_h:this.state.baseline_row_two_h + delta.width,
                                    baseline_vertical:this.state.baseline_vertical - delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.y_res - this.state.vertical_factor - padding * 6,
                            width: this.state.row_two_horizontal_factor - padding
                        }
                    }
                    maxWidth = {
                        this.panel_max_width
                    }
                    maxHeight = {
                        this.panel_max_height
                    }
                />

            </div>,
            paramcontrolbox =
                <div key="paramcontrol">
                <ParameterControlBox
                    text={this.state.active_tooltip}
                    className='pnl-panel'
                    onResize={
                        // self.panel_resize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    row_two_horizontal_factor:this.state.baseline_row_two_h - delta.width,
                                    vertical_factor:this.state.baseline_vertical - delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baseline_row_two_h:this.state.baseline_row_two_h - delta.width,
                                    baseline_vertical:this.state.baseline_vertical - delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.y_res - this.state.vertical_factor - padding * 6,
                            width: this.state.x_res - this.state.row_two_horizontal_factor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panel_max_width
                    }
                    maxHeight = {
                        this.panel_max_height
                    }
                />
            </div>;

        var components;

        if (this.props.activeView === 'graphview'){
            components = [
                sidebar,
                tipbox,
                paramcontrolbox,
                graphview
            ];
        }
        else if (this.props.activeView === 'plotter'){
            components = [
                sidebar,
                tipbox,
                paramcontrolbox,
                plotter
            ];
        }

        return (
            <div>
                <ControlStrip
                    width={window.innerWidth-this.panel_padding*2}
                    activePanelControl={this.set_active_component}
                />
                <SettingsPane
                    isOpen={false}
                    // isOpen={true}
                    toggleDialog={this.toggleDialog}
                    config={window.config}/>
                <DndProvider backend={ HTML5Backend } >
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
                                i: this.props.activeView,
                                x: this.state.row_one_horizontal_factor,
                                y: 0,
                                w: this.state.x_res - this.state.row_one_horizontal_factor - this.panel_padding,
                                h: this.state.vertical_factor
                            },
                            {
                                i: 'tipbox',
                                x: 0,
                                y: this.state.vertical_factor,
                                w: this.state.row_two_horizontal_factor,
                                h: this.state.y_res - this.state.vertical_factor - this.panel_padding * 6
                            },
                            {
                                i: 'paramcontrol',
                                x: this.state.row_two_horizontal_factor,
                                y: this.state.vertical_factor,
                                w: this.state.x_res - this.state.row_two_horizontal_factor,
                                h: this.state.y_res - this.state.vertical_factor - this.panel_padding * 6
                            }
                        ]}
                        rowHeight={1}
                        cols={this.state.x_res}
                        width={this.state.x_res}
                        // cols={this.state.x_res}
                        // width={this.state.x_res}
                        components={components}
                    />
                </DndProvider>
            </div>
        )
    }
}

const mapStateToProps = ({core}) => {
    return {
        activeView: core.activeView,
        graph_style: core.stylesheet
            }
}

const mapDispatchToProps = dispatch => ({
    setStyleSheet: graphStyle => {dispatch(setStyleSheet(graphStyle))},
    setActiveComposition: name => {dispatch(setActiveComposition(name))}
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WorkSpace)
