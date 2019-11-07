import * as React from 'react'
import {Dialog, Tree, EditableText, Callout} from '@blueprintjs/core'
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
        var config = {...config_client.get_config()};
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
            config: config
        };
    }

    handleNodeClick = (nodeData, _nodePath, e) => {
        this.forEachNode(this.state.nodes, n => (n.isSelected = false));
        nodeData.isSelected = true;
        this.setState(this.state);
        this.setState({"selectedCat":nodeData.id});
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

    generateSettings(category) {
        var option_id_index = 0;

        function get_next_option_id() {
            var current_id = "option_id_" + option_id_index;
            option_id_index += 1;
            return current_id
        }

        var current_config = {...this.state.config};

        //TODO: Add support for hierarchical nesting of arbitrary depth (currently only supports depth of 2)
        var category_settings = Object.entries(
            {...current_config[category]}
        );
        var components = [];
        var layout = [];
        var layout_depth_index = 0;
        category_settings.forEach(
            (cat_set) => {
                var label_id = get_next_option_id();
                var field_id = get_next_option_id();
                components.push(
                    <div key={label_id}>
                        {cat_set[0]}
                    </div>
                );
                var hack = cat_set[1];
                components.push(
                    <div key={field_id}>
                        {hack}
                        <div className={'sizer'} style={{"width": "60%"}}>
                            <EditableText
                                placeholder={'...'}
                                defaultValue={Math.random()}
                                onChange={
                                    (new_value) => {
                                        let newcf = {...this.state.config};
                                        current_config[category][cat_set[0]] = new_value;
                                        this.setState({config: current_config});
                                        config_client.set_config(current_config)
                                    }
                                }
                            />
                        </div>
                    </div>
                );
                layout.push(
                    {
                        i: label_id,
                        x: 0,
                        y: layout_depth_index,
                        w: 3,
                        h: 1
                    }
                );
                layout.push(
                    {
                        i: field_id,
                        x: 3,
                        y: layout_depth_index,
                        w: 7,
                        h: 1
                    }
                );
                layout_depth_index += 1;
            }
        );
        return {
            'components':components,
            'layout':layout
        }
    }

    // toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    render() {
        var self = this;
        var components_and_layout = this.generateSettings(this.state.nodes[this.state.selectedCat]['label']);
        var components = components_and_layout['components'];
        var layout = components_and_layout['layout'];
        console.log(layout)
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
                <div className={'options_panel'} style={{'width': '395px', 'height': '400px'}}>
                    <Layout
                        className={'options_grid'}
                        margin={[0, 0]}
                        cols={10}
                        width={500}
                        rowHeight={50}
                        components={components}
                        layout={layout}
                    />
                </div>
            </div>
        ];
        // var components = [
        //     <div key="a">
        //         <Tree
        //             contents={this.state.nodes}
        //             onNodeClick={this.handleNodeClick}
        //             onNodeCollapse={this.handleNodeCollapse}
        //             onNodeExpand={this.handleNodeExpand}
        //             className={"config_tree"}
        //         />
        //     </div>,
        //     <div key="b">
        //         <div className={'options_panel'} style={{'width': '395px', 'height': '400px'}}>
        //             <Layout
        //                 className={'options_grid'}
        //                 margin={[0, 0]}
        //                 cols={10}
        //                 width={500}
        //                 rowHeight={50}
        //                 components={[
        //                     <div key={'c'}>
        //                         Interpreter Path
        //                     </div>,
        //                     <div key={'d'}>
        //                         <div className={"sizer"} style={{"width": "60%"}}>
        //                             <EditableText
        //                                 placeholder={'...'}
        //                                 defaultValue={config_client.get_config().Python.interpreter_path}
        //                                 onChange={
        //                                     // TODO: GENERALIZE AND MOVE TO HANDLEOPTIONEDIT
        //                                     (new_value) => {
        //                                         let newcf = {...config_client.get_config()};
        //                                         newcf['Python']['interpreter_path'] = new_value;
        //                                         config_client.set_config(newcf)
        //                                     }
        //                                 }
        //                             />
        //                         </div>
        //                     </div>,
        //                     <div key={'e'}>
        //                         PsyNeuLink Path
        //                     </div>,
        //                     <div key={'f'}>
        //                         <div className={"sizer"} style={{"width": "60%"}}>
        //                             <EditableText
        //                                 placeholder={'...'}
        //                                 defaultValue={config_client.get_config().Python.psyneulink_path}
        //                                 onChange={
        //                                     // TODO: GENERALIZE AND MOVE TO HANDLEOPTIONEDIT
        //                                     (new_value) => {
        //                                         let newcf = {...config_client.get_config()};
        //                                         newcf['Python']['psyneulink_path'] = new_value;
        //                                         config_client.set_config(newcf)
        //                                     }
        //                                 }
        //                                 multiline={false}
        //                             />
        //                         </div>
        //                     </div>,
        //                 ]}
        //                 layout={[
        //                     {
        //                         i: 'c',
        //                         x: 0,
        //                         y: 0,
        //                         w: 3,
        //                         h: 1
        //                     },
        //                     {
        //                         i: 'd',
        //                         x: 3,
        //                         y: 0,
        //                         w: 7,
        //                         h: 1
        //                     },
        //                     {
        //                         i: 'e',
        //                         x: 0,
        //                         y: 1,
        //                         w: 3,
        //                         h: 1
        //                     },
        //                     {
        //                         i: 'f',
        //                         x: 3,
        //                         y: 1,
        //                         w: 7,
        //                         h: 1
        //                     },
        //                 ]}
        //             />
        //         </div>
        //     </div>
        // ];
        return (
            <div>
                <Dialog
                    icon="settings"
                    isOpen={this.props.isOpen}
                    onClose={function () {
                        self.props.toggleDialog()
                    }}
                    title="Settings"
                    style={{"width": 600}}
                >
                    <Layout
                        className={'workspace_grid'}
                        margin={[0, 0]}
                        cols={78}
                        width={500}
                        rowHeight={400}
                        components={components}
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