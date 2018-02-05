import React, { Component } from "react";
import { Tabs, Input } from "antd";
import "antd/dist/antd.css";
import { connect } from "react-redux";
import { changeTabAction, closeTabAction } from "../actions";
import { App } from "../../notebook/index";

const { TextArea } = Input;

class MyContent extends Component {
  onChange = activeKey => {
    this.props.onTabChange(activeKey);
  };

  onEdit = (targetKey, action) => {
    if (action === "remove") this.props.onTabClose(targetKey);
    else this[action](targetKey);
  };

  render() {
    return (
      <div>
        <Tabs
          hideAdd
          onChange={this.onChange}
          activeKey={this.props.activeKey}
          type="editable-card"
          onEdit={this.onEdit}
        >
          {this.props.openTabs.map(pane => (
            <Tabs.TabPane tab={pane.title} key={pane.key}>
              {/* <TextArea rows={4}></TextArea> */}
              <App />
            </Tabs.TabPane>
          ))}
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeKey: state.activeKey,
    openTabs: state.openTabs
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onTabChange: key => dispatch(changeTabAction(key)),
    onTabClose: key => dispatch(closeTabAction(key))
  };
};

export const MyContentR = connect(mapStateToProps, mapDispatchToProps)(
  MyContent
);
