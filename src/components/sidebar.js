import * as React from 'react'

import { Classes, Tree } from '@blueprintjs/core'
import '../css/sidebar.css'

import { Resizable } from "re-resizable"

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nodes: INITIAL_STATE,
      class: props.className !== undefined ? `${Classes.ELEVATION_0} ${props.className}`:Classes.ELEVATION_0
    }
  }

  render() {
    return (
      <Resizable
        style={style}
        onResize={this.props.onResize}
        onResizeStart={this.props.onResizeStart}
        onResizeStop={this.props.onResizeStop}
        enable={{
          top:false, right:true, bottom:true, left:false, topRight:false, bottomRight:true, bottomLeft:false, topLeft:false }}
        className='sidebar'
        // defaultSize={
        //   this.props.defaultSize
        // }
        size={
          this.props.size
        }
      >
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={this.state.class}
        />
      </Resizable>
    )
  }

  handleNodeClick = (nodeData, _nodePath, e) => {
    const originallySelected = nodeData.isSelected
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, n => (n.isSelected = false))
    }
    nodeData.isSelected = originallySelected == null ? true : !originallySelected
    this.setState(this.state)
  }

  handleNodeCollapse = (nodeData) => {
    nodeData.isExpanded = false
    this.setState(this.state)
  }

  handleNodeExpand = (nodeData) => {
    nodeData.isExpanded = true
    this.setState(this.state)
  }

  forEachNode(nodes, callback) {
    if (nodes == null) {
      return
    }

    for (const node of nodes) {
      this.forEachNode(node.childNodes, callback)
      callback(node)
    }
  }
}

const INITIAL_STATE = [
  {
    id: 0,
    icon: 'folder-close',
    hasCaret: false,
    isExpanded: true,
    label: 'Components',
    childNodes: [
      {
        id: 1,
        icon: 'folder-close',
        label: 'Mechanisms',
        hasCaret: false,
        isExpanded: true,
        childNodes: [
          {
            id: 2,
            icon: 'folder-close',
            label: 'Adaptive',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 3,
                icon: 'folder-close',
                label: 'Control',
                hasCaret: false,
                isExpanded: true,
                childNodes: [
                  {
                    id: 4,
                    icon: 'cog',
                    label: 'Control Mechanism'
                  },
                  {
                    id: 5,
                    icon: 'cog',
                    label: 'Optimization Control Mechanism'
                  },
                ]
              }
            ],
          },
          {
            id: 6,
            icon: 'folder-close',
            label: 'Gating',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 7,
                icon: 'cog',
                label: 'Gating Mechanism'
              }
            ],
          },
          {
            id: 8,
            icon: 'folder-close',
            label: 'Learning',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 7,
                icon: 'cog',
                label: 'Learning Mechanism'
              }
            ],
          },
          {
            id: 9,
            icon: 'folder-close',
            label: 'Processing',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 10,
                icon: 'cog',
                label: 'Integrator Mechanism'
              },
              {
                id: 11,
                icon: 'cog',
                label: 'Objective Mechanism'
              },
              {
                id: 12,
                icon: 'cog',
                label: 'Processing Mechanism'
              },
              {
                id: 13,
                icon: 'cog',
                label: 'Transfer Mechanism'
              }
            ],
          }
        ]
      },
      {
        id: 14,
        icon: 'folder-close',
        label: 'Projections',
        hasCaret: false,
        isExpanded: true,
        childNodes: [
          {
            id: 15,
            icon: 'folder-close',
            label: 'Modulatory',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 16,
                icon: 'inheritance',
                label: 'Control Projection'
              },
              {
                id: 17,
                icon: 'inheritance',
                label: 'Gating Projection'
              },
              {
                id: 18,
                icon: 'inheritance',
                label: 'Learning Projection'
              }
            ]
          },
          {
            id: 19,
            icon: 'folder-close',
            label: 'Pathway',
            hasCaret: false,
            isExpanded: true,
            childNodes: [
              {
                id: 20,
                icon: 'inheritance',
                label: 'Mapping Projection'
              },
              {
                id: 21,
                icon: 'inheritance',
                label: 'Pathway Projection'
              }
            ]
          }
        ]
      }
    ]
  },
]