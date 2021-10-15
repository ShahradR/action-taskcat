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

  public run(): void {
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
      const updateCfnLintChild = this._cp.spawn(
        "pip",
        ["install", "--upgrade", "cfn_lint"],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      updateCfnLintChild.stdout.setEncoding("utf-8");
      updateCfnLintChild.stderr.setEncoding("utf-8");

      updateCfnLintChild.stdout.on("data", (data) => {
        this._core.info(data);
      });

      updateCfnLintChild.stderr.on("data", (data) => {
        this._core.info(data);
      });
    }

    if (updateTaskcat) {
      const updateTaskcatChild = this._cp.spawn(
        "pip",
        ["install", "--upgrade", "taskcat"],
        {
          stdio: ["ignore", "pipe", "pipe"],
        }
      );

      updateTaskcatChild.stdout.setEncoding("utf-8");
      updateTaskcatChild.stderr.setEncoding("utf-8");

      updateTaskcatChild.stdout.on("data", (data) => {
        this._core.info(data);
      });

      updateTaskcatChild.stderr.on("data", (data) => {
        this._core.info(data);
      });
    }

    const newList = taskcatCommands.split(" ");

    const child = this._cp.spawn("taskcat", newList, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.setEncoding("utf-8");
    child.stderr.setEncoding("utf-8");

    child.stdout.on("data", (data) => {
      this._core.info(data);
    });

    child.stderr.on("data", (data) => {
      this._core.info(data);
    });

    child.on("exit", (exitCode) => {
      this._taskcatArtifactManager.maskAndPublishTaskcatArtifacts(awsAccountId);

      if (exitCode !== 0) {
        this._core.setFailed("The taskcat test did not complete successfully.");
      }
    });
  }
}
