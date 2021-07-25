import "reflect-metadata";
import { Artifact, Core, ChildProcess } from "../src/interfaces";
import * as cp from "child_process";
import {
  mock,
  mockDeep,
  anyArray,
  anyObject,
  anyFunction,
} from "jest-mock-extended";
import { PostEntrypointImpl } from "../src/post-entrypoint";
import { TaskcatArtifactManagerImpl } from "../src/taskcat-artifact-manager";
import { ChildProcessMock } from "./mocks/childProcessMock";

describe("the PostEntrypoint class", () => {
  describe("the main function", () => {
    it("should invoke taskcat", () => {
      expect.assertions(1);

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

      /**
       * This mock represents the child_process module. We configure it to
       * return the ChildProcess object created above when we call the "spawn"
       * function. This will contain the streams we run our unit tests against.
       */
      const childProcessMock = mockDeep<ChildProcess>();
      childProcessMock.spawn.mockReturnValue(cp);

      /**
       * Mock the "Core" object, and pass dummy values for the "commands" input
       * parameter. In this case, a value of "test run" should invoke "taskcat
       * test run"
       */
      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      /**
       * Verify that taskcat has been invoked. Note that we use matchers
       * to ensure that some array or object has been passed. Other tests will
       * be responsible for verifying the validity of the args and options
       * parameters.
       */
      expect(childProcessMock.spawn).toHaveBeenCalledWith(
        "taskcat",
        anyArray(),
        anyObject()
      );
    });

    it("should mark the run as failed if taskcat returns with a non-zero exit code", () => {
      expect.assertions(2);

      const cp = new ChildProcessMock(1);
      jest.spyOn(cp, "on");

      /**
       * Mock representingthe child_process module. We configure it to
       * return the ChildProcess object created above when we call the "spawn"
       * function. This will contain the streams we run our unit tests against.
       */
      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockReturnValue(cp);

      /**
       * Mock the "Core" object, and pass dummy values for the "commands" input
       * parameter. In this case, a value of "test run" should invoke "taskcat
       * test run"
       */
      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      expect(cp.on).toHaveBeenCalledWith("exit", anyFunction());
      expect(core.setFailed).toHaveBeenCalledWith(
        "The taskcat test did not complete successfully."
      );
    });

    it("should mark the run as successful if taskcat returns with an exit code of 0", () => {
      expect.assertions(2);

      const cp = new ChildProcessMock(0);
      jest.spyOn(cp, "on");

      /**
       * Mock representingthe child_process module. We configure it to
       * return the ChildProcess object created above when we call the "spawn"
       * function. This will contain the streams we run our unit tests against.
       */
      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockReturnValue(cp);

      /**
       * Mock the "Core" object, and pass dummy values for the "commands" input
       * parameter. In this case, a value of "test run" should invoke "taskcat
       * test run"
       */
      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      expect(cp.on).toHaveBeenCalledWith("exit", anyFunction());
      expect(core.setFailed).not.toHaveBeenCalled();
    });

    it.todo("should redirect standard and error outputs to the console");
    it.todo("should upload the taskcat reports as an artifact");
    it.todo("should mask the AWS account ID from the taskcat reports");
  });
});
