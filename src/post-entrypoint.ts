import {
  PostEntrypoint,
  TaskcatArtifactManager,
  Artifact,
  Core,
  ChildProcess,
} from "./interfaces";
import { TYPES } from "./types";
import { inject, injectable } from "inversify";

@injectable()
export class PostEntrypointImpl implements PostEntrypoint {
  private _artifact: Artifact;
  private _taskcatArtifactManager: TaskcatArtifactManager;
  private _core: Core;
  private _cp: ChildProcess;

  public constructor(
    @inject(TYPES.Artifact) artifact: Artifact,
    @inject(TYPES.Core) core: Core,
    @inject(TYPES.ChildProcess) cp: ChildProcess,
    @inject(TYPES.TaskcatArtifactManager)
    taskcatArtifactManager: TaskcatArtifactManager
  ) {
    this._artifact = artifact;
    this._core = core;
    this._cp = cp;
    this._taskcatArtifactManager = taskcatArtifactManager;
  }

  public async run(): Promise<void> {
    const awsAccountId = this._core.getInput("aws-account-id");
    const taskcatCommands = this._core.getInput("commands");

    let updateCfnLint: boolean;
    let updateTaskcat: boolean;

    try {
      updateCfnLint = this._core.getBooleanInput("update_cfn_lint");
    } catch (e) {
      if (
        e instanceof TypeError &&
        this._core.getInput("update_cfn_lint") === ""
      )
        updateCfnLint = false;
      else throw e;
    }

    try {
      updateTaskcat = this._core.getBooleanInput("update_taskcat");
    } catch (e) {
      if (
        e instanceof TypeError &&
        this._core.getInput("update_taskcat") === ""
      )
        updateTaskcat = false;
      else throw e;
    }

    this._core.info("Received commands: " + taskcatCommands);

    if (updateCfnLint) {
      await this.invokeCommand(this._core, this._cp, "pip", [
        "install",
        "--upgrade",
        "cfn_lint",
      ]);
    }

    if (updateTaskcat) {
      await this.invokeCommand(this._core, this._cp, "pip", [
        "install",
        "--upgrade",
        "taskcat",
      ]);
    }

    const newList = taskcatCommands.split(" ");

    await this.invokeTaskcatCommand(
      this._core,
      this._cp,
      "taskcat",
      newList,
      awsAccountId
    );
  }

  public invokeCommand(
    core: Core,
    cp: ChildProcess,
    command: string,
    args: string[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = cp.spawn(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      child.stdout.setEncoding("utf-8");
      child.stderr.setEncoding("utf-8");

      child.stdout.on("data", (data) => {
        core.info(data.replace(/\r?\n$/g, ""));
      });

      child.stderr.on("data", (data) => {
        core.info(data.replace(/\r?\n$/g, ""));
      });

      child.on("exit", (exitCode) => {
        if (exitCode !== 0) {
          reject(new Error("The command did not complete successfully."));
        }
        resolve();
      });
    });
  }

  public invokeTaskcatCommand(
    core: Core,
    cp: ChildProcess,
    command: string,
    args: string[],
    awsAccountId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = cp.spawn(command, args, {
        stdio: ["ignore", "pipe", "pipe"],
      });

      child.stdout.setEncoding("utf-8");
      child.stderr.setEncoding("utf-8");

      child.stdout.on("data", (data) => {
        core.info(data.replace(/\r?\n$/g, ""));
      });

      child.stderr.on("data", (data) => {
        core.info(data.replace(/\r?\n$/g, ""));
      });

      child.on("exit", (exitCode) => {
        this._taskcatArtifactManager.maskAndPublishTaskcatArtifacts(
          awsAccountId
        );

        if (exitCode !== 0) {
          this._core.setFailed(
            "The taskcat test did not complete successfully."
          );
          reject(new Error("The taskcat test did not complete successfully."));
        }
        resolve();
      });
    });
  }
}
