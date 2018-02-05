import React, { Component } from "react";

import { Menu, Tree, Button } from "antd";
import "antd/dist/antd.css";
import { changeTabAction } from "../actions";
import { connect } from "react-redux";

class MySideBar extends Component {
  constructor(props) {
    super(props);
    this.newTabIndex = 2;
    const panes = [
      { title: "Tab 1", key: "item-1" },
      { title: "Tab 2", key: "item-2" }
    ];
    this.state = {
      panes
    };
  }

  render() {
    return (
      <div className="Menu">
        <Tree
          onSelect={(keys, event) => this.onSelectNode(keys, event)}
          selectedKeys={[this.props.current_key]}
        >
          {this.state.panes.map(pane => (
            <Tree.TreeNode title={pane.title} key={pane.key} />
          ))}
        </Tree>

        <Button onClick={this.add}>ADD</Button>
      </div>
    );
  }

  add = () => {
    const panes = this.state.panes;
    this.newTabIndex++;
    const activeKey = `item-${this.newTabIndex}`;
    panes.push({ title: `Tab ${this.newTabIndex}`, key: activeKey });
    this.setState({ panes });
  };

  onSelectNode(keys, event) {
    console.log(event);
    this.props.onClickNode(event.node.props.eventKey);
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    current_key: state.key,
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClickNode: key => dispatch(changeTabAction(key))
  };
};

export const MySideBarR = connect(mapStateToProps, mapDispatchToProps)(
  MySideBar
);
