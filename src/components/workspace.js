import * as _ from 'lodash';
import React from 'react'
import Layout from './layout'
import SideBar from './sidebar'
import D3plotter from './plotter'
import GraphView from './d3model'
import ToolTipBox from './tool-tip-box'
import ControlStrip from "./control-strip";
import ParameterControlBox from './configuration-panel'
import SettingsPane from './settings'
import ErrorDispatcher from "../utility/errors/dispatcher";
import {connect} from "react-redux";
import {setActiveComposition, setStyleSheet} from "../state/core/actions";
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {createId} from "../state/util";
import {ID_LEN, PNL_PREFIX} from "../keywords";
import {getPsyNeuLinkIdSet, getPsyNeuLinkMapIdToName} from "../state/psyneulink-registry/selectors";
import {getComponentMapIdToParameterSet, getComponentMapNameToId} from "../state/psyneulink-components/selectors";
import {addData, registerParameters} from "../state/psyneulink-parameters/actions";
import {registerComponent} from "../state/psyneulink-components/actions";

const fs = window.interfaces.filesystem,
    interp = window.interfaces.interpreter,
    rpcClient = window.interfaces.rpc;

const mapStateToProps = ({core, psyNeuLinkRegistry, psyNeuLinkComponents}) => {
    return {
        activeView: core.activeView,
        graph_style: core.stylesheet,
        psyNeuLinkIdSet:getPsyNeuLinkIdSet(psyNeuLinkRegistry),
        psyNeuLinkMapIdToName:getPsyNeuLinkMapIdToName(psyNeuLinkRegistry),
        componentMapNameToId:getComponentMapNameToId(psyNeuLinkComponents),
        componentMapIdToParameterSet:getComponentMapIdToParameterSet(psyNeuLinkComponents)
    }
};

const mapDispatchToProps = dispatch => ({
    setStyleSheet: graphStyle => {dispatch(setStyleSheet(graphStyle))},
    setActiveComposition: name => {dispatch(setActiveComposition(name))},
    registerParameters: ({ownerId, parameterSpecs}) => dispatch(registerParameters({ownerId, parameterSpecs})),
    registerComponent: ({id, name}) => dispatch(registerComponent({id, name})),
    addData: ({id, data}) => dispatch(addData({id, data}))
});

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

class WorkSpace extends React.PureComponent {
    constructor(props) {
        super(props);
        var w = window.innerWidth;
        var h = window.innerHeight;
        var sizingFactors = this.getInitialSizingFactors();
        this.state = {
            activeToolTip: '',
            xRes: w,
            yRes: h,
            rowOneHorizontalFactor: sizingFactors.rowOneHorizontalFactor,
            rowTwoHorizontalFactor: sizingFactors.rowTwoHorizontalFactor,
            verticalFactor: sizingFactors.verticalFactor,
            baselineRowOneH:sizingFactors.rowOneHorizontalFactor,
            baselineRowTwoH:sizingFactors.rowTwoHorizontalFactor,
            baselineVertical:sizingFactors.verticalFactor,
            graph: null,
            graphStyle:null,
            showSettings: false,
            mouse:null,
            filepath: null,
            activeComponent: 'graphview'
        };
        this.panelPadding = 10;
        this.panelMaxWidth = window.innerWidth - this.panelPadding * 7;
        this.panelMaxHeight = window.innerHeight - this.panelPadding * 7;
        this.name = 'workspace';
        this.dispatcher = new ErrorDispatcher(this);
        this.container = {};
        // window.this = this;
        this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
        this.bindThisToFunctions();
        this.setMenu();
        this.setupIpcEvents();
        this.rpcClient = rpcClient;
    }

