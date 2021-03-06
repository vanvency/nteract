import { unlinkObservable, createSymlinkObservable } from "./..";

import { toArray } from "rxjs/operators";

jest.mock("fs");
const fs = require("fs");

describe("unlinkObservable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("errors on unlink issue", () => {
    expect.assertions(3);
    fs.existsSync.mockImplementation(() => true);
    fs.unlink.mockImplementation((path, error) => error({ message: "lol" }));
    unlinkObservable("path").subscribe(
      () => {},
      err => {
        expect(err.message).toBe("lol");
      },
      () => done.fail()
    );
    expect(fs.existsSync).toBeCalledWith("path");
    expect(fs.unlink).toBeCalled();
  });
  it("completes and calls fs.existsSync, fs.unlink", () => {
    expect.assertions(2);
    fs.existsSync.mockImplementation(() => true);
    fs.unlink.mockImplementation(() => true);
    unlinkObservable("path2")
      .pipe(toArray())
      .subscribe(() => {}, err => done.fail(err), () => {});
    expect(fs.existsSync).toBeCalledWith("path2");
    expect(fs.unlink).toBeCalled();
  });
});

describe("createSymlinkObservable", () => {
  it("returns an observable", () => {
    expect(createSymlinkObservable("target", "path").subscribe).not.toBeNull();
  });
});
