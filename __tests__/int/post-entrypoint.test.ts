import "reflect-metadata";
import { Artifact, ChildProcess } from "../../src/interfaces";
import * as core from "@actions/core";
import * as cp from "child_process";
import {
  mock,
  mockDeep,
  anyArray,
  anyObject,
  anyFunction,
} from "jest-mock-extended";
import { PostEntrypointImpl } from "../../src/post-entrypoint";
import { TaskcatArtifactManagerImpl } from "../../src/taskcat-artifact-manager";
import { ChildProcessMock } from "../mocks/childProcessMock";
import { Readable } from "stream";
import { InputOptions } from "@actions/core";

jest.mock("@actions/core", () => ({
  ...jest.requireActual("@actions/core"),
  info: jest.fn(),
}));

describe("the PostEntrypoint class", () => {
  describe("the cfn_lint update function", () => {
    it("should update cfn_lint if the update_cfn_lint input parameter returns true", async () => {
      expect.assertions(5);

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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_CFN_LINT = "true";
      process.env.INPUT_UPDATE_TASKCAT = "false";

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

    it("should not update cfn_lint if the update_cfn_lint input parameter returns false", async () => {
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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_CFN_LINT = "false";
      process.env.INPUT_UPDATE_TASKCAT = "false";

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

    it("should not update cfn_lint if the update_cfn_lint input parameter is not defined", async () => {
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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_CFN_LINT = "";
      process.env.INPUT_UPDATE_TASKCAT = "false";

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

    it("should update taskcat if the update_taskcat input parameter returns true", async () => {
      expect.assertions(5);

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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_CFN_LINT = "false";
      process.env.INPUT_UPDATE_TASKCAT = "true";

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
        "Output from the pip taskcat update stdout"
      );
      expect(core.info).toHaveBeenNthCalledWith(
        3,
        "Output from the pip taskcat update stderr"
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
    it("should not update taskcat if the update_taskcat input parameter returns false", async () => {
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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_CFN_LINT = "false";
      process.env.INPUT_UPDATE_TASKCAT = "false";

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

    it("should not update taskcat if the update_taskcat input parameter is not defined", async () => {
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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_TASKCAT = "";
      process.env.INPUT_UPDATE_CFN_LINT = "false";

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

    it("should throw an exception if the update_cfn_lint input parameter is not a boolean", async () => {
      expect.assertions(1);

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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_TASKCAT = "false";
      process.env.INPUT_UPDATE_CFN_LINT = "test";

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

    it("should throw an exception if the update_taskcat input parameter is not a boolean", async () => {
      expect.assertions(1);

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

      process.env.INPUT_COMMANDS = "test run";
      process.env.INPUT_UPDATE_TASKCAT = "test";
      process.env.INPUT_UPDATE_CFN_LINT = "false";

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
  });
});
