import { ActionsObservable } from "redux-observable";

import * as actionTypes from "@nteract/core/actionTypes";

import {
  setLanguageInfo,
  acquireKernelInfo,
  watchExecutionStateEpic,
  launchKernelObservable,
  launchKernelEpic,
  launchKernelByNameEpic
} from "../../../src/notebook/epics/kernel-launch";

import { createMessage } from "@nteract/messaging";

import { Subject } from "rxjs/Subject";
import { of } from "rxjs/observable/of";
import { toArray, share } from "rxjs/operators";

describe("acquireKernelInfo", () => {
  test("sends a kernel_info_request and processes kernel_info_reply", done => {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe(msg => {
      expect(msg.header.msg_type).toEqual("kernel_info_request");

      const response = createMessage("kernel_info_reply");
      response.parent_header = msg.header;
      response.content = { language_info: { language: "python" } };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const obs = acquireKernelInfo(mockSocket);

    obs.subscribe(langAction => {
      expect(langAction).toEqual({
        langInfo: { language: "python" },
        type: "SET_LANGUAGE_INFO"
      });
      done();
    });
  });
});

describe("watchExecutionStateEpic", () => {
  test("returns an Observable with an initial state of idle", done => {
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL_SUCCESSFUL,
      kernel: {
        channels: of({
          header: { msg_type: "status" },
          content: { execution_state: "idle" }
        })
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.pipe(toArray()).subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionTypes.SET_EXECUTION_STATE]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});

describe("launchKernelObservable", () => {
  test("returns an observable", () => {
    const obs = launchKernelObservable("python3", process.cwd());
    expect(obs.subscribe).toBeTruthy();
  });
});

describe("launchKernelEpic", () => {
  test("throws an error if given a bad action", done => {
    const actionBuffer = [];
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL
    }).pipe(share());
    const obs = launchKernelEpic(action$);
    obs.subscribe(
      x => {
        expect(x.type).toEqual(actionTypes.ERROR_KERNEL_LAUNCH_FAILED);
        actionBuffer.push(x.type);
        done();
      },
      err => done.fail(err)
    );
  });
  test("calls launchKernelObservable if given the correct action", done => {
    const actionBuffer = [];
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL,
      kernelSpec: { spec: "hokey" },
      cwd: "~"
    });
    const obs = launchKernelEpic(action$);
    obs.subscribe(
      x => {
        actionBuffer.push(x.type);
        if (actionBuffer.length === 2) {
          expect(actionBuffer).toEqual([
            actionTypes.SET_KERNEL_INFO,
            actionTypes.LAUNCH_KERNEL_SUCCESSFUL
          ]);
          done();
        }
      },
      err => done.fail(err)
    );
  });
});

describe("launchKernelByNameEpic", () => {
  test("creates a LAUNCH_KERNEL action in response to a LAUNCH_KERNEL_BY_NAME action", done => {
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL_BY_NAME,
      kernelSpecName: "python3",
      cwd: "~"
    });
    const obs = launchKernelByNameEpic(action$);
    obs.pipe(toArray()).subscribe(
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionTypes.LAUNCH_KERNEL]);
        done();
      },
      err => done.fail(err)
    );
  });
});
