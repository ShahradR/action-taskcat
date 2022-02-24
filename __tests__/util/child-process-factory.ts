import { ChildProcessMock } from "../mocks/childProcessMock";
import { mockDeep } from "jest-mock-extended";
import * as cp from "child_process";
import { Readable } from "stream";

export enum CP_MOCK_TYPE {
  JEST_MOCK,
  READABLE_MOCK,
}

class ChildProcessFactory {
  public jestMockChildProcess(): cp.ChildProcess {
    /**
     * Mock the ChildProcess class. This is returned by child_process.spawn,
     * and contains information about the running process itself, including
     * the stdin, stdout, and stderr streams used to verify taskcat's output.
     *
     * This is different from the ChildProcess interface defined in
     * src/interfaces.js we use throughout the application—that is a
     * representation of the whole child_process Node.JS module, and exports
     * this class. We mock the module itself below.
     */
    const cp = mockDeep<cp.ChildProcess>();

    return cp;
  }

  public readableMockChildProcess(): cp.ChildProcess {
    // Create real Readable streams (versus the mocks created in other tests).
    // We can simulate output from taskcat by pushing data to these streams.
    const stdout = new Readable();
    const stderr = new Readable();

    const cp = new ChildProcessMock(0, stdout, stderr);

    return cp;
  }

  public getChildProcessMock(mockType: CP_MOCK_TYPE) {
    switch (mockType) {
      case CP_MOCK_TYPE.JEST_MOCK:
        return this.jestMockChildProcess();
      case CP_MOCK_TYPE.READABLE_MOCK:
        return this.readableMockChildProcess();
      default:
        return this.jestMockChildProcess();
    }
  }
}

export const childProcessFactory = new ChildProcessFactory();
