import * as React from 'react'
import {Dialog, Tree, EditableText, Callout} from '@blueprintjs/core'
import Layout from "./layout";
import '../css/settings.css'
import {Resizable} from "re-resizable";
import ResizableDialog from "./resizable_dialog"

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

    generateSettingsPage(category) {
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
                components.push(
                    <div key={field_id}>
                        <div className={'sizer'}>
                            <EditableText
                                placeholder={'...'}
                                defaultValue={cat_set[1]}
                                value={cat_set[1]}
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
                        w: 6,
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
                <div className={'options_panel'} style={{'width': '100%', 'height': '100%'}}>
                    <Layout
                        className={'options_grid'}
                        margin={[0, 0]}
                        cols={10}
                        width={420}
                        rowHeight={50}
                        components={components}
                        layout={layout}
                    />
                </div>
            </div>
        ];
        return (
            <div className = "Hm">
                <Resizable>
                    <Dialog
                        icon="settings"
                        isOpen={this.props.isOpen}
                        onClose={function () {
                            self.props.toggleDialog()
                        }}
                        title="Settings"
                        style={{"width": 600}}
                        usePortal={false}
                    >
                            <Layout
                                className={'workspace_grid'}
                                margin={[0, 0]}
                                cols={580}
                                width={580}
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
                                        w: 420,
                                        h: 1
                                    },
                                ]}
                            />
                    </Dialog>
                </Resizable>
            </div>
        );
    }
}

export default SettingsPane