    bindThisToFunctions(){
        this.getCurrentGraphStyle = this.getCurrentGraphStyle.bind(this);
        this.getReferenceSizingFactors = this.getReferenceSizingFactors.bind(this);
        this.setGraphSize = this.setGraphSize.bind(this);
        this.chooseComposition = this.chooseComposition.bind(this);
        this.componentWillMount = this.componentWillMount.bind(this);
        this.panelResize = this.panelResize.bind(this);
        this.getMouseInitial = this.getMouseInitial.bind(this);
        this.setToolTip = this.setToolTip.bind(this);
        this.windowResize = this.windowResize.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.validateServerStatusAndLoadScript = this.validateServerStatusAndLoadScript.bind(this);
        this.handleErrors = this.handleErrors.bind(this);
        this.saveMouseData = this.saveMouseData.bind(this);
        this.setActiveComponent = this.setActiveComponent.bind(this);
        this.setupIpcEvents = this.setupIpcEvents.bind(this);
        this.handleParameterList = this.handleParameterList.bind(this);
        this.handleComponentList = this.handleComponentList.bind(this);
        this.handleIncomingData = this.handleIncomingData.bind(this);
    };

    componentDidMount() {
        var self = this,
            padding = 10
        this.getInitialFilepath();
    }

    setupIpcEvents() {
        ipcRenderer.on('parameterList', this.handleParameterList);
        ipcRenderer.on('componentList', this.handleComponentList);
        ipcRenderer.on('runData', this.handleIncomingData);
    }

    handleIncomingData(event, message) {
        let {componentMapIdToParameterSet: idToParameters,
            componentMapNameToId: nameToId,
            psyNeuLinkMapIdToName: idToName,
            addData} = this.props;
        let ownerName = message.componentName;
        let ownerId = nameToId[ownerName];
        let ownerParameters = idToParameters[ownerId];
        for (const id of ownerParameters){
            if (idToName[id] == message.parameterName){
                addData({id: id, data: message})
            }
        }
    }

    handleParameterList(event, message) {
        let idSet = new Set([...this.props.psyNeuLinkIdSet]);
        let {ownerName, parameters} = message;
        let ownerId = this.props.componentMapNameToId[ownerName];
        let parameterSpecs = {};
        parameters.forEach(p=>{
            let id = createId(idSet, PNL_PREFIX, ID_LEN);
            idSet.add(id);
            parameterSpecs[id] = p
        });
        this.props.registerParameters({ownerId: ownerId, parameterSpecs: parameterSpecs})
    }

    handleComponentList(event, message) {
        let idSet = new Set([...this.props.psyNeuLinkIdSet]);
        message.forEach(m=>{
            let id = createId(idSet, PNL_PREFIX, ID_LEN);
            idSet.add(id);
            this.props.registerComponent({id:id, name:m});
        });
        this.setState({components:message})
    }

