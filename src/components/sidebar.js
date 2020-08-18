import * as React from 'react'
import { Classes, Tree } from '@blueprintjs/core'
import '../css/sidebar.css'
import { Resizable } from "re-resizable"
import {connect} from "react-redux";
import {setActiveView, setStyleSheet} from "../app/redux/actions";
import {store} from "../app/redux/store";
import {DragSource, useDrag, DragPreviewImage, DropTarget} from 'react-dnd';
import { ItemTypes } from './constants';
import DraggableTreeNode from "./treenode";
import { getEmptyImage } from 'react-dnd-html5-backend'

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// DnD Spec
const PlotSpec = {
  drop(){
  }
}

// DnD DropTarget - collect
let collect = ( connect, monitor )=>{
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop()
  };
}

class SideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      nodes: PLOTVIEW_NODES,
      class: props.className !== undefined ? `${Classes.ELEVATION_0} ${props.className}`:Classes.ELEVATION_0
    }
  }

  componentDidUpdate() {
  }

  render() {
    const connectDropTarget = this.props.connectDropTarget;
    let nodes = this.props.activeView === 'graphview' ? GRAPHVIEW_NODES : PLOTVIEW_NODES
    return connectDropTarget(
        <div>
          <Resizable
              style={style}
              onResize={this.props.onResize}
              onResizeStart={this.props.onResizeStart}
              onResizeStop={this.props.onResizeStop}
              enable={{
                top: false,
                right: true,
                bottom: true,
                left: false,
                topRight: false,
                bottomRight: true,
                bottomLeft: false,
                topLeft: false
              }}
              className='sidebar'
              // defaultSize={
              //   this.props.defaultSize
              // }
              size={
                this.props.size
              }
              minHeight={
                40
              }
              minWidth={
                40
              }
              maxWidth={
                this.props.maxWidth
              }
              maxHeight={
                this.props.maxHeight
              }
          >

            <Tree
                contents={nodes}
                onNodeClick={(nodeData, _nodePath, e) =>
                    this.handleNodeClick(nodes, nodeData, _nodePath, e)
                }
                onNodeCollapse={this.handleNodeCollapse}
                onNodeExpand={this.handleNodeExpand}
                className={this.state.class}
            />
          </Resizable>
        </div>
    )
  }

  handleNodeClick = (nodeList, nodeData, _nodePath, e) => {
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

// var PLOTVIEW_NODES = [
//   <DraggableTreeNode
//       id = {0}
//       icon = {'folder-close'}
//       hasCaret = {false}
//       isExpanded = {true}
//       label = {'Components'}
//   />
// ]

var PLOTVIEW_NODES = [
  {
    id: 0,
    label: <DraggableTreeNode
        id={0}
        label={'Line Graph'}/>
  },
  {
    id: 1,
    label:  <DraggableTreeNode
        id={1}
        label={'Bar Graph'}/>
  }
];

const GRAPHVIEW_NODES = [
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

const mapStateToProps = state => {
  return {
    activeView: state.activeView,
  }
};

export default DropTarget(ItemTypes.PLOT, PlotSpec, collect)(connect(mapStateToProps)(SideBar))