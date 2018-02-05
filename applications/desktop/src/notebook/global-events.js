/* @flow */

import type { Store } from "redux";
import type { AppState } from "@nteract/types/core/records";

import { dialog } from "electron";
import { is } from "immutable";
import { forceShutdownKernel } from "./kernel/shutdown";
import type { Action } from "@nteract/types/redux";

export function unload(store: Store<AppState, Action>) {
  const state = store.getState();
  const kernel = {
    channels: state.app.channels,
    spawn: state.app.spawn,
    connectionFile: state.app.connectionFile
  };
  forceShutdownKernel(kernel);
}

export function beforeUnload(store: Store<AppState, Action>, e: any) {
  const state = store.getState();
  const saved = is(
    state.document
      .getIn(["docs", state.document.get("docFocused")])
      .get("notebook"), //TODO:hfan
    state.document
      .getIn(["docs", state.document.get("docFocused")])
      .get("savedNotebook")
  );
  if (!saved) {
    // Will prevent closing "will-prevent-unload"
    e.returnValue = true;
  }
}

export function initGlobalHandlers(store: Store<AppState, Action>) {
  window.onbeforeunload = beforeUnload.bind(null, store);
  window.onunload = unload.bind(null, store);
}
