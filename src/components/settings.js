import * as React from 'react'
import { Dialog, Tree, EditableText, Callout } from '@blueprintjs/core'
import Layout from "./layout";
import '../css/settings.css'

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};


class SettingsPane extends React.Component {
    constructor(props) {
        super();
        var id_counter = 0;
        var config = [];
        var categories = Object.keys(props.config);
        for (var i in categories){
            config.push(
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
            nodes:config
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

    handleOptionEdit = (input) => {
        console.log(input)
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

    toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    render() {
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
                                    defaultValue={this.props.config.Python.interpreter_path}
                                    onChange={this.handleOptionEdit}
                                />
                            </div>,
                            <div key={'e'}>
                                PsyNeuLink Path
                            </div>,
                            <div key={'f'}>
                                <EditableText
                                    placeholder={'...'}
                                    defaultValue={this.props.config.Python.psyneulink_path}/>
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
                    isOpen={this.state.isOpen}
                    onClose={this.toggleDialog}
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