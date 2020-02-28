import React from 'react'
import '../css/controlstrip.css'

export default class ControlStrip extends React.Component {
    constructor(props){
        super(props)
    }
    render() {
        return (
            <div class={'controlstrip-container'}
                 style={
                     {
                         width:`${this.props.width}px`,
                         height:'20px'
                     }
                 }>
                <div class={'controlstrip pnl-panel'}
                />
            </div>
        )
    }
}