    getInitialFilepath() {
        var config = fs.getConfig(),
            filepath = config.env.filepath;
        if (filepath){
            this.validateServerStatusAndLoadScript(filepath);
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
                            self.fileSelectionDialog()
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
                            window.electronRoot.open_log_file();
                        }
                    },
                    {
                        label: 'Show Debug Log in Finder',
                        accelerator: 'CmdOrCtrl+Shift+L',
                        click() {
                            window.electronRoot.open_log_folder();
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

    fileSelectionDialog() {
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
                    self.validateServerStatusAndLoadScript(pathArray[0]);
                }
            }
        )
    }

    loadScript(filepath) {
        var win;
        var self = this;
        win = window.remote.getCurrentWindow();
        self.setState({'filepath':filepath});
        rpcClient.load_script(filepath, (err) => {
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
                    var compositions = rpcClient.script_maintainer.compositions;
                    var composition = compositions[compositions.length - 1];
                    rpcClient.get_components(composition);
                    this.filepath = filepath
                    rpcClient.get_json(composition, function (err) {
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
                        self.setStateFromRpcClient()
                        }
                    )
                }
            }
        );
    }

    setStateFromRpcClient(){
        var self = this,
            filepath = this.filepath,
            compositions = rpcClient.script_maintainer.compositions,
            composition = compositions[compositions.length - 1],
            newGraph = Object.assign({}, JSON.parse(JSON.stringify(rpcClient.script_maintainer.gv))),
            newGraphStyle = Object.assign({}, JSON.parse(JSON.stringify(rpcClient.script_maintainer.style))),
            cf = Object.assign({}, fs.getConfig());
        cf.env.filepath = filepath;
        fs.setConfig(cf);
        this.props.setStyleSheet(newGraphStyle);
        this.props.setActiveComposition(composition);
        self.setState({
            graph: newGraph,
            filepath: filepath,
        });
        var homedir = window.remote.app.getPath('home');
        if (filepath.startsWith(homedir)){
            filepath = `~${filepath.slice(homedir.length)}`
        }
        fs.watch(filepath, (e)=>{
            window.dispatchEvent(new Event(e));
            self.getCurrentGraphStyle()
        });
        window.remote.getCurrentWindow().setTitle(`${composition} \u2014 ${filepath}`)
    }

    async validateServerStatusAndLoadScript(filepath) {
        var self, previous_title, win;
        self = this;
        win = window.remote.getCurrentWindow();
        self.filepath = filepath;
        self.setState({graph: "loading"}, ()=>{win.setTitle('PsyNeuLinkView')});
        window.electronRoot.addRecentDocument(filepath);
        // self.loadScript(filepath)
        interp.restartRPCServer(
            ()=>{
                self.loadScript(filepath)
            },
        );
    }

    getInitialSizingFactors() {
        var w = window.innerWidth,
            h = window.innerHeight,
            rowOneH = null,
            rowTwoH = null,
            v = null;
        if (!rowOneH) {
            rowOneH = Math.ceil(w * 0.2)
        }
        if (!rowTwoH) {
            rowTwoH = Math.ceil(w * 0.2)
        }
        if (!v) {
            v = Math.ceil(h * 0.7)
        }
        return(
            {
                rowOneHorizontalFactor: rowOneH,
                rowTwoHorizontalFactor: rowTwoH,
                verticalFactor: v
            }
        )
    }


    getCurrentGraphStyle(){
        var self = this;
        this.rpcClient.get_style(self.filepath, function (err) {
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
                var new_graph_style = JSON.parse(JSON.stringify(rpcClient.script_maintainer.style));
            } catch {
                var new_graph_style = {};
            }
            self.props.setStyleSheet(new_graph_style);
        })
    }


    chooseComposition() {
        var compositions = this.container.json.compositions;
        var chosenComposition = null;
        if (compositions.length === 0) {
        } else if (compositions.length === 1) {
            chosenComposition = compositions[0]
        } else {
            //TODO: add handling for multiple compositions
        }
        return chosenComposition
    }

    setToolTip(text) {
        var stateWithNewText = {...this.state.active_tooltip};
        stateWithNewText = text;
        this.setState({active_tooltip: stateWithNewText})
    }

    getMouseInitial() {
        this.mouse_initial = this.state.mouse
    }

    getReferenceSizingFactors(horizontal, vertical){
        // this.reference_factors = {
        //     horizontal_key:horizontal,
        //     horizontal_value:this.state[horizontal],
        //     vertical_key:vertical,
        //     vertical_value:this.state[vertical]
        // }
    }

    windowResize() {
        var oldXRes = this.state.xRes;
        var oldYRes = this.state.yRes;
        var oldR1HFactor = this.state.rowOneHorizontalFactor;
        var oldR2HFactor = this.state.rowTwoHorizontalFactor;
        var oldVFactor = this.state.verticalFactor;
        var w = window.innerWidth;
        var h = window.innerHeight;
        var newR1HFactor = (oldR1HFactor / oldXRes) * w;
        var newR2HFactor = (oldR2HFactor / oldXRes) * w;
        var newVFactor = (oldVFactor / oldYRes) * h;
        this.setState({
            xRes: w,
            yRes: h,
            rowOneHorizontalFactor: (oldR1HFactor / oldXRes) * w,
            rowTwoHorizontalFactor: (oldR2HFactor / oldXRes) * w,
            verticalFactor: (oldVFactor / oldYRes) * h,
            baselineRowOneH: newR1HFactor,
            baselineRowTwoH: newR2HFactor,
            baselineVertical: newVFactor
        });
        this.forceUpdate()
    }

    panelResize(e, direction, ref, d) {
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

    setGraphSize(width=this.state.rowOneHorizontalFactor,
                 height=this.state.verticalFactor,
                 callback=()=>{}){
        // This is a hook to allow child element graphview to set its own size.
        // Current horizontal factor attribute is set with respect to the first element in row.
        //  We subtract from one here so that calls to this method refer to the size of the actual
        //  graphview element instead.
        //
        // Args are passed in percents, so we need to convert them to fractions.

        var padding = this.panelPadding,
            newHFactor = window.innerWidth-((window.innerWidth)*(width/100)+padding*2)-1,
            newVFactor = (window.innerHeight)*(height/100)+padding;
        this.setState(
            {
                rowOneHorizontalFactor:newHFactor,
                verticalFactor:newVFactor
            },
            callback
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {componentMapNameToId, componentMapIdToParameterSet} = this.props;
        const registeredParameters = Object.keys(componentMapIdToParameterSet);
        if (!(_.isEqual(prevProps.componentMapNameToId, componentMapNameToId))){
            for (const [name, id] of Object.entries(componentMapNameToId)){
                if (!(id in registeredParameters) && !(name in prevProps.componentMapNameToId)){
                    rpcClient.get_parameters(name);
                }
            }
        }
    }

    componentWillUnmount() {
        // window.removeEventListener('mousemove', this.saveMouseData);
        window.removeEventListener('resize', this.windowResize);
        // window.removeEventListener('change', this.on_change)
    }

    componentWillMount() {
        // window.addEventListener('mousemove', this.saveMouseData);
        window.addEventListener('resize', this.windowResize);
        // window.addEventListener('change', this.on_change)
    }

    on_change(e) {
    }

    saveMouseData(e) {
        this.setState({mouse: e})
    }

    toggleDialog = () => {
        var interpreterPath_is_blank = !fs.getConfig()['Python']['Interpreter Path'];
        if (!interpreterPath_is_blank) {
            this.setState({show_settings: !this.state.show_settings});
        }
    };

    handleErrors() {
        this.dispatcher.emit()
    }

    onResize(e, direction, ref, d) {
        // this.panelResize('rowOneHorizontalFactor', 'verticalFactor', e, direction, ref, d)
        // window.dispatchEvent(new Event('resize'));
    }

    setActiveComponent(component, callback=()=>{}){
        // this.setState({'activeComponent':component}, callback)
    }

    renderLog(message){
    }

    render() {
        // var interpreterPath_is_blank = !fs.getConfig()['Python']['Interpreter Path'];
        // var interpreterPath_is_blank = false;
        // if (!this.state.showSettings && interpreterPath_is_blank) {
        //     this.setState({showSettings: true})
        // }
        var self = this;
        var padding = 10,
            sidebar = <div key="sidebar">
                <SideBar
                    hover={() => this.setToolTip('sidebar')}
                    className='pnl-panel'
                    onResize={
                        // self.panelResize
                        (e, dir, ref, delta)=>{
                            console.log("it's resizing");
                            this.setState(
                                {
                                    rowOneHorizontalFactor:this.state.baselineRowOneH + delta.width,
                                    verticalFactor:this.state.baselineVertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baselineRowOneH:this.state.baselineRowOneH + delta.width,
                                    baselineVertical:this.state.baselineVertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.verticalFactor - padding,
                            width: this.state.rowOneHorizontalFactor - padding
                        }
                    }
                    maxWidth = {
                        this.panelMaxWidth
                    }
                    maxHeight = {
                        this.panelMaxHeight
                    }
                />
            </div>,
            graphview = <div key="graphview">
                <GraphView
                    className='pnl-panel'
                    onResize={
                        // self.panelResize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    rowOneHorizontalFactor:this.state.baselineRowOneH - delta.width,
                                    verticalFactor:this.state.baselineVertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baselineRowOneH:this.state.baselineRowOneH - delta.width,
                                    baselineVertical:this.state.baselineVertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.verticalFactor - padding,
                            width: this.state.xRes - this.state.rowOneHorizontalFactor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panelMaxWidth
                    }
                    maxHeight = {
                        this.panelMaxHeight
                    }
                    location = {
                        {
                            x:this.state.rowOneHorizontalFactor,
                            y:0
                        }
                    }
                    graph={this.state.graph}
                    // graphStyle = {this.state.graphStyle}
                    filepath = {this.state.filepath}
                    graph_size_fx = {this.setGraphSize}
                />
            </div>,
            plotter =  <div key="plotter">
                <D3plotter
                    className='pnl-panel'
                    onResize={
                        // self.panelResize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    rowOneHorizontalFactor:this.state.baselineRowOneH - delta.width,
                                    verticalFactor:this.state.baselineVertical + delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baselineRowOneH:this.state.baselineRowOneH - delta.width,
                                    baselineVertical:this.state.baselineVertical + delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.verticalFactor - padding,
                            width: this.state.xRes - this.state.rowOneHorizontalFactor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panelMaxWidth
                    }
                    maxHeight = {
                        this.panelMaxHeight
                    }
                    location = {
                        {
                            x:this.state.rowOneHorizontalFactor - padding,
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
                        // self.panelResize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    rowTwoHorizontalFactor:this.state.baselineRowTwoH + delta.width,
                                    verticalFactor:this.state.baselineVertical - delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    baselineRowTwoH:this.state.baselineRowTwoH + delta.width,
                                    baselineVertical:this.state.baselineVertical - delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.yRes - this.state.verticalFactor - padding * 6,
                            width: this.state.rowTwoHorizontalFactor - padding
                        }
                    }
                    maxWidth = {
                        this.panelMaxWidth
                    }
                    maxHeight = {
                        this.panelMaxHeight
                    }
                />

            </div>,
            paramcontrolbox =
                <div key="paramcontrol">
                <ParameterControlBox
                    text={this.state.active_tooltip}
                    className='pnl-panel'
                    onResize={
                        // self.panelResize
                        (e, dir, ref, delta)=>{
                            this.setState(
                                {
                                    rowTwoHorizontalFactor:this.state.baselineRowTwoH - delta.width,
                                    verticalFactor:this.state.baselineVertical - delta.height
                                }
                            )
                        }
                    }
                    onResizeStop={
                        (e, dir, ref, delta)=>{
                            console.log('stop')
                            this.setState(
                                {
                                    baselineRowTwoH:this.state.baselineRowTwoH - delta.width,
                                    baselineVertical:this.state.baselineVertical - delta.height
                                },
                                this.forceUpdate
                            )
                        }
                    }
                    size={
                        {
                            height: this.state.yRes - this.state.verticalFactor - padding * 6,
                            width: this.state.xRes - this.state.rowTwoHorizontalFactor - padding * 2
                        }
                    }
                    maxWidth = {
                        this.panelMaxWidth
                    }
                    maxHeight = {
                        this.panelMaxHeight
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
                    width={window.innerWidth-this.panelPadding*2}
                    activePanelControl={this.setActiveComponent}
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
                                w: this.state.rowOneHorizontalFactor,
                                h: this.state.verticalFactor
                            },
                            {
                                i: this.props.activeView,
                                x: this.state.rowOneHorizontalFactor,
                                y: 0,
                                w: this.state.xRes - this.state.rowOneHorizontalFactor - this.panelPadding,
                                h: this.state.verticalFactor
                            },
                            {
                                i: 'tipbox',
                                x: 0,
                                y: this.state.verticalFactor,
                                w: this.state.rowTwoHorizontalFactor,
                                h: this.state.yRes - this.state.verticalFactor - this.panelPadding * 6
                            },
                            {
                                i: 'paramcontrol',
                                x: this.state.rowTwoHorizontalFactor,
                                y: this.state.verticalFactor,
                                w: this.state.xRes - this.state.rowTwoHorizontalFactor,
                                h: this.state.yRes - this.state.verticalFactor - this.panelPadding * 6
                            }
                        ]}
                        rowHeight={1}
                        cols={this.state.xRes}
                        width={this.state.xRes}
                        // cols={this.state.xRes}
                        // width={this.state.xRes}
                        components={components}
                    />
                </DndProvider>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WorkSpace)
