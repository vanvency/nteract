import { CHANGE_TAB, CLOSE_TAB } from "./actions";

const default_state = {
  activeKey: "item-1",
  openTabs: [
    { title: "Tab 1", key: "item-1" },
    { title: "Tab 2", key: "item-2" }
  ]
};

export function SelectKeyReducer(state = default_state, action) {
  switch (action.type) {
    case CHANGE_TAB:
      if (!action.key) {
        return state;
      }
      console.log("reducer receive action:" + action.type);
      if (state.openTabs.find(t => t.key === action.key)) {
        return { ...state, activeKey: action.key };
      } else {
        const keyId = action.key.slice(5);
        const newTab = { title: `Tab ${keyId}`, key: action.key };
        const nextOpenTabs = [...state.openTabs, newTab];
        return { ...state, openTabs: nextOpenTabs, activeKey: action.key };
      }
    case CLOSE_TAB:
      if (!action.key) {
        return state;
      }
      console.log("reducer receive action:" + action.type);
      const lastIndex =
        state.openTabs.findIndex((t, i) => t.key === action.key) - 1;
      let nextActiveKey = state.activeKey;
      if (lastIndex >= 0 && state.activeKey === action.key) {
        nextActiveKey = state.openTabs[lastIndex].key;
      }
      const nextOpenTabs = state.openTabs.filter(t => t.key !== action.key);
      return { ...state, openTabs: nextOpenTabs, activeKey: nextActiveKey };
    default:
      return state;
  }
}
