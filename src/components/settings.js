import * as React from 'react'
import { Dialog, Classes, Tree } from '@blueprintjs/core'
import Layout from "./layout";
import '../css/sidebar.css'

import { Resizable } from "re-resizable"

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};


class SettingsPane extends React.Component {
    constructor(props) {
        super();
        this.state = {
            isOpen: props.isOpen,
            config: props.config
        };
    }
    toggleDialog = () => this.setState({ isOpen: !this.state.isOpen });
    render() {
        var components = [
            <div key = "a">
                dafhdjkhafjdhfa
            </div>,
            <div key = "b">
                fdkslajflkjsdaflkj
            </div>
        ];
        return (
            <div>
                <Dialog
                    icon="settings"
                    isOpen={this.state.isOpen}
                    onClose={this.toggleDialog}
                    title="Settings"
                >
                    <Layout
                        className={'workspace_grid'}
                        margin={[0, 0]}
                        cols={4}
                        width={500}
                        rowHeight={400}
                        components = {components}
                        layout={[
                            {
                                i: 'a',
                                x: 0,
                                y: 0,
                                w: 1,
                                h: 1
                            },
                            {
                                i: 'b',
                                x: 1,
                                y: 0,
                                w: 3,
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