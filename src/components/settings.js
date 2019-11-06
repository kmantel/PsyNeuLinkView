import * as React from 'react'
import { Dialog, Tree, EditableText, Callout } from '@blueprintjs/core'
import Layout from "./layout";
import '../css/settings.css'

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const config_client = window.config_client;

class SettingsPane extends React.Component {
    constructor(props) {
        super();
        var id_counter = 0;
        var config = config_client.get_config();
        var categories = Object.keys(config);
        var nodes = [];
        for (var i in categories){
            nodes.push(
                {
                    id: id_counter,
                    hasCaret: false,
                    label: categories[i]
                }
            );
            id_counter += 1;
        }
        this.state = {
            isOpen: props.isOpen,
            nodes:nodes
        };
    }
    handleNodeClick = (nodeData, _nodePath, e) => {
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            this.forEachNode(this.state.nodes, n => (n.isSelected = false))
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected;
        this.setState(this.state)
    };

    handleNodeCollapse = (nodeData) => {
        nodeData.isExpanded = false;
        this.setState(this.state)
    };

    handleNodeExpand = (nodeData) => {
        nodeData.isExpanded = true;
        this.setState(this.state)
    };

    handleOptionEdit = (input) => {};

    forEachNode(nodes, callback) {
        if (nodes == null) {
            return
        }

        for (const node of nodes) {
            this.forEachNode(node.childNodes, callback);
            callback(node)
        }
    }

    // toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    render() {
        var self = this;
        var components = [
            <div key = "a">
                <Tree
                    contents={this.state.nodes}
                    onNodeClick={this.handleNodeClick}
                    onNodeCollapse={this.handleNodeCollapse}
                    onNodeExpand={this.handleNodeExpand}
                    className={"config_tree"}
                />
            </div>,
            <div key = "b">
                <div className={'options_panel'} style={{'width':'595px', 'height':'400px'}}>
                    <Layout
                        className={'options_grid'}
                        margin={[0,0]}
                        cols={10}
                        width={500}
                        rowHeight={50}
                        components={[
                            <div key={'c'}>
                                Interpreter Path
                            </div>,
                            <div key={'d'}>
                                <EditableText
                                    placeholder={'...'}
                                    defaultValue={config_client.get_config().Python.interpreter_path}
                                    onChange={
                                        // TODO: GENERALIZE AND MOVE TO HANDLEOPTIONEDIT
                                        (new_value)=>{
                                            let newcf = {...config_client.get_config()};
                                            newcf['Python']['interpreter_path'] = new_value
                                            config_client.set_config(newcf)
                                        }
                                    }
                                />
                            </div>,
                            <div key={'e'}>
                                PsyNeuLink Path
                            </div>,
                            <div key={'f'}>
                                <EditableText
                                    placeholder={'...'}
                                    defaultValue={config_client.get_config().Python.psyneulink_path}
                                    onChange={
                                        // TODO: GENERALIZE AND MOVE TO HANDLEOPTIONEDIT
                                        (new_value)=>{
                                            let newcf = {...config_client.get_config()};
                                            newcf['Python']['psyneulink_path'] = new_value;
                                            config_client.set_config(newcf)
                                        }
                                    }
                                />
                            </div>,
                        ]}
                        layout={[
                            {
                                i: 'c',
                                x: 0,
                                y: 0,
                                w: 3,
                                h: 1
                            },
                            {
                                i: 'd',
                                x: 3,
                                y: 0,
                                w: 7,
                                h: 1
                            },
                            {
                                i: 'e',
                                x: 0,
                                y: 1,
                                w: 3,
                                h: 1
                            },
                            {
                                i: 'f',
                                x: 3,
                                y: 1,
                                w: 7,
                                h: 1
                            },
                        ]}
                    />
                </div>
            </div>
        ];
        return (
            <div>
                <Dialog
                    icon="settings"
                    isOpen={this.props.isOpen}
                    onClose={function (){self.props.toggleDialog()}}
                    title="Settings"
                    style={{"width":800}}
                >
                    <Layout
                        className={'workspace_grid'}
                        margin={[0, 0]}
                        cols={78}
                        width={500}
                        rowHeight={400}
                        components = {components}
                        layout={[
                            {
                                i: 'a',
                                x: 0,
                                y: 0,
                                w: 28,
                                h: 1
                            },
                            {
                                i: 'b',
                                x: 29,
                                y: 0,
                                w: 49,
                                h: 1
                            },
                        ]}
                        />
                </Dialog>
            </div>
        );
    }
}

export default SettingsPane