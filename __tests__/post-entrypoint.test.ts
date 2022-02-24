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
import { Readable } from "stream";
import { InputOptions } from "@actions/core";
import {
  childProcessFactory,
  CP_MOCK_TYPE,
} from "./util/child-process-factory";

describe("the PostEntrypoint class", () => {
  describe("the main function", () => {
    it("should invoke taskcat", () => {
      expect.assertions(1);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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

      const cp = new ChildProcessMock(1, mock<Readable>(), mock<Readable>());
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

      const cp = new ChildProcessMock(0, mock<Readable>(), mock<Readable>());
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

    it("should redirect standard and error outputs to the console", async () => {
      expect.assertions(3);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const stdout = new Readable();
      const stderr = new Readable();

      const cp = new ChildProcessMock(0, stdout, stderr);

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockReturnValue(cp);

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      stdout.push("Output from stdout");
      stdout.push(null);

      stderr.push("Output from stderr");
      stderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(2, "Output from stdout");
      expect(core.info).toHaveBeenNthCalledWith(3, "Output from stderr");

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });
    it("should not invoke taskcat with the --minimal-output flag", () => {
      expect.assertions(1);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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
      expect(childProcessMock.spawn).not.toHaveBeenCalledWith(
        "taskcat",
        expect.arrayContaining(["--minimal-output"]),
        anyObject()
      );
    });
    it("should update taskcat when the update_taskcat parameter is passed", () => {
      expect.assertions(2);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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

      /**
       *
       */
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_taskcat") return true;
          return false;
        }
      );

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      /**
       * We verify that if the update_taskcat parameter is passed as an input,
       * the application calls pip in addition to our taskcat command
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        1,
        "pip",
        ["install", "--upgrade", "taskcat"],
        anyObject()
      );

      /**
       * Verify that taskcat has been invoked. Note that we use matchers
       * to ensure that some array or object has been passed. Other tests will
       * be responsible for verifying the validity of the args and options
       * parameters.
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        2,
        "taskcat",
        anyArray(),
        anyObject()
      );
    });

    it("should update cfn_lint when the update_cfn_lint parameter is passed", () => {
      expect.assertions(2);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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

      /**
       *
       */
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_cfn_lint") return true;
          return false;
        }
      );

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      /**
       * We verify that if the update_taskcat parameter is passed as an input,
       * the application calls pip in addition to our taskcat command
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        1,
        "pip",
        ["install", "--upgrade", "cfn_lint"],
        anyObject()
      );

      /**
       * Verify that taskcat has been invoked. Note that we use matchers
       * to ensure that some array or object has been passed. Other tests will
       * be responsible for verifying the validity of the args and options
       * parameters.
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        2,
        "taskcat",
        anyArray(),
        anyObject()
      );
    });

    it("should update cfn_lint and taskcat when both the update_cfn_lint update_taskcat parameters are passed", () => {
      expect.assertions(3);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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

      /**
       *
       */
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_cfn_lint" || name === "update_taskcat")
            return true;
          return false;
        }
      );

      // Invoke the PostEntrypointImpl.run() function with our mock values.
      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      /**
       * We verify that if the update_taskcat parameter is passed as an input,
       * the application calls pip in addition to our taskcat command
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        1,
        "pip",
        ["install", "--upgrade", "cfn_lint"],
        anyObject()
      );

      /**
       * We verify that if the update_taskcat parameter is passed as an input,
       * the application calls pip in addition to our taskcat command
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        2,
        "pip",
        ["install", "--upgrade", "taskcat"],
        anyObject()
      );

      /**
       * Verify that taskcat has been invoked. Note that we use matchers
       * to ensure that some array or object has been passed. Other tests will
       * be responsible for verifying the validity of the args and options
       * parameters.
       */
      expect(childProcessMock.spawn).toHaveBeenNthCalledWith(
        3,
        "taskcat",
        anyArray(),
        anyObject()
      );
    });

    it("should redirect standard and error outputs to the console from the pip cfn_lint update and taskcat commands", async () => {
      expect.assertions(5);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipStdout = new Readable();
      const pipStderr = new Readable();

      const pipCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipStdout,
        pipStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip" && args.includes("cfn_lint")) return pipCp;
          else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");

      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_cfn_lint") return true;
          return false;
        }
      );

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipStdout.push("Output from cfn_lint pip's stdout");
      pipStdout.push(null);

      pipStderr.push("Output from cfn_lint pip's stderr");
      pipStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from cfn_lint pip's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from cfn_lint pip's stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should redirect standard and error outputs to the console from the pip taskcat update and taskcat commands", async () => {
      expect.assertions(5);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipStdout = new Readable();
      const pipStderr = new Readable();

      const pipCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipStdout,
        pipStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip" && args.includes("taskcat")) return pipCp;
          else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_taskcat") return true;
          return false;
        }
      );

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipStdout.push("Output from taskcat pip's stdout");
      pipStdout.push(null);

      pipStderr.push("Output from taskcat pip's stderr");
      pipStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from taskcat pip's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from taskcat pip's stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should redirect standard and error outputs to the console from the pip taskcat and cfn updates as well as the taskcat commands", async () => {
      expect.assertions(7);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockReturnValue(true);

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip cfn_lint update stdout");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip cfn_lint update stderr");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip taskcat update stdout");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip taskcat update stderr");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from the pip cfn_lint update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip cfn_lint update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from the pip taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from the pip taskcat update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        6,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        7,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should set the update_cfn_lint input parameter as optional", async () => {
      expect.assertions(3);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );
      const core = mockDeep<Core>();
      core.getInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): string => {
          if (name === "commands") return "test run";
          else if (name === "aws-account-id") return "123456789";
          else if (name === "update_cfn_lint") return "";
          else if (name === "update_taskcat") return "false";
          else throw new Error();
        }
      );
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_cfn_lint") throw new TypeError();
          else return false;
        }
      );

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip cfn_lint update stdout");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip cfn_lint update stderr");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip taskcat update stdout");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip taskcat update stderr");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should throw an exception if the update_cfn_lint input parameter is not a boolean value", async () => {
      expect.assertions(1);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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
      core.getInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): string => {
          if (name === "commands") return "test run";
          else if (name === "aws-account-id") return "123456789";
          else if (name === "update_cfn_lint") return "test";
          else if (name === "update_taskcat") return "false";
          else throw new Error();
        }
      );
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_cfn_lint")
            throw new TypeError(
              'Input does not meet YAML 1.2 "Core Schema" specification: update_cfn_lint\nSupport boolean input list: `true | True | TRUE | false | False | FALSE`'
            );
          else return false;
        }
      );

      expect(() => {
        new PostEntrypointImpl(
          mock<Artifact>(),
          core,
          childProcessMock,
          mock<TaskcatArtifactManagerImpl>()
        ).run();
      }).toThrow(
        'Input does not meet YAML 1.2 "Core Schema" specification: update_cfn_lint\nSupport boolean input list: `true | True | TRUE | false | False | FALSE`'
      );
    });

    it("should set the update_taskcat input parameter as optional", async () => {
      expect.assertions(3);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );
      const core = mockDeep<Core>();
      core.getInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): string => {
          if (name === "commands") return "test run";
          else if (name === "aws-account-id") return "123456789";
          else if (name === "update_cfn_lint") return "false";
          else if (name === "update_taskcat") return "";
          else throw new Error();
        }
      );
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_taskcat")
            throw new TypeError(
              'Input does not meet YAML 1.2 "Core Schema" specification: update_taskcat\nSupport boolean input list: `true | True | TRUE | false | False | FALSE`'
            );
          else return false;
        }
      );

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip cfn_lint update stdout");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip cfn_lint update stderr");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip taskcat update stdout");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip taskcat update stderr");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should throw an exception if the update_taskcat input parameter is not a boolean value", async () => {
      expect.assertions(1);

      const cp = childProcessFactory.getChildProcessMock(
        CP_MOCK_TYPE.JEST_MOCK
      );

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
      core.getInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): string => {
          if (name === "commands") return "test run";
          else if (name === "aws-account-id") return "123456789";
          else if (name === "update_cfn_lint") return "false";
          else if (name === "update_taskcat") return "test";
          else throw new Error();
        }
      );
      core.getBooleanInput.mockImplementation(
        (name: string, options?: InputOptions | undefined): boolean => {
          if (name === "update_taskcat")
            throw new TypeError(
              'Input does not meet YAML 1.2 "Core Schema" specification: update_taskcat\nSupport boolean input list: `true | True | TRUE | false | False | FALSE`'
            );
          else return false;
        }
      );

      expect(() => {
        new PostEntrypointImpl(
          mock<Artifact>(),
          core,
          childProcessMock,
          mock<TaskcatArtifactManagerImpl>()
        ).run();
      }).toThrow(
        'Input does not meet YAML 1.2 "Core Schema" specification: update_taskcat\nSupport boolean input list: `true | True | TRUE | false | False | FALSE`'
      );
    });

    it("should remove the carriage return and line feed characters from the end of the line", async () => {
      expect.assertions(7);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockReturnValue(true);

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip cfn_lint update stdout\r\n");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip cfn_lint update stderr\r\n");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip taskcat update stdout\r\n");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip taskcat update stderr\r\n");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout\r\n");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr\r\n");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from the pip cfn_lint update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip cfn_lint update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from the pip taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from the pip taskcat update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        6,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        7,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should remove preserve the carriage return and line feed characters from the middle of the line", async () => {
      expect.assertions(7);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockReturnValue(true);

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip\r\n cfn_lint update stdout");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip\r\n cfn_lint update stderr");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip\r\n taskcat update stdout");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip\r\n taskcat update stderr");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from\r\n taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from\r\n taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from the pip\r\n cfn_lint update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip\r\n cfn_lint update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from the pip\r\n taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from the pip\r\n taskcat update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        6,
        "Output from\r\n taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        7,
        "Output from\r\n taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should remove the line feed character from the end of the line", async () => {
      expect.assertions(7);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockReturnValue(true);

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip cfn_lint update stdout\n");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip cfn_lint update stderr\n");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip taskcat update stdout\n");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip taskcat update stderr\n");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from taskcat's stdout\n");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from taskcat's stderr\n");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from the pip cfn_lint update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip cfn_lint update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from the pip taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from the pip taskcat update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        6,
        "Output from taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        7,
        "Output from taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });

    it("should remove preserve the line feed character from the middle of the line", async () => {
      expect.assertions(7);

      // Create real Readable streams (versus the mocks created in other tests).
      // We can simulate output from taskcat by pushing data to these streams.
      const pipTaskcatStdout = new Readable();
      const pipTaskcatStderr = new Readable();

      const pipTaskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipTaskcatStdout,
        pipTaskcatStderr
      );

      const pipCfnLintStdout = new Readable();
      const pipCfnLintStderr = new Readable();

      const pipCfnLintCp: cp.ChildProcess = new ChildProcessMock(
        0,
        pipCfnLintStdout,
        pipCfnLintStderr
      );

      const taskcatStdout = new Readable();
      const taskcatStderr = new Readable();

      const taskcatCp: cp.ChildProcess = new ChildProcessMock(
        0,
        taskcatStdout,
        taskcatStderr
      );

      const childProcessMock = mock<ChildProcess>();
      childProcessMock.spawn.mockImplementation(
        (
          command: string,
          args: readonly string[],
          options: cp.SpawnOptions
        ): cp.ChildProcess => {
          if (command === "pip") {
            if (args.includes("taskcat")) return pipTaskcatCp;
            else if (args.includes("cfn_lint")) return pipCfnLintCp;
            else throw Error("pip was invoked for neither taskcat or cfn_lint");
          } else if (command === "taskcat") return taskcatCp;
          else throw Error("This branch should not be reached");
        }
      );

      const core = mockDeep<Core>();
      core.getInput.mockReturnValue("test run");
      core.getBooleanInput.mockReturnValue(true);

      new PostEntrypointImpl(
        mock<Artifact>(),
        core,
        childProcessMock,
        mock<TaskcatArtifactManagerImpl>()
      ).run();

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      pipCfnLintStdout.push("Output from the pip\n cfn_lint update stdout");
      pipCfnLintStdout.push(null);

      pipCfnLintStderr.push("Output from the pip\n cfn_lint update stderr");
      pipCfnLintStderr.push(null);

      pipTaskcatStdout.push("Output from the pip\n taskcat update stdout");
      pipTaskcatStdout.push(null);

      pipTaskcatStderr.push("Output from the pip\n taskcat update stderr");
      pipTaskcatStderr.push(null);

      // Push data to the different streams. Note that we have to end the
      // stream with `null`, to let it know we're done pushing data.
      taskcatStdout.push("Output from\n taskcat's stdout");
      taskcatStdout.push(null);

      taskcatStderr.push("Output from\n taskcat's stderr");
      taskcatStderr.push(null);

      // Delay for 10 milliseconds, to give time for the code to receive and
      // process the stdout and stderr data we just pushed.
      await sleep(10);
      expect(core.info).toHaveBeenNthCalledWith(
        1,
        "Received commands: test run"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        2,
        "Output from the pip\n cfn_lint update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip\n cfn_lint update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        "Output from the pip\n taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        5,
        "Output from the pip\n taskcat update stderr"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        6,
        "Output from\n taskcat's stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        7,
        "Output from\n taskcat's stderr"
      );

      function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
    });
  });
});
