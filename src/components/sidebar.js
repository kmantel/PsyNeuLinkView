import * as React from 'react'
import { Classes, Tree, Icon } from '@blueprintjs/core'
import '../css/sidebar.css'
import { Resizable } from "re-resizable"
import {connect} from "react-redux";
import {setActiveView, setStyleSheet} from "../app/redux/actions";
import {store} from "../app/redux/store";
import {DragSource, useDrag, DragPreviewImage, DropTarget} from 'react-dnd';
import { ItemTypes } from './constants';
import DraggableTreeNode from "./treenode";
import { getEmptyImage } from 'react-dnd-html5-backend'
import {Select, List, Typography, Avatar, Button} from "antd";
import {PlusOutlined} from '@ant-design/icons'

const {Text} = Typography;

const style = {
  overflowY: "auto",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "start",
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


class SidebarSelect extends React.Component {
  components = ['Mechanisms', 'Projections'];

  constructor(props) {
    super(props);
    this.bindThisToFunctions = this.bindThisToFunctions.bind(this);
    this.bindThisToFunctions();
  }

  bindThisToFunctions(){
    var _ = this;
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
  }

  onBlur() {
  }

  onFocus() {
  }

  onSearch(val) {
  }
  render() {
    return (
        <Select
            showSearch
            style={{width: this.props.size.width}}
            placeholder="Select a component type"
            onChange={this.onChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onSearch={this.onSearch}
            bordered={false}
            filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
        >
          {this.components}
        </Select>)
  }
}


const structureData = [
  {
    categoryName: 'Control',
    components: [
      {
        id: 0,
        label: 'Control Mechanism',
        icon: 'cog'
      },
      {
        id: 1,
        label: 'Optimization Control Mechanism',
        icon: 'cog'
      },
      {
        id: 2,
        label: 'Control Projection',
        icon: 'inheritance'
      },
    ]
  },
  {
    categoryName: 'Gating',
    components: [
      {
        id: 3,
        label: 'Gating Mechanism',
        icon: 'cog'
      },
      {
        id: 4,
        label: 'Gating Projection',
        icon: 'inheritance'
      }
    ]
  },
  {
    categoryName: 'Learning',
    components: [
      {
        id: 5,
        label: 'Learning Mechanism',
        icon: 'cog'
      },
      {
        id: 6,
        label: 'Learning Projection',
        icon: 'inheritance'
      }
    ]
  },
  {
    categoryName: 'Processing',
    components: [
      {
        id: 7,
        label: 'Integrator Mechanism',
        icon: 'cog'
      },
      {
        id: 8,
        label: 'Objective Mechanism',
        icon: 'cog'
      },
      {
        id: 9,
        label: 'Processing Mechanism',
        icon: 'cog'
      },
      {
        id: 10,
        label: 'Transfer Mechanism',
        icon: 'cog'
      },
      {
        id: 11,
        label: 'Mapping Projection',
        icon: 'inheritance'
      },
      {
        id: 12,
        label: 'Pathway Projection',
        icon: 'inheritance'
      },
    ]
  },
];

const plottingData = [
  {categoryName: 'Plots',
    components: [
      {
        id: 13,
        label:
          <div className={'linePlotListItem'}>
            <DraggableTreeNode
              id={13}
              label={'Line Graph'}/>
          </div>,
        icon: 'timeline-line-chart'
      }

    ]
  }
];

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
    var nodes, listHeader;
    const connectDropTarget = this.props.connectDropTarget;
    if (this.props.activeView === 'graphview'){
        nodes = structureData;
        listHeader = <SidebarSelect
            size = {this.props.size}/>}
    else {
        nodes = plottingData;
        listHeader = ''
    }
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
              className='sidebar pnl-panel'
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
            {/*{listHeader}*/}
            <List
                style={{width:'100%', height:'100%', padding:'5px'}}
                size={'small'}
                itemLayout="vertical"
                dataSource={nodes}
                renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                          title={item.categoryName}
                          style={{marginBottom:0}}
                      />
                      {item.components.map(component =>
                          <List.Item.Meta
                              avatar={<Icon
                                  icon={component.icon}
                              />}
                              description={component.label}
                              style={{
                                marginLeft:'5px',
                                marginBottom:'7px',
                                cursor:'pointer'
                              }}
                          />)}
                    </List.Item>
                )}
            />
            {/*<Tree*/}
            {/*    contents={nodes}*/}
            {/*    onNodeClick={(nodeData, _nodePath, e) =>*/}
            {/*        this.handleNodeClick(nodes, nodeData, _nodePath, e)*/}
            {/*    }*/}
            {/*    onNodeCollapse={this.handleNodeCollapse}*/}
            {/*    onNodeExpand={this.handleNodeExpand}*/}
            {/*    className={this.state.class}*/}
            {/*/>*/}
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
        label={'Line Plot'}/>
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