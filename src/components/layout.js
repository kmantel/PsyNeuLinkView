import React from 'react'
import '../css/layout.css'
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'
import GridLayout from 'react-grid-layout'

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
    // this.componentDidMount = this.componentDidMount.bind(this)
  }

  render() {
    return (
      <GridLayout className={this.props.className}
                  layout={this.props.layout}
                  cols={this.props.cols}
                  width={this.props.width}
                  rowHeight={this.props.rowHeight}
                  margin={this.props.margin}
                  isDraggable={false}
                  isResizable={false}
                  >
        {
          this.props.components
        }
      </GridLayout>
    )
  }
}
