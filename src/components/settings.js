import * as React from 'react'
import {Dialog, Tree, EditableText, Spinner, Callout, Icon, Button} from '@blueprintjs/core'
import Layout from "./layout";
import '../css/settings.css'
import IndicatorLight from "./indicator_light";
import {Resizable} from "re-resizable";
import ResizableDialog from "./resizable_dialog"

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const config_client = window.config_client;
const fs = window.interfaces.filesystem,
      interp = window.interfaces.interpreter,
      validate_interpreter_path = interp.validate_interpreter_path;
// console.log(window.interfaces)

class SettingsPane extends React.Component {
    constructor(props) {
        super();
        var id_counter = 0;
        var config = fs.get_config();
        var categories = Object.keys(config);
        var nodes = [];
        for (var i in categories) {
            nodes.push(
                {
                    id: id_counter,
                    hasCaret: false,
                    label: categories[i],
                    isSelected: i == 0
                }
            );
            id_counter += 1;
        }
        this.state = {
            isOpen: props.isOpen,
            nodes: nodes,
            selectedCat: 0,
            config: config,
            interpreterPathStatus: 'loading'
        };
        this.buildSettingsTemplate = this.buildSettingsTemplate.bind(this);
        this.generateSettingsPage = this.generateSettingsPage.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.checkInterpreterPath = this.checkInterpreterPath.bind(this);
        this.checkInterpreterPath(config['Python']['Interpreter Path']);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.isOpen !== this.props.isOpen) {
        }
    }

    handleNodeClick = (nodeData, _nodePath, e) => {
        if (this.generateSettingsPage(nodeData.label)) {
            this.forEachNode(this.state.nodes, n => (n.isSelected = false));
            nodeData.isSelected = true;
            this.setState(this.state);
            this.setState({"selectedCat": nodeData.id});
        }
    };

    handleNodeCollapse = (nodeData) => {
        nodeData.isExpanded = false;
        this.setState(this.state)
    };

    handleNodeExpand = (nodeData) => {
        nodeData.isExpanded = true;
        this.setState(this.state)
    };

    handleOptionEdit = (input) => {
    };

    forEachNode(nodes, callback) {
        if (nodes == null) {
            return
        }

        for (const node of nodes) {
            this.forEachNode(node.childNodes, callback);
            callback(node)
        }
    }

    checkInterpreterPath(filepath){
        var self = this;
        if (!filepath){
            self.setState({interpreterPathStatus:'unsure'});
        }
        else{
            self.setState({interpreterPathStatus:'loading'});
            self.forceUpdate();
            validate_interpreter_path(
                filepath,
                (err, stdout, stderr) => {
                    if(err){
                        self.setState({interpreterPathStatus:'bad'})
                    }
                    else{
                        self.setState({interpreterPathStatus:'good'})
                    }
                    self.forceUpdate();
                }
            )
        }
    }

    buildSettingsTemplate() {
        var self = this;
        var option_id_index = 0;

        function get_next_option_id() {
            var current_id = "option_id_" + option_id_index;
            option_id_index += 1;
            return current_id
        }

        var keys = {
            'interpreterPathLabel': '0',
            'interpreterPathField': '1',
            'interpreterPathIcon': '2',
            'interpreterPathIndicator': '3',
            'pnlPathLabel': '4',
            'pnlPathField': '5',
            'pnlPathIcon': '6',
            'pnlPathIndicator': '7'
        };

        var current_config = {...this.state.config};
        var categories = Object.keys(current_config);
        categories['Python'] = {
            'components': [
                <div key={keys.interpreterPathLabel}>
                    {'Interpreter Path'}
                </div>,
                <div key={keys.interpreterPathField}>
                    <div className={'sizer'}>
                        <EditableText
                            placeholder={'location of Python interpreter executable file'}
                            defaultValue={current_config['Python']['Interpreter Path']}
                            value={current_config['Python']['Interpreter Path']}
                            onChange={
                                (new_value) => {
                                    current_config['Python']['Interpreter Path'] = new_value;
                                    self.setState({config: current_config});
                                    self.checkInterpreterPath(new_value);
                                }
                            }
                        />
                    </div>
                </div>,
                <div key={keys.interpreterPathIcon}>
                    <Icon
                        icon={"folder-open"}
                        color={"gray"}
                        style={{
                            cursor: "pointer"
                        }}
                        onClick={function () {
                            window.dialog.showOpenDialog(
                                window.getCurrentWindow(),
                                {
                                    properties: ['openFile']
                                }
                            ).then((paths) => {
                                var pathArray = paths.filePaths;
                                if (pathArray.length > 0) {
                                    current_config['Python']['Interpreter Path'] = paths.filePaths[0];
                                    self.setState({config: current_config});
                                    self.checkInterpreterPath(current_config['Python']['Interpreter Path'])
                                }
                            })
                        }}
                    />
                </div>,
                <div key={keys.interpreterPathIndicator}>
                    <IndicatorLight
                        className={'interpreter-indicator-light'}
                        status={self.state.interpreterPathStatus}/>
                </div>,
                <div key={keys.pnlPathLabel}>
                    {'PsyNeuLink Path'}
                </div>,
                <div key={keys.pnlPathField}>
                    <div className={'sizer'}>
                        <EditableText
                            placeholder={'location of PsyNeuLink directory (if not in Python site packages)'}
                            defaultValue={current_config['Python']['PsyNeuLink Path']}
                            value={current_config['Python']['PsyNeuLink Path']}
                            onChange={
                                (new_value) => {
                                    current_config['Python']['Interpreter Path'] = new_value;
                                    this.setState({config: current_config});
                                }
                            }
                        />
                    </div>
                </div>,
                <div key={keys.pnlPathIcon}>
                    <Icon
                        icon={"folder-open"}
                        color={"gray"}
                        style={{
                            cursor: "pointer"
                        }}
                        onClick={function () {
                            window.dialog.showOpenDialog(
                                window.getCurrentWindow(),
                                {
                                    properties: ['openDirectory']
                                }
                            ).then((paths) => {
                                var pathArray = paths.filePaths;
                                if (pathArray.length > 0) {
                                    current_config['Python']['PsyNeuLink Path'] = paths.filePaths[0];
                                    self.setState({config: current_config});
                                }
                            })
                        }}
                    />
                </div>,
            ],
            'layout': [
                {
                    i: keys.interpreterPathLabel,
                    x: 0,
                    y: 0,
                    w: 150,
                    h: 1
                },
                {
                    i: keys.interpreterPathField,
                    x: 150,
                    y: 0,
                    w: 400,
                    h: 1
                },
                {
                    i: keys.interpreterPathIcon,
                    x: 560,
                    y: 0,
                    h: 1,
                    w: 20
                },
                {
                    i: keys.interpreterPathIndicator,
                    x: 600,
                    y: 0,
                    h: 1,
                    w: 20
                },
                {
                    i: keys.pnlPathLabel,
                    x: 0,
                    y: 1,
                    w: 150,
                    h: 1
                },
                {
                    i: keys.pnlPathField,
                    x: 150,
                    y: 1,
                    w: 400,
                    h: 1
                },
                {
                    i: keys.pnlPathIcon,
                    x: 560,
                    y: 1,
                    h: 1
                },
            ]
        };
        return categories
    }

    generateSettingsPage(category) {
        return this.buildSettingsTemplate()[category]
    }

    render() {
        var self = this;
        var components_and_layout = this.generateSettingsPage(this.state.nodes[this.state.selectedCat]['label']);
        var components = components_and_layout['components'];
        var layout = components_and_layout['layout'];
        components = [
            <div key="a">
                <Tree
                    contents={this.state.nodes}
                    onNodeClick={this.handleNodeClick}
                    onNodeCollapse={this.handleNodeCollapse}
                    onNodeExpand={this.handleNodeExpand}
                    className={"config_tree"}
                />
            </div>,
            <div key="b">
                <div className={'options_panel'} style={{'width': '700', 'height': '100%'}}>
                    <Layout
                        className={'options_grid'}
                        margin={[0, 0]}
                        cols={700}
                        width={700}
                        rowHeight={25}
                        components={components}
                        layout={layout}
                    />
                </div>
            </div>
        ];
        return (
            <Dialog
                className={"settings-dialog"}
                icon="settings"
                isOpen={this.props.isOpen}
                onClose={function () {
                    self.props.toggleDialog()
                }}
                title="Preferences"
                style={{
                    "width": 840,
                    "height": 490
                }}
                usePortal={true}
            >
                <Layout
                    className={'workspace_grid'}
                    margin={[0, 0]}
                    cols={820}
                    width={820}
                    rowHeight={400}
                    components={components}
                    layout={[
                        {
                            i: 'a',
                            x: 0,
                            y: 0,
                            w: 150,
                            h: 1
                        },
                        {
                            i: 'b',
                            x: 160,
                            y: 0,
                            w: 660,
                            h: 1
                        },
                    ]}
                />
                <div class={"ButtonDiv"}>
                    <Button
                        className={"settings_button"}
                        onClick={
                            function () {
                                fs.set_config(self.state.config);
                                self.props.toggleDialog();
                            }
                        }
                    >
                        OK
                    </Button>
                    <Button
                        className={"settings_button"}
                        onClick={
                            function () {
                                fs.set_config(self.state.config);
                            }
                        }
                    >
                        Apply
                    </Button>
                    <Button
                        className={"settings_button"}
                        onClick={
                            function () {
                                fs.set_config(self.state.config);
                                self.setState({config: fs.get_config()})
                            }
                        }
                    >
                        Cancel
                    </Button>

                </div>
            </Dialog>
        );
    }
}

export default SettingsPane