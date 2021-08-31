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
    this._core.info("Received commands: " + taskcatCommands);

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
