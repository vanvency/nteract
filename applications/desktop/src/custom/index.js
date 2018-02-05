import React from "react";
import ReactDOM from "react-dom";
import { MyContentR } from "./components/content";
import { MySideBarR } from "./components/sidebar";
// import registerServiceWorker from './registerServiceWorker';
import { SelectKeyReducer } from "./reducers";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { Layout } from "antd";

let store = createStore(SelectKeyReducer);
ReactDOM.render(
  <Provider store={store}>
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Sider style={{ background: "#fff" }}>
        <MySideBarR />
      </Layout.Sider>
      <Layout>
        <Layout.Content>
          <MyContentR />
        </Layout.Content>
      </Layout>
    </Layout>
  </Provider>,
  document.querySelector("#app")
);
