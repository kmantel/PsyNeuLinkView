import * as React from 'react'
import { Spinner, Icon } from '@blueprintjs/core'

export default class IndicatorLight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: this.props.status
        };
        this.statusBindings = {
            'loading':
                <Spinner
                    small={true}
                    size={Spinner.SIZE_SMALL}
                />
            ,
            'bad':
                <Icon
                    icon={'error'}
                    color={'red'}
                />
            ,
            'good':
                <Icon
                    icon={'tick-circle'}
                    color={'green'}
                />
            ,
            'unsure':
                <Icon
                    icon={'help'}
                    color={'gray'}
                />
        };
        this.render = this.render.bind(this)
    }

    render() {
        var statusIcon = this.statusBindings[this.state.status];
        return (
            statusIcon
        )
    }
}