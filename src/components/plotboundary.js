import React, { PureComponent } from 'react';
import { DropTarget } from 'react-dnd'
import {ItemTypes} from "./constants";

const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const PlotSpec = {
    drop(props, monitor, component){
        return {dropped:true}
    }
};

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop()
    };
};

class PlotBoundary extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {connectDropTarget, isOver, canDrop} = this.props;
        var id = this.props.id,
            direction = this.props.direction,
            active = isOver && canDrop;
        return connectDropTarget(
            <div
                id={`${id}-${direction}-boundary`}
                className={
                    `subplot_boundary ${direction} ${active? 'selected' : ''}`}/>
        );
    }
}

PlotBoundary = DropTarget(ItemTypes.PLOT, PlotSpec, collect)(PlotBoundary)

class PlotBoundaries extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var id = this.props.id;
        return <div id={`${id}-boundaries`} className={'subplot_boundaries'}>
            <PlotBoundary
                id={id}
                direction={'left'}/>
            <PlotBoundary
                id={id}
                direction={'right'}/>
            <PlotBoundary
                id={id}
                direction={'top'}/>
            <PlotBoundary
                id={id}
                direction={'bottom'}/>
        </div>;
    }
}

export default PlotBoundaries
