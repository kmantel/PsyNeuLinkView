import React from 'react'
import ForceGrid from "./forcegrid";

export default class Layout extends React.PureComponent {
  constructor(props) {
    super(props);
    var isDraggable = props.isDraggable ? props.isDraggable : false;
    this.state = {
      isDraggable: isDraggable,
      forceLayoutSetState: this.props.forceLayoutSetState || []
    }
  }

  render() {
    return (
      <ForceGrid className={this.props.className}
                  layout={this.props.layout}
                  cols={this.props.cols}
                  width={this.props.width}
                  rowHeight={this.props.rowHeight}
                  margin={this.props.margin}
                  isDraggable={this.state.isDraggable}
                  onLayoutChange={this.props.onLayoutChange}
                  maxRows={this.props.maxRows}
                  preventCollision={this.props.preventCollision}
                  isResizable={false}
                  compactType={null}
                  forceSetState={this.state.forceLayoutSetState}
                  >
        {
          this.props.components
        }
      </ForceGrid>
    )
  }
}
